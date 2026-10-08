"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

/**
 * ChipsInput — edits a string[] (customer types, ZIPs, tech skills, serve/deny
 * chips). Add with Enter; remove with the chip's × or Backspace on empty input.
 * a11y: each chip's remove button is labelled.
 */
export function ChipsInput({
  value,
  onChange,
  placeholder,
  id,
  tone = "grey"
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
  tone?: "grey" | "brand" | "green" | "red";
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((chip) => (
            <li key={chip}>
              <Badge tone={tone} className="gap-1">
                {chip}
                <button
                  type="button"
                  aria-label={`Remove ${chip}`}
                  onClick={() => onChange(value.filter((c) => c !== chip))}
                  className="rounded-sm hover:text-grey-900"
                >
                  <X aria-hidden="true" size={12} />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <Input
        id={id}
        value={draft}
        placeholder={placeholder ?? "Type and press Enter"}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
      />
    </div>
  );
}
