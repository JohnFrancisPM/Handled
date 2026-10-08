/** Thrown when a request body is too large or not valid JSON. Routes map it to a 422. */
export class BodyError extends Error {}

/**
 * Read + parse a JSON request body with a hard size cap, so a route never buffers an
 * unbounded payload before Zod validation. 16 KB is ample for the harness's tiny bodies
 * ({ customerId, text } where text ≤ 2000 chars). Mirrors the website's leads-route cap.
 */
export async function readJsonCapped(req: Request, maxBytes = 16_384): Promise<unknown> {
  const text = await req.text();
  if (text.length > maxBytes) throw new BodyError("payload too large");
  try {
    return JSON.parse(text);
  } catch {
    throw new BodyError("invalid json");
  }
}
