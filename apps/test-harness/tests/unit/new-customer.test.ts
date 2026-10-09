import { describe, it, expect } from "vitest";
import { makeNewCustomer, normalizePhone, randomPhone, isAdHocCustomer } from "@/lib/session/newCustomer";

describe("normalizePhone", () => {
  it("keeps a leading + and digits, strips the rest", () => {
    expect(normalizePhone("+1 (555) 999-0001")).toBe("+15559990001");
    expect(normalizePhone("5559990001")).toBe("5559990001");
  });
  it("returns null for empty / digitless input", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("   ")).toBeNull();
    expect(normalizePhone("abc")).toBeNull();
    expect(normalizePhone(null)).toBeNull();
  });
});

describe("randomPhone", () => {
  it("produces a +1555 number outside the seeded 123xxxx block", () => {
    const p = randomPhone();
    expect(p).toMatch(/^\+1555\d{7}$/);
    expect(p.startsWith("+1555123")).toBe(false);
  });
  it("avoids phones already taken", () => {
    const first = randomPhone();
    const second = randomPhone(new Set([first]));
    expect(second).not.toBe(first);
  });
});

describe("makeNewCustomer", () => {
  it("builds an ad-hoc customer with a new- id, empty history and no name when blank", () => {
    const c = makeNewCustomer({ name: "  ", phone: "" });
    expect(isAdHocCustomer(c)).toBe(true);
    expect(c.name).toBeNull();
    expect(c.history).toEqual([]);
    expect(c.last_job).toBeNull();
    expect(c.phone).toMatch(/^\+1555\d{7}$/);
  });
  it("normalizes a supplied phone and trims the name", () => {
    const c = makeNewCustomer({ name: "  Dana New  ", phone: "+1 555 999 0001" });
    expect(c.name).toBe("Dana New");
    expect(c.phone).toBe("+15559990001");
  });
});

describe("isAdHocCustomer", () => {
  it("distinguishes session customers from seeded fixture rows", () => {
    expect(isAdHocCustomer({ id: "new-abc" })).toBe(true);
    expect(isAdHocCustomer({ id: "c0000000-0000-0000-0000-000000000001" })).toBe(false);
  });
});
