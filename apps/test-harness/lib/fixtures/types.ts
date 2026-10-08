// Fixture types — mirror the committed fixtures/*.json (fixture-extraction.md §2.1,
// scenario-set.md §1.1). These are plain data, loadable in both server and browser.

export interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
  intent: string | null;
  agent: string | null;
  actions: Array<{ type: string; [k: string]: unknown }> | null;
  ts: string; // relative label, e.g. "t+0s"
}

export interface LastJob {
  service: string;
  price: number | null;
  status: string; // closed_won | booked | cancelled
  scheduled_rel: string; // e.g. "6 days ago" | "in 3 days"
}

export interface Customer {
  id: string;
  phone: string;
  name: string | null;
  address: string | null;
  last_intent: string | null;
  status: string | null;
  history: HistoryTurn[];
  last_job: LastJob | null;
}

export interface CustomersFixture {
  generated_from: string[];
  generated_at: string;
  business_id_note: string;
  customer_count: number;
  customers: Customer[];
}

export interface Scenario {
  scenario_id: string;
  customer_id: string;
  text: string;
  expected_intent: string; // "*" means any
  acceptable_intents: string[]; // [] or ["*"] => always pass
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "n/a";
}

export interface ScenariosFixture {
  generated_note: string;
  scenario_count: number;
  scenarios: Scenario[];
}
