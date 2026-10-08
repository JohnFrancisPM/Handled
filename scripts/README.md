# scripts — builder-side utilities (outside `apps/customer-app`)

These run OUTSIDE the customer app. They are **builder tasks** (John / course),
not customer-facing features. Per the engineering doc there is no dashboard Evals
page and no `/api/evals/export` route — eval export is a direct DB pull.

## `export-evals.ts` — Azure AI Foundry eval export

Pulls every scored AI turn (`messages` where `role='assistant'`, org-scoped) and
writes an Azure AI Foundry-compatible JSONL dataset, one row per turn:

```jsonc
{"question":"...","response":"...","citation":"service_pricing#drain_clearing, check_availability","reasoning":"...","ground_truth":"(optional)","category":"book"}
```

It also records an `eval_exports` audit row (`row_count`, `format`, `created_by`).

- **Spec:** `docs/customer-app/implementation/eval-pipeline.md` §2, ED §9.3.
- **Client library:** `@supabase/supabase-js` (already a dependency of
  `apps/customer-app`). The query it runs is the documented SQL in
  `export-evals.sql`.
- **Auth:** service-role key (bypasses RLS). Server-only — never commit or ship it.

### Run it

The package is already installed under `apps/customer-app/node_modules`, so the
simplest path is to run from there (or install the two packages at the repo root):

```bash
# Option A — reuse the customer-app install:
cd apps/customer-app
SUPABASE_URL="https://<project>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
EVAL_ORG_SLUG="acme-plumbing" \
EVAL_OUT_FILE="../../out/acme-evals.jsonl" \
npx tsx ../../scripts/export-evals.ts

# Option B — standalone at the repo root:
npm i @supabase/supabase-js tsx
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/export-evals.ts
```

### Environment variables

| Var | Required | Default | Purpose |
|---|---|---|---|
| `SUPABASE_URL` | yes | — | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | — | Service-role key (bypasses RLS) |
| `EVAL_ORG_ID` | no | — | Org uuid (wins over slug) |
| `EVAL_ORG_SLUG` | no | `acme-plumbing` | Org slug to resolve |
| `EVAL_CREATED_BY` | no | `null` | `dashboard_users.id` to stamp on the audit row |
| `EVAL_OUT_FILE` | no | `evals-<slug>-<date>.jsonl` | Output path |

### Optional ground truth

If `scripts/eval-ground-truth.json` exists (a JSON object keyed by `question`,
with the expected answer/action from `docs/evals.xlsx`), the script attaches a
`ground_truth` field to matching rows. Without the file, rows omit it — the
export still works.

## `export-evals.sql`

The documented SQL the script mirrors — run it directly with `psql`/`supabase`
(service-role) if you prefer a one-off pull. Includes a slug-resolving variant
and the `eval_exports` audit insert.
