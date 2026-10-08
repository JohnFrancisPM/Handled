"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Zap } from "lucide-react";
import { apiGet } from "@/lib/http/client";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FunnelChart } from "@/components/analytics/FunnelChart";
import { RevenueTable } from "@/components/analytics/RevenueTable";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { AppointmentListItem } from "@/lib/types";
import type { ConversionMetrics, ConversionRange } from "@/lib/analytics/conversion";

const RANGES: { value: ConversionRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" }
];

export function AnalyticsView() {
  const [range, setRange] = useState<ConversionRange>("30d");

  const metricsQ = useQuery({
    queryKey: ["conversion", range],
    queryFn: () => apiGet<ConversionMetrics>(`/api/analytics/conversion?range=${range}`)
  });

  const revenueQ = useQuery({
    queryKey: ["appointments", "closed_won"],
    queryFn: () => apiGet<AppointmentListItem[]>("/api/appointments?status=closed_won")
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <label htmlFor="range" className="type-body-sm text-grey-500">
          Range
        </label>
        <Select
          id="range"
          value={range}
          onChange={(e) => setRange(e.target.value as ConversionRange)}
          className="w-48"
        >
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>

      {metricsQ.isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {metricsQ.isError && (
        <ErrorCard
          message={
            metricsQ.error instanceof Error ? metricsQ.error.message : "Could not load analytics."
          }
          onRetry={() => metricsQ.refetch()}
        />
      )}

      {metricsQ.data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard
              label="Captured Opportunity Value"
              value={formatCurrency(metricsQ.data.captured_opportunity_value)}
              sublabel="North Star — revenue captured from inbound chats"
              highlight
              icon={<Zap size={18} />}
            />
            <KpiCard
              label="Conversion rate"
              value={formatPercent(metricsQ.data.conversion_rate)}
              sublabel={`${metricsQ.data.booked} booked / ${metricsQ.data.inbound} inbound`}
              icon={<TrendingUp size={18} />}
            />
            <KpiCard
              label="Revenue (closed-won)"
              value={formatCurrency(metricsQ.data.revenue)}
              sublabel={`${metricsQ.data.closed_won} jobs paid`}
              icon={<DollarSign size={18} />}
            />
          </div>

          <Card className="flex flex-col gap-4">
            <h2 className="type-h5 text-grey-900">Conversion funnel</h2>
            <FunnelChart
              inbound={metricsQ.data.inbound}
              booked={metricsQ.data.booked}
              closedWon={metricsQ.data.closed_won}
            />
          </Card>
        </>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="type-h5 text-grey-900">Revenue by job</h2>
        {revenueQ.isLoading && <Skeleton className="h-40 w-full" />}
        {revenueQ.isError && (
          <ErrorCard message="Could not load revenue." onRetry={() => revenueQ.refetch()} />
        )}
        {revenueQ.data && <RevenueTable jobs={revenueQ.data} />}
      </section>
    </div>
  );
}
