import type { ReactNode } from "react";

/** Labelled form field with inline validation message (a11y: label + error id). */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="type-body-sm font-medium text-grey-700">
        {label}
      </label>
      {children}
      {hint && !error && <span className="type-body-sm text-grey-500">{hint}</span>}
      {error && (
        <span className="type-body-sm text-red-700" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
