# PLAN: TRAC-AICTE — Build Order

Read `PRD.md` and `ARCHITECTURE.md` first. Build in this strict order and finish each phase before starting the next. Tick each task when completed.

---

## Phase 0: Setup
- [ ] Initialize Next.js project with Tailwind CSS
- [ ] Configure Supabase client and environment variables (no service-role key in client actions)
- [ ] Set up layout skeleton (sidebar, header, role context provider)

## Phase 1: Database, Security, Audit Triggers and Auth
- [ ] Create all tables from `ARCHITECTURE.md`:
  - `institutions`, `bureaus`, `users`, `complaints`
  - `institution_resolution_queue`, `institution_match_suggestions`, `institution_resolution_events`
  - `case_actions`, `documents`
  - `overlap_flags`, `overlap_flag_cases`, `overlap_review_events`
  - `duplicate_flags`, `duplicate_flag_cases`, `duplicate_review_events`
  - `sla_rules`, `alerts`
- [ ] Enable `pg_trgm` extension
- [ ] Create computed database view `v_pending_beyond_timeline`
- [ ] Create summary view / policies for cross-bureau case visibility (limited summary for non-owning bureau officials)
- [ ] Implement append-only immutability:
  - Revoke `UPDATE` and `DELETE` on all audit/event tables (`case_actions`, `institution_resolution_events`, `overlap_review_events`, `duplicate_review_events`)
  - Create blocking triggers (`trg_block_immutable_changes`) on all audit/event tables
- [ ] Add Row Level Security (RLS) policies on **every** table:
  - `sla_rules` editable by Admin only; readable by authenticated officials
  - `users` role modification blocked for self/non-admins
  - Bureau-scoped and region-scoped case visibility and edit rules
- [ ] Seed bureaus (RB, PGRC, others) and demo users across each role

## Phase 2: Institutions and Cases (CRUD with Audit Logging)
- [ ] Institution master list and profile page (seeded with demo data; CSV import ready)
- [ ] Create case form (fields from F2)
- [ ] Secure database function for case creation and updates writing to `case_actions` in the same atomic transaction
- [ ] Cases list page (summary view for other bureaus, full view for owning bureau/senior/admin)
- [ ] Case detail page with status timeline, document viewer, and action history
- [ ] Status updates, transfers, escalations, officer assignment — all routed via secure database functions

## Phase 3: Institution Resolution Queue & Overlap Engine (High Priority)
- [ ] **Institution Resolution Queue (First)**:
  - Exact match on AICTE Permanent ID (sets `match_method = 'id'`)
  - Missing or unmatched Permanent ID routes to `institution_resolution_queue`
  - Fuzzy text matching via `pg_trgm` on name/address writes suggestions to `institution_match_suggestions` with confidence score
  - Resolution UI: queue table, candidate suggestions display, explicit confirmation modal
  - Privileged function `resolve_institution_queue`: checks caller authorization (owning bureau official or admin), updates complaint (`match_method = 'manual'`), writes to `institution_resolution_events` and `case_actions`, triggers overlap check
  - **Verification test**: Verify that fuzzy matching NEVER silently merges or links institutions without human action
- [ ] **Cross-Bureau Overlap Engine**:
  - Overlap check trigger executed on:
    1. Case creation (with resolved institution)
    2. Bureau change / transfer
    3. Status change
    4. Institution resolution
  - Query active cases (status NOT IN ('disposed'); 'transferred' counts as active) for the same institution across distinct bureaus
  - Concurrency handling (row/advisory locking on `institution_id`) so concurrent updates do not lose or duplicate flags
  - Create/update `overlap_flags` and `overlap_flag_cases`
  - Overlap alerts: "Potential Overlapping Cases – Coordination Required"
  - Overlap Center UI: active flags, side-by-side bureau case statuses, coordinate/dismiss events via `overlap_review_events`
- [ ] **Suspected Duplicate Complaint Engine (Separate)**:
  - Text similarity comparison on complaint description/category for same institution
  - Writes to `duplicate_flags` and `duplicate_flag_cases`
  - Duplicate Review UI and events via `duplicate_review_events`
- [ ] **Safety Guarantee Test**:
  - **Automated test**: Assert that NO complaint is ever automatically closed, transferred, or modified by overlap or duplicate detection

## Phase 4: Workflow, Transfers, and Audit History
- [ ] Chronological case action timeline reading from append-only `case_actions`
- [ ] Remarks and supporting document uploads linked to actions
- [ ] Bureau transfer workflow (records `from_bureau_id`, `to_bureau_id`, re-evaluates overlap)
- [ ] Escalation workflow (records escalation action, dispatches senior alerts)

## Phase 5: Search and Filters
- [ ] Search by institution name, Permanent ID, and case number
- [ ] Multi-parameter filters: Bureau/Cell, region, category, status, date range

## Phase 6: Dashboard
- [ ] Real-time count cards: total, pending, under process, disposed, transferred
- [ ] Overdue cases card reading from dynamic view `v_pending_beyond_timeline` (no background status mutation)
- [ ] Institution-wise case status view
- [ ] Bureau/Cell-wise workload distribution chart
- [ ] Supabase Realtime subscriptions for live metric updates

## Phase 7: Alerts and SLA Engine
- [ ] SLA rules configuration screen (Admin only)
- [ ] Scheduled function / cron for SLA warning, breach, and inactivity reminders
- [ ] Separate in-app notifications for:
  - Cross-bureau overlap alerts
  - Suspected duplicate alerts
  - SLA timeline warnings and breaches
  - Escalation alerts

## Phase 8: Reports and Analytics
- [ ] Bureau-wise, region-wise, and status-wise summary reports
- [ ] Institution-wise complaint history and profiles
- [ ] Pending case ageing breakdown
- [ ] Disposal rate trends
- [ ] **Cross-Bureau Overlap Report** (dedicated report on multi-bureau active case coordination)
- [ ] **Suspected Duplicate Complaints Report** (dedicated report on text similarity suggestions)
- [ ] Export reports to PDF and Excel (server-side generation)

## Phase 9: Polish, Demo Data, and Verification
- [ ] Seed comprehensive demo data:
  - 20–30 institutions with AICTE Permanent IDs and regional distribution
  - 100–150 complaints across RB, PGRC, and other bureaus
  - Intentional active cross-bureau overlaps (same institution in RB and PGRC)
  - Missing/variant name complaints in institution-resolution queue
  - Suspected duplicate complaints
- [ ] CSV import for institutions and complaints
- [ ] End-to-end verification of RLS visibility policies:
  - Bureau officials see only summary details of other Bureaus' cases
  - Non-admins cannot edit SLA rules or user roles
  - Attempted UPDATE or DELETE on audit tables strictly throws an error
  - No case is ever altered automatically by detection engines
- [ ] Empty, loading, and error states across all pages
- [ ] Production deployment build verification

---

## Non-Negotiable Rules While Building
1. **Never auto-merge or auto-resolve**: The overlap and duplicate engines only create flags and alerts.
2. **Never delete or modify audit rows**: `case_actions`, `institution_resolution_events`, `overlap_review_events`, and `duplicate_review_events` are strictly append-only.
3. **Database-enforced security**: All mutations go through validated database functions with RLS on every table. Never use the Supabase service-role key for user actions.
4. **Active case definition**: All statuses except `disposed` are active. `transferred` is active.
