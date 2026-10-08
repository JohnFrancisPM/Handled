import { copy } from "@/content/copy";

/** Animated dots for the 20–50s wait — comfortable, not implying a hang. */
export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[80%] flex-col gap-1 rounded-lg bg-white border border-grey-100 px-3 py-2">
        <span className="flex items-center gap-1" aria-hidden>
          <Dot delay="0ms" />
          <Dot delay="150ms" />
          <Dot delay="300ms" />
        </span>
        <span className="type-body-sm text-grey-500">{copy.composer.typing}</span>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-2 w-2 animate-pulse rounded-xl bg-grey-300"
      style={{ animationDelay: delay }}
    />
  );
}
