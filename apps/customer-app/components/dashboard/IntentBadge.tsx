import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { humanize } from "@/lib/utils/format";

/**
 * IntentBadge — the router's classification for a conversation/message
 * (dashboard-pages.md). Color = signal: emergencies/injection red, spam grey,
 * out-of-scope orange, pricing violet, booking brand.
 */
const INTENT_TONE: Record<string, BadgeTone> = {
  book: "brand",
  booking: "brand",
  new_booking: "brand",
  status_inquiry: "brand",
  reschedule: "yellow",
  cancel: "grey",
  pricing: "violet",
  emergency: "red",
  injection_attempt: "red",
  out_of_area: "orange",
  service_not_offered: "orange",
  spam: "grey"
};

export function IntentBadge({ intent }: { intent: string | null | undefined }) {
  if (!intent) return null;
  const tone = INTENT_TONE[intent] ?? "grey";
  return <Badge tone={tone}>{humanize(intent)}</Badge>;
}
