-- =====================================================================
-- export-evals.sql — documented builder-side eval pull (ED §9.3,
--   docs/customer-app/implementation/eval-pipeline.md §2).
--
-- BUILDER-SIDE ONLY: run with the service-role connection (bypasses RLS),
-- OUTSIDE apps/customer-app. Not a dashboard feature.
--
-- Pulls every scored AI turn (assistant messages), org-scoped, in order.
-- scripts/export-evals.ts runs the equivalent query via @supabase/supabase-js
-- and serializes each row to one Azure AI Foundry JSONL line:
--   { question, response, citation, reasoning, (ground_truth?), category }
-- where category = intent.
--
-- Replace :org_id with Acme's org id (a0000000-0000-0000-0000-000000000001),
-- or resolve it from the slug (see the CTE variant below).
-- =====================================================================

-- Direct form (ED §9.3 / eval-pipeline.md §2):
select
  m.question,
  m.response,
  m.citation,
  m.reasoning,
  m.intent as category
from public.messages m
where m.role = 'assistant'
  and m.org_id = :org_id
  and m.response is not null
order by m.created_at;

-- Convenience variant that resolves the org by slug (psql):
--   \set slug '''acme-plumbing'''
with org as (
  select id from public.organizations where slug = 'acme-plumbing'
)
select
  m.question,
  m.response,
  m.citation,
  m.reasoning,
  m.intent as category
from public.messages m
join org on org.id = m.org_id
where m.role = 'assistant'
  and m.response is not null
order by m.created_at;

-- Audit row the script records after a successful export:
-- insert into public.eval_exports (org_id, row_count, format, created_by)
-- values (:org_id, :row_count, 'azure_foundry_jsonl', :created_by);
