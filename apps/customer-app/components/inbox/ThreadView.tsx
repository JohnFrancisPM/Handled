"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/http/client";
import { MessageBubble } from "@/components/inbox/MessageBubble";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorCard } from "@/components/ui/ErrorCard";
import type { ConversationThread } from "@/lib/types";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * ThreadView — conversation detail (dashboard-pages.md /inbox/[id]). Messages
 * stream in via Supabase realtime when live; ARIA live announces new messages.
 */
export function ThreadView({ id }: { id: string }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => apiGet<ConversationThread>(`/api/conversations/${id}`)
  });

  // Realtime: new messages for this conversation (no-op in demo — client is null).
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        () => refetch()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetch]);

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [data?.messages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="ml-auto h-24 w-2/3" />
        <Skeleton className="h-16 w-1/2" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <ErrorCard
          message={error instanceof Error ? error.message : "Could not load this conversation."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-grey-100 bg-white px-4 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={data.customer.name} size="lg" />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate type-h5 text-grey-900">{data.customer.name}</span>
            <span className="truncate type-body-sm text-grey-500">
              {data.customer.phone}
              {data.customer.address ? ` · ${data.customer.address}` : ""}
            </span>
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div
        className="flex flex-1 flex-col gap-4 overflow-y-auto bg-grey-25 p-4 md:p-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        {data.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
