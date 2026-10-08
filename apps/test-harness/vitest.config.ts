import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "..", "..");

export default defineConfig({
  plugins: [react()],
  // Allow importing the builder from repo-root scripts/ (outside this app) in build-fixture.test.ts.
  server: { fs: { allow: [repoRoot] } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
    server: { deps: { inline: [/scripts[\\/]/] } }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      // The repo-root script imports this bare; pin it so Vite resolves it from the app's deps.
      "pgsql-ast-parser": path.resolve(__dirname, "node_modules/pgsql-ast-parser")
    }
  }
});
