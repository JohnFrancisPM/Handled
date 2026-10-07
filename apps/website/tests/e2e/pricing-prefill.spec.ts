import { test, expect } from "@playwright/test";

test("Pro tier CTA prefills the plan-interest select (R21)", async ({ page }) => {
  await page.goto("/pricing");

  await page.locator('a[href="/contact?plan=pro"]').first().click();

  await expect(page).toHaveURL(/\/contact\?plan=pro/);
  await expect(page.getByLabel("Plan you're interested in")).toHaveValue("pro");
});
