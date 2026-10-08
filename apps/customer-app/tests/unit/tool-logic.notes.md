# Tool-layer logic — where it lives and how it's tested

`testing.md` §Unit asks for coverage of the agent tool-layer logic:

- `validate_service_area` — serve/deny precedence
- `check_availability` — excludes sick/vacation techs, respects business hours +
  closed_dates, subtracts existing appointments
- `get_service_pricing` — returns a configured range only; `found:false` for an
  un-priced service

**This logic is NOT in `apps/customer-app`.** It is implemented inside the n8n
workflow as `toolCode` nodes in `n8n/handled-agentic.json` (see
`docs/customer-app/implementation/n8n-tools.md`). The dashboard has no importable
equivalent in `lib/` — it only renders the *results* of these tools (the fixtures
in `lib/demo/fixtures.ts` show the shape, e.g. `validate_service_area → {mode}`,
`get_service_pricing → {price_min, price_max}` / `{found:false}`).

Per the Stage-5 brief, we deliberately **do not duplicate** this n8n-embedded
logic into a parallel TypeScript module that would drift from the real agent.
Writing a copy here and unit-testing the copy would prove nothing about the agent
that actually runs.

## How it IS covered

End-to-end, by the **offline agent eval** (`tests/eval/`, see
`docs/customer-app/implementation/eval-pipeline.md` and the 50 `evals.xlsx`
cases). That harness POSTs real inputs to the n8n webhook and asserts the tools
behaved correctly in context — e.g.:

- serve/deny precedence → cases `Ha-04` (out-of-area decline, no booking)
- un-priced service → `Ho-02` (zero invented price; lead captured)
- real-slots-only availability → `Ho-03` / `Ho-08` (only tool-returned slots;
  re-check before write; no double-book)
- sick/vacation exclusion is exercised through the seeded team (1 sick, 1 on
  vacation — `lib/demo/fixtures.ts`) feeding `check_availability`.

The eval is env-gated (`N8N_WEBHOOK_URL`) and is run at Stage 6 against the live
n8n deployment; it is not run in this environment (no n8n/Anthropic key here).

## What the dashboard unit tests DO cover

The importable, dashboard-owned logic that mirrors these policies:

- `tests/unit/fixtures.test.ts` asserts the seed has both serve and deny areas,
  offered + won't-provide services, priced + un-priced services, and exactly one
  sick + one vacation technician — the inputs these tools read.
- `tests/unit/conversion.test.ts` / `schemas.test.ts` cover the analytics + Zod
  contract that the dashboard owns directly.
