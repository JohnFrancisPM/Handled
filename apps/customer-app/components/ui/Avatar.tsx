import { cn } from "@/lib/utils/cn";
import { initials as toInitials } from "@/lib/utils/initials";

export type AvatarTone = "brand" | "grey" | "green" | "violet" | "orange";

// Semantic-tint circle (design.md: avatars are full circles; Badge tint recipe
// bg-{tone}-50 / text-{tone}-700). Tone is derived from the name so the same
// person is always the same colour, giving scannable but restrained variety.
const TONES: Record<AvatarTone, string> = {
  brand: "bg-brand-50 text-brand-700",
  grey: "bg-grey-100 text-grey-700",
  green: "bg-green-50 text-green-700",
  violet: "bg-violet-50 text-violet-700",
  orange: "bg-orange-50 text-orange-700"
};

const ORDER: AvatarTone[] = ["brand", "violet", "green", "orange", "grey"];

const SIZES = {
  sm: "h-8 w-8 type-body-sm font-medium",
  md: "h-10 w-10 type-body-lg font-medium",
  lg: "h-12 w-12 type-body-lg font-medium"
} as const;

function toneFor(name: string): AvatarTone {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return ORDER[hash % ORDER.length] ?? "grey";
}

export function Avatar({
  name,
  tone,
  size = "md",
  className
}: {
  name: string;
  tone?: AvatarTone;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const resolved = tone ?? toneFor(name);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full leading-none",
        SIZES[size],
        TONES[resolved],
        className
      )}
    >
      {toInitials(name)}
    </span>
  );
}
