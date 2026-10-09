"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { copy } from "@/content/copy";

export interface NewCustomerInput {
  name?: string;
  phone?: string;
}

/**
 * Collapsed "+ New customer" button that expands into a tiny form. Both fields are
 * optional: leave them blank and the store assigns a fresh unseen phone, so the AI
 * meets the customer for the first time (e.g. a brand-new booking).
 */
export function NewCustomerForm({ onCreate }: { onCreate: (input: NewCustomerInput) => void }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<NewCustomerInput>({ defaultValues: { name: "", phone: "" } });

  const submit = handleSubmit((values) => {
    onCreate({ name: values.name?.trim() || undefined, phone: values.phone?.trim() || undefined });
    reset({ name: "", phone: "" });
    setOpen(false);
  });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-grey-200 px-3 py-2 type-body-sm text-grey-600 transition-colors hover:border-brand hover:text-brand"
      >
        <Plus size={14} aria-hidden /> {copy.newCustomer.open}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-md border border-grey-200 bg-grey-25 p-3">
      <div className="flex items-center justify-between">
        <span className="type-body-sm font-medium text-grey-900">{copy.newCustomer.title}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={copy.newCustomer.cancel}
          className="text-grey-400 transition-colors hover:text-grey-900"
        >
          <X size={14} aria-hidden />
        </button>
      </div>
      <input
        {...register("name")}
        placeholder={copy.newCustomer.namePlaceholder}
        aria-label={copy.newCustomer.namePlaceholder}
        className="h-9 rounded-md border border-grey-200 bg-white px-2 type-body-sm text-grey-900 transition-colors placeholder:text-grey-400 focus:border-brand focus:outline-none"
      />
      <input
        {...register("phone")}
        placeholder={copy.newCustomer.phonePlaceholder}
        aria-label={copy.newCustomer.phonePlaceholder}
        inputMode="tel"
        className="h-9 rounded-md border border-grey-200 bg-white px-2 type-body-sm text-grey-900 transition-colors placeholder:text-grey-400 focus:border-brand focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center rounded-md bg-brand px-3 type-body-sm text-white transition-colors hover:bg-blue-600"
      >
        {copy.newCustomer.submit}
      </button>
      <p className="type-body-sm text-grey-400">{copy.newCustomer.hint}</p>
    </form>
  );
}
