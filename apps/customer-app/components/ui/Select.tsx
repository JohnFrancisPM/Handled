import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type SelectProps = {
  invalid?: boolean;
} & ComponentProps<"select">;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid = false, className, children, ...rest },
  ref
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded-md border bg-white px-3 type-body-lg text-grey-900",
        "transition-colors duration-[var(--motion-fast)] ease-ds-out",
        "focus:outline-none focus-visible:outline-none",
        invalid
          ? "border-red-500 bg-red-50 text-red-700"
          : "border-grey-100 hover:border-grey-200 focus:border-brand",
        "disabled:bg-grey-25 disabled:text-grey-400",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
});
