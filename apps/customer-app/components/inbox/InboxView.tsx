"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { apiGet } from "@/lib/http/client";
import { useUiStore } from "@/lib/stores/ui";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { IntentBadge } from "@/components/dashboard/IntentBadge";
import { ThreadView } from "@/components/inbox/ThreadView";
import { formatRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { ConversationListItem } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "escalated", label: "Escalated" },
  { value: "open", label: "Open" },
  { value: "booked", label: "Booked" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" }
];

// Escalated/emergency conversations pinned to the top (Flow D).
function sortPinned(items: ConversationListItem[]): ConversationListItem[] {
  return items.slice().sort((a, b) => {
    const aEsc = a.status === "escalated" ? 0 : 1;
    const bEsc = b.status === "escalated" ? 0 : 1;
    if (aEsc !== bEsc) return aEsc - bEsc;
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export function InboxView({ selectedId }: { selectedId: string | null }) {
  const statusFilter = useUiStore((s) => s.inboxStatusFilter);
  const setStatusFilter = useUiStore((s) => s.setInboxStatusFilter);
  const queryClient = useQueryClient();

  const query = statusFilter ? `?status=${statusFilter}` : "";
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["conversations", statusFilter],
    queryFn: () => apiGet<ConversationListItem[]>(`/api/conversations${query}`)
  });

  // Realtime list updates (no-op in demo — browser client is null).
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const channel = supabase
      .channel("conversations-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () =>
        queryClient.invalidateQueries({ queryKey: ["conversations"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const items = data ? sortPinned(data) : [];

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Master: conversation list */}
      <div
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-lg border border-grey-100 bg-white lg:w-[360px] lg:shrink-0",
          selectedId && "hidden lg:flex"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-grey-100 p-3">
          <span className="type-body-sm font-medium text-grey-500">
            {items.length} {items.length === 1 ? "conversation" : "conversations"}
          </span>
          <label htmlFor="inbox-status" className="sr-only">
            Filter by status
          </label>
          <Select
            id="inbox-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col gap-3 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="p-3">
              <ErrorCard
                message={error instanceof Error ? error.message : "Could not load conversations."}
                onRetry={() => refetch()}
              />
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="p-3">
              <EmptyState
                icon={MessageSquare}
                title="No conversations"
                description="Inbound messages will appear here as customers text in."
              />
            </div>
          )}

          <ul>
            {items.map((c) => {
              const active = c.id === selectedId;
              return (
                <li key={c.id}>
                  <Link
                    href={`/inbox/${c.id}`}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex gap-3 border-b border-grey-50 border-l-2 px-4 py-3 transition-colors duration-[var(--motion-fast)] ease-ds-out",
                      active
                        ? "border-l-brand bg-brand-50"
                        : "border-l-transparent hover:bg-grey-25"
                    )}
                  >
                    <Avatar name={c.customer.name} size="md" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate type-body-lg font-medium text-grey-900">
                          {c.customer.name}
                        </span>
                        <span className="shrink-0 type-body-sm text-grey-400">
                          {formatRelative(c.updated_at)}
                        </span>
                      </div>
                      <span className="truncate type-body-sm text-grey-500">{c.customer.phone}</span>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <IntentBadge intent={c.last_intent} />
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Detail: selected thread */}
      <div
        className={cn(
          "min-w-0 flex-1 overflow-hidden rounded-lg border border-grey-100 bg-white",
          !selectedId && "hidden lg:block"
        )}
      >
        {selectedId ? (
          <>
            <div className="border-b border-grey-100 p-3 lg:hidden">
              <Link href="/inbox" className="type-body-sm text-brand hover:underline">
                ← Back to inbox
              </Link>
            </div>
            <ThreadView id={selectedId} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation on the left to read the full thread and the AI's reasoning."
            />
          </div>
        )}
      </div>
    </div>
  );
}
