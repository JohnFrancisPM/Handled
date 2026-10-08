import Link from "next/link";
import { AlertTriangle, CalendarCheck, DollarSign, TrendingUp, Zap } from "lucide-react";
import { getContext } from "@/lib/data/context";
import { computeConversion } from "@/lib/analytics/conversion";
import { getConversations, getAppointments } from "@/lib/data/dashboard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { IntentBadge } from "@/components/dashboard/IntentBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { formatCurrency, formatPercent, formatRelative, formatDateTime } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

// Overview (dashboard-pages.md /dashboard, notepad CE9): KPI row + recent activity.
export default async function DashboardOverviewPage() {
  const ctx = await getContext();
  if (!ctx) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Overview" />
        <ErrorCard message="Sign in to view your dashboard." />
      </section>
    );
  }

  const [metrics, conversations, appointments] = await Promise.all([
    computeConversion(ctx, "30d"),
    getConversations(ctx),
    getAppointments(ctx)
  ]);

  const escalations = conversations.filter((c) => c.status === "escalated").slice(0, 5);
  const recentBookings = appointments
    .filter((a) => a.status === "booked" || a.status === "closed_won")
    .slice(0, 5);

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title="Overview"
        description="Captured value, conversion, revenue, and the latest activity across your AI front desk."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Captured Opportunity Value"
          value={formatCurrency(metrics.captured_opportunity_value)}
          sublabel="North Star — booked revenue from inbound chats (30d)"
          highlight
          icon={<Zap size={18} />}
        />
        <KpiCard
          label="Conversion rate"
          value={formatPercent(metrics.conversion_rate)}
          sublabel={`${metrics.booked} booked of ${metrics.inbound} inbound`}
          icon={<TrendingUp size={18} />}
        />
        <KpiCard
          label="Revenue (closed-won)"
          value={formatCurrency(metrics.revenue)}
          sublabel={`${metrics.closed_won} jobs completed & paid`}
          icon={<DollarSign size={18} />}
        />
        <KpiCard
          label="Inbound (30d)"
          value={metrics.inbound}
          sublabel="Conversations with a customer message"
          icon={<CalendarCheck size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="type-h5 text-grey-900">Recent escalations</h2>
            <Link href="/inbox" className="type-body-sm text-brand hover:underline">
              View inbox
            </Link>
          </div>
          {escalations.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No active escalations"
              description="Emergencies and human-transfer requests will appear here."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-grey-50">
              {escalations.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/inbox/${c.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors duration-[var(--motion-fast)] ease-ds-out hover:bg-grey-25"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={c.customer.name} size="sm" />
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate type-body-lg font-medium text-grey-900">{c.customer.name}</span>
                        <span className="type-body-sm text-grey-500">
                          {formatRelative(c.updated_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <IntentBadge intent={c.last_intent} />
                      <StatusBadge status={c.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="type-h5 text-grey-900">Recent bookings</h2>
            <Link href="/appointments" className="type-body-sm text-brand hover:underline">
              View appointments
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No bookings yet"
              description="Jobs the AI books will show up here."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-grey-50">
              {recentBookings.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-grey-50 text-grey-400">
                      <CalendarCheck aria-hidden="true" size={16} />
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate type-body-lg font-medium text-grey-900">{a.service}</span>
                      <span className="truncate type-body-sm text-grey-500">
                        {a.tech ?? "Unassigned"} · {formatDateTime(a.scheduled_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="type-body-lg font-medium tabular-nums text-grey-900">{formatCurrency(a.price)}</span>
                    <StatusBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </section>
  );
}
