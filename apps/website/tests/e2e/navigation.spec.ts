import { test, expect } from "@playwright/test";

const routes: string[] = [
  "/",
  "/why-handled",
  "/features",
  "/integrations",
  "/how-it-works",
  "/pricing",
  "/contact",
  "/privacy",
  "/terms"
];

for (const route of routes) {
  test(`${route} returns 200, has one h1, nav CTA, and footer legal links`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status(), `status for ${route}`).toBe(200);

    await expect(page.locator("h1")).toHaveCount(1);

    // Persistent "Book a demo" entry point in the header.
    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
    if (isMobile) {
      await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    } else {
      await expect(
        page.locator("header").getByRole("link", { name: "Book a demo" })
      ).toBeVisible();
    }

    // Footer shows Privacy + Terms on every page.
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Privacy" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Terms" })).toBeVisible();
  });
}
