/**
 * export-evals.ts — BUILDER-SIDE eval export (Azure AI Foundry JSONL).
 *
 * Spec: docs/customer-app/implementation/eval-pipeline.md §2 (and ED §9.3).
 * This is NOT a customer-facing feature: there is no dashboard Evals page and no
 * /api/evals/export route. The builder (John) runs this directly against Supabase
 * with the SERVICE-ROLE key, OUTSIDE apps/customer-app.
 *
 * What it does:
 *   1. Connects to Supabase with the service-role key (bypasses RLS).
 *   2. Resolves the org (by id or slug; default slug "acme-plumbing").
 *   3. Pulls every scored AI turn: messages where role='assistant' (org-scoped),
 *      reading question/response/citation/reasoning/intent, ordered by created_at
 *      (mirrors the documented SQL in scripts/export-evals.sql).
 *   4. Optionally attaches ground_truth from a local labels file
 *      (scripts/eval-ground-truth.json, keyed by question) — from evals.xlsx.
 *   5. Writes one JSONL row per turn:
 *        { question, response, citation, reasoning, ground_truth?, category }
 *   6. Records an eval_exports audit row (row_count, format, created_by).
 *
 * Client library: @supabase/supabase-js (already a dependency of
 *   apps/customer-app; run this script with that package resolvable, e.g. from
 *   the repo root with that node_modules on NODE_PATH, or `npx tsx` after
 *   `npm i @supabase/supabase-js`). See scripts/README.md.
 *
 * Env (required):
 *   SUPABASE_URL                 e.g. https://<project>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    service-role key (server-only; never ship it)
 * Env (optional):
 *   EVAL_ORG_ID                  org uuid (takes precedence over slug)
 *   EVAL_ORG_SLUG                default "acme-plumbing"
 *   EVAL_CREATED_BY              dashboard_users.id to stamp on the audit row
 *   EVAL_OUT_FILE                output path (default evals-<slug>-<date>.jsonl)
 *
 * Usage:
 *   npx tsx scripts/export-evals.ts
 *   EVAL_ORG_SLUG=acme-plumbing EVAL_OUT_FILE=out/acme.jsonl npx tsx scripts/export-evals.ts
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
// Pure, DB-free JSONL builder (unit-tested in apps/customer-app/tests/unit).
import { buildEvalRows, serializeEvalJsonl, type AssistantTurn } from './eval-jsonl';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

/** Optional ground-truth labels (question -> expected answer/action) from evals.xlsx. */
function loadGroundTruth(): Record<string, string> {
  const path = resolve(__dirname, 'eval-ground-truth.json');
  if (!existsSync(path)) return {};
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown;
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, string>;
    }
    return {};
  } catch (err) {
    console.warn(`Could not parse ${path}; continuing without ground_truth.`, err);
    return {};
  }
}

async function resolveOrgId(supabase: SupabaseClient): Promise<string> {
  const explicit = process.env.EVAL_ORG_ID;
  if (explicit) return explicit;

  const slug = process.env.EVAL_ORG_SLUG ?? 'acme-plumbing';
  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error(`Could not resolve org by slug "${slug}":`, error?.message ?? 'not found');
    process.exit(1);
  }
  return (data as { id: string }).id;
}

async function main(): Promise<void> {
  const url = requireEnv('SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  // Service-role client: bypasses RLS. Do not persist a session.
  const supabase: SupabaseClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const orgId = await resolveOrgId(supabase);
  const groundTruth = loadGroundTruth();

  // Mirrors scripts/export-evals.sql: assistant turns, org-scoped, chronological.
  const { data, error } = await supabase
    .from('messages')
    .select('question, response, citation, reasoning, intent, created_at')
    .eq('org_id', orgId)
    .eq('role', 'assistant')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Query failed:', error.message);
    process.exit(1);
  }

  const turns = (data ?? []) as AssistantTurn[];

  // Pure transform (shared with the unit tests): rows + JSONL serialization.
  const rows = buildEvalRows(turns, groundTruth);
  const jsonl = serializeEvalJsonl(rows);

  const slug = process.env.EVAL_ORG_SLUG ?? 'acme-plumbing';
  const stamp = new Date().toISOString().slice(0, 10);
  const outFile = process.env.EVAL_OUT_FILE ?? `evals-${slug}-${stamp}.jsonl`;
  const outPath = resolve(process.cwd(), outFile);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, jsonl, 'utf8');

  // Audit row (eval_exports). created_by is nullable.
  const createdBy = process.env.EVAL_CREATED_BY ?? null;
  const { error: auditError } = await supabase.from('eval_exports').insert({
    org_id: orgId,
    row_count: rows.length,
    format: 'azure_foundry_jsonl',
    created_by: createdBy,
  });

  if (auditError) {
    console.warn('Export written but failed to record eval_exports row:', auditError.message);
  }

  console.log(`Exported ${rows.length} eval rows → ${outPath}`);
  console.log(`Recorded eval_exports audit row (org ${orgId}).`);
}

main().catch((err) => {
  console.error('export-evals failed:', err);
  process.exit(1);
});
