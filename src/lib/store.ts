import {
  Complaint,
  Institution,
  CaseAction,
  InstitutionResolutionQueueItem,
  InstitutionMatchSuggestion,
  OverlapFlag,
  OverlapReviewEvent,
  DuplicateFlag,
  DuplicateReviewEvent,
  Alert,
  User,
  Bureau,
  BureauCode,
  SLARule,
} from '@/types';
import { createClient } from '@/lib/supabase/client';

let complaints: Complaint[] = [];
let institutions: Institution[] = [];
let bureaus: Bureau[] = [];
let users: User[] = [];
let resolutionQueue: InstitutionResolutionQueueItem[] = [];
let matchSuggestions: InstitutionMatchSuggestion[] = [];
let overlapFlags: OverlapFlag[] = [];
let overlapReviewEvents: OverlapReviewEvent[] = [];
let duplicateFlags: DuplicateFlag[] = [];
let duplicateReviewEvents: DuplicateReviewEvent[] = [];
let caseActions: CaseAction[] = [];
let alerts: Alert[] = [];
let slaRules: SLARule[] = [];
let statutorySLATargetDays = 30;
let currentUser: User | null = null;
let revision = 0;
const listeners = new Set<() => void>();

function notifyLoaded() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

async function readRows<T>(table: string): Promise<T[]> {
  const { data, error } = await createClient().from(table).select('*');
  if (error) throw new Error(`Unable to load ${table}: ${error.message}`);
  return (data ?? []) as T[];
}

function requireResult<T>(data: T | null, error: { message: string } | null, operation: string): T {
  if (error) throw new Error(`${operation}: ${error.message}`);
  if (data === null) throw new Error(`${operation}: Supabase returned no row.`);
  return data;
}

function getCaseActionType(status: Complaint['status']): CaseAction['action_type'] {
  if (status === 'transferred' || status === 'escalated' || status === 'disposed') return status;
  return 'updated';
}

export const dataStore = {
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getRevision: () => revision,

  loadFromSupabase: async () => {
    const client = createClient();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw new Error(`Unable to verify the signed-in account: ${authError.message}`);
    if (!authData.user) throw new Error('A Supabase account is required to load dashboard data.');

    const { data: existingProfile, error: profileError } = await client
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();
    if (profileError) throw new Error(`Unable to load your account profile: ${profileError.message}`);

    let profile = existingProfile;
    if (!profile) {
      const { data, error } = await client
        .from('users')
        .insert({
          id: authData.user.id,
          name: authData.user.user_metadata?.full_name ?? authData.user.email ?? 'Official',
          email: authData.user.email ?? '',
          role: 'other_official',
          is_seed: false,
        })
        .select('*')
        .single();
      if (error) throw new Error(`Unable to create your account profile: ${error.message}`);
      profile = data;
    }
    currentUser = profile as User;

    const [
      bureauRows,
      userRows,
      institutionRows,
      complaintRows,
      actionRows,
      queueRows,
      suggestionRows,
      overlapRows,
      overlapEventRows,
      duplicateRows,
      duplicateEventRows,
      alertRows,
      slaRows,
      settingRows,
    ] = await Promise.all([
      readRows<Bureau>('bureaus'),
      readRows<User>('users'),
      readRows<Institution>('institutions'),
      readRows<Complaint>('complaints'),
      readRows<CaseAction>('case_actions'),
      readRows<InstitutionResolutionQueueItem>('institution_resolution_queue'),
      readRows<InstitutionMatchSuggestion>('institution_match_suggestions'),
      readRows<OverlapFlag>('overlap_flags'),
      readRows<OverlapReviewEvent>('overlap_review_events'),
      readRows<DuplicateFlag>('duplicate_flags'),
      readRows<DuplicateReviewEvent>('duplicate_review_events'),
      readRows<Alert>('alerts'),
      readRows<SLARule>('sla_rules'),
      readRows<{ id: string; value: number }>('app_settings'),
    ]);

    bureaus = bureauRows;
    users = userRows;
    institutions = institutionRows;
    complaints = complaintRows.map((complaint) => ({
      ...complaint,
      institution: institutionRows.find((institution) => institution.id === complaint.institution_id),
    }));
    caseActions = actionRows;
    resolutionQueue = queueRows;
    matchSuggestions = suggestionRows;
    overlapFlags = overlapRows.map((flag) => ({
      ...flag,
      cases: complaints.filter((complaint) => flag.case_ids.includes(complaint.id)),
    }));
    overlapReviewEvents = overlapEventRows;
    duplicateFlags = duplicateRows.map((flag) => ({
      ...flag,
      cases: complaints.filter((complaint) => flag.case_ids.includes(complaint.id)),
    }));
    duplicateReviewEvents = duplicateEventRows;
    alerts = alertRows;
    slaRules = slaRows;
    statutorySLATargetDays =
      settingRows.find((setting) => setting.id === 'statutory_sla_target_days')?.value ?? 30;
    notifyLoaded();
  },

  // Authentication user is obtained from the verified Supabase session.
  getCurrentUser: (): User =>
    currentUser ?? { id: '', name: 'Official', email: '', role: 'other_official' },
  setCurrentUser: (user: User) => {
    currentUser = user;
  },
  logout: () => {
    currentUser = null;
  },
  getAllUsers: () => [...users],
  getAllBureaus: () => [...bureaus],

  // Complaints
  getComplaints: () => [...complaints],
  getComplaintById: (id: string) => complaints.find((complaint) => complaint.id === id) ?? null,
  createComplaint: async (data: Omit<Complaint, 'id' | 'case_number' | 'created_at'>) => {
    const { data: insertedRows, error } = await createClient().rpc('create_case', {
      p_id: crypto.randomUUID(),
      p_institution_id: data.institution_id ?? null,
      p_institution_name_raw: data.institution_name_raw,
      p_permanent_id_raw: data.permanent_id_raw ?? null,
      p_category: data.category,
      p_description: data.description,
      p_complainant_type: data.complainant_type,
      p_date_received: data.date_received,
      p_status: data.status,
      p_bureau_id: data.bureau_id,
      p_bureau_code: data.bureau_code,
      p_assigned_officer_name: data.assigned_officer_name ?? currentUser?.name ?? 'Official',
      p_expected_disposal_date: data.expected_disposal_date ?? null,
      p_match_method: data.match_method ?? null,
    });
    const row = Array.isArray(insertedRows) ? insertedRows[0] : insertedRows;
    const created = requireResult(row as Complaint | null, error, 'Unable to register case');
    const complaint = {
      ...created,
      institution: institutions.find((institution) => institution.id === created.institution_id),
    };
    complaints = [complaint, ...complaints];
    const audit = await readRows<CaseAction>('case_actions');
    caseActions = audit;
    if (!created.institution_id) {
      resolutionQueue = await readRows<InstitutionResolutionQueueItem>('institution_resolution_queue');
    }
    return complaint;
  },

  updateComplaintStatus: async (id: string, status: Complaint['status'], remarks: string) => {
    const { data, error } = await createClient().rpc('update_case_status', {
      p_case_id: id,
      p_status: status,
      p_remarks: remarks,
      p_actor_name: currentUser?.name ?? 'Official',
    });
    const updated = requireResult(
      (Array.isArray(data) ? data[0] : data) as Complaint | null,
      error,
      'Unable to update case status',
    );
    const next = { ...updated, institution: institutions.find((item) => item.id === updated.institution_id) };
    complaints = complaints.map((complaint) => complaint.id === id ? next : complaint);
    caseActions = await readRows<CaseAction>('case_actions');
    return next;
  },

  transferComplaint: async (id: string, targetBureauCode: BureauCode, remarks: string) => {
    const { data, error } = await createClient().rpc('transfer_case', {
      p_case_id: id,
      p_target_bureau_code: targetBureauCode,
      p_remarks: remarks,
      p_actor_name: currentUser?.name ?? 'Official',
    });
    const updated = requireResult(
      (Array.isArray(data) ? data[0] : data) as Complaint | null,
      error,
      'Unable to transfer case',
    );
    const next = { ...updated, institution: institutions.find((item) => item.id === updated.institution_id) };
    complaints = complaints.map((complaint) => complaint.id === id ? next : complaint);
    caseActions = await readRows<CaseAction>('case_actions');
    return next;
  },

  getActionsForCase: (caseId: string) =>
    caseActions
      .filter((action) => action.case_id === caseId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),

  getInstitutions: () => [...institutions],
  getInstitutionById: (id: string) => institutions.find((institution) => institution.id === id),
  getComplaintsForInstitution: (institutionId: string) =>
    complaints.filter((complaint) => complaint.institution_id === institutionId),

  getResolutionQueue: () => resolutionQueue.filter((item) => item.status === 'pending'),
  getSuggestionsForQueueItem: (queueId: string) =>
    matchSuggestions.filter((suggestion) => suggestion.queue_id === queueId),
  resolveInstitutionQueueItem: async (queueId: string, institutionId: string, reason: string) => {
    const { data, error } = await createClient().rpc('resolve_institution_queue_item', {
      p_queue_id: queueId,
      p_institution_id: institutionId,
      p_reason: reason,
      p_actor_name: currentUser?.name ?? 'Official',
    });
    const resolved = requireResult(
      (Array.isArray(data) ? data[0] : data) as InstitutionResolutionQueueItem | null,
      error,
      'Unable to resolve institution',
    );
    resolutionQueue = resolutionQueue.map((item) => item.id === queueId ? resolved : item);
    const complaint = complaints.find((item) => item.id === resolved.case_id);
    const institution = institutions.find((item) => item.id === institutionId);
    if (complaint && institution) {
      Object.assign(complaint, {
        institution_id: institution.id,
        institution_name_raw: institution.name,
        permanent_id_raw: institution.aicte_permanent_id,
        match_method: 'manual',
        institution,
      });
    }
    caseActions = await readRows<CaseAction>('case_actions');
    return resolved;
  },

  getOverlapFlags: () => overlapFlags.map((flag) => ({
    ...flag,
    cases: complaints.filter((complaint) => flag.case_ids.includes(complaint.id)),
  })),
  recordOverlapReview: async (flagId: string, action: 'coordinated' | 'dismissed' | 'remark', notes: string) => {
    const { data, error } = await createClient().rpc('record_overlap_review', {
      p_flag_id: flagId,
      p_action: action,
      p_notes: notes,
      p_actor_name: currentUser?.name ?? 'Official',
    });
    const event = requireResult(
      (Array.isArray(data) ? data[0] : data) as OverlapReviewEvent | null,
      error,
      'Unable to save overlap review',
    );
    overlapReviewEvents = [event, ...overlapReviewEvents];
    if (action !== 'remark') {
      overlapFlags = overlapFlags.map((flag) => flag.id === flagId ? {
        ...flag,
        status: action === 'coordinated' ? 'coordinated' : 'dismissed',
        updated_at: event.reviewed_at,
      } : flag);
    }
    return event;
  },

  getDuplicateFlags: () => duplicateFlags.map((flag) => ({
    ...flag,
    cases: complaints.filter((complaint) => flag.case_ids.includes(complaint.id)),
  })),
  recordDuplicateReview: async (
    flagId: string,
    action: 'confirmed_duplicate' | 'dismissed' | 'remark',
    notes: string,
  ) => {
    const { data, error } = await createClient().rpc('record_duplicate_review', {
      p_flag_id: flagId,
      p_action: action,
      p_notes: notes,
      p_actor_name: currentUser?.name ?? 'Official',
    });
    const event = requireResult(
      (Array.isArray(data) ? data[0] : data) as DuplicateReviewEvent | null,
      error,
      'Unable to save duplicate review',
    );
    duplicateReviewEvents = [event, ...duplicateReviewEvents];
    if (action !== 'remark') {
      duplicateFlags = duplicateFlags.map((flag) => flag.id === flagId ? {
        ...flag,
        status: action,
      } : flag);
    }
    return event;
  },

  getAlerts: () => [...alerts],
  markAlertAsRead: async (id: string) => {
    const { data, error } = await createClient()
      .from('alerts')
      .update({ is_read: true })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    const updated = requireResult(data, error, 'Unable to mark alert as read');
    alerts = alerts.map((alert) => alert.id === id ? updated as Alert : alert);
  },

  getDashboardMetrics: () => {
    const pending = complaints.filter((complaint) => complaint.status === 'pending').length;
    const underProcess = complaints.filter((complaint) => complaint.status === 'under_process').length;
    const disposed = complaints.filter((complaint) => complaint.status === 'disposed').length;
    const transferred = complaints.filter((complaint) => complaint.status === 'transferred').length;
    const escalated = complaints.filter((complaint) => complaint.status === 'escalated').length;
    const pendingBeyondTimeline = complaints.filter((complaint) =>
      complaint.status !== 'disposed' &&
      Boolean(complaint.expected_disposal_date) &&
      new Date(complaint.expected_disposal_date!).getTime() < Date.now(),
    ).length;
    const bureauWorkload = bureaus.map((bureau) => {
      const bureauComplaints = complaints.filter((complaint) => complaint.bureau_code === bureau.code);
      return {
        code: bureau.code,
        name: bureau.name,
        total: bureauComplaints.length,
        active: bureauComplaints.filter((complaint) => complaint.status !== 'disposed').length,
        disposed: bureauComplaints.filter((complaint) => complaint.status === 'disposed').length,
      };
    });

    return {
      total: complaints.length,
      pending,
      underProcess,
      disposed,
      transferred,
      escalated,
      pendingBeyondTimeline,
      openOverlaps: overlapFlags.filter((flag) => flag.status === 'open').length,
      openDuplicates: duplicateFlags.filter((flag) => flag.status === 'open').length,
      pendingResolution: resolutionQueue.filter((item) => item.status === 'pending').length,
      bureauWorkload,
    };
  },

  getSLARules: () => [...slaRules],
  getStatutorySLATarget: () => statutorySLATargetDays,
  setStatutorySLATarget: async (days: number) => {
    const { data, error } = await createClient()
      .from('app_settings')
      .update({ value: days })
      .eq('id', 'statutory_sla_target_days')
      .select('value')
      .maybeSingle();
    const setting = requireResult(data, error, 'Unable to update statutory SLA target');
    statutorySLATargetDays = setting.value;
  },
};
