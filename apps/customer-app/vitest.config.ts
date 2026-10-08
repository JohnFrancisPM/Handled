import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // `server-only` is a build-time marker with no runtime behavior; stub it so
      // server modules (data layer, analytics) can be unit-tested under node/jsdom.
      "server-only": path.resolve(__dirname, "tests/stubs/empty.ts")
    }
  }
});
