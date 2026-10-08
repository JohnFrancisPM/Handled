import type { TurnResult } from "@/lib/types";

/**
 * Deterministic offline reply (graceful-degradation.md §2). Chooses a plausible intent from
 * keywords so a recorded demo looks alive even with no live n8n, and ALWAYS sets mocked:true
 * + agent:"offline-mock" + an unmistakable 【offline mock】 prefix. Never pretends to be live.
 */
export function mockReplyFor(_customer: { name: string | null }, text: string): TurnResult {
  const t = text.toLowerCase();
  const guess = /gas|burst|flood|sewage|carbon|no heat|fire|smoke/.test(t)
    ? "emergency"
    : /price|cost|how much|quote|\$/.test(t)
      ? "pricing"
      : /reschedul|move|change/.test(t)
        ? "reschedule"
        : /cancel/.test(t)
          ? "cancel"
          : /ignore (your|previous)|system prompt/.test(t)
            ? "injection"
            : /book|appointment|come out|fix|install|repair|clog/.test(t)
              ? "book"
              : "faq";
  return {
    reply: `【offline mock】 Simulated ${guess} reply — the live Acme assistant is not connected.`,
    intent: guess,
    agent: "offline-mock",
    actions: null,
    mocked: true
  };
}
