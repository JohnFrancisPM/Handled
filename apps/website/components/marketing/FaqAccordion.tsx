"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/content/faqs";
import { cn } from "@/lib/utils/cn";

type FaqAccordionProps = { faqs: Faq[] };

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="flex flex-col">
      {faqs.map((faq, i) => {
        const isOpen = open.has(i);
        const btnId = `${baseId}-q-${i}`;
        const panelId = `${baseId}-a-${i}`;
        return (
          <div key={faq.question} className="border-b border-grey-100">
            <h3>
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 py-6 text-left type-body-lg font-medium text-grey-900"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={20}
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 text-grey-500 transition-transform duration-[var(--motion-base)] ease-ds-out",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="pb-6"
            >
              <p className="type-body-lg text-grey-500">{faq.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
