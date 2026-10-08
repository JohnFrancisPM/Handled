import { MessageSquare } from "lucide-react";

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-grey-50 text-grey-400">
        <MessageSquare size={22} aria-hidden />
      </span>
      <p className="type-body-lg text-grey-900">{title}</p>
      {body ? <p className="type-body-sm text-grey-500">{body}</p> : null}
    </div>
  );
}
