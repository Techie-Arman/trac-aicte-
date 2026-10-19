import {
  mockBureaus,
  mockUsers,
  mockInstitutions,
  mockComplaints,
  mockCaseActions,
  mockResolutionQueue,
  mockMatchSuggestions,
  mockOverlapFlags,
  mockOverlapReviewEvents,
  mockDuplicateFlags,
  mockDuplicateReviewEvents,
  mockSLARules,
  mockAlerts
} from './mock-data';
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
  BureauCode
} from '@/types';

// In-memory state copy for interactive UI operations during frontend session
let complaints = [...mockComplaints];
let institutions = [...mockInstitutions];
let resolutionQueue = [...mockResolutionQueue];
let matchSuggestions = [...mockMatchSuggestions];
let overlapFlags = [...mockOverlapFlags];
let overlapReviewEvents = [...mockOverlapReviewEvents];
let duplicateFlags = [...mockDuplicateFlags];
let duplicateReviewEvents = [...mockDuplicateReviewEvents];
let caseActions = [...mockCaseActions];
let alerts = [...mockAlerts];

// Current session user context for UI simulation (starts unauthenticated — login page is shown first)
let currentUser: User | null = null;
let isAuthenticated: boolean = false;

export const dataStore = {
  // Authentication & Session
  isAuthenticated: () => isAuthenticated,
  getCurrentUser: (): User => currentUser || mockUsers[0],
  getSessionUser: (): User | null => currentUser,
  login: (email: string, role?: string) => {
    const found = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || mockUsers[0];
    currentUser = found;
    isAuthenticated = true;
    return found;
  },
  logout: () => {
    currentUser = null;
    isAuthenticated = false;
  },
  setCurrentUser: (user: User) => {
    currentUser = user;
    isAuthenticated = true;
  },
  getAllUsers: () => mockUsers,
  getAllBureaus: () => mockBureaus,

  // Complaints
  getComplaints: () => [...complaints],
  getComplaintById: (id: string) => {
    const complaint = complaints.find(c => c.id === id);
    if (!complaint) return null;
    const inst = institutions.find(i => i.id === complaint.institution_id);
    return { ...complaint, institution: inst };
  },
  createComplaint: (data: Omit<Complaint, 'id' | 'case_number' | 'created_at'>) => {
    const newId = `c-${complaints.length + 1}`;
    const caseNumber = `TRAC-2026-${String(complaints.length + 1).padStart(5, '0')}`;
    const newCase: Complaint = {
      ...data,
      id: newId,
      case_number: caseNumber,
      created_at: new Date().toISOString(),
      institution: data.institution_id ? institutions.find(i => i.id === data.institution_id) : undefined,
    };
    complaints = [newCase, ...complaints];

    // Append-only audit record
    dataStore.addAuditAction({
      case_id: newId,
      action_type: 'created',
      performed_by: currentUser ? currentUser.id : 'anon',
      performed_by_name: currentUser ? currentUser.name : 'Public / Officer',
      bureau_id: data.bureau_id,
      bureau_code: data.bureau_code,
      remarks: 'Complaint registered in the central monitoring repository',
    });

    // If Permanent ID was missing, route to resolution queue
    if (!data.institution_id) {
      dataStore.addToResolutionQueue({
        case_id: newId,
        case_number: caseNumber,
        raw_institution_name: data.institution_name_raw,
        raw_permanent_id: data.permanent_id_raw || null,
        bureau_code: data.bureau_code,
      });
    }

    return newCase;
  },
  updateComplaintStatus: (id: string, newStatus: Complaint['status'], remarks: string) => {
    const existing = complaints.find(c => c.id === id);
    if (!existing) return null;
    const beforeState = { status: existing.status };
    existing.status = newStatus;
    existing.last_action = remarks || `Status changed to ${newStatus}`;
    existing.last_action_date = new Date().toISOString();

    dataStore.addAuditAction({
      case_id: id,
      action_type: newStatus === 'transferred' ? 'transferred' : newStatus === 'escalated' ? 'escalated' : newStatus === 'disposed' ? 'disposed' : 'updated',
      performed_by: currentUser ? currentUser.id : 'sys',
      performed_by_name: currentUser ? currentUser.name : 'Authorized Official',
      bureau_id: existing.bureau_id,
      bureau_code: existing.bureau_code,
      remarks: remarks || `Status updated to ${newStatus}`,
      before_state: beforeState,
      after_state: { status: newStatus },
    });

    return existing;
  },
  transferComplaint: (id: string, targetBureauCode: BureauCode, remarks: string) => {
    const existing = complaints.find(c => c.id === id);
    if (!existing) return null;
    const targetBureau = mockBureaus.find(b => b.code === targetBureauCode);
    if (!targetBureau) return null;

    const fromCode = existing.bureau_code;
    existing.bureau_id = targetBureau.id;
    existing.bureau_code = targetBureau.code;
    existing.status = 'transferred';
    existing.last_action = `Transferred from ${fromCode} to ${targetBureauCode}: ${remarks}`;
    existing.last_action_date = new Date().toISOString();

    dataStore.addAuditAction({
      case_id: id,
      action_type: 'transferred',
      performed_by: currentUser ? currentUser.id : 'sys',
      performed_by_name: currentUser ? currentUser.name : 'Authorized Official',
      bureau_id: targetBureau.id,
      bureau_code: targetBureau.code,
      from_bureau_code: fromCode,
      to_bureau_code: targetBureauCode,
      remarks,
    });

    return existing;
  },

  // Audit trail
  getActionsForCase: (caseId: string) => {
    return caseActions.filter(a => a.case_id === caseId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  addAuditAction: (action: Omit<CaseAction, 'id' | 'created_at'>) => {
    const newAction: CaseAction = {
      ...action,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
    };
    caseActions = [newAction, ...caseActions];
    return newAction;
  },

  // Institutions
  getInstitutions: () => [...institutions],
  getInstitutionById: (id: string) => institutions.find(i => i.id === id),
  getComplaintsForInstitution: (institutionId: string) => complaints.filter(c => c.institution_id === institutionId),

  // Institution Resolution Queue
  getResolutionQueue: () => resolutionQueue.filter(q => q.status === 'pending'),
  addToResolutionQueue: (item: Omit<InstitutionResolutionQueueItem, 'id' | 'status' | 'created_at'>) => {
    const newQueueItem: InstitutionResolutionQueueItem = {
      ...item,
      id: `q-${resolutionQueue.length + 1}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    resolutionQueue = [newQueueItem, ...resolutionQueue];
    return newQueueItem;
  },
  getSuggestionsForQueueItem: (queueId: string) => {
    return matchSuggestions.filter(s => s.queue_id === queueId);
  },
  resolveInstitutionQueueItem: (queueId: string, selectedInstitutionId: string, reason: string) => {
    const queueItem = resolutionQueue.find(q => q.id === queueId);
    if (!queueItem) return null;
    const inst = institutions.find(i => i.id === selectedInstitutionId);
    if (!inst) return null;

    queueItem.status = 'resolved';

    // Link complaint explicitly
    const comp = complaints.find(c => c.id === queueItem.case_id);
    if (comp) {
      comp.institution_id = selectedInstitutionId;
      comp.match_method = 'manual';
      comp.institution = inst;
      comp.institution_name_raw = inst.name;
      comp.permanent_id_raw = inst.aicte_permanent_id;
      comp.last_action = `Institution manually matched to ${inst.name} (${inst.aicte_permanent_id}): ${reason}`;
      comp.last_action_date = new Date().toISOString();

      dataStore.addAuditAction({
        case_id: comp.id,
        action_type: 'institution_resolved',
        performed_by: currentUser ? currentUser.id : 'sys',
        performed_by_name: currentUser ? currentUser.name : 'Authorized Official',
        bureau_id: comp.bureau_id,
        bureau_code: comp.bureau_code,
        remarks: `Institution resolved by official: ${reason}`,
        after_state: { institution_id: selectedInstitutionId, match_method: 'manual' },
      });
    }

    return queueItem;
  },

  // Overlap flags
  getOverlapFlags: () => {
    return overlapFlags.map(f => {
      const relatedCases = complaints.filter(c => f.case_ids.includes(c.id));
      return { ...f, cases: relatedCases };
    });
  },
  recordOverlapReview: (flagId: string, action: 'coordinated' | 'dismissed' | 'remark', notes: string) => {
    const flag = overlapFlags.find(f => f.id === flagId);
    if (!flag) return null;
    if (action === 'coordinated') flag.status = 'coordinated';
    if (action === 'dismissed') flag.status = 'dismissed';
    flag.updated_at = new Date().toISOString();

    const reviewEvent: OverlapReviewEvent = {
      id: `ov-rev-${Date.now()}`,
      flag_id: flagId,
      action,
      notes,
      reviewed_by: currentUser ? currentUser.id : 'sys',
      reviewed_by_name: currentUser ? currentUser.name : 'Authorized Official',
      reviewed_at: new Date().toISOString(),
    };
    overlapReviewEvents = [reviewEvent, ...overlapReviewEvents];
    return reviewEvent;
  },

  // Duplicate flags
  getDuplicateFlags: () => {
    return duplicateFlags.map(f => {
      const relatedCases = complaints.filter(c => f.case_ids.includes(c.id));
      return { ...f, cases: relatedCases };
    });
  },
  recordDuplicateReview: (flagId: string, action: 'confirmed_duplicate' | 'dismissed' | 'remark', notes: string) => {
    const flag = duplicateFlags.find(f => f.id === flagId);
    if (!flag) return null;
    if (action === 'confirmed_duplicate') flag.status = 'confirmed_duplicate';
    if (action === 'dismissed') flag.status = 'dismissed';

    const reviewEvent: DuplicateReviewEvent = {
      id: `dup-rev-${Date.now()}`,
      flag_id: flagId,
      action,
      notes,
      reviewed_by: currentUser ? currentUser.id : 'sys',
      reviewed_by_name: currentUser ? currentUser.name : 'Authorized Official',
      reviewed_at: new Date().toISOString(),
    };
    duplicateReviewEvents = [reviewEvent, ...duplicateReviewEvents];
    return reviewEvent;
  },

  // Alerts
  getAlerts: () => [...alerts],
  markAlertAsRead: (id: string) => {
    const alt = alerts.find(a => a.id === id);
    if (alt) alt.is_read = true;
  },

  // Computed metrics for dashboard
  getDashboardMetrics: () => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const underProcess = complaints.filter(c => c.status === 'under_process').length;
    const disposed = complaints.filter(c => c.status === 'disposed').length;
    const transferred = complaints.filter(c => c.status === 'transferred').length;
    const escalated = complaints.filter(c => c.status === 'escalated').length;

    // Computed view: cases pending beyond timeline (not disposed, disposal date < now)
    const now = new Date();
    const pendingBeyondTimeline = complaints.filter(c => {
      if (c.status === 'disposed') return false;
      if (!c.expected_disposal_date) return false;
      return new Date(c.expected_disposal_date) < now;
    }).length;

    const openOverlaps = overlapFlags.filter(f => f.status === 'open').length;
    const openDuplicates = duplicateFlags.filter(f => f.status === 'open').length;
    const pendingResolution = resolutionQueue.filter(q => q.status === 'pending').length;

    // Bureau-wise counts
    const bureauWorkload = mockBureaus.map(b => {
      const bureauComplaints = complaints.filter(c => c.bureau_code === b.code);
      return {
        code: b.code,
        name: b.name,
        total: bureauComplaints.length,
        active: bureauComplaints.filter(c => c.status !== 'disposed').length,
        disposed: bureauComplaints.filter(c => c.status === 'disposed').length,
      };
    });

    return {
      total,
      pending,
      underProcess,
      disposed,
      transferred,
      escalated,
      pendingBeyondTimeline,
      openOverlaps,
      openDuplicates,
      pendingResolution,
      bureauWorkload,
    };
  },

  // SLA rules
  getSLARules: () => [...mockSLARules],
};
