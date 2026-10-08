import { test, expect } from "@playwright/test";

/**
 * Analytics funnel renders with seeded data (testing.md §E2E): KPI row + the
 * inbound → booked → closed_won funnel, against demo fixtures.
 */
test.describe("Analytics", () => {
  test("renders KPIs and the conversion funnel", async ({ page }) => {
    await page.goto("/analytics");

    await expect(page.getByRole("heading", { level: 1, name: "Analytics" })).toBeVisible();

    // North-star + funnel KPIs.
    await expect(page.getByText("Captured Opportunity Value").first()).toBeVisible();
    await expect(page.getByText("Conversion rate").first()).toBeVisible();
    await expect(page.getByText(/Revenue \(closed-won\)/).first()).toBeVisible();

    // The funnel chart renders with its accessible label (inbound/booked/closed won).
    await expect(page.getByRole("heading", { name: "Conversion funnel" })).toBeVisible();
    await expect(page.getByRole("img", { name: /Funnel:.*inbound.*booked.*closed won/i })).toBeVisible();

    // Revenue-by-job section renders from seeded closed_won appointments.
    await expect(page.getByRole("heading", { name: "Revenue by job" })).toBeVisible();
  });

  test("changing the range keeps the funnel rendered", async ({ page }) => {
    await page.goto("/analytics");
    await page.getByLabel("Range").selectOption("all");
    await expect(page.getByRole("img", { name: /Funnel:/i })).toBeVisible();
  });
});
