# Dashboard Pages & Components

**Sub-system:** Dashboard (`app/(dashboard)/**`, `components/**`)
**Source:** engineering-doc §5, Flows H/I; notepad CE7/CE8/CE9/CE10 (Flow J eval export is builder-side, not a dashboard page — see `eval-pipeline.md`)
**State management:** RSC + Server Actions for reads/writes; TanStack Query for realtime-backed lists + optimistic policy edits; Zustand for ephemeral UI (open panels, filters). No Redux.
**Every data surface handles:** Loading (skeleton, 300ms), Empty, Error (Red 50/500/700 card + retry), Responsive (desktop-first, usable at tablet; inbox collapses to single-column master/detail), Accessibility, Demo-stable (seeded read-only when env missing).

## Layout (`(dashboard)/layout.tsx`, RSC)
Sidebar nav + org header. Nav items: Overview, Inbox, Appointments, Leads, Analytics, Profile (with sub-nav: Identity, Services, Pricing, Areas, Hours, Team, Emergency). Active-state via tokens. Org name + user email in header. Notifications bell (unread count from `/api/notifications`). (No Evals nav item — eval export is a builder-side DB task, not a customer-facing page; see `eval-pipeline.md`.)

## Pages

### `/dashboard` — Overview (notepad CE9)
KPI row: **Captured Opportunity Value** (North Star, prominent), Conversion rate, Revenue (closed-won), Inbound count. Recent escalations + recent bookings lists. Reads `/api/analytics/conversion` + top escalations/notifications.

### `/inbox` + `/inbox/[conversationId]` (notepad CE8, Flow I)
- List (realtime via Supabase subscription on `conversations`/`messages`): customer name/phone, last_intent `IntentBadge`, `StatusBadge`, updated_at. EMERGENCY/escalated conversations pinned to top (Flow D). Filters (status) in Zustand.
- Thread: `MessageBubble` inbound (left) vs AI (right); each AI bubble shows an `IntentBadge` + a reasoning/citation popover (from `messages.reasoning`/`citation`/`tool_calls`) — the explainability surface (PRD). New messages stream in with ARIA live.

### `/appointments` (CE9, EC11)
Table: service, tech, scheduled_at, arrival_window, `StatusBadge` (requested/booked/completed/closed_won/cancelled/no_show), price, confirmed. Filters by status/range. Reads `/api/appointments`.

### `/leads` (Flow E/F; eval Ho-02/Ha-04/H-09/12/18)
Follow-up queue: customer, `reason` badge (unknown_price, out_of_area, recurring_plan, unknown_warranty, callback, photo_followup), requested_service, detail, status. Owner updates status via `PATCH /api/leads/[id]` (optimistic). Photo leads show the `media_url` thumbnail/link.

### `/analytics` (CE9, Flow I)
`FunnelChart` (inbound → booked → closed_won) + `RevenueTable` (price per job) + Captured Opportunity Value headline. Recharts, semantic palette, range selector. Reads `/api/analytics/conversion`.

### `/profile/*` — SELF-SERVICE policy editor (notepad CE10, Flow H)
One `PolicyPanel` per page, optimistic UI + inline Zod validation, toast "Saved". Writes via `PUT /api/profile/[panel]`. Next inbound text uses new config immediately (agents read live config — no cache staleness).
- `/profile` Identity: company identity + `ai_disclosure_text` + spanish toggle + customer types.
- `/profile/services` Services offered + services NOT offered (two lists; `ServiceRow`).
- `/profile/pricing` Per-service pricing (`PricingRow`, min/max/unit/notes).
- `/profile/areas` Serve/deny regions (`AreaChips`).
- `/profile/hours` Business hours + closed dates.
- `/profile/team` Technicians + availability status (`TechRow`; sick/vacation).
- `/profile/emergency` Emergency rules config.

### `(auth)/login`
Supabase Auth email/password (see `auth-and-middleware.md`).

## Shared components (`components/`)
`Sidebar`, `KpiCard`, `ConversationList`, `MessageBubble` (with reasoning/citation popover), `IntentBadge`, `StatusBadge`, `FunnelChart`, `RevenueTable`, `PolicyPanel`, `ServiceRow`, `PricingRow`, `AreaChips`, `TechRow`, `EmergencyRuleRow`, `LeadRow`, `NotificationBell`, `EmptyState`, `ErrorCard`. All styled strictly via design tokens (apply `design-system` skill).

## Component contract pattern (each component spec includes)
props (typed), states (loading/empty/error/populated), interactions, a11y (roles, keyboard), responsive behavior, tokens used. Example — `MessageBubble`:
- props: `{ role:'user'|'assistant', content, intent?, reasoning?, citation?, tool_calls? }`
- AI bubble: right-aligned, Blue 50 bg; `IntentBadge`; info icon opens popover with `reasoning` + `citation` + tool list.
- user bubble: left-aligned, Grey 50 bg.
- a11y: `role="article"`, popover keyboard-accessible.
