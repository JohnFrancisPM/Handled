"use client";

import { useState } from "react";
import Image from "next/image";
import { UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/http/client";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Toast } from "@/components/ui/Toast";
import { humanize, formatRelative } from "@/lib/utils/format";
import type { LeadListItem, LeadStatus } from "@/lib/types";

const REASON_TONE: Record<string, BadgeTone> = {
  unknown_price: "violet",
  out_of_area: "orange",
  recurring_plan: "brand",
  unknown_warranty: "yellow",
  callback: "brand",
  photo_followup: "violet",
  other: "grey"
};

const STATUS_OPTIONS: LeadStatus[] = ["open", "contacted", "converted", "dismissed"];

export function LeadsQueue() {
  const [statusFilter, setStatusFilter] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const query = statusFilter ? `?status=${statusFilter}` : "";
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["leads", statusFilter],
    queryFn: () => apiGet<LeadListItem[]>(`/api/leads${query}`)
  });

  const mutate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      apiPatch<{ ok: true }>(`/api/leads/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["leads", statusFilter] });
      const prev = queryClient.getQueryData<LeadListItem[]>(["leads", statusFilter]);
      queryClient.setQueryData<LeadListItem[]>(["leads", statusFilter], (old) =>
        (old ?? []).map((l) => (l.id === id ? { ...l, status } : l))
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(["leads", statusFilter], context.prev);
    },
    onSuccess: () => setSavedAt(Date.now())
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="lead-status" className="type-body-sm text-grey-500">
            Status
          </label>
          <Select
            id="lead-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </Select>
        </div>
        {savedAt && (
          <Toast tone="success" key={savedAt}>
            Saved
          </Toast>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <ErrorCard
          message={error instanceof Error ? error.message : "Could not load leads."}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <EmptyState
          icon={UserPlus}
          title="No leads to follow up"
          description="When the AI can't close a request, it captures a lead here for you to work."
        />
      )}

      <ul className="flex flex-col gap-3">
        {data?.map((lead) => (
          <li key={lead.id}>
            <Card className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                {lead.reason === "photo_followup" && lead.media_url && (
                  <a
                    href={lead.media_url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 overflow-hidden rounded-md border border-grey-100"
                    aria-label="Open customer photo"
                  >
                    <Image
                      src={lead.media_url}
                      alt="Customer-submitted photo"
                      width={64}
                      height={64}
                      className="h-16 w-16 object-cover"
                      unoptimized
                    />
                  </a>
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="type-body-lg text-grey-900">{lead.customer}</span>
                    <Badge tone={REASON_TONE[lead.reason] ?? "grey"}>{humanize(lead.reason)}</Badge>
                    <span className="type-body-sm text-grey-300">
                      {formatRelative(lead.created_at)}
                    </span>
                  </div>
                  {lead.requested_service && (
                    <span className="type-body-sm text-grey-700">{lead.requested_service}</span>
                  )}
                  {lead.detail && (
                    <span className="type-body-sm text-grey-500">{lead.detail}</span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <label htmlFor={`lead-${lead.id}`} className="sr-only">
                  Update lead status
                </label>
                <Select
                  id={`lead-${lead.id}`}
                  value={lead.status}
                  onChange={(e) =>
                    mutate.mutate({ id: lead.id, status: e.target.value as LeadStatus })
                  }
                  className="w-40"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {humanize(s)}
                    </option>
                  ))}
                </Select>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
