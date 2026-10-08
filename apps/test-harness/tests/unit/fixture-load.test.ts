import { describe, it, expect } from "vitest";
import { getCustomers, getCustomerById, customerLabel } from "@/lib/fixtures/load";

describe("fixture loaders", () => {
  it("returns all 30 seeded customers", () => {
    expect(getCustomers()).toHaveLength(30);
  });

  it("getCustomerById resolves a known id and returns undefined for a miss", () => {
    const first = getCustomers()[0]!;
    expect(getCustomerById(first.id)?.phone).toBe(first.phone);
    expect(getCustomerById("nope")).toBeUndefined();
  });

  it("customerLabel falls back to phone for the null-name customer (#23)", () => {
    const nullName = getCustomers().find((c) => c.name === null);
    expect(nullName).toBeDefined();
    expect(customerLabel(nullName!)).toBe(nullName!.phone);
  });

  it("every customer has a unique phone (the contract from_phone)", () => {
    const phones = getCustomers().map((c) => c.phone);
    expect(new Set(phones).size).toBe(phones.length);
  });
});
