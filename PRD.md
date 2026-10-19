# PRD: TRAC-AICTE — Integrated Institution Complaint Monitoring and Status Dashboard

## 1. Overview
A web-based, single-window dashboard for AICTE (TRAC-AICTE) that gives authorized officials a consolidated, real-time view of all institution-related complaints across Bureaus/Cells (Regulation Bureau (RB), Public Grievance Redressal Cell (PGRC), others). It acts as the **single source of truth** and automatically flags **potentially overlapping cases** so Bureaus/Cells can coordinate.

## 2. Problem
- Complaints about the same institution reach different Bureaus/Cells (RB, PGRC, others).
- No centralized, real-time monitoring exists.
- Result: overlapping actions, duplication of effort, delays in disposal, and no clarity on which Bureau/Cell is dealing with which institution/case.
- Complaint sources: students, faculty members, stakeholders, other concerned parties.

## 3. Goals
1. View all institution-related complaint/grievance cases in one place.
2. Identify the Bureau/Cell currently handling each case.
3. Track the complete status and movement of a case.
4. Identify cases where RB and PGRC actions overlap, or multiple Bureaus/Cells deal with the same institution.
5. Avoid duplication of action; ensure coordination.
6. Monitor pending, disposed, under-process, transferred and escalated cases.
7. Generate institution-wise, region-wise, Bureau/Cell-wise and status-wise reports.
8. Alert on pending cases and cases approaching prescribed timelines.

## 4. Expected outcomes
- Reduce duplication of work
- Prevent conflicting or parallel actions
- Improve coordination between RB, PGRC and other Bureaus/Cells
- Ensure timely disposal of complaints
- Improve accountability and transparency
- Real-time monitoring of institutions and complaints by management
- Data-driven decision-making by AICTE

## 5. Users and roles
| Role | Description |
|---|---|
| RB Official | Regulation Bureau user |
| PGRC Official | Public Grievance Redressal Cell user |
| Other Bureau/Cell Official | Other concerned AICTE Bureaus/Cells |
| Regional Office User | Regional Offices/Centres, scoped to their region |
| Senior Officer / Management | Authorized officers, read-heavy, all reports |
| Competent Authority / Admin | AICTE administration, full access and configuration |

Access is limited to authorized officials only (login + role-based access).
- **Cross-Bureau Visibility Control**: Bureau officials see only a high-level summary of other Bureaus' cases (case number, Bureau, status, assigned officer). Full case details, complainant specifics, and remarks are visible only to the owning Bureau, senior officers, and admin.
- **Queue Resolution Authority**: The Bureau official who owns the case and admin have authorization to resolve institution-resolution queue items.

## 6. Features

### F1. Centralized Institution Profile
- Unique Institution ID / AICTE Permanent ID (primary matching key)
- Name, address, region, other relevant details
- Institution Master: initially seeded with demo data, with CSV import capability supported
- Consolidated history of complaints/cases for the institution

### F2. Complaint/Case Tracking
- Unique Complaint/Case ID
- Date of receipt
- Nature/category of complaint
- Current status
- Presently assigned Bureau/Cell
- Assigned officer/official
- Last action taken
- Next action required
- Date of last action
- Expected disposal date

### F3. Cross-Bureau/Cell Overlap Detection (core feature)
- Automatically identify when active complaints (any status except "disposed"; "transferred" counts as active) concerning the same institution are present across different Bureaus/Cells (RB, PGRC, others).
- Evaluated on: case creation, bureau change, status change, and institution resolution.
- Show overlap alert to authorized officials: **"Potential Overlapping Cases – Coordination Required"**.
- Display each Bureau's case status side by side (e.g. PGRC: under process, RB: action initiated).
- Allow officials to review, coordinate, and link/map related complaints and cases.
- **Safety Rule**: Humans decide the course of action; the engine only creates flags and alerts. It never automatically closes, transfers, or modifies any case.

### F4. Real-Time Dashboard
- Total complaints/cases received
- Pending cases
- Cases under process
- Cases disposed
- Cases transferred
- Cases pending beyond prescribed timelines (computed view based on SLA timeline)
- Institution-wise case status
- Bureau/Cell-wise workload

### F5. Workflow and Action History
- Complete chronological history of actions
- Append-only audit history for case actions, overlap reviews, duplicate reviews, and institution-resolution decisions (enforced in database via revoked UPDATE/DELETE privileges and blocking triggers)
- Officer/Bureau responsible for each action
- Date and time stamp
- Remarks and supporting documents
- Transfer/escalation history

### F6. Search and Filters
Search by: institution name, AICTE Permanent ID, complaint/case ID, Bureau/Cell, region, complaint category, status, date range.

### F7. Alerts and Notifications
- Cross-bureau overlap alerts and suspected duplicate complaint alerts are maintained separately (separate tables, review events, alerts, and reports)
- Pending case reminders
- Escalation alerts
- Timeline/SLA alerts (cases approaching deadlines)

### F8. Reports and Analytics
- Bureau-wise, region-wise, status-wise reports
- Institution-wise complaint history
- Pending case ageing analysis
- Disposal rate
- Cross-Bureau Overlap Report (separate report dedicated to multi-bureau active case coordination)
- Suspected Duplicate Complaints Report (separate report for duplicate cases/text similarity suggestions)
- Monthly/quarterly performance reports
- Export to PDF/Excel

## 7. Case statuses
Pending, Under process, Disposed, Transferred, Escalated.
*Note: All statuses except "Disposed" are considered active for cross-bureau overlap detection.*

## 8. Institution Matching and Duplicate Detection Strategy
Use data matching, rule-based logic and/or AI-assisted analytics with strict human-in-the-loop safeguards:

1. **Exact match on AICTE Permanent ID (Primary Key)**: If the Permanent ID matches an existing institution in the master, the complaint links to that institution (`match_method = 'id'`).
2. **Institution Resolution Queue (Mandatory Fallback)**: If the Permanent ID is missing or not found in the master, the case is sent to a manual `institution_resolution_queue`.
   - Name and address fuzzy matching (`pg_trgm`) may only generate suggestions stored in an `institution_match_suggestions` table.
   - Fuzzy matching **must never silently merge or link institutions**.
   - An authorized human (case-owning Bureau official or Admin) must explicitly resolve the institution queue item.
3. **AI Text Similarity Layer (Duplicates Only)**:
   - Evaluates complaint descriptions and categories to identify suspected duplicate filings.
   - Feeds duplicate suggestions only (`duplicate_flags` / `duplicate_match_suggestions`), **not overlap detection**.
   - Cross-bureau overlap detection is strictly institution-driven (active cases on the same resolved institution across distinct bureaus).
4. Each suggestion carries a confidence level; suggestions require official confirmation and never trigger automatic case merging.

## 9. Non-functional requirements
- Real-time updates (live dashboard counts and alerts)
- Authentication and role-based access control via Row Level Security (RLS) on every table
- Immutable append-only audit trail enforced by database triggers and privilege revocation
- Responsive web UI, optimized for desktop
- Secure file storage for supporting documents
- Data import via CSV/API from RB and PGRC sources

## 10. Out of scope
- Native mobile app
- Automated resolution, closing, or merging of complaints
- Public-facing complaint filing portal (unless added later)

## 11. Success metrics
- Overlapping cases detected and flagged
- Reduction in duplicate actions
- Disposal rate and average case age
- Share of cases resolved within timeline
