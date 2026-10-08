// Shared API + domain types for the harness.

export type ApiErrorCode =
  | "validation" // bad client input to OUR route (text length, unknown customer)
  | "not_found" // unknown customerId / scenarioSetId
  | "unauthorized" // webhook rejected our secret (body ok:false, error "unauthorized")
  | "unknown_business" // webhook could not resolve business_id
  | "webhook_unavailable" // unreachable / timeout / non-2xx / malformed / generic webhook ok:false
  | "server"; // truly unexpected internal fault

export interface ApiError {
  code: ApiErrorCode;
  message: string;
}
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export interface Action {
  type: string;
  [k: string]: unknown;
}

/** What we hand the UI after a single send/batch turn. */
export interface TurnResult {
  reply: string | null;
  intent: string | null;
  agent: string | null;
  actions: Action[] | null;
  mocked: boolean; // true when produced by offline-mock
}

export interface BatchResult {
  scenario_id: string;
  text: string;
  expected_intent: string;
  intent: string | null;
  agent: string | null;
  match: boolean; // returned intent ∈ acceptable_intents (or acceptable = ["*"])
  latency_ms: number;
  reply: string | null;
  actions: Action[] | null;
  mocked: boolean;
  error: ApiErrorCode | null; // null on success; set on (b)/(c) outcomes
}

export interface BatchSummary {
  sent: number;
  ok: number;
  matched: number;
  errored: number;
}

export interface BatchRunData {
  runId: string;
  summary: BatchSummary;
  results: BatchResult[];
}

export interface HealthData {
  webhookConfigured: boolean;
  offlineMock: boolean;
}
