import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("lists 30 customers and filters via search", async ({ page }) => {
  await expect(page.getByText("30 seeded customers")).toBeVisible();
  const list = page.getByRole("list");
  await expect(list.getByRole("listitem")).toHaveCount(30);

  await page.getByPlaceholder("Search by name or phone").fill("Jane");
  await expect(list.getByRole("listitem")).toHaveCount(1);
  await expect(page.getByText("Jane Doe")).toBeVisible();
});

test("selecting a customer opens the thread with backfilled history", async ({ page }) => {
  await page.getByRole("button", { name: /Jane Doe/ }).click();
  await expect(page.getByText("as Jane Doe (+15551230001)")).toBeVisible();
  // user turn (right) and assistant turn (left) from the fixture
  await expect(page.getByText("My kitchen sink is clogged, can someone come out?")).toBeVisible();
  await expect(page.getByText(/You're booked: drain clearing/)).toBeVisible();
});

test("the null-name customer shows the phone as its label", async ({ page }) => {
  await page.getByPlaceholder("Search by name or phone").fill("15551230023");
  const list = page.getByRole("list");
  await expect(list.getByRole("listitem")).toHaveCount(1);
  // the phone is both the display label and the secondary line (name is null) → appears twice
  await expect(list.getByText("+15551230023")).toHaveCount(2);
});
