import { getContext } from "@/lib/data/context";
import { computeConversion } from "@/lib/analytics/conversion";
import { ConversionQuerySchema } from "@/lib/schemas";
import { ok, fail } from "@/lib/api/envelope";

// GET /api/analytics/conversion — funnel + revenue + North Star. Demo-safe.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await getContext();
  if (!ctx) return fail("unauthorized");

  const rangeParam = new URL(req.url).searchParams.get("range") ?? undefined;
  const parsed = ConversionQuerySchema.safeParse({ range: rangeParam });
  if (!parsed.success) return fail("validation", parsed.error.issues[0]?.message);

  try {
    const data = await computeConversion(ctx, parsed.data.range);
    return ok(data);
  } catch {
    return fail("server");
  }
}
