# Graceful Degradation — offline/mock vs degraded-but-200

**Source:** engineering-doc §4.5, §6.2, §8.3, §16, SC-4 · coordinator verified-backend note.
**Core rule:** the harness **never hard-fails**. But there are **two distinct** non-happy
situations and they must not be conflated.

---

## 1. The two situations (keep them distinct)

### A. Degraded-but-200 (a REAL agent response — show it faithfully)
The webhook returned HTTP 200 with `body.ok:true` but a **degraded** payload — e.g. the
booking agent replies `"Agent stopped due to max iterations"` with `actions: []`, or `reply`
is terse/odd. **This is a genuine agent turn.** The harness renders it exactly as any other
success (`webhook-proxy.md` §4.2 state (a)): inbound bubble + whatever `intent`/`agent`/
`actions` came back. **Do NOT special-case, hide, retry, or "fix" it.** The whole point of a
test harness is to expose this behavior to the tester. Spam (`reply:null`, `billed:false`) is
also a real success: render a muted system line "no reply (spam filtered)".

### B. Unreachable / unconfigured (we never reached a working agent)
Network error, DNS failure, timeout (>`WEBHOOK_TIMEOUT_MS`), malformed/unparseable body, or
missing env (`!hasWebhookConfig()`) → `callWebhook` returns `kind:"unreachable"`. This is the
**offline/mock + error** path below. It is NOT a chat reply from Acme.

> A webhook `body.ok:false` (bad secret, unknown business, the webhook's own validation
> gripe) is a **third** state — surfaced as a configuration **error**, also not a chat reply
> (`webhook-proxy.md` §4.2 state (b)). Summary: (a) success incl. degraded, (b) webhook
> rejected us, (c) we couldn't reach it. Three states, three UI treatments.

---

## 2. Offline-mock mode — `lib/webhook/mock.ts`

When `OFFLINE_MOCK=true` and the outcome is `unreachable` (situation B), the routes return a
**canned, clearly-tagged** reply instead of an error, so a recorded demo cannot hard-fail
even with no live n8n.

```ts
// lib/webhook/mock.ts
import type { TurnResult } from "@/lib/types";

/**
 * Deterministic offline reply. Chooses a plausible intent from keywords so the demo looks
 * alive, and ALWAYS sets mocked:true + intent:"mock-<guess>" style so it is unmistakably
 * simulated. Never pretends to be the live agent.
 */
export function mockReplyFor(customer: { name: string | null }, text: string): TurnResult {
  const t = text.toLowerCase();
  const guess =
    /gas|burst|flood|sewage|carbon|no heat|fire|smoke/.test(t) ? "emergency" :
    /price|cost|how much|quote|\$/.test(t)                     ? "pricing"  :
    /reschedul|move|change/.test(t)                            ? "reschedule":
    /cancel/.test(t)                                            ? "cancel"   :
    /ignore (your|previous)|system prompt/.test(t)             ? "injection":
    /book|appointment|come out|fix|install|repair|clog/.test(t) ? "book"     :
    "faq";
  return {
    reply: `【offline mock】 Simulated ${guess} reply — the live Acme assistant is not connected.`,
    intent: guess,
    agent: "offline-mock",
    actions: null,
    mocked: true
  };
}
```

- Used by `/api/send` (one reply) and `/api/batch` (per scenario) on `unreachable` outcomes
  **only when `isOfflineMock()`**.
- In the batch, a mocked row counts toward `summary.ok` but is flagged `mocked:true`; its
  `match` is still computed against `acceptable_intents` (demo continuity).
- The `agent:"offline-mock"` + `mocked:true` + the `【offline mock】` prefix make it visually
  unmistakable (the UI also styles mocked bubbles distinctly — §4).

---

## 3. Error mode (OFFLINE_MOCK off)

When the outcome is `unreachable` and `OFFLINE_MOCK` is **false**:
- `/api/send` → `fail("webhook_unavailable")` (HTTP 200 soft). UI renders a non-blocking
  **error bubble** in-thread: "Acme's assistant is unavailable — check N8N_WEBHOOK_URL." The
  composer stays enabled; nothing crashes.
- `/api/batch` → if the webhook is entirely unconfigured, one whole-batch
  `fail("webhook_unavailable")` + banner; otherwise per-row `error:"webhook_unavailable"` and
  the run completes (`webhook-proxy.md` §6.4).

For webhook `ok:false` (situation (b)) the UI shows the specific coded message
(`unauthorized` → "check N8N_WEBHOOK_SECRET", `unknown_business` → "check ACME_BUSINESS_ID").

---

## 4. UI surfaces (cross-ref `chat-ui.md`)

| Surface | When | Component |
|---|---|---|
| Offline banner (top) | `useHealth` → `webhookConfigured:false` | `system/OfflineBanner.tsx` — "Offline: webhook not configured. Replies are simulated." (or "…will show an error" if mock off) |
| Mock indicator | `useHealth` → `offlineMock:true` | banner variant / badge "Offline mock mode — replies are simulated." |
| Mocked bubble | `TurnResult.mocked === true` | `MessageBubble` with a muted/"mock" tag (distinct style, still color-token-only) |
| Error bubble | envelope `ok:false` | `system/ErrorBubble.tsx` — coded safe message, Red-50 tint per design tokens |
| Degraded success | `ok:true`, odd reply | normal `MessageBubble` — **no special styling**; it is a real reply |

---

## 5. Invariants (tested — see `testing.md`)

1. App **builds and runs with zero env** set (no webhook, no secret). Roster + threads work
   from the fixture; `/api/health` reports `webhookConfigured:false`.
2. No code path throws an unhandled rejection to the browser. Every `/api/*` returns a valid
   envelope. `callWebhook` never rethrows a fetch error past its try/catch.
3. Degraded-but-200 replies are rendered unchanged (a unit/integration test feeds a stubbed
   `"Agent stopped due to max iterations"` + empty actions and asserts it reaches the UI as a
   normal success, `mocked:false`).
4. Offline-mock replies are always `mocked:true` + `agent:"offline-mock"` and never
   indistinguishable from a live reply.

---

## Requirement coverage
- **TH-5** (never hard-fail; offline/mock + error state) — §1–§5.
- **SC-4** (webhook unavailable/env missing never hard-fails) — §2, §3, §5.
- Coordinator mandate (degraded-200 distinct from unreachable; three states) — §1, §4.
