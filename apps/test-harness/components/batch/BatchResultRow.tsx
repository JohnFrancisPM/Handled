"use client";

import { useState } from "react";
import { Chip } from "@/components/system/Chip";
import { intentChipColor, matchChipColor } from "@/content/chips";
import { copy } from "@/content/copy";
import type { BatchResult } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { formatLatency } from "@/lib/utils/format";

export function BatchResultRow({ r }: { r: BatchResult }) {
  const [open, setOpen] = useState(false);
  const anyAccepted = r.expected_intent === "*";
  const matchLabel = anyAccepted ? copy.batch.any : r.match ? copy.batch.pass : copy.batch.fail;

  return (
    <>
      <tr
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer border-b border-grey-50 transition-colors hover:bg-grey-50"
      >
        <td className="px-2 py-2 type-body-sm text-grey-700">{r.scenario_id}</td>
        <td className="max-w-[220px] truncate px-2 py-2 type-body-sm text-grey-500">{r.text}</td>
        <td className="px-2 py-2 type-body-sm text-grey-500">{r.expected_intent}</td>
        <td className="px-2 py-2">
          <Chip color={r.mocked ? "grey" : intentChipColor(r.intent)}>{r.intent ?? "—"}</Chip>
        </td>
        <td className="px-2 py-2 type-body-sm text-grey-500">{r.agent ?? "—"}</td>
        <td className="px-2 py-2 type-body-sm text-grey-500">{formatLatency(r.latency_ms)}</td>
        <td className="px-2 py-2">
          <Chip color={matchChipColor(r.match, anyAccepted)}>{matchLabel}</Chip>
        </td>
        <td className="px-2 py-2 type-body-sm text-red-700">
          {r.error ?? ""}
          {r.mocked ? " (mock)" : ""}
        </td>
      </tr>
      {open ? (
        <tr className="border-b border-grey-50 bg-grey-25">
          <td colSpan={8} className="px-3 py-2">
            <p className={cn("whitespace-pre-wrap type-body-sm", r.reply ? "text-grey-700" : "italic text-grey-400")}>
              {r.reply ?? copy.thread.noReply}
            </p>
            {r.actions && r.actions.length > 0 ? (
              <ul className="mt-1 list-none space-y-1">
                {r.actions.map((a, i) => (
                  <li key={i} className="type-body-sm text-grey-500">
                    <span className="font-medium text-grey-700">{a.type}</span>
                    {Object.entries(a)
                      .filter(([k]) => k !== "type")
                      .map(([k, v]) => ` · ${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
                      .join("")}
                  </li>
                ))}
              </ul>
            ) : null}
          </td>
        </tr>
      ) : null}
    </>
  );
}
