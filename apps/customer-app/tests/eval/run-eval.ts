/**
 * run-eval.ts — offline agent eval runner (eval-pipeline.md §3/§4).
 *
 * Reads the 50 eval cases (tests/eval/eval-cases.json, extracted from
 * docs/evals.xlsx), POSTs each caller input to the n8n webhook (or any configured
 * endpoint), scores the response against the expected intent/behavior, and
 * aggregates HHH pass rates + the launch gates:
 *   - ANY Critical case failure blocks launch
 *   - emergency recall must = 100%
 *
 * This is a STANDALONE script (not a Vitest test — the filename intentionally does
 * not end in .test.ts, so `npm run test` never runs it). It is env-gated and does
 * NOT run in environments without a reachable agent. It never invents scores: with
 * no endpoint configured it prints how to run it and exits 0 (nothing scored);
 * with an endpoint it scores only real responses.
 *
 * Run (at Stage 6, against the deployed n8n):
 *   N8N_WEBHOOK_URL="https://<n8n-host>/webhook/handled" \
 *   N8N_WEBHOOK_SECRET="<secret>" \
 *   npx tsx tests/eval/run-eval.ts
 *
 * Optional:
 *   EVAL_ENDPOINT   override the POST target (defaults to N8N_WEBHOOK_URL)
 *   EVAL_ORG_ID     org id to include in the payload
 *   EVAL_OUT_FILE   write the full JSON report here (default: eval-report-<date>.json)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { aggregate, scoreCase, type AgentResponse, type EvalCase, type CaseResult } from "./score";

const ENDPOINT = process.env.EVAL_ENDPOINT || process.env.N8N_WEBHOOK_URL || "";
const SECRET = process.env.N8N_WEBHOOK_SECRET || "";
const ORG_ID = process.env.EVAL_ORG_ID || "";

function loadCases(): EvalCase[] {
  const path = resolve(__dirname, "eval-cases.json");
  const parsed = JSON.parse(readFileSync(path, "utf8")) as { cases: EvalCase[] };
  return parsed.cases;
}

/** POST one case to the agent endpoint and normalize the response shape. */
async function askAgent(c: EvalCase): Promise<AgentResponse | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(SECRET ? { "x-webhook-secret": SECRET } : {})
      },
      body: JSON.stringify({
        org_id: ORG_ID || undefined,
        case_id: c.case_id,
        from: "+15550000000",
        text: c.caller_input
      })
    });
    if (!res.ok) return { error: `HTTP ${res.status}`, reply: null };
    const body = (await res.json()) as Record<string, unknown>;
    return {
      intent: (body.intent as string) ?? null,
      actions: (body.actions as string[]) ?? [],
      reply: (body.reply as string) ?? (body.text as string) ?? null,
      tool_calls: (body.tool_calls as AgentResponse["tool_calls"]) ?? []
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err), reply: null };
  }
}

async function main(): Promise<void> {
  const cases = loadCases();
  console.log(`Loaded ${cases.length} eval cases from tests/eval/eval-cases.json`);

  if (!ENDPOINT) {
    console.log(
      "\nNo agent endpoint configured (set N8N_WEBHOOK_URL or EVAL_ENDPOINT).\n" +
        "Nothing was scored — this runner never invents results.\n" +
        "See tests/eval/README.md to run it against the deployed n8n at Stage 6."
    );
    process.exit(0);
  }

  const results: CaseResult[] = [];
  for (const c of cases) {
    const resp = await askAgent(c);
    const result = scoreCase(c, resp);
    results.push(result);
    const mark = result.passed ? "PASS" : "FAIL";
    console.log(`  [${mark}] ${c.case_id} (${c.severity}) — ${result.reasons[0] ?? ""}`);
  }

  const summary = aggregate(results);
  console.log("\n=== Summary ===");
  console.log(`Overall: ${summary.passed}/${summary.total} (${(summary.pass_rate * 100).toFixed(1)}%)`);
  for (const [hhh, s] of Object.entries(summary.byHHH)) {
    console.log(`  ${hhh}: ${s.passed}/${s.total} (${(s.pass_rate * 100).toFixed(1)}%)`);
  }
  console.log(
    `Critical: ${summary.critical.passed}/${summary.critical.total}` +
      (summary.critical.failed ? ` — FAILED: ${summary.critical.failed_ids.join(", ")}` : "")
  );
  console.log(
    `Emergency recall: ${(summary.emergency.recall * 100).toFixed(1)}% ` +
      `(${summary.emergency.recalled}/${summary.emergency.total})` +
      (summary.emergency.missed_ids.length ? ` — MISSED: ${summary.emergency.missed_ids.join(", ")}` : "")
  );
  console.log("\n=== Launch gates (eval-pipeline.md §4) ===");
  console.log(`  All Critical pass:    ${summary.gates.critical_all_pass ? "YES" : "NO"}`);
  console.log(`  Emergency recall 100%: ${summary.gates.emergency_recall_100 ? "YES" : "NO"}`);
  console.log(`  LAUNCH ${summary.gates.launch_blocked ? "BLOCKED" : "CLEAR"}`);

  const outFile =
    process.env.EVAL_OUT_FILE ?? `eval-report-${new Date().toISOString().slice(0, 10)}.json`;
  writeFileSync(resolve(process.cwd(), outFile), JSON.stringify({ summary, results }, null, 2));
  console.log(`\nWrote full report → ${outFile}`);

  // Non-zero exit when the launch gates fail, so CI can block.
  process.exit(summary.gates.launch_blocked ? 1 : 0);
}

main().catch((err) => {
  console.error("run-eval failed:", err);
  process.exit(1);
});
