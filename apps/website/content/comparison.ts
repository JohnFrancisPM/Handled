export type ComparisonRow = { capability: string; handled: boolean | string; receptionist: boolean | string };

export const capabilityComparison: ComparisonRow[] = [
  { capability: "Answers every call 24/7", handled: true, receptionist: true },
  { capability: "Natural conversation, no phone tree", handled: true, receptionist: true },
  { capability: "Books into your FSM (Jobber / Housecall Pro / ServiceTitan)", handled: true, receptionist: "Calendar event only" },
  { capability: "Respects tech skills, availability & service area", handled: true, receptionist: false },
  { capability: "Address / service-area validation", handled: true, receptionist: false },
  { capability: "Trade-aware emergency triage & escalation", handled: true, receptionist: false },
  { capability: "Missed-call text-back", handled: true, receptionist: "Sometimes" },
  { capability: "Quote follow-up, reminders, review requests", handled: "Office-manager scope", receptionist: false },
  { capability: "Flat pricing, no charge for spam/hangups", handled: true, receptionist: "Surprise overage" },
  { capability: "Transcripts, summaries & owner notify", handled: true, receptionist: true }
];

export type PriceCompareRow = {
  product: string;
  price: string;
  booksIntoFsm: boolean;
  officeManagerScope: boolean;
  emergencyTriage: boolean;
  transparentPricing: boolean;
  highlight?: boolean;        // true for Handled's row
};

export const pricingComparison: PriceCompareRow[] = [
  { product: "Handled Pro", price: "$299/mo", booksIntoFsm: true, officeManagerScope: true, emergencyTriage: true, transparentPricing: true, highlight: true },
  { product: "reception.ai Premium (ElevenLabs)", price: "$199/mo", booksIntoFsm: false, officeManagerScope: false, emergencyTriage: false, transparentPricing: false },
  { product: "Smith.ai Starter", price: "$300/mo", booksIntoFsm: false, officeManagerScope: false, emergencyTriage: false, transparentPricing: false },
  { product: "A full-time office manager", price: "$42K–$62K/yr", booksIntoFsm: true, officeManagerScope: true, emergencyTriage: true, transparentPricing: true }
];

export const pricingComparisonNote =
  "Handled is priced at the same level as a premium AI receptionist — while booking real jobs into your dispatch, handling office-manager work, and triaging emergencies. And it costs a fraction of a $42–62K/yr human office manager.";
