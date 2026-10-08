"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Tag } from "lucide-react";
import { Chip } from "@/components/system/Chip";
import { intentChipColor } from "@/content/chips";
import { copy } from "@/content/copy";
import type { Action } from "@/lib/types";

/** Under an assistant bubble: intent·agent chip + an expandable actions disclosure. */
export function MetaChip({
  intent,
  agent,
  actions,
  mocked
}: {
  intent?: string | null;
  agent?: string | null;
  actions?: Action[] | null;
  mocked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasActions = Array.isArray(actions) && actions.length > 0;
  if (!intent && !agent && !hasActions && !mocked) return null;

  const color = mocked ? "grey" : intentChipColor(intent);

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      {(intent || agent) && (
        <Chip color={color}>
          <Tag size={11} aria-hidden />
          {intent ?? "—"}
          {agent ? ` · ${agent}` : ""}
        </Chip>
      )}
      {mocked && <Chip color="grey">{copy.tags.mock}</Chip>}

      {hasActions && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 rounded-sm border border-grey-200 bg-white px-2 py-[2px] type-body-sm text-grey-600 transition-colors hover:border-grey-300"
        >
          {open ? <ChevronDown size={12} aria-hidden /> : <ChevronRight size={12} aria-hidden />}
          {copy.tags.actions} ({actions!.length})
        </button>
      )}

      {open && hasActions && (
        <ul className="mt-1 w-full list-none space-y-1">
          {actions!.map((a, i) => (
            <li key={i} className="type-body-sm text-grey-500">
              <span className="font-medium text-grey-700">{a.type}</span>
              {Object.entries(a)
                .filter(([k]) => k !== "type")
                .map(([k, v]) => ` · ${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
                .join("")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
