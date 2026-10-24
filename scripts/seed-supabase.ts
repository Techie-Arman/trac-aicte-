import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import {
  mockAlerts,
  mockBureaus,
  mockCaseActions,
  mockComplaints,
  mockDuplicateFlags,
  mockDuplicateReviewEvents,
  mockInstitutions,
  mockMatchSuggestions,
  mockOverlapFlags,
  mockOverlapReviewEvents,
  mockResolutionQueue,
  mockSLARules,
  mockUsers,
} from '../src/lib/mock-data';

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Set NEXT_PUBLIC_SUPABASE_URL and the server-only SUPABASE_SERVICE_ROLE_KEY in .env.local before seeding.',
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedTable(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    console.log(`No rows to seed into ${table}.`);
    return;
  }

  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) {
    throw new Error(`Unable to seed ${table}: ${error.message}`);
  }
  console.log(`Seeded ${rows.length} rows into ${table}.`);
}

async function seed() {
  await seedTable('bureaus', mockBureaus.map((row) => ({ ...row, is_seed: true })));
  await seedTable('users', mockUsers.map((row) => ({ ...row, is_seed: true })));
  await seedTable('institutions', mockInstitutions.map((row) => ({ ...row, is_seed: true })));
  await seedTable(
    'complaints',
    mockComplaints.map(({ institution: _institution, ...row }) => ({ ...row, is_seed: true })),
  );
  await seedTable('case_actions', mockCaseActions.map((row) => ({ ...row, is_seed: true })));
  await seedTable('institution_resolution_queue', mockResolutionQueue.map((row) => ({ ...row, is_seed: true })));
  await seedTable('institution_match_suggestions', mockMatchSuggestions.map((row) => ({ ...row, is_seed: true })));
  await seedTable('overlap_flags', mockOverlapFlags.map((row) => ({ ...row, is_seed: true })));
  await seedTable('overlap_review_events', mockOverlapReviewEvents.map((row) => ({ ...row, is_seed: true })));
  await seedTable('duplicate_flags', mockDuplicateFlags.map((row) => ({ ...row, is_seed: true })));
  await seedTable('duplicate_review_events', mockDuplicateReviewEvents.map((row) => ({ ...row, is_seed: true })));
  await seedTable('sla_rules', mockSLARules.map((row) => ({ ...row, is_seed: true })));
  await seedTable('alerts', mockAlerts.map((row) => ({ ...row, is_seed: true })));
  await seedTable('app_settings', [{ id: 'statutory_sla_target_days', value: 30, is_seed: true }]);
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
