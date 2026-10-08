import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST } from "@/app/api/batch/route";
import { getScenarios } from "@/lib/fixtures/load";

const jsonRes = (obj: unknown) => ({ json: async () => obj }) as unknown as Response;

/** Extract the scenario_id from the tail of message_id (batch-<uuid>-<scenario_id>). */
function scenarioIdFromMessageId(mid: string): string {
  const m = /(TH-ex-\d+|Ho-\d+|Ha-\d+|H-\d+)$/.exec(mid);
  return m ? m[1]! : mid;
}

function makeFetch(log: string[], opts: { failScenario?: string } = {}) {
  return vi.fn(async (_url: string, init: { body: string }) => {
    const b = JSON.parse(init.body) as { message_id: string; text: string };
    const sid = scenarioIdFromMessageId(b.message_id);
    log.push(sid);
    if (opts.failScenario && sid === opts.failScenario) {
      return jsonRes({ ok: false, error: "unauthorized" });
    }
    return jsonRes({ ok: true, reply: "ok", intent: "book", agent: "a", actions: [] });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.N8N_WEBHOOK_URL = "https://x/webhook";
  process.env.N8N_WEBHOOK_SECRET = "s";
  process.env.ACME_BUSINESS_ID = "acme-plumbing";
  process.env.BATCH_CONCURRENCY = "5";
  delete process.env.OFFLINE_MOCK;
});
afterEach(() => {
  vi.restoreAllMocks();
  for (const k of ["N8N_WEBHOOK_URL", "N8N_WEBHOOK_SECRET", "ACME_BUSINESS_ID", "BATCH_CONCURRENCY", "OFFLINE_MOCK"])
    delete process.env[k];
});

describe("/api/batch", () => {
  it("returns a summary + one result per scenario", async () => {
    const log: string[] = [];
    global.fetch = makeFetch(log);
    const env = await (await POST()).json();
    expect(env.ok).toBe(true);
    const total = getScenarios().length;
    expect(env.data.summary.sent).toBe(total);
    expect(env.data.results).toHaveLength(total);
    expect(env.data.summary.errored).toBe(0);
  });

  it("a single failing row does not abort the batch", async () => {
    const log: string[] = [];
    global.fetch = makeFetch(log, { failScenario: "Ho-02" });
    const env = await (await POST()).json();
    expect(env.ok).toBe(true);
    expect(env.data.summary.sent).toBe(getScenarios().length);
    expect(env.data.summary.errored).toBeGreaterThanOrEqual(1);
    const row = env.data.results.find((r: { scenario_id: string }) => r.scenario_id === "Ho-02");
    expect(row.error).toBe("unauthorized");
  });

  it("serializes same-phone scenarios in fixture order (Jane: H-01 < Ho-04 < TH-ex-01)", async () => {
    const log: string[] = [];
    global.fetch = makeFetch(log);
    await POST();
    const jane = log.filter((id) => ["H-01", "Ho-04", "TH-ex-01"].includes(id));
    expect(jane).toEqual(["H-01", "Ho-04", "TH-ex-01"]);
  });

  it("computes match against acceptable_intents", async () => {
    global.fetch = makeFetch([]);
    const env = await (await POST()).json();
    const h01 = env.data.results.find((r: { scenario_id: string }) => r.scenario_id === "H-01");
    expect(h01.match).toBe(true); // returned "book" ∈ ["book"]
    const extra = env.data.results.find((r: { scenario_id: string }) => r.scenario_id === "TH-ex-01");
    expect(extra.match).toBe(true); // acceptable ["*"] always passes
  });

  it("whole-batch webhook_unavailable only when unconfigured and mock off", async () => {
    delete process.env.N8N_WEBHOOK_URL;
    delete process.env.N8N_WEBHOOK_SECRET;
    const res = await POST();
    const env = await res.json();
    expect(env.ok).toBe(false);
    expect(env.error.code).toBe("webhook_unavailable");
  });
});
