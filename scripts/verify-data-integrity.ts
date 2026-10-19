import { dataStore } from '../src/lib/store';
import {
  mockInstitutions,
  mockBureaus,
  mockComplaints,
  mockOverlapFlags,
  mockDuplicateFlags,
  mockMatchSuggestions,
  mockResolutionQueue,
  mockAlerts
} from '../src/lib/mock-data';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('========================================================');
console.log('TRAC-AICTE Comprehensive Data Integrity Validation Suite');
console.log('========================================================\n');

// 1. RECONCILE ALL CASE COUNTS
console.log('--- 1. Case Count and Status Reconciliations ---');
const complaints = dataStore.getComplaints();
assert(complaints.length === 250, `Total complaints count is exactly 250 (found ${complaints.length})`);

const metrics = dataStore.getDashboardMetrics();
assert(metrics.total === 250, `Dashboard metrics total is 250 (found ${metrics.total})`);
assert(metrics.pending === 70, `Pending status count is exactly 70 (found ${metrics.pending})`);
assert(metrics.underProcess === 65, `Under Process count is exactly 65 (found ${metrics.underProcess})`);
assert(metrics.transferred === 35, `Transferred count is exactly 35 (found ${metrics.transferred})`);
assert(metrics.escalated === 30, `Escalated count is exactly 30 (found ${metrics.escalated})`);
assert(metrics.disposed === 50, `Disposed count is exactly 50 (found ${metrics.disposed})`);

const statusSum = metrics.pending + metrics.underProcess + metrics.transferred + metrics.escalated + metrics.disposed;
assert(statusSum === metrics.total, `Sum of all mutually exclusive statuses (${statusSum}) exactly equals total (${metrics.total})`);

const activeCases = complaints.filter(c => c.status !== 'disposed');
assert(activeCases.length === 200, `Active cases (all non-disposed) total exactly 200 (found ${activeCases.length})`);
assert(activeCases.length + metrics.disposed === metrics.total, 'Active cases (200) + Disposed (50) = Total cases (250)');

// 2. BUREAU TOTALS AND APPROVAL BUREAU POPULATION
console.log('\n--- 2. Bureau Workload & Approval Bureau Population ---');
let bureauCasesSum = 0;
metrics.bureauWorkload.forEach(b => {
  bureauCasesSum += b.total;
  assert(b.total > 0, `Bureau ${b.code} (${b.name}) has cases > 0 (found ${b.total})`);
  assert(b.active + b.disposed === b.total, `Bureau ${b.code} active (${b.active}) + disposed (${b.disposed}) === total (${b.total})`);
});
assert(bureauCasesSum === metrics.total, `Sum of cases across all 6 bureaus (${bureauCasesSum}) exactly equals total cases (${metrics.total})`);

const abBureau = metrics.bureauWorkload.find(b => b.code === 'AB');
assert(Boolean(abBureau && abBureau.total >= 20), `Approval Bureau (AB) is coherently populated (found ${abBureau?.total} cases)`);

// 3. CANONICAL INSTITUTION MASTER & PERMANENT ID CONSISTENCY
console.log('\n--- 3. AICTE Permanent-ID & Institution Master Consistency ---');
assert(mockInstitutions.length === 60, `Institution master contains 60 records (found ${mockInstitutions.length})`);

const permanentIds = new Set<string>();
mockInstitutions.forEach(inst => {
  assert(!permanentIds.has(inst.aicte_permanent_id), `Permanent ID ${inst.aicte_permanent_id} is globally unique`);
  permanentIds.add(inst.aicte_permanent_id);
});

// Check specific fixed items
const inst2 = mockInstitutions.find(i => i.aicte_permanent_id === '1-1062831852');
assert(inst2?.name === 'National College of Engineering & Research', `ID 1-1062831852 maps canonically to National College of Engineering & Research (found "${inst2?.name}")`);

const inst3 = mockInstitutions.find(i => i.aicte_permanent_id === '1-1094247778');
assert(inst3?.name === 'Silicon Valley Business School & Research Centre', `ID 1-1094247778 maps canonically to Silicon Valley Business School & Research Centre (found "${inst3?.name}")`);

const inst4 = mockInstitutions.find(i => i.aicte_permanent_id === '1-1125663704');
assert(inst4?.name === 'Vanguard School of Architecture & Design', `ID 1-1125663704 maps canonically to Vanguard School of Architecture & Design (found "${inst4?.name}")`);

const kolkataInst = mockInstitutions.find(i => i.name.includes('Kolkata Metropolitan'));
assert(kolkataInst?.state === 'West Bengal' && kolkataInst?.region === 'East' && kolkataInst?.district === 'Kolkata',
  `Kolkata Metropolitan Institute is correctly located in Kolkata, West Bengal, East Region (found ${kolkataInst?.district}, ${kolkataInst?.state})`);

const ranchiInst = mockInstitutions.find(i => i.name.includes('Ranchi'));
assert(ranchiInst?.name === 'Ranchi Institute of Technology & Management', `Ranchi Institute name has no duplicate "Institute of" (found "${ranchiInst?.name}")`);

mockInstitutions.forEach(inst => {
  if (inst.type.includes('Applied Arts')) {
    assert(inst.name.includes('Fine Arts') || inst.name.includes('Applied Arts'), `Applied Arts inst "${inst.name}" has appropriate fine arts/design name`);
  }
});

// 4. CASE-TO-INSTITUTION ASSOCIATION CONSISTENCY
console.log('\n--- 4. Case-to-Institution Associations ---');
const case2 = dataStore.getComplaintById('c-2');
assert(case2?.institution_id === 'inst-1', `Case TRAC-2026-00002 belongs to inst-1 (Apex Institute) (found ${case2?.institution_id})`);
assert(case2?.institution?.name === 'Apex Institute of Technology & Management', `Case TRAC-2026-00002 resolves to Apex Institute of Technology & Management`);

const case1 = dataStore.getComplaintById('c-1');
assert(case1?.institution_id === 'inst-1', `Case TRAC-2026-00001 belongs to inst-1 (Apex Institute)`);

// Overlap 1 connects c-1 and c-2 on inst-1
const ov1 = dataStore.getOverlapFlags().find(f => f.id === 'ov-1');
assert(ov1?.institution_id === 'inst-1' && ov1?.case_ids.includes('c-1') && ov1?.case_ids.includes('c-2'), 'Overlap ov-1 correctly binds c-1 and c-2 on inst-1');

// Duplicate 1 connects c-1 and c-107 on inst-1
const dup1 = dataStore.getDuplicateFlags().find(f => f.id === 'dup-1');
assert(dup1?.institution_id === 'inst-1' && dup1?.case_ids.includes('c-1') && dup1?.case_ids.includes('c-107'), 'Duplicate dup-1 correctly binds c-1 and c-107 on inst-1');

const case107 = dataStore.getComplaintById('c-107');
assert(case107?.institution_id === 'inst-1', 'Case c-107 belongs to inst-1 (Apex Institute)');
assert(case1?.category === case107?.category, `Duplicate pair c-1 & c-107 share identical category "${case1?.category}"`);

// 5. COHERENT CANDIDATE SUGGESTIONS
console.log('\n--- 5. Candidate Suggestions Coherence ---');
const q1 = mockResolutionQueue.find(q => q.id === 'q-1');
assert(q1?.raw_institution_name === 'Vanguard Inst. of Architecture & Design', 'Queue item q-1 is Vanguard Inst. of Architecture & Design');

const q1Suggestions = dataStore.getSuggestionsForQueueItem('q-1');
const q1Top = q1Suggestions[0];
assert(q1Top?.suggested_institution_id === 'inst-4', `q-1 (Vanguard) top candidate is inst-4 Vanguard School of Architecture (found ${q1Top?.suggested_institution_id})`);
assert(q1Top?.confidence >= 0.90, `q-1 top suggestion confidence is >= 0.90 (found ${q1Top?.confidence})`);
assert(q1Top?.match_details.city === 'Mumbai Suburban' && q1Top?.match_details.state === 'Maharashtra', 'q-1 top suggestion location matches Mumbai Suburban, Maharashtra');

const q2 = mockResolutionQueue.find(q => q.id === 'q-2');
const q2Suggestions = dataStore.getSuggestionsForQueueItem('q-2');
const q2Top = q2Suggestions[0];
assert(q2Top?.suggested_institution_id === 'inst-6', `q-2 (Aryabhatta) top candidate is inst-6 Aryabhatta Institute (found ${q2Top?.suggested_institution_id})`);
assert(q2Top?.confidence >= 0.90, `q-2 top suggestion confidence is >= 0.90 (found ${q2Top?.confidence})`);

// 6. SLA AGEING AND STATUTORY RULE
console.log('\n--- 6. SLA Ageing and Statutory Target ---');
const statutoryTarget = dataStore.getStatutorySLATarget();
assert(statutoryTarget === 30 || statutoryTarget === 21, `Statutory SLA target is configured (${statutoryTarget} days)`);

const now = new Date();
let freshCount = 0;
let activeAgeCount = 0;
let warningCount = 0;
let criticalCount = 0;

complaints.forEach(c => {
  if (c.status === 'disposed') return;
  const received = new Date(c.date_received);
  const diffDays = Math.floor((now.getTime() - received.getTime()) / (1000 * 3600 * 24));
  if (diffDays < 15) freshCount++;
  else if (diffDays <= 30) activeAgeCount++;
  else if (diffDays <= 45) warningCount++;
  else criticalCount++;
});

assert(freshCount === 55, `Fresh cases (< 15 days) count is 55 (found ${freshCount})`);
assert(activeAgeCount === 65, `Active cases (15-30 days) count is 65 (found ${activeAgeCount})`);
assert(warningCount === 48, `Warning cases (30-45 days) count is 48 (found ${warningCount})`);
assert(criticalCount === 32, `Critical cases (> 45 days) count is 32 (found ${criticalCount})`);
assert(freshCount + activeAgeCount + warningCount + criticalCount === 200, `Sum of heatmap age buckets (${freshCount + activeAgeCount + warningCount + criticalCount}) equals 200 active cases`);

console.log('\n🎉 ALL DATA INTEGRITY & AUDIT CHECKS PASSED SUCCESSFULLY!');
