import { test, expect } from "@playwright/test";

test("send shows the optimistic bubble, then a (mock) reply; reset clears live turns", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Jane Doe/ }).click();

  const composer = page.getByPlaceholder("Message as this customer…");
  await composer.fill("Can you come tomorrow to fix my faucet?");
  await composer.press("Enter");

  // optimistic user bubble appears immediately
  await expect(page.getByText("Can you come tomorrow to fix my faucet?")).toBeVisible();

  // offline-mock reply arrives (no live n8n in E2E)
  await expect(page.getByText(/Simulated .* reply/).first()).toBeVisible({ timeout: 15000 });

  // reset clears live turns back to the fixture history
  await page.getByRole("button", { name: "Reset thread" }).click();
  await expect(page.getByText("Can you come tomorrow to fix my faucet?")).toHaveCount(0);
  await expect(page.getByText(/You're booked: drain clearing/)).toBeVisible();
});
