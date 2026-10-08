import { test, expect } from "@playwright/test";

test("run batch fills the results grid with a summary and expandable rows", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Run batch/ }).click();

  const dialog = page.getByRole("dialog", { name: "Batch run" });
  await expect(dialog).toBeVisible();

  // mock replies are fast — the results table fills in
  await expect(dialog.getByRole("table")).toBeVisible({ timeout: 30000 });
  await expect(dialog.getByText(/\d+ sent · \d+ ok · \d+ matched · \d+ errored/)).toBeVisible();

  // a row expands to reveal the reply
  await dialog.getByText("H-01", { exact: true }).click();
  await expect(dialog.getByText(/Simulated .* reply/).first()).toBeVisible();
});
