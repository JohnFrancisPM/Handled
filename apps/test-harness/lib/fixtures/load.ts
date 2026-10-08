import customersJson from "@/fixtures/customers.json";
import scenariosJson from "@/fixtures/scenarios.json";
import type { CustomersFixture, Customer, ScenariosFixture, Scenario } from "@/lib/fixtures/types";

// Synchronous bundled imports — the roster renders with no backend call, and the
// Route Handlers resolve from_phone/name server-side from the same data (no DB).
const customersFixture = customersJson as CustomersFixture;
const scenariosFixture = scenariosJson as ScenariosFixture;

export function getCustomers(): Customer[] {
  return customersFixture.customers;
}

export function getCustomerById(id: string): Customer | undefined {
  return customersFixture.customers.find((c) => c.id === id);
}

/** Display label: name when present, else the phone (handles #23 null name). */
export function customerLabel(c: Customer): string {
  return c.name ?? c.phone;
}

export function getScenarios(): Scenario[] {
  return scenariosFixture.scenarios;
}
