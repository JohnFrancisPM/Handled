"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import { BatchResultsGrid } from "@/components/batch/BatchResultsGrid";
import { copy } from "@/content/copy";
import type { ApiResult, BatchRunData } from "@/lib/types";

export function BatchPanel({
  open,
  isPending,
  envelope,
  onClose
}: {
  open: boolean;
  isPending: boolean;
  envelope: ApiResult<BatchRunData> | undefined;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="bg-overlay fixed inset-0 z-40 flex"
      role="dialog"
      aria-modal="true"
      aria-label={copy.batch.title}
    >
      <div className="mx-auto mt-8 flex h-[90vh] w-[min(1100px,94vw)] flex-col overflow-hidden rounded-xl border border-grey-200 bg-white">
        <header className="flex items-center justify-between border-b border-grey-100 px-4 py-3">
          <div className="flex flex-col">
            <h2 className="type-h5 text-grey-900">{copy.batch.title}</h2>
            <span className="type-body-sm text-grey-500">{copy.batch.subtitle}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.batch.close}
            className="rounded-md border border-grey-200 p-1 text-grey-500 transition-colors hover:border-grey-300"
          >
            <X size={18} aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {isPending ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Loader2 size={28} className="animate-spin text-brand" aria-hidden />
              <p className="type-body-lg text-grey-900">{copy.batch.running}</p>
              <p className="type-body-sm text-grey-500">
                55 scenarios, 5 at a time — live replies take 20–50s each, so this can run a few minutes.
              </p>
            </div>
          ) : null}

          {!isPending && envelope && !envelope.ok ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 type-body-lg text-red-700"
            >
              <AlertTriangle size={18} aria-hidden className="mt-[2px] shrink-0" />
              <span>{envelope.error.message}</span>
            </div>
          ) : null}

          {!isPending && envelope && envelope.ok ? (
            <>
              <p className="type-body-lg text-grey-900">{copy.batch.summary(envelope.data.summary)}</p>
              <div className="mt-3">
                <BatchResultsGrid results={envelope.data.results} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
