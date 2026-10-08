import { describe, it, expect } from "vitest";
import {
  buildEvalRows,
  serializeEvalJsonl,
  type AssistantTurn
} from "../../../../scripts/eval-jsonl";

/**
 * Builder-side eval export unit tests (testing.md §Unit — "JSONL builder emits
 * the 4 required fields + optional ground_truth/category"). Tests the pure
 * transform extracted from scripts/export-evals.ts; the DB call path in
 * export-evals.ts is left intact and delegates to these functions.
 */

const turns: AssistantTurn[] = [
  {
    question: "How much to unclog a toilet?",
    response: "A simple toilet unclog is a flat $125–$275.",
    citation: "service_pricing#toilet_unclog",
    reasoning: "Price is configured; quoted the configured range.",
    intent: "pricing",
    created_at: "2026-10-01T00:00:00Z"
  },
  {
    question: "What would a full house repipe cost?",
    response: "That's quote-only; I've flagged it for a site estimate.",
    citation: "service_pricing (none) → leads#unknown_price",
    reasoning: "No configured price; captured a lead instead.",
    intent: "pricing",
    created_at: "2026-10-02T00:00:00Z"
  }
];

describe("buildEvalRows", () => {
  it("emits the 4 required fields per row", () => {
    const rows = buildEvalRows(turns);
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row).toHaveProperty("question");
      expect(row).toHaveProperty("response");
      expect(row).toHaveProperty("citation");
      expect(row).toHaveProperty("reasoning");
    }
  });

  it("maps intent → category and defaults to 'unknown'", () => {
    const row = buildEvalRows(turns)[0]!;
    expect(row.category).toBe("pricing");

    const noIntent = buildEvalRows([{ ...turns[0]!, intent: null }]);
    expect(noIntent[0]!.category).toBe("unknown");
  });

  it("attaches optional ground_truth only when a label exists for the question", () => {
    const labels = { "How much to unclog a toilet?": "state configured range only" };
    const rows = buildEvalRows(turns, labels);
    expect(rows[0]!.ground_truth).toBe("state configured range only");
    expect(rows[1]!.ground_truth).toBeUndefined();
  });

  it("omits ground_truth entirely when no labels are provided", () => {
    const rows = buildEvalRows(turns);
    expect("ground_truth" in rows[0]!).toBe(false);
  });

  it("filters out turns with no scored response", () => {
    const rows = buildEvalRows([
      ...turns,
      { question: "q", response: null, citation: null, reasoning: null, intent: "book" },
      { question: "q2", response: "   ", citation: null, reasoning: null, intent: "book" }
    ]);
    expect(rows).toHaveLength(2);
  });

  it("coalesces null optional fields to empty strings", () => {
    const rows = buildEvalRows([
      { question: null, response: "hi", citation: null, reasoning: null, intent: null }
    ]);
    expect(rows[0]!).toMatchObject({ question: "", citation: "", reasoning: "", category: "unknown" });
  });
});

describe("serializeEvalJsonl", () => {
  it("writes one JSON object per line with a trailing newline", () => {
    const jsonl = serializeEvalJsonl(buildEvalRows(turns));
    const lines = jsonl.trimEnd().split("\n");
    expect(lines).toHaveLength(2);
    expect(jsonl.endsWith("\n")).toBe(true);
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.question).toBe("How much to unclog a toilet?");
    expect(parsed.category).toBe("pricing");
  });

  it("returns an empty string for no rows", () => {
    expect(serializeEvalJsonl([])).toBe("");
  });
});
