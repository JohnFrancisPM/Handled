"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/http/client";
import { humanize, formatRelative } from "@/lib/utils/format";
import type { NotificationItem } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const NOTIF_TONE: Record<string, string> = {
  escalation: "text-red-700",
  new_booking: "text-green-700",
  lead: "text-violet-700",
  after_hours_summary: "text-grey-500"
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiGet<NotificationItem[]>("/api/notifications")
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiPatch<{ ok: true }>(`/api/notifications/${id}`, { read: true }),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prev = queryClient.getQueryData<NotificationItem[]>(["notifications"]);
      queryClient.setQueryData<NotificationItem[]>(["notifications"], (old) =>
        (old ?? []).map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(["notifications"], context.prev);
    }
  });

  const unread = data.filter((n) => !n.read);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-grey-500 hover:bg-grey-50"
      >
        <Bell aria-hidden="true" size={18} />
        {unread.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 type-body-sm font-medium text-white">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            aria-label="Notifications"
            className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-grey-100 bg-white"
          >
            <div className="flex items-center justify-between border-b border-grey-100 px-4 py-3">
              <span className="type-body-lg text-grey-900">Notifications</span>
              <span className="type-body-sm text-grey-500">{unread.length} unread</span>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {data.length === 0 && (
                <li className="px-4 py-6 text-center type-body-sm text-grey-500">
                  You&apos;re all caught up.
                </li>
              )}
              {data.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "flex items-start justify-between gap-2 border-b border-grey-50 px-4 py-3 last:border-0",
                    !n.read && "bg-grey-25"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className={cn("type-body-lg", NOTIF_TONE[n.kind] ?? "text-grey-900")}>
                      {humanize(n.kind)}
                    </span>
                    <span className="type-body-sm text-grey-500">
                      {formatRelative(n.created_at)}
                    </span>
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      aria-label="Mark as read"
                      onClick={() => markRead.mutate(n.id)}
                      className="rounded-md p-1 text-grey-400 hover:bg-grey-50 hover:text-grey-700"
                    >
                      <Check aria-hidden="true" size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
