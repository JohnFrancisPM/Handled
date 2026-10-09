import type { Customer } from "@/lib/fixtures/types";

/** Keep a leading "+" and digits only; returns null when nothing usable remains. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  const digits = trimmed.replace(/[^0-9]/g, "");
  return digits ? `${plus}${digits}` : null;
}

/**
 * A fresh +1555-XXXXXXX number for an unseen customer. Avoids the seeded
 * +1555123XXXX block (and anything in `taken`) so the agent treats it as first contact.
 */
export function randomPhone(taken: ReadonlySet<string> = new Set()): string {
  for (let i = 0; i < 50; i++) {
    const seven = String(Math.floor(2_000_000 + Math.random() * 7_999_999)); // 7 digits, never 123xxxx
    const phone = `+1555${seven}`;
    if (!taken.has(phone)) return phone;
  }
  // Fallback: timestamp-derived suffix (still 7 digits) — collision here is effectively impossible.
  return `+1555${String(Date.now()).slice(-7)}`;
}

/**
 * Build a session-only "new customer": no fixture row, empty history, so the AI meets
 * them for the first time. The id is prefixed `new-` so the send path knows to pass the
 * identity explicitly (fromPhone/customerName) rather than doing a fixture lookup.
 */
export function makeNewCustomer(opts: {
  name?: string | null;
  phone?: string | null;
  taken?: ReadonlySet<string>;
}): Customer {
  const name = opts.name && opts.name.trim() ? opts.name.trim() : null;
  const phone = normalizePhone(opts.phone) ?? randomPhone(opts.taken);
  return {
    id: `new-${crypto.randomUUID()}`,
    phone,
    name,
    address: null,
    last_intent: null,
    status: "new",
    history: [],
    last_job: null
  };
}

/** True for customers created this session (vs. seeded fixture rows). */
export function isAdHocCustomer(c: { id: string }): boolean {
  return c.id.startsWith("new-");
}
