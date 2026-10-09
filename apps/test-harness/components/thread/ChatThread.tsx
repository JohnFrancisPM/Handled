"use client";

import { useEffect, useRef } from "react";
import { MessageBubble, type BubbleTurn } from "@/components/thread/MessageBubble";
import { Composer } from "@/components/thread/Composer";
import { EmptyState } from "@/components/system/EmptyState";
import { Chip } from "@/components/system/Chip";
import { copy } from "@/content/copy";
import { customerLabel } from "@/lib/fixtures/load";
import type { Customer } from "@/lib/fixtures/types";
import { isAdHocCustomer } from "@/lib/session/newCustomer";
import { useSendTurn } from "@/lib/hooks/useSendTurn";
import { useSessionStore } from "@/lib/store/session";
import { initials } from "@/lib/utils/format";

export function ChatThread({ customer }: { customer: Customer | null }) {
  const liveTurns = useSessionStore((s) => (customer ? s.liveTurns[customer.id] ?? [] : []));
  const resetThread = useSessionStore((s) => s.resetThread);
  const { mutate: send, isPending } = useSendTurn();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [liveTurns, customer?.id]);

  if (!customer) {
    return (
      <section className="flex min-h-0 flex-1 flex-col bg-grey-25">
        <EmptyState title={copy.thread.emptyTitle} body={copy.thread.emptyBody} />
      </section>
    );
  }

  const label = customerLabel(customer);
  const adHoc = isAdHocCustomer(customer);
  const fixtureTurns: BubbleTurn[] = customer.history.map((h) => ({ ...h }));
  const live: BubbleTurn[] = liveTurns.map((t) => ({
    role: t.role,
    content: t.content,
    intent: t.intent,
    agent: t.agent,
    actions: t.actions,
    mocked: t.mocked,
    pending: t.pending,
    error: t.error
  }));

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-grey-25">
      <header className="flex items-center gap-3 border-b border-grey-100 bg-white px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 type-body-sm font-medium text-blue-700">
          {initials(label)}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate type-body-lg text-grey-900">{copy.smsHeader}</span>
          <span className="truncate type-body-sm text-grey-500">
            as {label} ({customer.phone})
          </span>
        </div>
        {adHoc ? <Chip color="grey">{copy.newCustomer.badge}</Chip> : null}
      </header>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={copy.thread.headerAs(label, customer.phone)}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        {fixtureTurns.length === 0 && live.length === 0 ? (
          <p className="type-body-sm text-grey-400">No prior messages. Send the first text below.</p>
        ) : null}
        {fixtureTurns.map((t, i) => (
          <MessageBubble key={`fx-${i}`} turn={t} />
        ))}
        {live.map((t, i) => (
          <MessageBubble key={`lv-${i}`} turn={t} />
        ))}
      </div>

      <Composer
        pending={isPending}
        onSend={(text) =>
          send({
            customerId: customer.id,
            text,
            // Ad-hoc customers have no fixture row, so pass their identity explicitly.
            ...(adHoc ? { fromPhone: customer.phone, customerName: customer.name ?? undefined } : {})
          })
        }
        onReset={() => resetThread(customer.id)}
      />
    </section>
  );
}
