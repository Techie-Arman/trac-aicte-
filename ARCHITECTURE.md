# ARCHITECTURE: TRAC-AICTE — Complaint Monitoring Dashboard

## 1. Tech stack
| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router, React) + Tailwind CSS + Recharts |
| Backend | Next.js Route Handlers / Server Actions (calling Supabase DB functions) |
| Database | PostgreSQL (Supabase) with `pg_trgm` extension |
| Auth & Security | Supabase Auth with RLS enabled on all tables; database functions with validated `auth.uid()` |
| Realtime | Supabase Realtime subscriptions |
| File storage | Supabase Storage (supporting documents) |
| Jobs | Scheduled job (cron / Supabase Edge Function) for SLA warnings and reminder alerts |
| AI / Text Similarity | Trigram / embeddings / LLM for duplicate complaint suggestions only |
| Export | PDF and Excel generation (server-side) |

---

## 2. High-level flow
1. Complaints enter from RB, PGRC, and other Bureaus/Cells (form, CSV import, or API).
2. **Institution Resolution**:
   - Primary matching key: exact match on `aicte_permanent_id`.
   - If Permanent ID is missing or not found in the master, case is routed to `institution_resolution_queue`.
   - Fuzzy matching (`pg_trgm` on name/address) generates advisory candidate entries in `institution_match_suggestions` only. It **never** automatically links or merges institutions.
   - An authorized official (owning Bureau official or Admin) explicitly resolves the institution item (`institution_resolution_events`), recording actor, timestamp, original association, selected institution, and reason.
3. **Overlap Engine Execution**:
   - Automatically executed on:
     - Case creation (if institution is linked)
     - Bureau change / transfer
     - Status change
     - Institution resolution
   - Identifies active cases (all statuses except `disposed`; `transferred` counts as active) for the same institution in other Bureaus/Cells.
   - Creates/updates `overlap_flags` and `overlap_flag_cases` and issues alerts: **"Potential Overlapping Cases – Coordination Required"**.
4. **Duplicate Detection Engine**:
   - Runs text similarity comparison on complaint descriptions/categories for cases regarding the same institution.
   - Generates `duplicate_flags` and `duplicate_flag_cases` for human review. Completely separate from overlap flags.
5. **Human Review & Coordination**:
   - Officials review overlap and duplicate flags via dedicated review events (`overlap_review_events`, `duplicate_review_events`).
   - The engine **never** automatically closes, transfers, or modifies any case.
6. **SLA & Computed Views**:
   - "Pending beyond timeline" is a **computed view / query** (no background mutation of complaint status).
   - Scheduled job checks timelines to raise SLA warning, breach, and reminder alerts.
7. **Dashboard and reports**:
   - Read live data from views and tables with RLS applied.

---

## 3. Database schema

### institutions
- `id` (uuid, pk)
- `aicte_permanent_id` (text, unique, indexed)
- `name`, `address`, `region`, `state`, `district`
- `created_at` (timestamptz)

### bureaus
- `id` (uuid, pk), `code` (text, unique - 'RB', 'PGRC', etc.), `name` (text)

### users
- `id` (uuid, pk, references `auth.users.id`)
- `name` (text), `email` (text)
- `role` (text: 'rb_official', 'pgrc_official', 'other_official', 'regional', 'senior', 'admin')
- `bureau_id` (uuid, fk → bureaus)
- `region` (text)
- *Security*: Users cannot update their own role (RLS + trigger protected).

### complaints (cases)
- `id` (uuid, pk)
- `case_number` (text, unique, human-readable e.g. TRAC-2026-XXXXX)
- `institution_id` (uuid, fk → institutions, nullable until resolved)
- `institution_name_raw` (text), `permanent_id_raw` (text)
- `category` (text), `description` (text)
- `complainant_type` (text: 'student', 'faculty', 'stakeholder', 'other')
- `date_received` (timestamptz)
- `status` (text: 'pending', 'under_process', 'disposed', 'transferred', 'escalated')
  - *Note: Active cases are all statuses except 'disposed'.*
- `bureau_id` (uuid, fk → bureaus, presently assigned)
- `assigned_officer_id` (uuid, fk → users)
- `last_action` (text), `next_action` (text), `last_action_date` (timestamptz)
- `expected_disposal_date` (timestamptz)
- `match_method` (text: 'id' or 'manual')
- `created_at` (timestamptz)

### institution_resolution_queue
- `id` (uuid, pk)
- `case_id` (uuid, fk → complaints, unique)
- `raw_institution_name` (text)
- `raw_permanent_id` (text)
- `status` (text: 'pending', 'resolved')
- `created_at` (timestamptz)

### institution_match_suggestions
- `id` (uuid, pk)
- `queue_id` (uuid, fk → institution_resolution_queue)
- `suggested_institution_id` (uuid, fk → institutions)
- `confidence` (float: 0.0 to 1.0, based on `pg_trgm` name/address similarity)
- `match_details` (jsonb)
- `created_at` (timestamptz)

### institution_resolution_events (append-only)
- `id` (uuid, pk)
- `queue_id` (uuid, fk → institution_resolution_queue)
- `case_id` (uuid, fk → complaints)
- `original_association` (jsonb)
- `selected_institution_id` (uuid, fk → institutions)
- `decision_reason` (text)
- `resolved_by` (uuid, fk → users)
- `resolved_at` (timestamptz, default now())

### case_actions (append-only audit trail)
- `id` (uuid, pk)
- `case_id` (uuid, fk → complaints)
- `action_type` (text: 'created', 'updated', 'remark', 'transferred', 'escalated', 'disposed', 'institution_resolved')
- `performed_by` (uuid, fk → users)
- `bureau_id` (uuid, fk → bureaus)
- `remarks` (text)
- `before_state` (jsonb)
- `after_state` (jsonb)
- `from_bureau_id` (uuid, fk → bureaus)
- `to_bureau_id` (uuid, fk → bureaus)
- `created_at` (timestamptz, default now())

### documents
- `id` (uuid, pk)
- `case_id` (uuid, fk → complaints)
- `action_id` (uuid, fk → case_actions, nullable)
- `file_url` (text), `file_name` (text), `uploaded_by` (uuid, fk → users), `created_at` (timestamptz)

### overlap_flags
- `id` (uuid, pk)
- `institution_id` (uuid, fk → institutions)
- `status` (text: 'open', 'reviewed', 'coordinated', 'dismissed')
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)

### overlap_flag_cases
- `flag_id` (uuid, fk → overlap_flags)
- `case_id` (uuid, fk → complaints)
- Primary key `(flag_id, case_id)`

### overlap_review_events (append-only)
- `id` (uuid, pk)
- `flag_id` (uuid, fk → overlap_flags)
- `action` (text: 'coordinated', 'dismissed', 'remark')
- `notes` (text)
- `reviewed_by` (uuid, fk → users)
- `reviewed_at` (timestamptz, default now())

### duplicate_flags
- `id` (uuid, pk)
- `institution_id` (uuid, fk → institutions)
- `confidence` (float: 0.0 to 1.0)
- `status` (text: 'open', 'confirmed_duplicate', 'dismissed')
- `created_at` (timestamptz, default now())

### duplicate_flag_cases
- `flag_id` (uuid, fk → duplicate_flags)
- `case_id` (uuid, fk → complaints)
- Primary key `(flag_id, case_id)`

### duplicate_review_events (append-only)
- `id` (uuid, pk)
- `flag_id` (uuid, fk → duplicate_flags)
- `action` (text: 'confirmed_duplicate', 'dismissed', 'remark')
- `notes` (text)
- `reviewed_by` (uuid, fk → users)
- `reviewed_at` (timestamptz, default now())

### sla_rules (admin-only configuration)
- `id` (uuid, pk)
- `category` (text), `bureau_id` (uuid, fk → bureaus)
- `days_allowed` (int), `warning_days_before` (int)
- `created_at` (timestamptz)

### alerts
- `id` (uuid, pk)
- `recipient_user_id` (uuid, fk → users, nullable)
- `recipient_bureau_id` (uuid, fk → bureaus, nullable)
- `type` (text: 'overlap', 'duplicate', 'pending_reminder', 'escalation', 'sla_warning', 'sla_breach')
- `case_id` (uuid, fk → complaints, nullable)
- `flag_id` (uuid, nullable)
- `message` (text)
- `is_read` (boolean, default false)
- `created_at` (timestamptz, default now())

### v_pending_beyond_timeline (Computed Database View)
A SQL view calculating case delay dynamically:
```sql
CREATE OR REPLACE VIEW v_pending_beyond_timeline AS
SELECT c.*,
       EXTRACT(DAY FROM (NOW() - c.expected_disposal_date))::INT AS days_overdue
FROM complaints c
WHERE c.status NOT IN ('disposed')
  AND c.expected_disposal_date IS NOT NULL
  AND c.expected_disposal_date < NOW();
```
*No cron job or background process updates `complaints.status`.*

---

## 4. Institution Matching and Overlap Detection Engine

### Step 1: Institution Resolution
1. **Primary match key**: Check if `permanent_id_raw` is non-empty and matches `institutions.aicte_permanent_id`.
   - If matched: Set `complaints.institution_id`, `match_method = 'id'`. Trigger overlap check.
2. **Missing / Unmatched ID**:
   - Insert an entry into `institution_resolution_queue`.
   - Run fuzzy text query via `pg_trgm` on `institutions.name` and `institutions.address` against `institution_name_raw`.
   - For matches meeting score threshold, insert advisory rows into `institution_match_suggestions` with calculated `confidence`.
   - **Safety Rule**: Suggestions **never** link or merge automatically, regardless of score.
3. **Manual Resolution Procedure**:
   - Permitted actors: Bureau official of the owning Bureau or Admin.
   - Resolution invokes privileged DB function `resolve_institution_queue(p_queue_id, p_institution_id, p_reason)`.
   - The function:
     - Validates caller authorization.
     - Updates `complaints.institution_id` and sets `match_method = 'manual'`.
     - Marks queue item as `resolved`.
     - Writes to `institution_resolution_events` (actor, timestamp, original values, selected institution, reason).
     - Writes to `case_actions`.
     - Automatically invokes the cross-bureau overlap check.

### Step 2: Cross-Bureau Overlap Check
Runs in a transaction on:
- Case creation (with resolved institution)
- Bureau change / transfer
- Status change
- Institution resolution

**Active Case Definition**: Status NOT IN ('disposed'). Note that 'transferred', 'pending', 'under_process', 'escalated' are all active.

**Detection Query & Concurrency Safety**:
To prevent race conditions during concurrent case creation or status changes, row-level locking on the institution (`SELECT id FROM institutions WHERE id = target_id FOR UPDATE`) or advisory locks on `(institution_id)` are acquired during evaluation.
```sql
SELECT id, bureau_id, case_number, status
FROM complaints
WHERE institution_id = target_institution_id
  AND status NOT IN ('disposed')
```
If cases span two or more distinct `bureau_id`s:
- Create or update an `overlap_flags` record for `target_institution_id`.
- Upsert links into `overlap_flag_cases`.
- Emit alert to concerned bureaus: **"Potential Overlapping Cases – Coordination Required"**.
- If active complaints no longer span multiple bureaus (e.g. cases disposed), existing open overlap flag is marked `coordinated` or closed.

### Step 3: Duplicate Complaint Detection (Separate Engine)
- Triggered on new complaints for the same institution.
- Evaluates title/description similarity using trigram similarity / vector embeddings.
- If score exceeds duplicate threshold (e.g., > 0.80):
  - Inserts record in `duplicate_flags` (with `confidence`) and links to `duplicate_flag_cases`.
  - Dispatches `duplicate` alert.
  - Separate review path (`duplicate_review_events`).

### Step 4: Strict Human-in-the-Loop Guarantee
- The engine creates alerts and flags only.
- Cases are never automatically closed, merged, or transferred.

---

## 5. Append-Only Audit Integrity & Database Triggers

To strictly guarantee append-only immutability for compliance and court-grade audit trails:

1. **Privilege Revocation**:
   ```sql
   REVOKE UPDATE, DELETE ON case_actions FROM authenticated, anon, public;
   REVOKE UPDATE, DELETE ON institution_resolution_events FROM authenticated, anon, public;
   REVOKE UPDATE, DELETE ON overlap_review_events FROM authenticated, anon, public;
   REVOKE UPDATE, DELETE ON duplicate_review_events FROM authenticated, anon, public;
   ```
2. **Blocking Database Triggers**:
   Each append-only table has a trigger raising an uncatchable exception on `UPDATE` or `DELETE`:
   ```sql
   CREATE OR REPLACE FUNCTION trg_block_immutable_changes()
   RETURNS TRIGGER AS $$
   BEGIN
       RAISE EXCEPTION 'Table % is strictly append-only. UPDATE and DELETE operations are prohibited.', TG_TABLE_NAME;
   END;
   $$ LANGUAGE plpgsql;
   ```
3. **Privileged State-Change Functions**:
   All updates to cases, transfers, status changes, and institution resolutions execute via database functions configured with:
   - `SECURITY DEFINER`
   - Fixed `SET search_path = public, pg_temp`
   - Mandatory check: `auth.uid()` identity and caller role verification
   - Transactional writing to `case_actions` in the same atomic transaction.

---

## 6. Access Control & Row Level Security (RLS)

All tables have `ENABLE ROW LEVEL SECURITY`. Client actions never use the Supabase service-role key; they run under the authenticated user's JWT.

### Visibility Rules
- **Cross-Bureau Case Visibility**:
  - Officials from Bureau A can see other Bureaus' cases in a **summary view** only (`case_number`, `bureau_id`, `status`, `assigned_officer_id`, `date_received`).
  - Sensitive details (full description, complainant personal info, detailed remarks, documents) are restricted to:
    - The owning Bureau officials (`bureau_id = auth_user.bureau_id`)
    - Senior officers / Management (`role = 'senior'`)
    - Administrators (`role = 'admin'`)
  - Enforced via a secure database view `v_complaints_summary` or column-filtering RLS policy.
- **Regional Office Scope**:
  - Filtered to institutions/cases within their assigned `region`.
- **Institution Resolution Queue**:
  - Visible to the owning bureau officials and admins.
  - Can be resolved only by the owning bureau official or admin.
- **SLA Rules**:
  - Read: All authenticated officials.
  - Insert / Update / Delete: `admin` only.
- **User Role Protection**:
  - `users.role` cannot be modified by any non-admin. RLS `WITH CHECK` and trigger prevent self-escalation.

---

## 7. Key Pages
- **Login / Auth**
- **Main Dashboard**: Real-time count cards (pending, under process, disposed, transferred, pending beyond timeline via view), workload charts
- **Cases List**: Search & filter; summary view for cross-bureau cases
- **Case Detail**: Full info for owning bureau/senior/admin, action timeline, documents
- **Institution Resolution Queue**: Pending unresolved institutions, match suggestions list with confidence scores, explicit resolution modal
- **Institution Profile**: Master details, complaint history, active overlap alerts
- **Overlap Center**: Active cross-bureau overlap flags, side-by-side case status view, coordination events
- **Duplicate Review Center**: Dedicated queue for suspected duplicate cases
- **Alerts Center**: Filtered by overlap, duplicate, and SLA warnings
- **Reports & Analytics**: Separate Overlap Coordination Report and Duplicate Cases Report, ageing analysis, export
- **Admin**: User roles, bureau management, SLA rule configuration
- **Import**: CSV import for institution master and historical complaints

---

## 8. Demo Data
Seed 20 to 30 institutions (Permanent IDs, regions) and 100 to 150 complaints across RB and PGRC:
- Deliberate cross-bureau overlaps (active cases for same Permanent ID in RB and PGRC).
- Unmatched complaints with name variations ("XYZ Inst. of Tech" vs "XYZ Institute of Technology") demonstrating queue routing and suggestion generation without auto-merging.
