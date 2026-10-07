import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

// WINDOW_MS / LIMIT are internal to lib/rate-limit.ts (10 min / 5 calls).
const WINDOW_MS = 10 * 60 * 1000;

describe("rateLimit (R24)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows 5 calls per IP then blocks the 6th with retryAfterSec", () => {
    const ip = "10.0.0.1";
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(ip).ok).toBe(true);
    }
    const blocked = rateLimit(ip);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(WINDOW_MS / 1000);
  });

  it("tracks distinct IPs independently", () => {
    const a = "10.0.0.2";
    const b = "10.0.0.3";
    for (let i = 0; i < 5; i++) rateLimit(a);
    expect(rateLimit(a).ok).toBe(false); // a is exhausted
    expect(rateLimit(b).ok).toBe(true); // b is untouched
  });

  it("resets the bucket after the window elapses", () => {
    const ip = "10.0.0.4";
    for (let i = 0; i < 5; i++) rateLimit(ip);
    expect(rateLimit(ip).ok).toBe(false);

    vi.advanceTimersByTime(WINDOW_MS + 1);
    expect(rateLimit(ip).ok).toBe(true);
  });
});
