import { getBatchConcurrency, getBusinessId, isOfflineMock } from "@/lib/env";
import { getCustomerById, getScenarios } from "@/lib/fixtures/load";
import { callWebhook, type WebhookRequestBody } from "@/lib/webhook/callWebhook";
import { mockReplyFor } from "@/lib/webhook/mock";
import type { BatchResult, BatchRunData, BatchSummary } from "@/lib/types";
import type { Scenario } from "@/lib/fixtures/types";

export function matches(scenario: Scenario, intent: string | null): boolean {
  if (scenario.acceptable_intents.includes("*")) return true;
  return intent != null && scenario.acceptable_intents.includes(intent);
}

/** Group scenarios by resolved from_phone, preserving fixture order within each group. */
export function groupByPhone(scenarios: Scenario[]): Scenario[][] {
  const groups = new Map<string, Scenario[]>();
  for (const s of scenarios) {
    const phone = getCustomerById(s.customer_id)?.phone ?? s.customer_id;
    if (!groups.has(phone)) groups.set(phone, []);
    groups.get(phone)!.push(s);
  }
  return [...groups.values()];
}

async function runScenario(runId: string, scenario: Scenario): Promise<BatchResult> {
  const base = {
    scenario_id: scenario.scenario_id,
    text: scenario.text,
    expected_intent: scenario.expected_intent
  };
  const customer = getCustomerById(scenario.customer_id);
  if (!customer) {
    return { ...base, intent: null, agent: null, match: false, latency_ms: 0, reply: null, actions: null, mocked: false, error: "not_found" };
  }

  const body: WebhookRequestBody = {
    business_id: getBusinessId(),
    from_phone: customer.phone,
    text: scenario.text,
    channel: "sms",
    ...(customer.name ? { customer_name: customer.name } : {}),
    message_id: `batch-${runId}-${scenario.scenario_id}`
  };

  const start = Date.now();
  const outcome = await callWebhook(body);
  const latency_ms = Date.now() - start;

  if (outcome.kind === "ok") {
    const { reply, intent, agent, actions, mocked } = outcome.result;
    return { ...base, intent, agent, match: matches(scenario, intent), latency_ms, reply, actions, mocked, error: null };
  }
  if (outcome.kind === "error") {
    return { ...base, intent: null, agent: null, match: false, latency_ms, reply: null, actions: null, mocked: false, error: outcome.code };
  }
  // unreachable
  if (isOfflineMock()) {
    const m = mockReplyFor(customer, scenario.text);
    return { ...base, intent: m.intent, agent: m.agent, match: matches(scenario, m.intent), latency_ms, reply: m.reply, actions: m.actions, mocked: true, error: null };
  }
  return { ...base, intent: null, agent: null, match: false, latency_ms, reply: null, actions: null, mocked: false, error: "webhook_unavailable" };
}

/**
 * Fan the committed scenario set out to the webhook. Scenarios that share a from_phone run
 * SERIALLY (so n8n per-(org,phone) context never interleaves); different phones run
 * concurrently, bounded by getBatchConcurrency() (hard-capped at 5). Partial failures never
 * abort the run. (webhook-proxy.md §6 / scenario-set.md §5.)
 */
export async function runBatch(): Promise<BatchRunData> {
  const runId = crypto.randomUUID();
  const scenarios = getScenarios();
  const groupList = groupByPhone(scenarios);

  const results: BatchResult[] = [];
  let cursor = 0;
  const worker = async () => {
    // `cursor++` is synchronous before any await — no race in the single-threaded loop.
    while (cursor < groupList.length) {
      const group = groupList[cursor++];
      if (!group) continue;
      for (const scenario of group) {
        results.push(await runScenario(runId, scenario));
      }
    }
  };
  const workerCount = Math.min(getBatchConcurrency(), groupList.length);
  await Promise.all(Array.from({ length: workerCount }, worker));

  // stable output: order results by the original scenario order
  const order = new Map(scenarios.map((s, i) => [s.scenario_id, i]));
  results.sort((a, b) => (order.get(a.scenario_id) ?? 0) - (order.get(b.scenario_id) ?? 0));

  const summary: BatchSummary = {
    sent: results.length,
    ok: results.filter((r) => r.error === null).length, // includes degraded 200s + mocks
    matched: results.filter((r) => r.match).length,
    errored: results.filter((r) => r.error !== null).length
  };

  return { runId, summary, results };
}
