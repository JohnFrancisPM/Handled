import type { ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;      // the input/select element
};

export function Field({ id, label, required, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="type-body-lg font-medium text-grey-900">
        {label}
        {required && <span className="text-red-700"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="type-body-sm text-grey-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="type-body-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
