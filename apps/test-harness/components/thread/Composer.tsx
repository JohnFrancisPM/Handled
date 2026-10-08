"use client";

import { useForm } from "react-hook-form";
import { RotateCcw, Send } from "lucide-react";
import { copy } from "@/content/copy";
import { sendRequestSchema } from "@/lib/validation/contract";

/** Compose a turn as the impersonated customer. Enter sends, Shift+Enter newlines.
 *  Send disables while a turn is pending, but the input stays editable. */
export function Composer({
  pending,
  onSend,
  onReset
}: {
  pending: boolean;
  onSend: (text: string) => void;
  onReset: () => void;
}) {
  const { register, handleSubmit, reset } = useForm<{ text: string }>({ defaultValues: { text: "" } });

  const submit = handleSubmit(({ text }) => {
    const parsed = sendRequestSchema.shape.text.safeParse(text);
    if (!parsed.success) return; // client mirror of the contract 1–2000 rule
    onSend(parsed.data);
    reset({ text: "" });
  });

  return (
    <form onSubmit={submit} className="border-t border-grey-100 bg-white p-3">
      <div className="flex items-end gap-2">
        <textarea
          {...register("text", { required: true, maxLength: 2000 })}
          rows={1}
          placeholder={copy.composer.placeholder}
          aria-label={copy.composer.placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          className="max-h-40 min-h-[40px] flex-1 resize-none rounded-md border border-grey-200 bg-white px-3 py-2 type-body-lg text-grey-900 transition-colors placeholder:text-grey-400 focus:border-brand"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-1 rounded-md bg-brand px-4 type-body-lg text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-grey-100 disabled:text-grey-400"
        >
          <Send size={16} aria-hidden />
          {pending ? copy.composer.sending : copy.composer.send}
        </button>
        <button
          type="button"
          onClick={onReset}
          title={copy.composer.reset}
          aria-label={copy.composer.reset}
          className="inline-flex h-10 items-center rounded-md border border-grey-200 bg-white px-3 text-grey-500 transition-colors hover:border-grey-300"
        >
          <RotateCcw size={16} aria-hidden />
        </button>
      </div>
    </form>
  );
}
