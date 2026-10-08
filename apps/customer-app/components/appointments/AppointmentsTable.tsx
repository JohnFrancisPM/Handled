"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Check } from "lucide-react";
import { apiGet } from "@/lib/http/client";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import type { AppointmentListItem } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "requested", label: "Requested" },
  { value: "booked", label: "Booked" },
  { value: "completed", label: "Completed" },
  { value: "closed_won", label: "Closed won" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No show" }
];

export function AppointmentsTable() {
  const [status, setStatus] = useState("");
  const query = status ? `?status=${status}` : "";

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["appointments", status],
    queryFn: () => apiGet<AppointmentListItem[]>(`/api/appointments${query}`)
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="appt-status" className="type-body-sm text-grey-500">
          Status
        </label>
        <Select
          id="appt-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-48"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <ErrorCard
          message={error instanceof Error ? error.message : "Could not load appointments."}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="No appointments"
          description="Jobs booked by the AI will appear here."
        />
      )}

      {!isLoading && !isError && (data?.length ?? 0) > 0 && (
        <div className="overflow-x-auto rounded-lg border border-grey-100 bg-white">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Appointments</caption>
            <thead>
              <tr className="border-b border-grey-100 bg-grey-25">
                <Th>Service</Th>
                <Th>Technician</Th>
                <Th>Scheduled</Th>
                <Th>Arrival</Th>
                <Th>Status</Th>
                <Th className="text-right">Price</Th>
                <Th className="text-center">Confirmed</Th>
              </tr>
            </thead>
            <tbody>
              {data!.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-grey-50 transition-colors duration-[var(--motion-fast)] ease-ds-out last:border-0 hover:bg-grey-25"
                >
                  <Td className="whitespace-nowrap font-medium text-grey-900">{a.service ?? "—"}</Td>
                  <Td className="whitespace-nowrap">{a.tech ?? "Unassigned"}</Td>
                  <Td className="whitespace-nowrap">{formatDateTime(a.scheduled_at)}</Td>
                  <Td className="whitespace-nowrap">{a.arrival_window ?? "—"}</Td>
                  <Td>
                    <StatusBadge status={a.status} />
                  </Td>
                  <Td className="whitespace-nowrap text-right font-medium tabular-nums text-grey-900">
                    {formatCurrency(a.price)}
                  </Td>
                  <Td className="text-center">
                    {a.confirmed ? (
                      <Check aria-label="Confirmed" className="mx-auto text-green-600" size={16} />
                    ) : (
                      <span className="type-body-sm text-grey-300" aria-label="Not confirmed">
                        —
                      </span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-4 py-3 type-body-sm font-medium text-grey-500 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 type-body-sm text-grey-700 ${className}`}>{children}</td>;
}
