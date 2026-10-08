import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = {
  invalid?: boolean;
} & ComponentProps<"input">;

// Inputs: radius-md (6px); Default/Focus/Error states per design.md state table.
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded-md border bg-white px-3 type-body-lg text-grey-900",
        "placeholder:text-grey-300",
        "transition-colors duration-[var(--motion-fast)] ease-ds-out",
        "focus:outline-none focus-visible:outline-none",
        invalid
          ? "border-red-500 bg-red-50 text-red-700"
          : "border-grey-100 hover:border-grey-200 focus:border-brand",
        "disabled:bg-grey-25 disabled:text-grey-400",
        className
      )}
      {...rest}
    />
  );
});
