# Spec: Lead Capture (Contact / Book a demo)

**App:** `apps/website`
**Implements:** R20, R21, R22, R23, R24, R26, R32, R40
**Depends on:** `project-setup.md`, `design-system-setup.md`, `components.md`, `content-modules.md`, `supabase-schema.sql`, `.env.example`
**Routes/files:** `app/contact/page.tsx`, `components/form/DemoForm.tsx` (+ `Field`, `Select`, `FormSuccess`), `app/api/leads/route.ts`, `lib/validation/lead.ts`, `lib/supabase/server.ts`, `lib/rate-limit.ts`

The only dynamic feature. The form POSTs to a Node Route Handler that re-validates with the **same Zod schema**, rate-limits, rejects honeypots, and (if configured) inserts a `leads` row — otherwise it **gracefully no-ops** so the recorded demo never fails (ED §6, App.A.2).

---

## 1. Shared Zod schema — `lib/validation/lead.ts` (R23)

Single source of truth, imported by both the client form and the server handler.

```ts
import { z } from "zod";

export const TRADES = [
  "Plumbing", "HVAC", "Electrical", "Roofing",
  "Landscaping", "Cleaning", "Pest control", "Garage doors", "Other"
] as const;

export const PLAN_INTEREST = ["starter", "pro", "scale"] as const;

export const leadSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(200, "Name is too long"),
  businessName: z.string().trim().min(1, "Please enter your business name").max(200, "Business name is too long"),
  email: z.string().trim().email("Enter a valid email address").max(320),
  phone: z.string().trim().max(40, "Phone is too long").optional().or(z.literal("")),
  trade: z.enum(TRADES).optional().or(z.literal("")),
  weeklyCalls: z.coerce.number().int().min(0).max(100000).optional(),
  planInterest: z.enum(PLAN_INTEREST).optional().or(z.literal("")),
  message: z.string().trim().max(2000, "Message is too long").optional().or(z.literal("")),
  sourcePath: z.string().max(500).optional(),
  // Anti-spam (not stored):
  company: z.string().max(0, "").optional().or(z.literal("")),   // HONEYPOT — must be empty (R24)
  formLoadedAt: z.coerce.number().optional()                      // epoch ms, for min-fill-time (R24)
});

export type LeadInput = z.infer<typeof leadSchema>;

// Server-side refinement for min-fill-time (bots submit instantly).
export const MIN_FILL_MS = 2000;
```

Notes:
- `weeklyCalls` uses `z.coerce.number()` so the string from the `<input type="number">` coerces cleanly; empty → undefined (handle `""`→`undefined` before parse in the form).
- Honeypot `company` must be empty; any content → validation error (treated as spam).
- `formLoadedAt` enables the min-fill-time check server-side (compare `Date.now() - formLoadedAt >= MIN_FILL_MS`).
- The enum `.or(z.literal(""))` tolerates the "no selection" option from a `<select>`; the handler normalizes `""`→`null` before insert.

---

## 2. Supabase server client — `lib/supabase/server.ts` (R22)

Server-only. Returns `null` when env is absent so the handler can no-op.

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;                       // graceful-degradation guard (R22)
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
```

- **Never** import this into a Client Component. The service-role key is server-only (`.env.example` marks it SERVER ONLY).
- No `NEXT_PUBLIC_` Supabase vars exist — the browser never talks to Supabase (ED §6).

---

## 3. Rate limiter — `lib/rate-limit.ts` (R24)

Lightweight per-instance in-memory IP token bucket: **5 submissions / 10 minutes / IP**.

```ts
type Bucket = { count: number; resetAt: number };
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const store = new Map<string, Bucket>();

export function rateLimit(ip: string): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const b = store.get(ip);
  if (!b || now > b.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (b.count >= LIMIT) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}
```

- In-memory is sufficient and demo-safe for MVP (ED §6 notes Upstash Redis is a later pluggable upgrade).
- IP derived from `x-forwarded-for` (first hop) with a fallback constant for local dev.

---

## 4. Route Handler — `app/api/leads/route.ts` (R22, R24, R32)

```ts
import { NextRequest, NextResponse } from "next/server";
import { leadSchema, MIN_FILL_MS } from "@/lib/validation/lead";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";          // required so the service-role client can run (ED §9)
export const dynamic = "force-dynamic";   // never statically cache the endpoint

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()) || "local";
    const rl = rateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429,
        headers: rl.retryAfterSec ? { "Retry-After": String(rl.retryAfterSec) } : undefined });
    }

    const json = await req.json().catch(() => null);
    if (!json) return NextResponse.json({ ok: false, error: "validation", fields: {} }, { status: 400 });

    const parsed = leadSchema.safeParse(json);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fields[key]) fields[key] = issue.message;
      }
      return NextResponse.json({ ok: false, error: "validation", fields }, { status: 400 });
    }
    const data = parsed.data;

    // Honeypot (R24): any value in `company` → reject as validation (do not store)
    if (data.company && data.company.length > 0) {
      return NextResponse.json({ ok: false, error: "validation", fields: {} }, { status: 400 });
    }
    // Min-fill-time (R24): submitted too fast → reject
    if (data.formLoadedAt && Date.now() - data.formLoadedAt < MIN_FILL_MS) {
      return NextResponse.json({ ok: false, error: "validation", fields: {} }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      // Graceful no-op (R22) — demo-safe when env absent
      console.info("[leads] Supabase env absent; skipping insert (stored:false)");
      return NextResponse.json({ ok: true, stored: false }, { status: 200 });
    }

    const normalize = (v: unknown) => (v === "" || v === undefined ? null : v);
    const { error } = await supabase.from("leads").insert({
      name: data.name,
      business_name: data.businessName,
      email: data.email,
      phone: normalize(data.phone),
      trade: normalize(data.trade),
      weekly_calls: data.weeklyCalls ?? null,
      plan_interest: normalize(data.planInterest),
      message: normalize(data.message),
      source_path: normalize(data.sourcePath),
      user_agent: req.headers.get("user-agent") ?? null
    });

    if (error) {
      // Insert failed: still succeed to the user (demo-safe), log server-side only (R22)
      console.error("[leads] insert failed:", error.message);
      return NextResponse.json({ ok: true, stored: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true, stored: true }, { status: 200 });
  } catch (err) {
    console.error("[leads] unexpected error:", err);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });   // no stack leaked
  }
}
```

### Response contract (R32) — matches ED §9 exactly
| Status | Body | When |
|---|---|---|
| 200 | `{ ok: true, stored: boolean }` | Accepted; `stored` = whether env present AND insert succeeded |
| 400 | `{ ok: false, error: "validation", fields: Record<string,string> }` | Zod failure, honeypot tripped, or min-fill-time |
| 429 | `{ ok: false, error: "rate_limited" }` | IP exceeded 5/10min |
| 500 | `{ ok: false, error: "server" }` | Unexpected error (stack never leaked) |

---

## 5. Form components

### 5.1 `Field` (`components/form/Field.tsx`) — client-safe presentational
Props:
```ts
type FieldProps = {
  id: string; label: string; required?: boolean;
  error?: string; hint?: string;
  children: React.ReactNode;      // the input/select element
};
```
- Renders `<label htmlFor={id}>` (+ "*" when required), the control, an optional hint, and an error `<p id={`${id}-error`}>` when `error` set.
- The control must receive `aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}` and `aria-invalid={!!error}` (R30).
- Error styling uses design state tokens (red-50 bg on input, red-500 border, red-700 text).

### 5.2 `Select` (`components/form/Select.tsx`)
- Token-styled `<select>` with a leading empty option ("Select…"). Used for Trade (from `TRADES`) and Plan interest (`starter`/`pro`/`scale`).

### 5.3 `FormSuccess` (`components/form/FormSuccess.tsx`)
- Success panel (green-50 bg, green-500 border, green-700 text per design state table): checkmark icon + heading "Thanks — we'll reach out within 1 business day." + a line to explore `/features` or return home.

### 5.4 `DemoForm` (`components/form/DemoForm.tsx`) — Client Component (`"use client"`) (R20, R21, R24)
State (local `useState` only — no global store, ED §5):
- `values` for all fields; `errors: Record<string,string>`; `status: "idle" | "submitting" | "success" | "error"`; `formLoadedAt` captured once on mount (`useRef(Date.now())`).

Fields (map to schema):
| Field | Control | Required | Notes |
|---|---|---|---|
| name | text | yes | |
| businessName | text | yes | |
| email | email | yes | |
| phone | tel | no | |
| trade | select (TRADES) | no | R40 — options from `TRADES` |
| weeklyCalls | number (min 0) | no | |
| planInterest | select (PLAN_INTEREST) | no | **prefilled from `?plan=` (R21)** |
| message | textarea | no | maxLength 2000 |
| company | text, **honeypot** | no | visually hidden (`aria-hidden`, `tabIndex=-1`, off-screen), must stay empty (R24) |

Prefill (R21):
- Read `useSearchParams().get("plan")`; if it's one of `PLAN_INTEREST`, set `values.planInterest` initial state to it. Wrap the component (or its `useSearchParams` usage) in a `<Suspense>` boundary on the contact page since `useSearchParams` requires it.

Behavior:
1. Client-side validate on submit with `leadSchema.safeParse` (strip `""` from optional numerics → undefined). Show inline field errors; focus the first errored field.
2. If valid: set `status="submitting"` (disable submit button + show spinner), POST JSON to `/api/leads` including `sourcePath: window.location.pathname` and `formLoadedAt: formLoadedAtRef.current`.
3. On `200`: set `status="success"` → render `<FormSuccess />` in place of the form.
4. On `400`: merge `fields` into `errors`, set `status="idle"`.
5. On `429`: top-level banner "You've submitted a few times — please wait a minute and try again."
6. On `500`/network error: top-level retry banner (red state) "Something went wrong. Please try again." keep entered values; `status="error"`.
- Submit button disabled while `submitting`; transitions ≤150ms ease-out (design.md motion).
- Honeypot field rendered but hidden from users and screen readers.

---

## 6. Contact page — `app/contact/page.tsx` (R20, R26)
- Server Component shell: `Hero as="h1"` ("Book a demo", subheading "See Handled answer and book a real job. Tell us about your shop and we'll reach out within 1 business day.").
- Two-column on desktop (form left, reassurance/trust bullets right e.g. "Live in minutes", "No charge for spam", "Books into your FSM"); single column mobile.
- Render `<Suspense fallback={<FormSkeleton/>}><DemoForm/></Suspense>` (Suspense needed for `useSearchParams`).
- **Consent line + privacy link (R26):** directly under the submit button — "By submitting you agree to be contacted about Handled. See our [Privacy Policy](/privacy)."
- Metadata (seo.md): title "Book a demo — Handled", description "Book a 15-minute demo. See Handled answer a call and book a real job into your field-service system." `noindex: false`.

---

## 7. Acceptance criteria
- Client and server validate with the **same** `leadSchema` (R23).
- Submitting a valid form with Supabase env set inserts one `leads` row and returns `{ ok:true, stored:true }`.
- **With Supabase env absent, a valid submit returns `{ ok:true, stored:false }` and the UI shows the success panel** (R22 — demo stability; covered by integration test in `testing.md`).
- Honeypot content → 400 without storing; min-fill-time violation → 400 (R24).
- 6th submit from one IP within 10 min → 429 (R24).
- `?plan=pro` prefills the plan-interest select (R21).
- Consent line + `/privacy` link present under the submit (R26).
- Trade dropdown options equal `TRADES` (R40).
- 500 path never leaks a stack trace (R32); all failures logged server-side only.
- Field errors are announced to screen readers via `aria-describedby`/`aria-invalid` (R30).
