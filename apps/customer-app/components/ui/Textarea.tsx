import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type TextareaProps = {
  invalid?: boolean;
} & ComponentProps<"textarea">;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid = false, className, rows = 4, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full rounded-md border bg-white px-3 py-2 type-body-lg text-grey-900",
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
