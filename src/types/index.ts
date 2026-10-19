export type Role =
  | 'rb_official'
  | 'pgrc_official'
  | 'other_official'
  | 'regional'
  | 'senior'
  | 'admin';

export type BureauCode = 'RB' | 'PGRC' | 'EB' | 'AB' | 'QAC' | 'LC';

export interface Bureau {
  id: string;
  code: BureauCode;
  name: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  bureau_id?: string;
  bureau_code?: BureauCode;
  region?: string;
}

export interface Institution {
  id: string;
  aicte_permanent_id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  region: string;
  type: string;
  created_at: string;
}

export type CaseStatus =
  | 'pending'
  | 'under_process'
  | 'disposed'
  | 'transferred'
  | 'escalated';

export type ComplainantType = 'student' | 'faculty' | 'stakeholder' | 'other';
export type MatchMethod = 'id' | 'manual';

export interface Complaint {
  id: string;
  case_number: string;
  institution_id?: string | null;
  institution_name_raw: string;
  permanent_id_raw?: string | null;
  category: string;
  description: string;
  complainant_type: ComplainantType;
  date_received: string;
  status: CaseStatus;
  bureau_id: string;
  bureau_code: BureauCode;
  assigned_officer_id?: string | null;
  assigned_officer_name?: string | null;
  last_action?: string | null;
  next_action?: string | null;
  last_action_date?: string | null;
  expected_disposal_date?: string | null;
  match_method?: MatchMethod;
  created_at: string;
  // Related institution object when resolved
  institution?: Institution;
}

export interface CaseAction {
  id: string;
  case_id: string;
  action_type:
    | 'created'
    | 'updated'
    | 'remark'
    | 'transferred'
    | 'escalated'
    | 'disposed'
    | 'institution_resolved';
  performed_by: string;
  performed_by_name: string;
  bureau_id: string;
  bureau_code: BureauCode;
  remarks: string;
  before_state?: Record<string, any>;
  after_state?: Record<string, any>;
  from_bureau_code?: BureauCode;
  to_bureau_code?: BureauCode;
  created_at: string;
}

export interface InstitutionResolutionQueueItem {
  id: string;
  case_id: string;
  case_number: string;
  raw_institution_name: string;
  raw_permanent_id?: string | null;
  status: 'pending' | 'resolved';
  created_at: string;
  bureau_code: BureauCode;
}

export interface InstitutionMatchSuggestion {
  id: string;
  queue_id: string;
  suggested_institution_id: string;
  suggested_institution_name: string;
  suggested_permanent_id: string;
  confidence: number; // 0.0 to 1.0
  match_details: {
    name_similarity: number;
    address_match: boolean;
    state: string;
    city: string;
  };
}

export interface OverlapFlag {
  id: string;
  institution_id: string;
  institution_name: string;
  aicte_permanent_id: string;
  status: 'open' | 'reviewed' | 'coordinated' | 'dismissed';
  involved_bureaus: BureauCode[];
  case_ids: string[];
  cases?: Complaint[];
  created_at: string;
  updated_at: string;
}

export interface OverlapReviewEvent {
  id: string;
  flag_id: string;
  action: 'coordinated' | 'dismissed' | 'remark';
  notes: string;
  reviewed_by: string;
  reviewed_by_name: string;
  reviewed_at: string;
}

export interface DuplicateFlag {
  id: string;
  institution_id: string;
  institution_name: string;
  aicte_permanent_id: string;
  confidence: number;
  status: 'open' | 'confirmed_duplicate' | 'dismissed';
  case_ids: string[];
  cases?: Complaint[];
  created_at: string;
}

export interface DuplicateReviewEvent {
  id: string;
  flag_id: string;
  action: 'confirmed_duplicate' | 'dismissed' | 'remark';
  notes: string;
  reviewed_by: string;
  reviewed_by_name: string;
  reviewed_at: string;
}

export interface SLARule {
  id: string;
  category: string;
  bureau_id: string;
  bureau_code: BureauCode;
  days_allowed: number;
  warning_days_before: number;
}

export interface Alert {
  id: string;
  type:
    | 'overlap'
    | 'duplicate'
    | 'pending_reminder'
    | 'escalation'
    | 'sla_warning'
    | 'sla_breach';
  recipient_bureau_code?: BureauCode;
  recipient_user_id?: string;
  case_id?: string;
  case_number?: string;
  flag_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
