"use client";

import { useMutation } from "@tanstack/react-query";
import { useSessionStore } from "@/lib/store/session";
import type { ApiResult, TurnResult } from "@/lib/types";

/**
 * Optimistic send: append a user bubble + a pending assistant placeholder, POST /api/send,
 * then resolve the placeholder with the reply (or an error flag). Never throws — /api/send
 * always returns a valid envelope (soft failures are HTTP 200).
 */
export function useSendTurn() {
  const appendTurn = useSessionStore((s) => s.appendTurn);
  const updateLastPending = useSessionStore((s) => s.updateLastPending);

  return useMutation({
    mutationFn: async ({
      customerId,
      text,
      fromPhone,
      customerName
    }: {
      customerId: string;
      text: string;
      fromPhone?: string; // set only for ad-hoc "new customers" (no fixture row)
      customerName?: string;
    }) => {
      const now = Date.now();
      appendTurn(customerId, { role: "user", content: text, ts: now });
      appendTurn(customerId, { role: "assistant", content: "", pending: true, ts: now + 1 });

      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          text,
          ...(fromPhone ? { fromPhone } : {}),
          ...(customerName ? { customerName } : {})
        })
      });
      const env = (await res.json()) as ApiResult<TurnResult>;

      if (env.ok) {
        updateLastPending(customerId, {
          content: env.data.reply ?? "", // empty => bubble renders the muted spam line
          pending: false,
          intent: env.data.intent,
          agent: env.data.agent,
          actions: env.data.actions,
          mocked: env.data.mocked
        });
      } else {
        updateLastPending(customerId, { content: env.error.message, pending: false, error: true });
      }
      return env;
    }
  });
}
