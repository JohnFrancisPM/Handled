"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CustomerRoster } from "@/components/roster/CustomerRoster";
import { ChatThread } from "@/components/thread/ChatThread";
import { BatchTrigger } from "@/components/batch/BatchTrigger";
import { BatchPanel } from "@/components/batch/BatchPanel";
import { OfflineBanner } from "@/components/system/OfflineBanner";
import { Chip } from "@/components/system/Chip";
import { copy } from "@/content/copy";
import type { Customer } from "@/lib/fixtures/types";
import { useBatchRun } from "@/lib/hooks/useBatchRun";
import { useHealth } from "@/lib/hooks/useHealth";
import { useSessionStore } from "@/lib/store/session";
import { cn } from "@/lib/utils/cn";

export function AppShell({ customers }: { customers: Customer[] }) {
  const activeId = useSessionStore((s) => s.activeCustomerId);
  const setActive = useSessionStore((s) => s.setActiveCustomer);
  const active = customers.find((c) => c.id === activeId) ?? null;

  const { data: health } = useHealth();
  const batch = useBatchRun();
  const [batchOpen, setBatchOpen] = useState(false);

  const runBatch = () => {
    setBatchOpen(true);
    batch.mutate();
  };

  return (
    <div className="flex h-screen flex-col">
      {health && !health.webhookConfigured ? <OfflineBanner offlineMock={health.offlineMock} /> : null}

      <header className="flex items-center justify-between gap-3 border-b border-grey-100 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate type-body-lg font-medium text-grey-900">{copy.appTitle}</span>
          {health?.offlineMock ? <Chip color="grey">{copy.tags.mock}</Chip> : null}
        </div>
        <BatchTrigger onClick={runBatch} disabled={batch.isPending} />
      </header>

      <main className="flex min-h-0 flex-1">
        <CustomerRoster
          customers={customers}
          activeId={activeId}
          onSelect={setActive}
          className={cn(
            "min-h-0 flex-col border-r border-grey-100 bg-white md:flex md:w-80",
            active ? "hidden md:flex" : "flex w-full"
          )}
        />

        <div className={cn("min-h-0 flex-1 flex-col", active ? "flex" : "hidden md:flex")}>
          {active ? (
            <button
              type="button"
              onClick={() => setActive("")}
              className="flex items-center gap-1 border-b border-grey-100 bg-white px-4 py-2 type-body-sm text-grey-500 transition-colors hover:text-grey-900 md:hidden"
            >
              <ArrowLeft size={14} aria-hidden /> {copy.roster.heading}
            </button>
          ) : null}
          <ChatThread customer={active} />
        </div>
      </main>

      <BatchPanel open={batchOpen} isPending={batch.isPending} envelope={batch.data} onClose={() => setBatchOpen(false)} />
    </div>
  );
}
