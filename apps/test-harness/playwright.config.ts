import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // E2E runs against a STUBBED webhook (see testing.md): OFFLINE_MOCK on, no real n8n.
    env: { OFFLINE_MOCK: "true" }
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
