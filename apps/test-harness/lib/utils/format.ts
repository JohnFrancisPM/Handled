/** Avatar initials from a display label; phone-only labels (#23) show "#". */
export function initials(label: string): string {
  if (/^\+?\d/.test(label.trim())) return "#";
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** Latency in ms → "21.8 s" / "640 ms" / "—". */
export function formatLatency(ms: number): string {
  if (!ms || ms <= 0) return "—";
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}
