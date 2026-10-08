// Intent / status chip color map (design-system-setup.md §3). Token classes only.
// Chips are ALWAYS paired with label text + an icon, so they never rely on color alone.

export type ChipColor = "green" | "blue" | "violet" | "red" | "yellow" | "grey";

export const INTENT_CHIP: Record<string, ChipColor> = {
  book: "green", // positive conversion
  reschedule: "blue", // neutral/info
  cancel: "grey", // neutral-negative
  pricing: "violet", // accent (info ask)
  emergency: "red", // danger/urgent
  out_of_area: "yellow", // warning (declined)
  faq: "blue", // info
  spam: "grey", // filtered/neutral
  injection: "red", // security
  fallback: "yellow", // degraded/warning
  mock: "grey" // clearly simulated
};

export function intentChipColor(intent: string | null | undefined): ChipColor {
  if (!intent) return "grey";
  return INTENT_CHIP[intent] ?? "grey";
}

// Semantic Status Badge pattern: [color]-50 bg, [color]-200 border, [color]-700 text.
export const CHIP_CLASSES: Record<ChipColor, string> = {
  green: "bg-green-50 border-green-200 text-green-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  violet: "bg-violet-50 border-violet-200 text-violet-700",
  red: "bg-red-50 border-red-200 text-red-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-900",
  grey: "bg-grey-50 border-grey-200 text-grey-700"
};

/** Batch match chip: pass=green, any(*)=grey, fail=red. */
export function matchChipColor(match: boolean, anyAccepted: boolean): ChipColor {
  if (anyAccepted) return "grey";
  return match ? "green" : "red";
}
