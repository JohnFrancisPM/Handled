import { test, expect } from "@playwright/test";

/**
 * Navigation (testing.md §E2E): every dashboard route loads 200 with exactly one
 * h1, and there is no /evals route (eval export is builder-side — confirm 404).
 */

const ROUTES: { path: string; h1: string }[] = [
  { path: "/dashboard", h1: "Overview" },
  { path: "/inbox", h1: "Inbox" },
  { path: "/appointments", h1: "Appointments" },
  { path: "/leads", h1: "Leads" },
  { path: "/analytics", h1: "Analytics" },
  { path: "/profile", h1: "Business profile" },
  { path: "/profile/services", h1: "Business profile" },
  { path: "/profile/pricing", h1: "Business profile" },
  { path: "/profile/areas", h1: "Business profile" },
  { path: "/profile/hours", h1: "Business profile" },
  { path: "/profile/team", h1: "Business profile" },
  { path: "/profile/emergency", h1: "Business profile" }
];

test.describe("Dashboard route health", () => {
  for (const { path, h1 } of ROUTES) {
    test(`${path} loads 200 with exactly one h1`, async ({ page }) => {
      const resp = await page.goto(path);
      expect(resp?.status(), `status for ${path}`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
    });
  }

  test("there is no /evals route (eval export is builder-side) — 404", async ({ page }) => {
    const resp = await page.goto("/evals");
    expect(resp?.status()).toBe(404);
  });
});

/**
 * Responsive health: no horizontal page overflow at the current viewport. On the
 * `mobile` project (Pixel 5, 393px) this guards the responsive shell — the
 * sidebar collapses into a drawer and master/detail + tables reflow, so the
 * document must never be wider than the viewport.
 */
test.describe("No horizontal overflow", () => {
  for (const path of ["/dashboard", "/inbox", "/appointments", "/analytics", "/profile"]) {
    test(`${path} does not overflow horizontally`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      // Allow a 1px rounding tolerance.
      expect(scrollWidth, `${path} scrollWidth vs clientWidth`).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
});
