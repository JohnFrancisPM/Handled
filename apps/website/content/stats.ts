export type Stat = { value: string; label: string; source: string };

// Numbers from PRD §1 — do not alter.
export const missedCallStats: Stat[] = [
  { value: "27%", label: "of inbound calls to home-service businesses go unanswered", source: "Invoca, 2026" },
  { value: "52%", label: "of calls are answered by a live person", source: "Invoca, 2026" },
  { value: "62%", label: "of callers who don't get through immediately call a competitor", source: "Missed-call benchmarks, 2026" },
  { value: "85%", label: "of those callers never call back", source: "Missed-call benchmarks, 2026" },
  { value: "~$1,200", label: "average value of a single missed home-services call", source: "Invoca, 2026" }
];
