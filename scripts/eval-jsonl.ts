/**
 * eval-jsonl.ts — PURE JSONL builder for the Azure AI Foundry eval export.
 *
 * Extracted from export-evals.ts so the row-building logic is unit-testable
 * WITHOUT a Supabase connection (testing.md §Unit — "Builder-side eval export").
 * export-evals.ts keeps the full DB call path intact and delegates the pure
 * transform (DB rows → eval rows → JSONL) to the two functions below.
 *
 * Spec: docs/customer-app/implementation/eval-pipeline.md §2 (+ ED §9.3).
 */

/** One scored AI turn as read from `messages`. */
export interface AssistantTurn {
  question: string | null;
  response: string | null;
  citation: string | null;
  reasoning: string | null;
  intent: string | null;
  created_at?: string;
}

/** One output row in the Azure AI Foundry JSONL dataset. */
export interface EvalRow {
  question: string;
  response: string;
  citation: string;
  reasoning: string;
  ground_truth?: string;
  category: string;
}

/**
 * Build eval rows from assistant turns.
 * - Emits the 4 required fields (question/response/citation/reasoning).
 * - `category` comes from the turn's `intent` (default "unknown").
 * - `ground_truth` is attached only when the labels map has an entry for the
 *   turn's question (optional field).
 * - Only fully-scored turns are exported (a non-empty `response` must exist).
 */
export function buildEvalRows(
  turns: AssistantTurn[],
  groundTruth: Record<string, string> = {}
): EvalRow[] {
  return turns
    .filter((t) => t.response != null && t.response.trim() !== "")
    .map((t) => {
      const question = t.question ?? "";
      const row: EvalRow = {
        question,
        response: t.response ?? "",
        citation: t.citation ?? "",
        reasoning: t.reasoning ?? "",
        category: t.intent ?? "unknown"
      };
      const gt = groundTruth[question];
      if (gt) row.ground_truth = gt;
      return row;
    });
}

/** Serialize eval rows to JSONL (one JSON object per line, trailing newline). */
export function serializeEvalJsonl(rows: EvalRow[]): string {
  return rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : "");
}
