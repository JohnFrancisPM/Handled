"use client";

import { formatCurrency, formatDate } from "@/lib/utils/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { DollarSign } from "lucide-react";
import type { AppointmentListItem } from "@/lib/types";

/**
 * RevenueTable — price per closed-won job (dashboard-pages.md /analytics, CE9).
 */
export function RevenueTable({ jobs }: { jobs: AppointmentListItem[] }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={DollarSign}
        title="No closed-won revenue yet"
        description="Completed, paid jobs will be listed here with their price."
      />
    );
  }

  const total = jobs.reduce((acc, j) => acc + (j.price ?? 0), 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-grey-100 bg-white">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Revenue by closed-won job</caption>
        <thead>
          <tr className="border-b border-grey-100">
            <th scope="col" className="px-4 py-3 type-body-sm font-medium text-grey-500">
              Service
            </th>
            <th scope="col" className="px-4 py-3 type-body-sm font-medium text-grey-500">
              Technician
            </th>
            <th scope="col" className="px-4 py-3 type-body-sm font-medium text-grey-500">
              Date
            </th>
            <th scope="col" className="px-4 py-3 text-right type-body-sm font-medium text-grey-500">
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} className="border-b border-grey-50 last:border-0 hover:bg-grey-25">
              <td className="px-4 py-3 type-body-sm text-grey-900">{j.service ?? "—"}</td>
              <td className="px-4 py-3 type-body-sm text-grey-700">{j.tech ?? "—"}</td>
              <td className="px-4 py-3 type-body-sm text-grey-700">{formatDate(j.scheduled_at)}</td>
              <td className="px-4 py-3 text-right type-body-sm text-grey-900">
                {formatCurrency(j.price)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-grey-100 bg-grey-25">
            <td className="px-4 py-3 type-body-lg text-grey-900" colSpan={3}>
              Total revenue
            </td>
            <td className="px-4 py-3 text-right type-body-lg text-grey-900">
              {formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
