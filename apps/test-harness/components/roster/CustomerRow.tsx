import { Chip } from "@/components/system/Chip";
import { intentChipColor } from "@/content/chips";
import { customerLabel } from "@/lib/fixtures/load";
import type { Customer } from "@/lib/fixtures/types";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

export function CustomerRow({
  customer,
  selected,
  onSelect
}: {
  customer: Customer;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const label = customerLabel(customer);
  return (
    <li role="listitem">
      <button
        type="button"
        onClick={() => onSelect(customer.id)}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "flex w-full items-center gap-3 border-l-2 px-3 py-2 text-left transition-colors",
          selected ? "border-brand bg-blue-50" : "border-transparent hover:bg-grey-50"
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-grey-50 type-body-sm font-medium text-grey-600">
          {initials(label)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate type-body-lg text-grey-900">{label}</span>
          <span className="truncate type-body-sm text-grey-500">{customer.phone}</span>
        </span>
        {customer.last_intent ? (
          <Chip color={intentChipColor(customer.last_intent)}>{customer.last_intent}</Chip>
        ) : null}
      </button>
    </li>
  );
}
