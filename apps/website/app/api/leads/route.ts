import { NextRequest, NextResponse } from "next/server";
import { leadSchema, MIN_FILL_MS } from "@/lib/validation/lead";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";          // required so the service-role client can run (ED §9)
export const dynamic = "force-dynamic";   // never statically cache the endpoint

// Reject oversized payloads before parsing (defense-in-depth). The form is a
// handful of short fields; a well-formed request is well under 16 KB. Non-POST
// methods are rejected automatically by Next (405) since only POST is exported.
const MAX_BODY_BYTES = 16 * 1024;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = rateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        {
          status: 429,
          headers: rl.retryAfterSec ? { "Retry-After": String(rl.retryAfterSec) } : undefined
        }
      );
    }

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }

    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ ok: false, error: "validation", fields: {} }, { status: 400 });
    }

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
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 }); // no stack leaked
  }
}
