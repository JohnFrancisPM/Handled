import { Loader2, Play } from "lucide-react";
import { copy } from "@/content/copy";

export function BatchTrigger({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 type-body-lg text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-grey-100 disabled:text-grey-400"
    >
      {disabled ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Play size={16} aria-hidden />}
      {disabled ? copy.batch.running : copy.batch.trigger}
    </button>
  );
}
