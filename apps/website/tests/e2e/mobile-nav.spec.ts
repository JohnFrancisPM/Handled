import { test, expect } from "@playwright/test";

test.describe("mobile navigation", () => {
  test("hamburger opens the sheet; Escape and backdrop close it; focus returns", async ({
    page
  }) => {
    test.skip((page.viewportSize()?.width ?? 1280) >= 768, "mobile viewport only");

    await page.goto("/");

    const trigger = page.getByRole("button", { name: "Open menu" });
    await expect(trigger).toBeVisible();

    // Open
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Pricing" })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Book a demo" })).toBeVisible();

    // Escape closes and focus returns to the trigger
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();

    // Re-open, then close via the backdrop
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    // The backdrop is an aria-hidden full-screen overlay; fire its click handler directly
    // (it sits beneath the sheet, so a positional click is unreliable).
    await page.locator('div.fixed.inset-0[aria-hidden="true"]').dispatchEvent("click");
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });
});
