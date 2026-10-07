import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type SelectOption = { value: string; label: string };

type SelectProps = {
  options: readonly SelectOption[];
  placeholder?: string;
  error?: boolean;
} & ComponentProps<"select">;

export function Select({ options, placeholder = "Select…", error, className, ...rest }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border bg-white px-3 type-body-lg text-grey-900",
        "transition-colors duration-[var(--motion-fast)] ease-ds-out",
        error ? "border-red-500 bg-red-50 text-red-700" : "border-grey-100 hover:border-grey-200",
        className
      )}
      {...rest}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
