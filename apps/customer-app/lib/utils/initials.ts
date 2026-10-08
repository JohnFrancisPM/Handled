/** Derive 1–2 letter initials from a person's name or an email local part. */
export function initials(input: string | null | undefined): string {
  if (!input) return "?";
  const base = input.includes("@") ? input.split("@")[0] ?? input : input;
  const parts = base
    .replace(/[._\-+]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0];
  if (!first) return "?";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? first;
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}
