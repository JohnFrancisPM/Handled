// Lightweight per-instance in-memory IP token bucket: 5 submissions / 10 minutes / IP (R24).
// In-memory is sufficient and demo-safe for MVP (ED §6: Upstash Redis is a later pluggable upgrade).
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
