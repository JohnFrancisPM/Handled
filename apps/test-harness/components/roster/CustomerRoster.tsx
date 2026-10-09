"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CustomerRow } from "@/components/roster/CustomerRow";
import { NewCustomerForm, type NewCustomerInput } from "@/components/roster/NewCustomerForm";
import { copy } from "@/content/copy";
import { customerLabel } from "@/lib/fixtures/load";
import type { Customer } from "@/lib/fixtures/types";

export function CustomerRoster({
  customers,
  newCustomers,
  activeId,
  onSelect,
  onCreateNew,
  className
}: {
  customers: Customer[];
  newCustomers: Customer[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: (input: NewCustomerInput) => void;
  className?: string;
}) {
  const [q, setQ] = useState("");

  const matchesQuery = (c: Customer, s: string) =>
    customerLabel(c).toLowerCase().includes(s) || c.phone.includes(s);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((c) => matchesQuery(c, s));
  }, [q, customers]);

  const filteredNew = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return newCustomers;
    return newCustomers.filter((c) => matchesQuery(c, s));
  }, [q, newCustomers]);

  return (
    <aside className={className}>
      <div className="border-b border-grey-100 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="type-body-lg text-grey-900">{copy.roster.heading}</h2>
          <span className="type-body-sm text-grey-500">{copy.roster.count(customers.length)}</span>
        </div>
        <label className="mb-2 flex items-center gap-2 rounded-md border border-grey-200 px-2 transition-colors focus-within:border-brand">
          <Search size={14} aria-hidden className="text-grey-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={copy.roster.searchPlaceholder}
            aria-label={copy.roster.searchPlaceholder}
            className="h-9 flex-1 bg-transparent type-body-sm text-grey-900 placeholder:text-grey-400 focus:outline-none"
          />
        </label>
        <NewCustomerForm onCreate={onCreateNew} />
      </div>
      <ul role="list" className="min-h-0 flex-1 overflow-y-auto">
        {filteredNew.length > 0 ? (
          <li>
            <p className="px-3 pb-1 pt-3 type-body-sm font-medium text-grey-500">{copy.newCustomer.group}</p>
            <ul role="list">
              {filteredNew.map((c) => (
                <CustomerRow key={c.id} customer={c} selected={c.id === activeId} onSelect={onSelect} />
              ))}
            </ul>
          </li>
        ) : null}
        {filtered.map((c) => (
          <CustomerRow key={c.id} customer={c} selected={c.id === activeId} onSelect={onSelect} />
        ))}
        {filtered.length === 0 && filteredNew.length === 0 ? (
          <li className="px-3 py-4 type-body-sm text-grey-400">No matches.</li>
        ) : null}
      </ul>
    </aside>
  );
}
