"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Client provider shell. React Query drives the send/batch/health hooks
 * (chat-ui.md §State). One QueryClient per browser session.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false }
        }
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
