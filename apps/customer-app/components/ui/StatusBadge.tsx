import { Badge, type BadgeTone } from "@/components/ui/Badge";

/**
 * StatusBadge — maps a domain status string to a semantic tone and renders a
 * Badge. The mapping is intentionally broad (appointments, leads, conversations)
 * so Stage 4 surfaces can reuse it. Unknown statuses fall back to grey.
 */
const STATUS_TONE: Record<string, BadgeTone> = {
  // appointments
  requested: "yellow",
  booked: "brand",
  completed: "green",
  closed_won: "green",
  cancelled: "grey",
  no_show: "red",
  // leads
  open: "yellow",
  contacted: "brand",
  converted: "green",
  dismissed: "grey",
  // conversations
  active: "brand",
  escalated: "red",
  emergency: "red",
  resolved: "green",
  spam: "grey"
};

function humanize(status: string): string {
  return status.replace(/_/g, " ");
}

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "grey";
  return <Badge tone={tone}>{humanize(status)}</Badge>;
}
