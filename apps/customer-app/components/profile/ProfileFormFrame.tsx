"use client";

import type { FormEventHandler, ReactNode } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

/**
 * ProfileFormFrame — shared chrome for every policy panel (dashboard-pages.md
 * /profile/*): heading, demo-mode banner, the form body, and a footer with the
 * Save button + "Saved" toast. Keeps all seven panels visually consistent.
 */
export function ProfileFormFrame({
  title,
  description,
  onSubmit,
  saving,
  savedAt,
  errorMessage,
  isDemo,
  children
}: {
  title: string;
  description?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  saving: boolean;
  savedAt: number | null;
  errorMessage: string | null;
  isDemo: boolean;
  children: ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="type-h5 text-grey-900">{title}</h2>
        {description && <p className="type-body-sm text-grey-500">{description}</p>}
      </div>

      {isDemo && (
        <div
          role="note"
          className="flex items-center gap-2 rounded-md border border-yellow-500 bg-yellow-50 px-4 py-3 type-body-sm text-yellow-800"
        >
          <Info aria-hidden="true" size={16} />
          Demo mode — changes aren&apos;t saved. Connect Supabase to edit your live policy.
        </div>
      )}

      {children}

      <div className="flex items-center gap-3 border-t border-grey-100 pt-4">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {savedAt && (
          <Toast tone="success" key={savedAt}>
            Saved
          </Toast>
        )}
        {errorMessage && (
          <Toast tone="error" key={errorMessage}>
            {errorMessage}
          </Toast>
        )}
      </div>
    </form>
  );
}
