import {
  Bureau,
  User,
  Institution,
  Complaint,
  CaseAction,
  InstitutionResolutionQueueItem,
  InstitutionMatchSuggestion,
  OverlapFlag,
  OverlapReviewEvent,
  DuplicateFlag,
  DuplicateReviewEvent,
  SLARule,
  Alert
} from '@/types';

// ==========================================
// 1. BUREAUS (6 Key Wings)
// ==========================================
export const mockBureaus: Bureau[] = [
  { id: 'b-1', code: 'RB', name: 'Regulation Bureau', description: 'Handles institution regulatory compliance, faculty cadres, and statutory norms' },
  { id: 'b-2', code: 'PGRC', name: 'Public Grievance Redressal Cell', description: 'Grievances from students, faculty, staff and general public' },
  { id: 'b-3', code: 'EB', name: 'Extension Bureau', description: 'Affiliation extensions, variation in intake, and seat approvals' },
  { id: 'b-4', code: 'AB', name: 'Approval Bureau', description: 'New institution approvals, land/building scrutiny, and closures' },
  { id: 'b-5', code: 'QAC', name: 'Quality Assurance Cell', description: 'Academic quality oversight, NBA/NAAC compliance, and curriculum' },
  { id: 'b-6', code: 'LC', name: 'Legal Cell', description: 'Court matters, legal notices, litigation, and statutory appeals' },
];

// ==========================================
// 2. DEMO USERS (Representative Roles)
// ==========================================
export const mockUsers: User[] = [
  { id: 'u-1', name: 'Dr. Ramesh Sharma', email: 'admin@aicte.gov.in', role: 'admin' },
  { id: 'u-2', name: 'Smt. Anjali Gupta', email: 'rb.officer@aicte.gov.in', role: 'rb_official', bureau_id: 'b-1', bureau_code: 'RB', region: 'North' },
  { id: 'u-3', name: 'Shri Vikram Desai', email: 'pgrc.officer@aicte.gov.in', role: 'pgrc_official', bureau_id: 'b-2', bureau_code: 'PGRC', region: 'West' },
  { id: 'u-4', name: 'Prof. K. Swaminathan', email: 'senior.management@aicte.gov.in', role: 'senior' },
  { id: 'u-5', name: 'Dr. Sunita Rao', email: 'regional.south@aicte.gov.in', role: 'regional', region: 'South' },
  { id: 'u-6', name: 'Shri Manoj Verma', email: 'eb.officer@aicte.gov.in', role: 'other_official', bureau_id: 'b-3', bureau_code: 'EB' },
  { id: 'u-7', name: 'Adv. Priya Malhotra', email: 'legal.officer@aicte.gov.in', role: 'other_official', bureau_id: 'b-6', bureau_code: 'LC' },
  { id: 'u-8', name: 'Dr. Alok Sen', email: 'qac.officer@aicte.gov.in', role: 'other_official', bureau_id: 'b-5', bureau_code: 'QAC', region: 'East' },
];

// ==========================================
// 3. 60 FICTIONAL INSTITUTIONS
// ==========================================
const statesAndDistricts = [
  { state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', region: 'North' },
  { state: 'Uttar Pradesh', district: 'Lucknow', region: 'North' },
  { state: 'Maharashtra', district: 'Pune', region: 'West' },
  { state: 'Maharashtra', district: 'Mumbai Suburban', region: 'West' },
  { state: 'Karnataka', district: 'Bengaluru Urban', region: 'South' },
  { state: 'Karnataka', district: 'Mysuru', region: 'South' },
  { state: 'Tamil Nadu', district: 'Chennai', region: 'South' },
  { state: 'Tamil Nadu', district: 'Coimbatore', region: 'South' },
  { state: 'Telangana', district: 'Hyderabad', region: 'South-Central' },
  { state: 'Andhra Pradesh', district: 'Visakhapatnam', region: 'South-Central' },
  { state: 'West Bengal', district: 'Kolkata', region: 'East' },
  { state: 'Madhya Pradesh', district: 'Bhopal', region: 'Central' },
  { state: 'Gujarat', district: 'Ahmedabad', region: 'West' },
  { state: 'Rajasthan', district: 'Jaipur', region: 'North-West' },
  { state: 'Kerala', district: 'Ernakulam', region: 'South-West' },
];

const institutionPrefixes = [
  'Apex', 'National', 'Silicon Valley', 'Vanguard', 'Kolkata Metropolitan',
  'Aryabhatta', 'Bharati', 'Chanakya', 'Dronacharya', 'Everest',
  'Frontier', 'Global', 'Himalayan', 'Imperial', 'Jupiter',
  'Kohinoor', 'Lakshya', 'Metropolitan', 'Navodaya', 'Orion',
  'Pioneer', 'Quantum', 'Radhakrishnan', 'Saraswati', 'Trident',
  'Universal', 'Vidyapeeth', 'Western India', 'Xavier', 'Zenith',
  'Aakash', 'Brahmaputra', 'Cauvery', 'Deccan', 'East Coast',
  'Godavari', 'Indus', 'Jhelum', 'Konkan', 'Malabar',
  'Narmada', 'Patliputra', 'Ranchi Institute of', 'Sahyadri', 'Thar',
  'Utkal', 'Vindhya', 'Yamuna', 'Acharya', 'Bengal',
  'Cyberabad', 'Dr. APJ Abdul Kalam', 'Emerald', 'Future Institute of', 'Ganga',
  'Heritage', 'Insight', 'Jyoti', 'Kaveri', 'Lotus'
];

const institutionTypes = [
  'Engineering & Technology',
  'Management (MBA/PGDM)',
  'Pharmacy',
  'Architecture & Planning',
  'MCA / Computer Applications',
  'Applied Arts & Crafts'
];

export const mockInstitutions: Institution[] = institutionPrefixes.map((prefix, idx) => {
  const loc = statesAndDistricts[idx % statesAndDistricts.length];
  const type = institutionTypes[idx % institutionTypes.length];
  const idNumber = String(1000000000 + (idx + 1) * 31415926 % 899999999);
  const permanentId = `1-${idNumber.slice(0, 10)}`;

  let name = `${prefix} Institute of Technology & Management`;
  if (type.includes('Management')) name = `${prefix} Business School & Research Centre`;
  if (type.includes('Pharmacy')) name = `${prefix} College of Pharmaceutical Sciences`;
  if (type.includes('Architecture')) name = `${prefix} School of Architecture & Design`;

  return {
    id: `inst-${idx + 1}`,
    aicte_permanent_id: permanentId,
    name,
    address: `Plot No. ${(idx + 1) * 7}, Institutional Area, Phase-${(idx % 4) + 1}`,
    district: loc.district,
    state: loc.state,
    region: loc.region,
    type,
    created_at: new Date(2022, (idx % 12), ((idx % 28) + 1)).toISOString(),
  };
});

// ==========================================
// 4. EXACTLY 250 REALISTIC DEMO COMPLAINTS
// ==========================================
export interface CategoryTemplate {
  category: string;
  defaultBureau: 'RB' | 'PGRC' | 'EB' | 'AB' | 'QAC' | 'LC';
  templates: string[];
}

const complaintCategoryTemplates: CategoryTemplate[] = [
  {
    category: 'Faculty & Cadre Ratio Deficiency',
    defaultBureau: 'RB',
    templates: [
      'Operating with only 35% qualified regular faculty; unapproved adjuncts and guest lecturers taking core semester classes without mandated AICTE qualification norms.',
      'Cadre ratio severely violated in Computer Science and Electronics departments: zero Professors in position against mandatory cadre ratio of 1:2:6.',
      'Faculty members forced to sign pay vouchers for 7th CPC scales while receiving less than 50% net salary through cash return kickbacks.',
      'Mass termination of senior faculty prior to AICTE annual approval inspection without notice period or terminal dues clearance.',
      'Falsified faculty biometric attendance records submitted to approval portal; ghost faculty registered under AICTE Faculty ID.'
    ]
  },
  {
    category: 'Non-refund of Fees & Retention of Original Certificates',
    defaultBureau: 'PGRC',
    templates: [
      'Management refusing to refund tuition and development fees following withdrawal prior to AICTE cut-off deadline.',
      'Original 10th, 12th marks cards and migration certificates unlawfully retained to coerce students into continuing second-year enrollment.',
      'Exorbitant unauthorized penalty of Rs. 1,50,000 demanded for issuing college leaving transfer certificate (TC).',
      'Caution money deposit not refunded to graduated batch despite submission of clearance certificates over 8 months ago.',
      'Forced collection of unapproved annual hostel and mess charges despite student opting for day-scholar attendance.'
    ]
  },
  {
    category: 'Infrastructure & Safety Norm Violations',
    defaultBureau: 'RB',
    templates: [
      'Laboratory equipment for Advanced Fluid Mechanics and Robotics completely defunct and non-operational during curriculum practicals.',
      'Fire safety clearance expired over 14 months ago; emergency exit stairways blocked by temporary administrative partition walls.',
      'Library lacking mandatory minimum national/international journal subscriptions and online database access licences.',
      'Operating academic classes in unapproved rented commercial complex 6 km away from approved permanent campus land.',
      'Deficient barrier-free environment: no functional ramps, disabled-friendly washrooms or lifts available for physically challenged students.'
    ]
  },
  {
    category: 'Unapproved Intake Expansion & Quota Violations',
    defaultBureau: 'EB',
    templates: [
      'Admitted 240 students in MBA program against AICTE sanctioned intake approval of only 120 seats.',
      'Supernumerary seats under Tuition Fee Waiver (TFW) scheme allocated to non-eligible full-fee management quota candidates.',
      'Operating unauthorized evening shift diploma courses without obtaining extension of approval (EoA) from AICTE.',
      'Management quota admissions finalized without adhering to state merit counselling guidelines and published fee structures.',
      'Running collaborative foreign university twinning program without statutory AICTE/UGC tripartite approval.'
    ]
  },
  {
    category: 'Ragging & Student Harassment Inaction',
    defaultBureau: 'PGRC',
    templates: [
      'Hostel warden and campus anti-ragging squad failed to take cognizance of physical ragging complaint lodged by first-year hostellers.',
      'Internal Complaints Committee (ICC) not constituted in compliance with AICTE (Gender Sensitization, Prevention and Prohibition of Sexual Harassment) Regulations.',
      'CCTV cameras in hostel corridors and common dining areas deliberately disconnected during reported ragging incidents.',
      'Complainant student subjected to retaliatory internal examination marking following formal grievance filing.',
      'Lack of professional psychological counselor and functional 24x7 student grievance redressal mechanism on campus.'
    ]
  },
  {
    category: 'Withholding of Stipends & Scholarship Embezzlement',
    defaultBureau: 'PGRC',
    templates: [
      'GPAT monthly PG scholarship stipend delayed by institutional accounts department for 6 consecutive months.',
      'Post-matric scholarship funds disbursed by social welfare department not credited to reserved-category students bank accounts.',
      'Direct Benefit Transfer (DBT) credentials of students tampered with by college administrative staff to divert fee subsidies.',
      'Mandatory teaching assistantship honorarium for M.Tech GATE scholars withheld citing institutional budget constraints.',
      'Deductions made from PM-USPY stipend under arbitrary heading of campus infrastructure development fees.'
    ]
  },
  {
    category: 'Curriculum & Examination Malpractices',
    defaultBureau: 'QAC',
    templates: [
      'Autonomous institute altered semester grading curves arbitrarily to inflate placement eligibility records.',
      'Internal continuous assessment marks awarded without conducting laboratory evaluations and midterm tests.',
      'Mandatory AICTE model curriculum internships not arranged; students forced to purchase fake completion certificates.',
      'Unqualified non-Ph.D. faculty assigned as research supervisors for postgraduate thesis dissertations.',
      'Failure to conduct remedial classes for academically weak students despite central funding allocation.'
    ]
  },
  {
    category: 'Land & Building Title Litigation',
    defaultBureau: 'LC',
    templates: [
      'Campus land subject to High Court stay order regarding disputed agricultural ceiling acquisition; title deed defective.',
      'Municipal corporation served building demolition notice for unauthorized construction of 4th and 5th engineering block floors.',
      'Institute trust undergoing internal factional litigation affecting administrative cheques and salary clearing accounts.',
      'Contempt petition initiated for non-implementation of university appellate tribunal directive on staff reinstatement.',
      'Lease agreement for campus sports ground expired and renewed through disputed power-of-attorney documentation.'
    ]
  }
];

const complainantTypes: Array<'student' | 'faculty' | 'stakeholder' | 'other'> = [
  'student', 'faculty', 'stakeholder', 'other'
];

const statuses: Array<'pending' | 'under_process' | 'disposed' | 'transferred' | 'escalated'> = [
  'pending', 'under_process', 'disposed', 'transferred', 'escalated'
];

// Helper to deterministically build 250 cases
function generate250Complaints(): Complaint[] {
  const result: Complaint[] = [];
  const baseDate = new Date('2026-03-01T10:00:00Z').getTime();

  for (let i = 1; i <= 250; i++) {
    const caseNumber = `TRAC-2026-${String(i).padStart(5, '0')}`;
    const catObj = complaintCategoryTemplates[i % complaintCategoryTemplates.length];
    const category = catObj.category;
    const descTemplate = catObj.templates[i % catObj.templates.length];

    // Assigned Bureau: primarily follows category, with deliberate cross-bureau assignments
    let bureauCode = catObj.defaultBureau;
    if (i % 7 === 0) bureauCode = 'RB';
    if (i % 11 === 0) bureauCode = 'PGRC';
    if (i % 17 === 0) bureauCode = 'EB';

    const bureau = mockBureaus.find(b => b.code === bureauCode) || mockBureaus[0];

    // Status distribution
    let status: 'pending' | 'under_process' | 'disposed' | 'transferred' | 'escalated';
    if (i <= 65) status = 'under_process';
    else if (i <= 135) status = 'pending';
    else if (i <= 185) status = 'disposed';
    else if (i <= 220) status = 'transferred';
    else status = 'escalated';

    // Institution resolution logic:
    // Cases 241-250: UNRESOLVED for the Institution Resolution Queue!
    const isUnresolvedQueueItem = i >= 241 && i <= 250;

    let inst: Institution | undefined = undefined;
    let institutionNameRaw = '';
    let permanentIdRaw: string | null = null;
    let matchMethod: 'id' | 'manual' | undefined = undefined;

    if (isUnresolvedQueueItem) {
      // Missing or variant name
      const targetInst = mockInstitutions[(i * 3) % mockInstitutions.length];
      if (i % 2 === 0) {
        institutionNameRaw = `${targetInst.name.split(' ')[0]} Engg College, Campus 2`;
        permanentIdRaw = null; // Missing ID
      } else {
        institutionNameRaw = `${targetInst.name.replace('Institute', 'Inst.')}`;
        permanentIdRaw = '1-9999999999'; // Non-existent ID
      }
      matchMethod = undefined;
      inst = undefined;
    } else {
      // Deliberate cross-bureau overlap clusters on inst-1, inst-2, inst-3, inst-4, inst-5, inst-6
      // inst-1 has cases in RB (c-1, c-24) and PGRC (c-2, c-25)
      // inst-2 has cases in RB (c-3) and EB (c-26)
      // inst-3 has cases in PGRC (c-4) and LC (c-27)
      // inst-4 has cases in RB (c-5) and PGRC (c-28)
      // inst-5 has cases in EB (c-6) and RB (c-29)
      let targetInstIndex = (i - 1) % mockInstitutions.length;

      // Force overlaps on early index
      if (i === 24) targetInstIndex = 0; // inst-1 (Apex)
      if (i === 25) targetInstIndex = 0; // inst-1 (Apex)
      if (i === 26) targetInstIndex = 1; // inst-2 (National)
      if (i === 27) targetInstIndex = 2; // inst-3 (Silicon Valley)
      if (i === 28) targetInstIndex = 3; // inst-4 (Vanguard)
      if (i === 29) targetInstIndex = 4; // inst-5 (Kolkata Metro)

      // Force duplicates on inst-1
      // c-1 and c-107 are duplicate texts
      inst = mockInstitutions[targetInstIndex];
      institutionNameRaw = inst.name;
      permanentIdRaw = inst.aicte_permanent_id;
      matchMethod = 'id';
    }

    // Assigned officer
    const officer = mockUsers.find(u => u.bureau_code === bureauCode) || mockUsers[1];

    // Dates
    const daysAgo = (250 - i) * 0.9;
    const dateReceived = new Date(baseDate + (i * 86400000 * 0.8)).toISOString();

    // Expected disposal: 30 to 45 days after receipt
    const expDate = new Date(new Date(dateReceived).getTime() + (35 * 86400000));
    const expectedDisposalDate = expDate.toISOString();

    // Overdue logic: For some under_process/pending/escalated cases, expectedDisposalDate is in the past!
    // Current local simulated date is around Oct 2026. If dateReceived was in March-August 2026, it is overdue.
    const isOverdue = status !== 'disposed' && (i % 6 === 0);

    // Last Action
    let lastAction = 'Initial verification completed; awaiting institutional response';
    if (status === 'transferred') lastAction = `Transferred from other cell to ${bureauCode} for specialized scrutiny`;
    if (status === 'escalated') lastAction = 'Escalated to Member Secretary & Scrutiny Committee';
    if (status === 'disposed') lastAction = 'Compliance verified on-site; grievance disposed and closed';

    let nextAction = 'Review compliance documentation';
    if (status === 'disposed') nextAction = 'Case closed';
    if (status === 'escalated') nextAction = 'Scrutiny hearing with Chairman';

    const complainantType = complainantTypes[i % complainantTypes.length];

    result.push({
      id: `c-${i}`,
      case_number: caseNumber,
      institution_id: inst ? inst.id : null,
      institution_name_raw: institutionNameRaw,
      permanent_id_raw: permanentIdRaw,
      category,
      description: i === 107
        ? 'Operating with only 35% qualified regular faculty; unapproved adjuncts taking core classes without AICTE approval qualification.' // Exact duplicate of c-1
        : `${descTemplate} (Reference Inspection Diary Item #${1000 + i})`,
      complainant_type: complainantType,
      date_received: dateReceived,
      status,
      bureau_id: bureau.id,
      bureau_code: bureau.code,
      assigned_officer_id: officer.id,
      assigned_officer_name: officer.name,
      last_action: lastAction,
      next_action: nextAction,
      last_action_date: new Date(new Date(dateReceived).getTime() + (5 * 86400000)).toISOString(),
      expected_disposal_date: expectedDisposalDate,
      match_method: matchMethod,
      created_at: dateReceived,
      institution: inst,
    });
  }

  return result;
}

export const mockComplaints: Complaint[] = generate250Complaints();

// ==========================================
// 5. CASE ACTIONS (Append-only Audit History)
// ==========================================
export const mockCaseActions: CaseAction[] = [
  {
    id: 'act-1',
    case_id: 'c-1',
    action_type: 'created',
    performed_by: 'u-2',
    performed_by_name: 'Smt. Anjali Gupta',
    bureau_id: 'b-1',
    bureau_code: 'RB',
    remarks: 'Complaint lodged by faculty association regarding severe cadre ratio violations in CSE department.',
    created_at: '2026-03-02T10:30:00Z',
  },
  {
    id: 'act-2',
    case_id: 'c-1',
    action_type: 'updated',
    performed_by: 'u-2',
    performed_by_name: 'Smt. Anjali Gupta',
    bureau_id: 'b-1',
    bureau_code: 'RB',
    remarks: 'Formal show-cause notice dispatched to Principal and Trust Chairman with 15-day compliance window.',
    created_at: '2026-03-10T14:00:00Z',
  },
  {
    id: 'act-3',
    case_id: 'c-2',
    action_type: 'created',
    performed_by: 'u-3',
    performed_by_name: 'Shri Vikram Desai',
    bureau_id: 'b-2',
    bureau_code: 'PGRC',
    remarks: 'Grievance received from 14 final-year students regarding retention of original migration certificates.',
    created_at: '2026-03-03T11:15:00Z',
  },
  {
    id: 'act-4',
    case_id: 'c-4',
    action_type: 'transferred',
    performed_by: 'u-2',
    performed_by_name: 'Smt. Anjali Gupta',
    bureau_id: 'b-3',
    bureau_code: 'EB',
    from_bureau_code: 'RB',
    to_bureau_code: 'EB',
    remarks: 'Matter relates to excess intake quota approval; transferred to Extension Bureau for verification.',
    created_at: '2026-03-12T15:30:00Z',
  },
  {
    id: 'act-5',
    case_id: 'c-221',
    action_type: 'escalated',
    performed_by: 'u-3',
    performed_by_name: 'Shri Vikram Desai',
    bureau_id: 'b-2',
    bureau_code: 'PGRC',
    remarks: 'Escalated to Member Secretary due to persistent failure of management to appear before scrutiny committee.',
    created_at: '2026-09-01T16:00:00Z',
  },
  {
    id: 'act-6',
    case_id: 'c-140',
    action_type: 'disposed',
    performed_by: 'u-3',
    performed_by_name: 'Shri Vikram Desai',
    bureau_id: 'b-2',
    bureau_code: 'PGRC',
    remarks: 'Institution refunded excess fee via RTGS; bank compliance challan verified by regional officer.',
    created_at: '2026-08-15T12:00:00Z',
  }
];

// ==========================================
// 6. RESOLUTION QUEUE & SUGGESTIONS (Cases 241-250)
// ==========================================
export const mockResolutionQueue: InstitutionResolutionQueueItem[] = [241, 242, 243, 244, 245, 246, 247, 248, 249, 250].map((num, idx) => {
  const c = mockComplaints.find(comp => comp.id === `c-${num}`)!;
  return {
    id: `q-${idx + 1}`,
    case_id: c.id,
    case_number: c.case_number,
    raw_institution_name: c.institution_name_raw,
    raw_permanent_id: c.permanent_id_raw,
    status: 'pending',
    created_at: c.date_received,
    bureau_code: c.bureau_code,
  };
});

export const mockMatchSuggestions: InstitutionMatchSuggestion[] = [
  {
    id: 'sug-1',
    queue_id: 'q-1',
    suggested_institution_id: 'inst-1',
    suggested_institution_name: 'Apex Institute of Technology & Management',
    suggested_permanent_id: mockInstitutions[0].aicte_permanent_id,
    confidence: 0.88,
    match_details: {
      name_similarity: 0.86,
      address_match: true,
      state: 'Uttar Pradesh',
      city: 'Gautam Buddha Nagar',
    }
  },
  {
    id: 'sug-2',
    queue_id: 'q-1',
    suggested_institution_id: 'inst-7',
    suggested_institution_name: 'Aryabhatta Institute of Technology & Management',
    suggested_permanent_id: mockInstitutions[6].aicte_permanent_id,
    confidence: 0.35,
    match_details: {
      name_similarity: 0.32,
      address_match: false,
      state: 'Uttar Pradesh',
      city: 'Lucknow',
    }
  },
  {
    id: 'sug-3',
    queue_id: 'q-2',
    suggested_institution_id: 'inst-2',
    suggested_institution_name: 'National College of Engineering & Research',
    suggested_permanent_id: mockInstitutions[1].aicte_permanent_id,
    confidence: 0.91,
    match_details: {
      name_similarity: 0.92,
      address_match: true,
      state: 'Maharashtra',
      city: 'Pune',
    }
  },
  {
    id: 'sug-4',
    queue_id: 'q-3',
    suggested_institution_id: 'inst-3',
    suggested_institution_name: 'Silicon Valley Business School & Research Centre',
    suggested_permanent_id: mockInstitutions[2].aicte_permanent_id,
    confidence: 0.82,
    match_details: {
      name_similarity: 0.80,
      address_match: true,
      state: 'Karnataka',
      city: 'Bengaluru Urban',
    }
  }
];

// ==========================================
// 7. CROSS-BUREAU OVERLAP FLAGS
// (Active cases for same institution in diff Bureaus)
// ==========================================
export const mockOverlapFlags: OverlapFlag[] = [
  {
    id: 'ov-1',
    institution_id: 'inst-1',
    institution_name: 'Apex Institute of Technology & Management',
    aicte_permanent_id: mockInstitutions[0].aicte_permanent_id,
    status: 'open',
    involved_bureaus: ['RB', 'PGRC'],
    case_ids: ['c-1', 'c-2'], // c-1 in RB (under_process), c-2 in PGRC (pending)
    created_at: '2026-03-03T11:20:00Z',
    updated_at: '2026-03-03T11:20:00Z',
  },
  {
    id: 'ov-2',
    institution_id: 'inst-2',
    institution_name: 'National College of Engineering & Research',
    aicte_permanent_id: mockInstitutions[1].aicte_permanent_id,
    status: 'open',
    involved_bureaus: ['RB', 'EB'],
    case_ids: ['c-3', 'c-26'], // c-3 in RB, c-26 in EB
    created_at: '2026-03-25T14:10:00Z',
    updated_at: '2026-03-25T14:10:00Z',
  },
  {
    id: 'ov-3',
    institution_id: 'inst-3',
    institution_name: 'Silicon Valley Business School & Research Centre',
    aicte_permanent_id: mockInstitutions[2].aicte_permanent_id,
    status: 'open',
    involved_bureaus: ['PGRC', 'LC'],
    case_ids: ['c-4', 'c-27'], // c-4 in PGRC, c-27 in LC
    created_at: '2026-04-02T09:45:00Z',
    updated_at: '2026-04-02T09:45:00Z',
  },
  {
    id: 'ov-4',
    institution_id: 'inst-4',
    institution_name: 'Vanguard College of Pharmaceutical Sciences',
    aicte_permanent_id: mockInstitutions[3].aicte_permanent_id,
    status: 'coordinated',
    involved_bureaus: ['RB', 'PGRC'],
    case_ids: ['c-5', 'c-28'],
    created_at: '2026-04-12T16:00:00Z',
    updated_at: '2026-04-18T10:00:00Z',
  }
];

export const mockOverlapReviewEvents: OverlapReviewEvent[] = [
  {
    id: 'ov-rev-1',
    flag_id: 'ov-4',
    action: 'coordinated',
    notes: 'Joint coordination meeting between Smt. Anjali Gupta (RB) and Shri Vikram Desai (PGRC). RB leading the infrastructure inquiry.',
    reviewed_by: 'u-2',
    reviewed_by_name: 'Smt. Anjali Gupta',
    reviewed_at: '2026-04-18T10:00:00Z',
  }
];

// ==========================================
// 8. SUSPECTED DUPLICATE FLAGS (Isolated AI Engine)
// ==========================================
export const mockDuplicateFlags: DuplicateFlag[] = [
  {
    id: 'dup-1',
    institution_id: 'inst-1',
    institution_name: 'Apex Institute of Technology & Management',
    aicte_permanent_id: mockInstitutions[0].aicte_permanent_id,
    confidence: 0.96,
    status: 'open',
    case_ids: ['c-1', 'c-107'], // c-1 and c-107 are duplicate texts
    created_at: '2026-06-15T14:25:00Z',
  },
  {
    id: 'dup-2',
    institution_id: 'inst-2',
    institution_name: 'National College of Engineering & Research',
    aicte_permanent_id: mockInstitutions[1].aicte_permanent_id,
    confidence: 0.89,
    status: 'open',
    case_ids: ['c-3', 'c-83'],
    created_at: '2026-05-20T11:00:00Z',
  }
];

export const mockDuplicateReviewEvents: DuplicateReviewEvent[] = [];

// ==========================================
// 9. STATUTORY SLA RULES
// ==========================================
export const mockSLARules: SLARule[] = [
  { id: 'sla-1', category: 'Faculty & Cadre Ratio Deficiency', bureau_id: 'b-1', bureau_code: 'RB', days_allowed: 45, warning_days_before: 7 },
  { id: 'sla-2', category: 'Non-refund of Fees & Retention of Original Certificates', bureau_id: 'b-2', bureau_code: 'PGRC', days_allowed: 30, warning_days_before: 5 },
  { id: 'sla-3', category: 'Infrastructure & Safety Norm Violations', bureau_id: 'b-1', bureau_code: 'RB', days_allowed: 45, warning_days_before: 7 },
  { id: 'sla-4', category: 'Unapproved Intake Expansion & Quota Violations', bureau_id: 'b-3', bureau_code: 'EB', days_allowed: 60, warning_days_before: 10 },
  { id: 'sla-5', category: 'Ragging & Student Harassment Inaction', bureau_id: 'b-2', bureau_code: 'PGRC', days_allowed: 15, warning_days_before: 3 },
  { id: 'sla-6', category: 'Withholding of Stipends & Scholarship Embezzlement', bureau_id: 'b-2', bureau_code: 'PGRC', days_allowed: 30, warning_days_before: 5 },
  { id: 'sla-7', category: 'Curriculum & Examination Malpractices', bureau_id: 'b-5', bureau_code: 'QAC', days_allowed: 40, warning_days_before: 7 },
  { id: 'sla-8', category: 'Land & Building Title Litigation', bureau_id: 'b-6', bureau_code: 'LC', days_allowed: 90, warning_days_before: 14 },
];

// ==========================================
// 10. REALISTIC SURVEILLANCE ALERTS
// ==========================================
export const mockAlerts: Alert[] = [
  {
    id: 'alt-1',
    type: 'overlap',
    recipient_bureau_code: 'RB',
    case_id: 'c-1',
    case_number: 'TRAC-2026-00001',
    flag_id: 'ov-1',
    message: 'Potential Overlapping Cases – Coordination Required: Apex Institute of Technology has active cases in RB and PGRC.',
    is_read: false,
    created_at: '2026-03-03T11:20:00Z',
  },
  {
    id: 'alt-2',
    type: 'overlap',
    recipient_bureau_code: 'PGRC',
    case_id: 'c-2',
    case_number: 'TRAC-2026-00002',
    flag_id: 'ov-1',
    message: 'Potential Overlapping Cases – Coordination Required: Apex Institute of Technology has active cases in PGRC and RB.',
    is_read: false,
    created_at: '2026-03-03T11:20:00Z',
  },
  {
    id: 'alt-3',
    type: 'overlap',
    recipient_bureau_code: 'EB',
    case_id: 'c-26',
    case_number: 'TRAC-2026-00026',
    flag_id: 'ov-2',
    message: 'Potential Overlapping Cases – Coordination Required: National College of Engineering has parallel active cases in EB and RB.',
    is_read: false,
    created_at: '2026-03-25T14:10:00Z',
  },
  {
    id: 'alt-4',
    type: 'duplicate',
    recipient_bureau_code: 'RB',
    case_id: 'c-107',
    case_number: 'TRAC-2026-00107',
    flag_id: 'dup-1',
    message: 'Suspected duplicate complaint: TRAC-2026-00107 matches existing case TRAC-2026-00001 with 96% similarity.',
    is_read: false,
    created_at: '2026-06-15T14:25:00Z',
  },
  {
    id: 'alt-5',
    type: 'sla_breach',
    recipient_bureau_code: 'PGRC',
    case_id: 'c-18',
    case_number: 'TRAC-2026-00018',
    message: 'SLA Breach: Case TRAC-2026-00018 is pending beyond prescribed timeline (Overdue by 24 days).',
    is_read: false,
    created_at: '2026-05-10T00:00:00Z',
  },
  {
    id: 'alt-6',
    type: 'escalation',
    case_id: 'c-221',
    case_number: 'TRAC-2026-00221',
    message: 'Escalation Notice: Case TRAC-2026-00221 escalated to Member Secretary & Scrutiny Committee.',
    is_read: true,
    created_at: '2026-09-01T16:00:00Z',
  }
];
