"use client";

import { useState } from "react";
import { Info, Wrench } from "lucide-react";
import { IntentBadge } from "@/components/dashboard/IntentBadge";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { ThreadMessage } from "@/lib/types";

/**
 * MessageBubble (dashboard-pages.md component contract):
 * - AI bubble: right-aligned, Blue 50 bg; IntentBadge; info icon opens a popover
 *   with reasoning + citation + tool list (the explainability surface, PRD).
 * - user bubble: left-aligned, Grey 50 bg.
 * a11y: role="article"; popover toggled by a keyboard-accessible button.
 */
export function MessageBubble({ message }: { message: ThreadMessage }) {
  const [showDetail, setShowDetail] = useState(false);
  const isAssistant = message.role === "assistant";
  const hasExplain =
    isAssistant &&
    Boolean(message.reasoning || message.citation || (message.tool_calls?.length ?? 0) > 0);

  return (
    <article
      className={cn("flex w-full flex-col gap-1", isAssistant ? "items-end" : "items-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg border px-4 py-3 md:max-w-[70%]",
          isAssistant ? "border-blue-100 bg-blue-50" : "border-grey-100 bg-grey-50"
        )}
      >
        {isAssistant && (message.intent || hasExplain) && (
          <div className="mb-2 flex items-center justify-between gap-3">
            <IntentBadge intent={message.intent} />
            {hasExplain && (
              <button
                type="button"
                aria-expanded={showDetail}
                aria-label={showDetail ? "Hide AI reasoning" : "Show AI reasoning"}
                onClick={() => setShowDetail((v) => !v)}
                className="flex items-center gap-1 rounded-sm p-1 text-grey-500 hover:bg-white hover:text-brand"
              >
                <Info aria-hidden="true" size={15} />
                <span className="type-body-sm">Why</span>
              </button>
            )}
          </div>
        )}

        <p className="type-body-lg whitespace-pre-wrap text-grey-900">{message.content}</p>

        {hasExplain && showDetail && (
          <div className="mt-3 flex flex-col gap-3 border-t border-blue-100 pt-3">
            {message.reasoning && (
              <div className="flex flex-col gap-1">
                <span className="type-body-sm font-medium text-grey-700">Reasoning</span>
                <span className="type-body-sm text-grey-500">{message.reasoning}</span>
              </div>
            )}
            {message.citation && (
              <div className="flex flex-col gap-1">
                <span className="type-body-sm font-medium text-grey-700">Citation</span>
                <code className="type-body-sm text-grey-500">{message.citation}</code>
              </div>
            )}
            {message.tool_calls && message.tool_calls.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="type-body-sm font-medium text-grey-700">Tools used</span>
                <ul className="flex flex-wrap gap-2">
                  {message.tool_calls.map((t, i) => (
                    <li
                      key={`${t.tool}-${i}`}
                      className="inline-flex items-center gap-1 rounded-sm border border-grey-100 bg-white px-2 py-[2px] type-body-sm text-grey-700"
                    >
                      <Wrench aria-hidden="true" size={12} />
                      {t.tool}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <span className="type-body-sm text-grey-300">
        {isAssistant ? "AI assistant" : "Customer"} · {formatDateTime(message.created_at)}
      </span>
    </article>
  );
}
