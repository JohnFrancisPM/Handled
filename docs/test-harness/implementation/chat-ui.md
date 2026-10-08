# Chat UI — pages, components, state, hooks

**Source:** engineering-doc §4, §5.2, §5.3, §10 F2–F4 · design: `design-system-setup.md`.
**Apply `/design-system` to every component.** Tokens only — no arbitrary hex/spacing/type.

The app is a **single screen**: a two-pane SMS tester (roster + thread) with a batch
overlay. All copy lives in `content/copy.ts` (content-driven, like the website).

---

## 1. Layout & page

```
app/layout.tsx     Root: Inter Display font, globals.css, <Providers>, <html lang="en">
app/providers.tsx  QueryClientProvider (React Query). (Zustand needs no provider.)
app/page.tsx       Server component shell → renders <AppShell> (client) with the fixture
                   customers passed as a prop (import getCustomers() at module scope).
```

`<AppShell>` (client) renders:
```
<OfflineBanner/>                         (only when health.webhookConfigured === false)
<header>  Texting Acme Plumbing · [Run batch] button </header>
<main> two panes:
  <CustomerRoster/>   (left; collapses to a top drawer < 768px)
  <ChatThread/>       (right; empty-state when no customer selected)
</main>
<BatchPanel/>         (overlay/drawer; open when batch triggered)
```

---

## 2. State — Zustand store `lib/store/session.ts`

```ts
interface LiveTurn {              // a turn created THIS session (not from the fixture)
  role: "user" | "assistant";
  content: string;
  intent?: string | null;
  agent?: string | null;
  actions?: Array<{ type: string; [k: string]: unknown }> | null;
  pending?: boolean;             // true while awaiting the webhook (shows typing indicator)
  mocked?: boolean;
  error?: boolean;               // true => render as ErrorBubble, not a chat reply
  ts: number;                    // Date.now() for ordering within the live tail
}

interface SessionState {
  activeCustomerId: string | null;
  liveTurns: Record<string, LiveTurn[]>;   // keyed by customerId; appended after fixture history
  setActiveCustomer: (id: string) => void;
  appendTurn: (customerId: string, turn: LiveTurn) => void;
  updateLastPending: (customerId: string, patch: Partial<LiveTurn>) => void; // resolve pending→final
  resetThread: (customerId: string) => void;   // clears liveTurns[customerId] (ED §4.6)
}
```

- The thread view renders `fixtureHistory ++ liveTurns[activeCustomerId]`.
- **Nothing is persisted** (no localStorage in MVP; no DB ever). Refresh = back to pure
  fixture history. `resetThread` clears the live tail for one customer (ED §4.6 "Reset thread").

---

## 3. Data hooks (React Query) — `lib/hooks/`

| Hook | Call | Notes |
|---|---|---|
| `useHealth()` | `GET /api/health` | `staleTime: Infinity`-ish; drives OfflineBanner/mock badge |
| `useSendTurn()` | `POST /api/send` mutation | on mutate → append pending user+assistant turns; on success → `updateLastPending` with the reply (or error flag); never throws (envelope) |
| `useBatchRun()` | `POST /api/batch` mutation | returns `{summary, results}`; drives BatchPanel |

`useSendTurn` flow (optimistic):
```
onSubmit(text):
  appendTurn(cid, {role:"user", content:text, ts})
  appendTurn(cid, {role:"assistant", content:"", pending:true, ts})   // typing indicator
  const res = await fetch("/api/send", {POST, body:{customerId:cid, text}})
  const env = await res.json()  // always valid envelope; fetch won't throw for soft errors
  if (env.ok)
     updateLastPending(cid, {content: env.data.reply ?? "(no reply)", pending:false,
        intent:env.data.intent, agent:env.data.agent, actions:env.data.actions,
        mocked:env.data.mocked})
  else
     updateLastPending(cid, {content: env.error.message, pending:false, error:true})
```
A `reply:null` success (spam) renders the muted "no reply (spam filtered)" line, not an error.

---

## 4. Components

### 4.1 Roster — `components/roster/`
- `CustomerRoster.tsx`: `role="list"`; search box filters by name/phone; renders 30 `CustomerRow`.
- `CustomerRow.tsx`: `role="listitem"`, button; shows **display label** (`customerLabel` →
  name or phone for #23), phone (secondary), and a `last_intent` badge (chip colors per
  `design-system-setup.md`). Selected row has a visible active state + `aria-current`.

### 4.2 Thread — `components/thread/`
- `ChatThread.tsx`: scrollable region, `role="log"`, `aria-live="polite"`, `aria-relevant="additions"`
  so new bubbles are announced. Header: "Texting Acme Plumbing as <label> (<phone>)".
  Renders fixture `history` then `liveTurns`. Empty states (§5).
- `MessageBubble.tsx`: `user` → right-aligned brand bubble; `assistant` → left-aligned grey
  bubble (SMS look). Shows relative `ts` label. `mocked` → muted tag; `error` → delegates to
  `ErrorBubble`. A `null`/empty assistant reply with no error → muted "no reply (spam filtered)".
- `MetaChip.tsx`: under each assistant bubble, `intent · agent` chip (color per intent) + an
  expandable "actions" disclosure listing each `action.type` and key fields (e.g. `price`,
  `slots`). Color-independent (icon + text), keyboard-expandable.
- `Composer.tsx`: react-hook-form + `sendRequestSchema` (client-side mirror: text 1–2000,
  non-empty). Enter submits (Shift+Enter newline). Disabled with a spinner while a send is
  pending. A "Reset thread" button calls `resetThread`.
- `TypingIndicator.tsx`: animated dots while `pending` (expect a **20–50 s** wait — the
  indicator must be comfortable for a long wait, not imply a hang; include an "assistant is
  thinking…" affordance and keep the composer input editable but Send disabled).

### 4.3 Batch — `components/batch/`
- `BatchTrigger.tsx`: the one "Run batch" button (header). Disabled while a run is in flight.
- `BatchPanel.tsx`: overlay/drawer. Progress bar (`sent/total`), summary counters
  (`sent · ok · matched · errored`). On whole-batch failure shows the banner message instead.
- `BatchResultsGrid.tsx`: table, `role="table"`; columns: scenario_id, text (truncated),
  expected intent, **returned intent**, agent, latency (ms → "21.8 s"), match chip, error.
- `BatchResultRow.tsx`: one row; match chip green (pass) / grey (any `*`) / red (fail);
  `mocked` tagged; `error` shows the code. Clicking a row expands the full `reply` + actions.

### 4.4 System — `components/system/`
- `OfflineBanner.tsx`, `ErrorBubble.tsx`, `EmptyState.tsx` (see `graceful-degradation.md` §4).

---

## 5. UX states (every surface)

| State | Behavior |
|---|---|
| Loading | Roster: instant (bundled fixture, no spinner). Send: typing indicator + disabled Send, tolerant of 20–50 s. Batch: progress bar + skeleton rows. |
| Empty | No customer selected → thread shows "Select a customer to start texting." Customer with only a user turn + no reply (spam #24/#25) → render the one user bubble + muted "no reply (spam filtered)". |
| Error | Send failure → in-thread ErrorBubble (non-blocking). Batch row failure → red error chip; batch continues. |
| Offline/mock | OfflineBanner + mocked bubbles clearly tagged. |
| Responsive | Two-pane ≥768px; roster collapses to a top drawer below. Batch panel full-width overlay. |
| Accessibility | `list`/`listitem` roster, `log`+`aria-live=polite` thread, `table` grid; visible focus rings (Blue 500 per tokens); Enter to send; labelled controls; color-independent chips (icon+text). Target WCAG 2.1 AA, verified by axe-core in E2E. |

---

## 6. SMS look-and-feel (notepad line 96)

- Alternating-aligned bubbles (customer right / Acme left), rounded (radius-lg 8px),
  tail-less chat bubbles, timestamps, a phone-style header. Avatars are initials in a circle
  (radius 50%), not images (no remote image deps). The thread reads like texting Acme Plumbing.
- All visuals use design tokens only (`design-system-setup.md`).

---

## 7. `content/copy.ts`

Centralizes all literal UI strings: header text, roster placeholder, empty/error messages,
offline/mock banner text, batch labels, action-disclosure label. Components import from here
(content-driven), so copy changes never touch component logic.

---

## Requirement coverage
- **TH-1** (pick/switch 30 customers) — §4.1, §2.
- **TH-2 / TH-17** (per-customer SMS thread, backfill then live; SMS look) — §4.2, §6, §2.
- **TH-3 / TH-20** (send → reply + intent/agent/actions surfaced) — §3, §4.2 (MetaChip).
- **TH-4** (batch results view) — §4.3.
- **TH-5** (offline/mock + error states in UI) — §4.4, §5, `graceful-degradation.md`.
- **TH-16** (demo: send a few prompts) — §3, §4.2.
- **TH-10** (design tokens only) — §6, `design-system-setup.md`.
