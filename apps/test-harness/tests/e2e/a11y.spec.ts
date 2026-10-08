import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test("no WCAG 2.1 AA violations on the main screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("30 seeded customers")).toBeVisible();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = await new AxeBuilder({ page: page as any }).withTags(WCAG).analyze();
  expect(results.violations).toEqual([]);
});

test("no WCAG 2.1 AA violations with a thread open", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Jane Doe/ }).click();
  await expect(page.getByText("as Jane Doe (+15551230001)")).toBeVisible();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = await new AxeBuilder({ page: page as any }).withTags(WCAG).analyze();
  expect(results.violations).toEqual([]);
});

test("keyboard: the composer sends with Enter", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Jane Doe/ }).click();
  const composer = page.getByPlaceholder("Message as this customer…");
  await composer.focus();
  await composer.type("keyboard test message");
  await composer.press("Enter");
  await expect(page.getByText("keyboard test message")).toBeVisible();
});
