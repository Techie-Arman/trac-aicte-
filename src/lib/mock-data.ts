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
// CANONICAL SYNTHETIC DEMONSTRATION DATASET
// AICTE Institutional Grievance Surveillance
// ==========================================

// ==========================================
// 1. BUREAUS (6 Functional Wings)
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
  { id: 'u-9', name: 'Dr. Sanjay Deshmukh', email: 'ab.officer@aicte.gov.in', role: 'other_official', bureau_id: 'b-4', bureau_code: 'AB', region: 'North' },
];

// ==========================================
// 3. CANONICAL INSTITUTION MASTER DATASET (60 Institutions)
// Each AICTE Permanent ID resolves to exactly ONE verified canonical record
// ==========================================

interface InstitutionSeed {
  prefix: string;
  name: string;
  type: string;
  state: string;
  district: string;
  region: string;
  address: string;
}

const canonicalInstitutionSeeds: InstitutionSeed[] = [
  // 1. Apex
  {
    prefix: 'Apex',
    name: 'Apex Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Uttar Pradesh',
    district: 'Gautam Buddha Nagar',
    region: 'North',
    address: 'Plot No. 7, Institutional Area, Knowledge Park II'
  },
  // 2. National (Resolved canonical record: National College of Engineering & Research)
  {
    prefix: 'National',
    name: 'National College of Engineering & Research',
    type: 'Engineering & Technology',
    state: 'Maharashtra',
    district: 'Pune',
    region: 'West',
    address: 'Survey No. 44/1, Hinjawadi Infotech Park, Phase 1'
  },
  // 3. Silicon Valley (Resolved canonical record: Silicon Valley Business School & Research Centre)
  {
    prefix: 'Silicon Valley',
    name: 'Silicon Valley Business School & Research Centre',
    type: 'Management (MBA/PGDM)',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    region: 'South',
    address: 'Plot No. 21, Electronics City Phase I'
  },
  // 4. Vanguard (Resolved canonical record: Vanguard School of Architecture & Design)
  {
    prefix: 'Vanguard',
    name: 'Vanguard School of Architecture & Design',
    type: 'Architecture & Planning',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    region: 'West',
    address: 'Plot No. 28, Sector 15, Vashi'
  },
  // 5. Kolkata Metropolitan (Corrected location: West Bengal, East Region)
  {
    prefix: 'Kolkata Metropolitan',
    name: 'Kolkata Metropolitan Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'West Bengal',
    district: 'Kolkata',
    region: 'East',
    address: 'Plot No. 35, Sector V, Salt Lake City'
  },
  // 6. Aryabhatta
  {
    prefix: 'Aryabhatta',
    name: 'Aryabhatta Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Bihar',
    district: 'Patna',
    region: 'East',
    address: 'Bailey Road, Near Saguna More'
  },
  // 7. Ranchi (Corrected name: removed duplicate "Institute of", location: Jharkhand, East)
  {
    prefix: 'Ranchi',
    name: 'Ranchi Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Jharkhand',
    district: 'Ranchi',
    region: 'East',
    address: 'Namkum Industrial Area, Near Ring Road'
  },
  // 8. Bharati
  {
    prefix: 'Bharati',
    name: 'Bharati College of Pharmaceutical Sciences',
    type: 'Pharmacy',
    state: 'Maharashtra',
    district: 'Pune',
    region: 'West',
    address: 'Katraj-Dhankawadi Campus'
  },
  // 9. Chanakya
  {
    prefix: 'Chanakya',
    name: 'Chanakya Business School & Research Centre',
    type: 'Management (MBA/PGDM)',
    state: 'Delhi',
    district: 'South West Delhi',
    region: 'North',
    address: 'Institutional Area, Vasant Kunj Phase II'
  },
  // 10. Dronacharya
  {
    prefix: 'Dronacharya',
    name: 'Dronacharya Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Haryana',
    district: 'Gurugram',
    region: 'North',
    address: 'Khentawas, Farrukhnagar'
  },
  // 11. Everest
  {
    prefix: 'Everest',
    name: 'Everest Institute of Computer Applications',
    type: 'MCA / Computer Applications',
    state: 'Uttarakhand',
    district: 'Dehradun',
    region: 'North',
    address: 'Rajpur Road, Near IT Park'
  },
  // 12. Frontier
  {
    prefix: 'Frontier',
    name: 'Frontier College of Fine Arts & Design',
    type: 'Applied Arts & Crafts',
    state: 'Rajasthan',
    district: 'Jaipur',
    region: 'North-West',
    address: 'RIICO Institutional Area, Sitapura'
  },
  // 13. Global
  {
    prefix: 'Global',
    name: 'Global Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Gujarat',
    district: 'Ahmedabad',
    region: 'West',
    address: 'S.G. Highway, Gota'
  },
  // 14. Himalayan
  {
    prefix: 'Himalayan',
    name: 'Himalayan College of Pharmaceutical Sciences',
    type: 'Pharmacy',
    state: 'Himachal Pradesh',
    district: 'Solan',
    region: 'North',
    address: 'NH-22, Kumarhatti-Oachghat Road'
  },
  // 15. Imperial
  {
    prefix: 'Imperial',
    name: 'Imperial Business School & Research Centre',
    type: 'Management (MBA/PGDM)',
    state: 'Telangana',
    district: 'Hyderabad',
    region: 'South-Central',
    address: 'Financial District, Nanakramguda'
  },
  // 16. Jupiter
  {
    prefix: 'Jupiter',
    name: 'Jupiter School of Architecture & Design',
    type: 'Architecture & Planning',
    state: 'Gujarat',
    district: 'Vadodara',
    region: 'West',
    address: 'Gotri Road, Near Sevasi'
  },
  // 17. Kohinoor
  {
    prefix: 'Kohinoor',
    name: 'Kohinoor Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Punjab',
    district: 'Ludhiana',
    region: 'North-West',
    address: 'GT Road, Miller Ganj'
  },
  // 18. Lakshya
  {
    prefix: 'Lakshya',
    name: 'Lakshya Institute of Computer Applications',
    type: 'MCA / Computer Applications',
    state: 'Madhya Pradesh',
    district: 'Indore',
    region: 'Central',
    address: 'Bypass Road, Manglia'
  },
  // 19. Metropolitan
  {
    prefix: 'Metropolitan',
    name: 'Metropolitan College of Fine Arts & Crafts',
    type: 'Applied Arts & Crafts',
    state: 'Tamil Nadu',
    district: 'Chennai',
    region: 'South',
    address: 'Old Mahabalipuram Road, Navalur'
  },
  // 20. Navodaya
  {
    prefix: 'Navodaya',
    name: 'Navodaya Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Karnataka',
    district: 'Raichur',
    region: 'South',
    address: 'Navodaya Nagar, Mantralayam Road'
  },
  // 21. Orion
  {
    prefix: 'Orion',
    name: 'Orion College of Pharmaceutical Sciences',
    type: 'Pharmacy',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    region: 'South-Central',
    address: 'Rushikonda IT Park Road'
  },
  // 22. Pioneer
  {
    prefix: 'Pioneer',
    name: 'Pioneer Business School & Research Centre',
    type: 'Management (MBA/PGDM)',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    region: 'South',
    address: 'Avinashi Road, Peelamedu'
  },
  // 23. Quantum
  {
    prefix: 'Quantum',
    name: 'Quantum School of Architecture & Design',
    type: 'Architecture & Planning',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    region: 'North',
    address: 'Vipin Khand, Gomti Nagar'
  },
  // 24. Radhakrishnan
  {
    prefix: 'Radhakrishnan',
    name: 'Radhakrishnan Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Odisha',
    district: 'Khurda',
    region: 'East',
    address: 'Chandaka Industrial Estate, Bhubaneswar'
  },
  // 25. Saraswati
  {
    prefix: 'Saraswati',
    name: 'Saraswati Institute of Computer Applications',
    type: 'MCA / Computer Applications',
    state: 'Maharashtra',
    district: 'Nagpur',
    region: 'West',
    address: 'Hingna Road, MIDC Electronic Zone'
  },
  // 26. Trident
  {
    prefix: 'Trident',
    name: 'Trident College of Applied Arts & Crafts',
    type: 'Applied Arts & Crafts',
    state: 'West Bengal',
    district: 'Kolkata',
    region: 'East',
    address: 'Raja SC Mullick Road, Jadavpur'
  },
  // 27. Universal
  {
    prefix: 'Universal',
    name: 'Universal Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Kerala',
    district: 'Ernakulam',
    region: 'South-West',
    address: 'Kakkanad, Kochi InfoPark Corridor'
  },
  // 28. Vidyapeeth
  {
    prefix: 'Vidyapeeth',
    name: 'Vidyapeeth College of Pharmaceutical Sciences',
    type: 'Pharmacy',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    region: 'North',
    address: 'Cantt Industrial Area, GT Road'
  },
  // 29. Western India
  {
    prefix: 'Western India',
    name: 'Western India Business School & Research Centre',
    type: 'Management (MBA/PGDM)',
    state: 'Gujarat',
    district: 'Surat',
    region: 'West',
    address: 'Dumas Road, Magdalla'
  },
  // 30. Xavier
  {
    prefix: 'Xavier',
    name: 'Xavier School of Architecture & Design',
    type: 'Architecture & Planning',
    state: 'Goa',
    district: 'North Goa',
    region: 'West',
    address: 'Pomburpa Road, Porvorim'
  },
  // 31. Zenith
  {
    prefix: 'Zenith',
    name: 'Zenith Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Chhattisgarh',
    district: 'Raipur',
    region: 'Central',
    address: 'Vidhan Sabha Road, Mandir Hasaud'
  },
  // 32. Aakash
  {
    prefix: 'Aakash',
    name: 'Aakash Institute of Computer Applications',
    type: 'MCA / Computer Applications',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    region: 'East',
    address: 'Amiya Nagar, Guwahati'
  },
  // 33. Brahmaputra
  {
    prefix: 'Brahmaputra',
    name: 'Brahmaputra Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Assam',
    district: 'Kamrup',
    region: 'East',
    address: 'North Guwahati, Amingaon'
  },
  // 34. Cauvery
  {
    prefix: 'Cauvery',
    name: 'Cauvery College of Pharmaceutical Sciences',
    type: 'Pharmacy',
    state: 'Karnataka',
    district: 'Mysuru',
    region: 'South',
    address: 'Bannur Ring Road, Hebbal Industrial Area'
  },
  // 35. Deccan
  {
    prefix: 'Deccan',
    name: 'Deccan Business School & Research Centre',
    type: 'Management (MBA/PGDM)',
    state: 'Maharashtra',
    district: 'Pune',
    region: 'West',
    address: 'Karve Road, Erandwane'
  },
  // 36. East Coast
  {
    prefix: 'East Coast',
    name: 'East Coast School of Architecture & Design',
    type: 'Architecture & Planning',
    state: 'Tamil Nadu',
    district: 'Chengalpattu',
    region: 'South',
    address: 'East Coast Road, Kelambakkam'
  },
  // 37. Godavari
  {
    prefix: 'Godavari',
    name: 'Godavari Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    region: 'South-Central',
    address: 'Chaitanya Knowledge City, Rajahmundry'
  },
  // 38. Indus
  {
    prefix: 'Indus',
    name: 'Indus Institute of Computer Applications',
    type: 'MCA / Computer Applications',
    state: 'Gujarat',
    district: 'Gandhinagar',
    region: 'West',
    address: 'Koba-Gandhinagar Highway'
  },
  // 39. Jhelum
  {
    prefix: 'Jhelum',
    name: 'Jhelum College of Applied Arts & Crafts',
    type: 'Applied Arts & Crafts',
    state: 'Jammu and Kashmir',
    district: 'Jammu',
    region: 'North-West',
    address: 'Bari Brahmana Industrial Complex'
  },
  // 40. Konkan
  {
    prefix: 'Konkan',
    name: 'Konkan Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Maharashtra',
    district: 'Ratnagiri',
    region: 'West',
    address: 'Mirjole MIDC, Mirya Road'
  },
  // 41. Malabar
  {
    prefix: 'Malabar',
    name: 'Malabar College of Pharmaceutical Sciences',
    type: 'Pharmacy',
    state: 'Kerala',
    district: 'Kozhikode',
    region: 'South-West',
    address: 'Calicut Bypass Road, Pantheeramkavu'
  },
  // 42. Narmada
  {
    prefix: 'Narmada',
    name: 'Narmada Business School & Research Centre',
    type: 'Management (MBA/PGDM)',
    state: 'Madhya Pradesh',
    district: 'Jabalpur',
    region: 'Central',
    address: 'Mandla Road, Tilhari'
  },
  // 43. Patliputra
  {
    prefix: 'Patliputra',
    name: 'Patliputra School of Architecture & Design',
    type: 'Architecture & Planning',
    state: 'Bihar',
    district: 'Patna',
    region: 'East',
    address: 'Patliputra Industrial Estate'
  },
  // 44. Sahyadri
  {
    prefix: 'Sahyadri',
    name: 'Sahyadri Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Karnataka',
    district: 'Dakshina Kannada',
    region: 'South',
    address: 'Adyar, Mangaluru'
  },
  // 45. Thar
  {
    prefix: 'Thar',
    name: 'Thar Institute of Computer Applications',
    type: 'MCA / Computer Applications',
    state: 'Rajasthan',
    district: 'Jodhpur',
    region: 'North-West',
    address: 'Mogra, Pal-Sangarh Road'
  },
  // 46. Utkal
  {
    prefix: 'Utkal',
    name: 'Utkal College of Fine Arts & Design',
    type: 'Applied Arts & Crafts',
    state: 'Odisha',
    district: 'Bhubaneswar',
    region: 'East',
    address: 'Infocity Road, Patia'
  },
  // 47. Vindhya
  {
    prefix: 'Vindhya',
    name: 'Vindhya Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    region: 'Central',
    address: 'Raisen Road, Patel Nagar'
  },
  // 48. Yamuna
  {
    prefix: 'Yamuna',
    name: 'Yamuna College of Pharmaceutical Sciences',
    type: 'Pharmacy',
    state: 'Haryana',
    district: 'Yamunanagar',
    region: 'North',
    address: 'Near Chhachhrauli Road, Gadholi'
  },
  // 49. Acharya
  {
    prefix: 'Acharya',
    name: 'Acharya Business School & Research Centre',
    type: 'Management (MBA/PGDM)',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    region: 'South',
    address: 'Acharya Dr. Sarvepalli Radhakrishnan Road, Soladevanahalli'
  },
  // 50. Bengal
  {
    prefix: 'Bengal',
    name: 'Bengal School of Architecture & Design',
    type: 'Architecture & Planning',
    state: 'West Bengal',
    district: 'Howrah',
    region: 'East',
    address: 'NH-6, Kona Expressway'
  },
  // 51. Cyberabad
  {
    prefix: 'Cyberabad',
    name: 'Cyberabad Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Telangana',
    district: 'Hyderabad',
    region: 'South-Central',
    address: 'HITEC City, Madhapur'
  },
  // 52. Dr. APJ Abdul Kalam
  {
    prefix: 'Dr. APJ Abdul Kalam',
    name: 'Dr. APJ Abdul Kalam Institute of Computer Applications',
    type: 'MCA / Computer Applications',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    region: 'North',
    address: 'Sec-11, Jankipuram Vistar'
  },
  // 53. Emerald
  {
    prefix: 'Emerald',
    name: 'Emerald College of Applied Arts & Crafts',
    type: 'Applied Arts & Crafts',
    state: 'Kerala',
    district: 'Thiruvananthapuram',
    region: 'South-West',
    address: 'Technopark Phase III, Kazhakkoottam'
  },
  // 54. Future
  {
    prefix: 'Future',
    name: 'Future Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Uttar Pradesh',
    district: 'Bareilly',
    region: 'North',
    address: 'Bareilly-Lucknow Road, Faridpur'
  },
  // 55. Ganga
  {
    prefix: 'Ganga',
    name: 'Ganga College of Pharmaceutical Sciences',
    type: 'Pharmacy',
    state: 'Haryana',
    district: 'Jhajjar',
    region: 'North',
    address: 'Bahu Akbarpur, Rohtak-Delhi NH-10'
  },
  // 56. Heritage
  {
    prefix: 'Heritage',
    name: 'Heritage Business School & Research Centre',
    type: 'Management (MBA/PGDM)',
    state: 'West Bengal',
    district: 'Kolkata',
    region: 'East',
    address: 'Chowbaga Road, Anandapur'
  },
  // 57. Insight
  {
    prefix: 'Insight',
    name: 'Insight School of Architecture & Design',
    type: 'Architecture & Planning',
    state: 'Karnataka',
    district: 'Bengaluru Rural',
    region: 'South',
    address: 'Doddaballapur Main Road'
  },
  // 58. Jyoti
  {
    prefix: 'Jyoti',
    name: 'Jyoti Institute of Technology & Management',
    type: 'Engineering & Technology',
    state: 'Telangana',
    district: 'Rangareddy',
    region: 'South-Central',
    address: 'Turkayamjal, Nagarjuna Sagar Road'
  },
  // 59. Kaveri
  {
    prefix: 'Kaveri',
    name: 'Kaveri Institute of Computer Applications',
    type: 'MCA / Computer Applications',
    state: 'Tamil Nadu',
    district: 'Tiruchirappalli',
    region: 'South',
    address: 'Thuvakudi Industrial Area, NH-67'
  },
  // 60. Lotus
  {
    prefix: 'Lotus',
    name: 'Lotus College of Applied Arts & Crafts',
    type: 'Applied Arts & Crafts',
    state: 'Punjab',
    district: 'Mohali',
    region: 'North-West',
    address: 'Sector 82, JLPL Industrial Area'
  }
];

export const mockInstitutions: Institution[] = canonicalInstitutionSeeds.map((seed, idx) => {
  const idNumber = String(1000000000 + (idx + 1) * 31415926 % 899999999);
  const permanentId = `1-${idNumber.slice(0, 10)}`;

  return {
    id: `inst-${idx + 1}`,
    aicte_permanent_id: permanentId,
    name: seed.name,
    address: seed.address,
    district: seed.district,
    state: seed.state,
    region: seed.region,
    type: seed.type,
    created_at: new Date(2022, (idx % 12), ((idx % 28) + 1)).toISOString(),
  };
});

// ==========================================
// 4. COMPLAINT CATEGORY TEMPLATES (9 Categories across 6 Bureaus)
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
  },
  {
    category: 'Unapproved Campus Expansion & Land Norm Violations',
    defaultBureau: 'AB',
    templates: [
      'Operating academic programs in unapproved satellite building without prior scrutiny clearance from AICTE Approval Bureau.',
      'Commenced new technical intake without obtaining formal Letter of Approval (LoA) from Approval Bureau.',
      'Campus land encumbered with unapproved commercial third-party mortgage violating AICTE land ownership norms.',
      'Unauthorized alteration of structural floor plans for engineering workshops without statutory municipality and AICTE approval.',
      'Closure of undergraduate engineering division executed without mandatory student migration plan approved by Approval Bureau.'
    ]
  }
];

const complainantTypes: Array<'student' | 'faculty' | 'stakeholder' | 'other'> = [
  'student', 'faculty', 'stakeholder', 'other'
];

// Statutory SLA Days allowed per category (Configurable baseline: 30 days default)
const categorySLADaysMap: Record<string, number> = {
  'Faculty & Cadre Ratio Deficiency': 45,
  'Non-refund of Fees & Retention of Original Certificates': 30,
  'Infrastructure & Safety Norm Violations': 45,
  'Unapproved Intake Expansion & Quota Violations': 60,
  'Ragging & Student Harassment Inaction': 15,
  'Withholding of Stipends & Scholarship Embezzlement': 30,
  'Curriculum & Examination Malpractices': 40,
  'Land & Building Title Litigation': 90,
  'Unapproved Campus Expansion & Land Norm Violations': 45,
};

// ==========================================
// 5. EXACTLY 250 CANONICAL DEMO COMPLAINTS
// Reconciled Status Distribution:
// - under_process: 65
// - pending: 70
// - disposed: 50
// - transferred: 35
// - escalated: 30
// Total: 250 (Active: 200, Disposed: 50)
// ==========================================
function generate250Complaints(): Complaint[] {
  const result: Complaint[] = [];
  const now = new Date();
  const nowMs = now.getTime();

  // Create an explicit, realistic age distribution for the 200 active cases:
  // - Fresh (< 15 days): 55 cases
  // - Active (15 - 30 days): 65 cases
  // - Warning (30 - 45 days): 48 cases
  // - Critical (> 45 days): 32 cases
  // Total Active: 200 cases
  // Disposed: 50 cases (ages 40 - 110 days)
  const activeAgeSchedule: number[] = [];
  // 55 Fresh cases (ages 1 to 14 days)
  for (let k = 0; k < 55; k++) {
    activeAgeSchedule.push(1 + Math.floor((k / 55) * 13));
  }
  // 65 Active cases (ages 15 to 30 days)
  for (let k = 0; k < 65; k++) {
    activeAgeSchedule.push(15 + Math.floor((k / 65) * 15));
  }
  // 48 Warning cases (ages 31 to 45 days)
  for (let k = 0; k < 48; k++) {
    activeAgeSchedule.push(31 + Math.floor((k / 48) * 14));
  }
  // 32 Critical cases (ages 46 to 75 days)
  for (let k = 0; k < 32; k++) {
    activeAgeSchedule.push(46 + Math.floor((k / 32) * 29));
  }

  let activeIndex = 0;
  let disposedIndex = 0;

  for (let i = 1; i <= 250; i++) {
    const caseNumber = `TRAC-2026-${String(i).padStart(5, '0')}`;
    const catObj = complaintCategoryTemplates[i % complaintCategoryTemplates.length];
    const category = catObj.category;
    const descTemplate = catObj.templates[i % catObj.templates.length];

    // Status distribution
    let status: 'pending' | 'under_process' | 'disposed' | 'transferred' | 'escalated';
    if (i <= 65) status = 'under_process'; // 65
    else if (i <= 135) status = 'pending'; // 70
    else if (i <= 185) status = 'disposed'; // 50
    else if (i <= 220) status = 'transferred'; // 35
    else status = 'escalated'; // 30

    // Assigned Bureau: balanced across all 6 bureaus including Approval Bureau (AB)
    let bureauCode = catObj.defaultBureau;
    // Deliberate balanced assignment:
    if (i % 6 === 0) bureauCode = 'AB';
    else if (i % 5 === 0) bureauCode = 'EB';
    else if (i % 4 === 0) bureauCode = 'RB';
    else if (i % 7 === 0) bureauCode = 'QAC';
    else if (i % 11 === 0) bureauCode = 'LC';
    else if (i % 3 === 0) bureauCode = 'PGRC';

    // Specific case bureau locks for coherent test scenarios:
    if (i === 1) bureauCode = 'RB';   // c-1: Apex in RB
    if (i === 2) bureauCode = 'PGRC'; // c-2: Apex in PGRC (overlaps with c-1)
    if (i === 3) bureauCode = 'RB';   // c-3: National in RB
    if (i === 26) bureauCode = 'EB';  // c-26: National in EB (overlaps with c-3)
    if (i === 4) bureauCode = 'PGRC'; // c-4: Silicon Valley in PGRC
    if (i === 27) bureauCode = 'LC';  // c-27: Silicon Valley in LC (overlaps with c-4)
    if (i === 5) bureauCode = 'RB';   // c-5: Vanguard in RB
    if (i === 28) bureauCode = 'AB';  // c-28: Vanguard in AB (overlaps with c-5)
    if (i === 107) bureauCode = 'RB'; // c-107: Apex in RB (duplicate text of c-1)
    if (i === 83) bureauCode = 'PGRC'; // c-83: National in PGRC (duplicate text of c-3)

    const bureau = mockBureaus.find(b => b.code === bureauCode) || mockBureaus[0];

    // Institution resolution logic:
    // Cases 241-250: UNRESOLVED for the Institution Resolution Queue!
    const isUnresolvedQueueItem = i >= 241 && i <= 250;

    let inst: Institution | undefined = undefined;
    let institutionNameRaw = '';
    let permanentIdRaw: string | null = null;
    let matchMethod: 'id' | 'manual' | undefined = undefined;

    if (isUnresolvedQueueItem) {
      // Missing or variant name submitted by public complainant
      if (i === 241) {
        // Targets inst-4: Vanguard School of Architecture & Design
        institutionNameRaw = 'Vanguard Inst. of Architecture & Design';
        permanentIdRaw = null; // Missing ID
      } else if (i === 242) {
        // Targets inst-6: Aryabhatta Institute of Technology & Management
        institutionNameRaw = 'Aryabhatta Inst. of Technology';
        permanentIdRaw = '1-9999999999'; // Non-existent ID
      } else if (i === 243) {
        // Targets inst-1: Apex Institute
        institutionNameRaw = 'Apex Inst. of Technology, Campus 2';
        permanentIdRaw = null;
      } else if (i === 244) {
        // Targets inst-2: National College
        institutionNameRaw = 'National Engg College Research Wing';
        permanentIdRaw = '1-0000000000';
      } else if (i === 245) {
        // Targets inst-5: Kolkata Metropolitan
        institutionNameRaw = 'Kolkata Metro Inst. of Tech & Mgmt';
        permanentIdRaw = null;
      } else if (i === 246) {
        // Targets inst-7: Ranchi Institute
        institutionNameRaw = 'Ranchi Tech & Mgmt College';
        permanentIdRaw = '1-9876543210';
      } else {
        const targetInst = mockInstitutions[(i * 3) % mockInstitutions.length];
        institutionNameRaw = `${targetInst.name.split(' ')[0]} Engg College`;
        permanentIdRaw = i % 2 === 0 ? null : '1-9999999999';
      }
      matchMethod = undefined;
      inst = undefined;
    } else {
      let targetInstIndex = (i - 1) % mockInstitutions.length;

      // Deterministic Overlap clusters:
      // inst-1 (Apex): c-1 in RB, c-2 in PGRC, c-107 in RB
      if (i === 1 || i === 2 || i === 107) targetInstIndex = 0;
      // inst-2 (National): c-3 in RB, c-26 in EB, c-83 in PGRC
      if (i === 3 || i === 26 || i === 83) targetInstIndex = 1;
      // inst-3 (Silicon Valley): c-4 in PGRC, c-27 in LC
      if (i === 4 || i === 27) targetInstIndex = 2;
      // inst-4 (Vanguard): c-5 in RB, c-28 in AB
      if (i === 5 || i === 28) targetInstIndex = 3;
      // inst-5 (Kolkata Metropolitan): c-6 in EB, c-29 in RB
      if (i === 6 || i === 29) targetInstIndex = 4;

      inst = mockInstitutions[targetInstIndex];
      institutionNameRaw = inst.name;
      permanentIdRaw = inst.aicte_permanent_id;
      matchMethod = 'id';
    }

    // Officer assignment
    const officer = mockUsers.find(u => u.bureau_code === bureauCode) || mockUsers[1];

    // Case Age and Dates calculation
    let ageDays: number;
    if (status === 'disposed') {
      ageDays = 40 + Math.floor((disposedIndex / 50) * 60);
      disposedIndex++;
    } else {
      ageDays = activeAgeSchedule[activeIndex] || 20;
      activeIndex++;
    }

    const dateReceived = new Date(nowMs - ageDays * 86400000).toISOString();
    const allowedDays = categorySLADaysMap[category] || 30;
    const expectedDisposalDate = new Date(new Date(dateReceived).getTime() + (allowedDays * 86400000)).toISOString();

    // Descriptions with coherent duplicates
    let description: string;
    let categoryName = category;

    if (i === 1) {
      categoryName = 'Faculty & Cadre Ratio Deficiency';
      description = 'Operating with only 35% qualified regular faculty in Computer Science and Engineering; unapproved adjuncts taking core classes without mandatory AICTE qualification norms. (Inspection Diary #1001)';
    } else if (i === 107) {
      categoryName = 'Faculty & Cadre Ratio Deficiency';
      // Genuinely similar duplicate of c-1 for same institution inst-1
      description = 'Computer Science department operating with severe faculty shortage of 35% regular staff; unapproved guest lecturers conducting core theory classes violating AICTE cadre norms. (Inspection Diary #1107)';
    } else if (i === 2) {
      categoryName = 'Non-refund of Fees & Retention of Original Certificates';
      description = 'Grievance received from final-year engineering students regarding retention of original migration certificates and non-refund of caution deposit. (Inspection Diary #1002)';
    } else if (i === 3) {
      categoryName = 'Non-refund of Fees & Retention of Original Certificates';
      description = 'Management refusing to refund first-year tuition fees following admission cancellation prior to national cut-off; original migration certificates withheld. (Inspection Diary #1003)';
    } else if (i === 83) {
      categoryName = 'Non-refund of Fees & Retention of Original Certificates';
      // Genuinely similar duplicate of c-3 for same institution inst-2
      description = 'College administration declines refund of paid tuition fees and retains original migration certificate after admission cancellation before AICTE cut-off deadline. (Inspection Diary #1083)';
    } else {
      description = `${descTemplate} (Reference Inspection Diary Item #${1000 + i})`;
    }

    // Actions
    let lastAction = 'Initial verification completed; awaiting institutional response';
    if (status === 'transferred') lastAction = `Transferred from other cell to ${bureauCode} for specialized scrutiny`;
    if (status === 'escalated') lastAction = 'Escalated to Member Secretary & Scrutiny Committee for urgent hearing';
    if (status === 'disposed') lastAction = 'Compliance verified on-site; grievance disposed and closed';

    let nextAction = 'Review compliance documentation';
    if (status === 'disposed') nextAction = 'Case closed';
    if (status === 'escalated') nextAction = 'Scrutiny hearing with Chairman & Appellate Committee';

    const complainantType = complainantTypes[i % complainantTypes.length];

    result.push({
      id: `c-${i}`,
      case_number: caseNumber,
      institution_id: inst ? inst.id : null,
      institution_name_raw: institutionNameRaw,
      permanent_id_raw: permanentIdRaw,
      category: categoryName,
      description,
      complainant_type: complainantType,
      date_received: dateReceived,
      status,
      bureau_id: bureau.id,
      bureau_code: bureau.code,
      assigned_officer_id: officer.id,
      assigned_officer_name: officer.name,
      last_action: lastAction,
      next_action: nextAction,
      last_action_date: new Date(new Date(dateReceived).getTime() + (Math.min(ageDays, 5) * 86400000)).toISOString(),
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
// 6. CASE ACTIONS (Append-only Audit History)
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
    created_at: mockComplaints[0].date_received,
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
    created_at: mockComplaints[0].last_action_date || mockComplaints[0].date_received,
  },
  {
    id: 'act-3',
    case_id: 'c-2',
    action_type: 'created',
    performed_by: 'u-3',
    performed_by_name: 'Shri Vikram Desai',
    bureau_id: 'b-2',
    bureau_code: 'PGRC',
    remarks: 'Grievance received from final-year students regarding retention of original migration certificates.',
    created_at: mockComplaints[1].date_received,
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
    created_at: mockComplaints[3].last_action_date || mockComplaints[3].date_received,
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
    created_at: mockComplaints[220].last_action_date || mockComplaints[220].date_received,
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
    created_at: mockComplaints[139].last_action_date || mockComplaints[139].date_received,
  }
];

// ==========================================
// 7. RESOLUTION QUEUE & COHERENT SUGGESTIONS (Cases 241-250)
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

// Coherent Candidate Suggestions referencing verified canonical master institutions
export const mockMatchSuggestions: InstitutionMatchSuggestion[] = [
  // q-1: Vanguard Inst. of Architecture & Design -> Targets inst-4 (Vanguard School of Architecture)
  {
    id: 'sug-1',
    queue_id: 'q-1',
    suggested_institution_id: 'inst-4',
    suggested_institution_name: mockInstitutions[3].name,
    suggested_permanent_id: mockInstitutions[3].aicte_permanent_id,
    confidence: 0.92,
    match_details: {
      name_similarity: 0.91,
      address_match: true,
      state: mockInstitutions[3].state,
      city: mockInstitutions[3].district,
    }
  },
  {
    id: 'sug-2',
    queue_id: 'q-1',
    suggested_institution_id: 'inst-1',
    suggested_institution_name: mockInstitutions[0].name,
    suggested_permanent_id: mockInstitutions[0].aicte_permanent_id,
    confidence: 0.22,
    match_details: {
      name_similarity: 0.18,
      address_match: false,
      state: mockInstitutions[0].state,
      city: mockInstitutions[0].district,
    }
  },
  // q-2: Aryabhatta Inst. of Technology -> Targets inst-6 (Aryabhatta Institute of Technology & Management)
  {
    id: 'sug-3',
    queue_id: 'q-2',
    suggested_institution_id: 'inst-6',
    suggested_institution_name: mockInstitutions[5].name,
    suggested_permanent_id: mockInstitutions[5].aicte_permanent_id,
    confidence: 0.94,
    match_details: {
      name_similarity: 0.93,
      address_match: true,
      state: mockInstitutions[5].state,
      city: mockInstitutions[5].district,
    }
  },
  {
    id: 'sug-4',
    queue_id: 'q-2',
    suggested_institution_id: 'inst-2',
    suggested_institution_name: mockInstitutions[1].name,
    suggested_permanent_id: mockInstitutions[1].aicte_permanent_id,
    confidence: 0.28,
    match_details: {
      name_similarity: 0.24,
      address_match: false,
      state: mockInstitutions[1].state,
      city: mockInstitutions[1].district,
    }
  },
  // q-3: Apex Inst. of Technology, Campus 2 -> Targets inst-1 (Apex Institute)
  {
    id: 'sug-5',
    queue_id: 'q-3',
    suggested_institution_id: 'inst-1',
    suggested_institution_name: mockInstitutions[0].name,
    suggested_permanent_id: mockInstitutions[0].aicte_permanent_id,
    confidence: 0.89,
    match_details: {
      name_similarity: 0.88,
      address_match: true,
      state: mockInstitutions[0].state,
      city: mockInstitutions[0].district,
    }
  },
  // q-4: National Engg College Research Wing -> Targets inst-2 (National College)
  {
    id: 'sug-6',
    queue_id: 'q-4',
    suggested_institution_id: 'inst-2',
    suggested_institution_name: mockInstitutions[1].name,
    suggested_permanent_id: mockInstitutions[1].aicte_permanent_id,
    confidence: 0.88,
    match_details: {
      name_similarity: 0.86,
      address_match: true,
      state: mockInstitutions[1].state,
      city: mockInstitutions[1].district,
    }
  },
  // q-5: Kolkata Metro Inst. of Tech & Mgmt -> Targets inst-5 (Kolkata Metropolitan)
  {
    id: 'sug-7',
    queue_id: 'q-5',
    suggested_institution_id: 'inst-5',
    suggested_institution_name: mockInstitutions[4].name,
    suggested_permanent_id: mockInstitutions[4].aicte_permanent_id,
    confidence: 0.91,
    match_details: {
      name_similarity: 0.89,
      address_match: true,
      state: mockInstitutions[4].state,
      city: mockInstitutions[4].district,
    }
  },
  // q-6: Ranchi Tech & Mgmt College -> Targets inst-7 (Ranchi Institute)
  {
    id: 'sug-8',
    queue_id: 'q-6',
    suggested_institution_id: 'inst-7',
    suggested_institution_name: mockInstitutions[6].name,
    suggested_permanent_id: mockInstitutions[6].aicte_permanent_id,
    confidence: 0.86,
    match_details: {
      name_similarity: 0.84,
      address_match: true,
      state: mockInstitutions[6].state,
      city: mockInstitutions[6].district,
    }
  }
];

// ==========================================
// 8. CROSS-BUREAU OVERLAP FLAGS
// (Active cases for same canonical institution in distinct AICTE Bureaus)
// ==========================================
export const mockOverlapFlags: OverlapFlag[] = [
  {
    id: 'ov-1',
    institution_id: 'inst-1',
    institution_name: mockInstitutions[0].name,
    aicte_permanent_id: mockInstitutions[0].aicte_permanent_id,
    status: 'open',
    involved_bureaus: ['RB', 'PGRC'],
    case_ids: ['c-1', 'c-2'], // c-1 in RB (under_process), c-2 in PGRC (pending)
    created_at: mockComplaints[1].date_received,
    updated_at: mockComplaints[1].date_received,
  },
  {
    id: 'ov-2',
    institution_id: 'inst-2',
    institution_name: mockInstitutions[1].name,
    aicte_permanent_id: mockInstitutions[1].aicte_permanent_id,
    status: 'open',
    involved_bureaus: ['RB', 'EB'],
    case_ids: ['c-3', 'c-26'], // c-3 in RB, c-26 in EB
    created_at: mockComplaints[25].date_received,
    updated_at: mockComplaints[25].date_received,
  },
  {
    id: 'ov-3',
    institution_id: 'inst-3',
    institution_name: mockInstitutions[2].name,
    aicte_permanent_id: mockInstitutions[2].aicte_permanent_id,
    status: 'open',
    involved_bureaus: ['PGRC', 'LC'],
    case_ids: ['c-4', 'c-27'], // c-4 in PGRC, c-27 in LC
    created_at: mockComplaints[26].date_received,
    updated_at: mockComplaints[26].date_received,
  },
  {
    id: 'ov-4',
    institution_id: 'inst-4',
    institution_name: mockInstitutions[3].name,
    aicte_permanent_id: mockInstitutions[3].aicte_permanent_id,
    status: 'coordinated',
    involved_bureaus: ['RB', 'AB'],
    case_ids: ['c-5', 'c-28'], // c-5 in RB, c-28 in AB
    created_at: mockComplaints[27].date_received,
    updated_at: mockComplaints[27].date_received,
  }
];

export const mockOverlapReviewEvents: OverlapReviewEvent[] = [
  {
    id: 'ov-rev-1',
    flag_id: 'ov-4',
    action: 'coordinated',
    notes: 'Joint coordination meeting between Smt. Anjali Gupta (RB) and Dr. Sanjay Deshmukh (AB). Regulation Bureau leading the physical verification inspection.',
    reviewed_by: 'u-2',
    reviewed_by_name: 'Smt. Anjali Gupta',
    reviewed_at: mockComplaints[27].date_received,
  }
];

// ==========================================
// 9. SUSPECTED DUPLICATE FLAGS (Isolated AI Similarity Engine)
// Genuinely similar complaint descriptions on the same canonical institution
// ==========================================
export const mockDuplicateFlags: DuplicateFlag[] = [
  {
    id: 'dup-1',
    institution_id: 'inst-1',
    institution_name: mockInstitutions[0].name,
    aicte_permanent_id: mockInstitutions[0].aicte_permanent_id,
    confidence: 0.94,
    status: 'open',
    case_ids: ['c-1', 'c-107'], // Both are Faculty Cadre Deficiency on Apex Institute
    created_at: mockComplaints[106].date_received,
  },
  {
    id: 'dup-2',
    institution_id: 'inst-2',
    institution_name: mockInstitutions[1].name,
    aicte_permanent_id: mockInstitutions[1].aicte_permanent_id,
    confidence: 0.89,
    status: 'open',
    case_ids: ['c-3', 'c-83'], // Both are Fee Non-refund on National College
    created_at: mockComplaints[82].date_received,
  }
];

export const mockDuplicateReviewEvents: DuplicateReviewEvent[] = [];

// ==========================================
// 10. STATUTORY SLA RULES (Configurable statutory disposal policies)
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
  { id: 'sla-9', category: 'Unapproved Campus Expansion & Land Norm Violations', bureau_id: 'b-4', bureau_code: 'AB', days_allowed: 45, warning_days_before: 7 },
];

// ==========================================
// 11. SURVEILLANCE ALERTS
// ==========================================
export const mockAlerts: Alert[] = [
  {
    id: 'alt-1',
    type: 'overlap',
    recipient_bureau_code: 'RB',
    case_id: 'c-1',
    case_number: 'TRAC-2026-00001',
    flag_id: 'ov-1',
    message: 'Potential Overlapping Cases – Coordination Required: Apex Institute of Technology & Management has parallel active cases in RB and PGRC.',
    is_read: false,
    created_at: mockComplaints[1].date_received,
  },
  {
    id: 'alt-2',
    type: 'overlap',
    recipient_bureau_code: 'PGRC',
    case_id: 'c-2',
    case_number: 'TRAC-2026-00002',
    flag_id: 'ov-1',
    message: 'Potential Overlapping Cases – Coordination Required: Apex Institute of Technology & Management has parallel active cases in PGRC and RB.',
    is_read: false,
    created_at: mockComplaints[1].date_received,
  },
  {
    id: 'alt-3',
    type: 'overlap',
    recipient_bureau_code: 'EB',
    case_id: 'c-26',
    case_number: 'TRAC-2026-00026',
    flag_id: 'ov-2',
    message: 'Potential Overlapping Cases – Coordination Required: National College of Engineering & Research has parallel active cases in EB and RB.',
    is_read: false,
    created_at: mockComplaints[25].date_received,
  },
  {
    id: 'alt-4',
    type: 'duplicate',
    recipient_bureau_code: 'RB',
    case_id: 'c-107',
    case_number: 'TRAC-2026-00107',
    flag_id: 'dup-1',
    message: 'Suspected duplicate complaint: TRAC-2026-00107 matches existing case TRAC-2026-00001 with 94% NLP similarity (Faculty & Cadre Ratio Deficiency at Apex Institute).',
    is_read: false,
    created_at: mockComplaints[106].date_received,
  },
  {
    id: 'alt-5',
    type: 'sla_breach',
    recipient_bureau_code: 'PGRC',
    case_id: 'c-18',
    case_number: 'TRAC-2026-00018',
    message: 'SLA Breach: Case TRAC-2026-00018 is pending beyond prescribed statutory timeline.',
    is_read: false,
    created_at: mockComplaints[17].date_received,
  },
  {
    id: 'alt-6',
    type: 'escalation',
    case_id: 'c-221',
    case_number: 'TRAC-2026-00221',
    message: 'Escalation Notice: Case TRAC-2026-00221 escalated to Member Secretary & Scrutiny Committee.',
    is_read: true,
    created_at: mockComplaints[220].date_received,
  }
];
