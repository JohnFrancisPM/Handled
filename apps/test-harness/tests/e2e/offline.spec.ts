import { test, expect } from "@playwright/test";

test("offline: banner shows and a send never crashes the page", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  await page.goto("/");
  await expect(page.getByText(/Offline mock mode/)).toBeVisible();

  await page.getByRole("button", { name: /Jane Doe/ }).click();
  const composer = page.getByPlaceholder("Message as this customer…");
  await composer.fill("hello?");
  await composer.press("Enter");

  await expect(page.getByText(/Simulated .* reply/).first()).toBeVisible({ timeout: 15000 });
  expect(pageErrors).toEqual([]);
});
