import { test, expect } from "@playwright/test";

test.describe("demo form (R20, R22)", () => {
  test("valid submit after min-fill-time shows the success panel", async ({ page }) => {
    await page.goto("/contact");

    await page.getByLabel("Your name").fill("Jane Tester");
    await page.getByLabel("Business name").fill("Jane Plumbing");
    await page.getByLabel("Email").fill("jane@example.com");

    // Server rejects submissions faster than MIN_FILL_MS (2s).
    await page.waitForTimeout(2300);

    await page.getByRole("button", { name: "Book a demo" }).click();

    // Works with no Supabase env because the route gracefully no-ops (stored:false).
    // Target the success panel heading specifically (the phrase also appears in page copy).
    await expect(
      page.getByRole("heading", { name: /within 1 business day/i })
    ).toBeVisible();
  });

  test("empty submit shows inline required errors and focuses the first field", async ({
    page
  }) => {
    await page.goto("/contact");

    await page.getByRole("button", { name: "Book a demo" }).click();

    await expect(page.getByText("Please enter your name")).toBeVisible();
    await expect(page.getByText("Please enter your business name")).toBeVisible();
    await expect(page.getByLabel("Your name")).toBeFocused();
  });

  test("consent line and Privacy link appear under the submit button", async ({ page }) => {
    await page.goto("/contact");

    const form = page.locator("form");
    await expect(form.getByText(/By submitting you agree to be contacted/i)).toBeVisible();
    await expect(form.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
  });
});
