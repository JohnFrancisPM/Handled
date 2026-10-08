import { MetaChip } from "@/components/thread/MetaChip";
import { ErrorBubble } from "@/components/system/ErrorBubble";
import { TypingIndicator } from "@/components/thread/TypingIndicator";
import { copy } from "@/content/copy";
import { cn } from "@/lib/utils/cn";
import type { Action } from "@/lib/types";

export interface BubbleTurn {
  role: "user" | "assistant";
  content: string;
  intent?: string | null;
  agent?: string | null;
  actions?: Action[] | null;
  mocked?: boolean;
  pending?: boolean;
  error?: boolean;
  ts?: string; // relative label for fixture turns
}

export function MessageBubble({ turn }: { turn: BubbleTurn }) {
  if (turn.pending) return <TypingIndicator />;
  if (turn.error) return <ErrorBubble message={turn.content} />;

  const isUser = turn.role === "user";
  const isEmptyAssistant = !isUser && turn.content.trim() === "";

  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      {isEmptyAssistant ? (
        <div className="rounded-lg border border-grey-100 bg-white px-3 py-2 type-body-sm italic text-grey-400">
          {copy.thread.spamNoReply}
        </div>
      ) : (
        <div
          className={cn(
            "max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 type-body-lg",
            isUser
              ? "bg-brand text-white"
              : cn("border bg-white text-grey-900", turn.mocked ? "border-grey-200" : "border-grey-100")
          )}
        >
          {turn.content}
        </div>
      )}

      {!isUser && !isEmptyAssistant && (
        <MetaChip intent={turn.intent} agent={turn.agent} actions={turn.actions} mocked={turn.mocked} />
      )}

      {turn.ts ? <span className="type-body-sm text-grey-400">{turn.ts}</span> : null}
    </div>
  );
}
