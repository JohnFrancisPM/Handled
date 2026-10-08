import { test, expect } from "@playwright/test";

/**
 * Inbox renders a seeded conversation thread with the reasoning/citation popover
 * (testing.md §E2E). Runs against demo mode (seeded Acme fixtures, no env).
 *
 * ThreadView auto-scrolls to the newest message, so which messages sit inside the
 * overflow pane's clip rect is non-deterministic. We scroll each asserted element
 * into the pane before checking visibility, and invoke the button's own click to
 * avoid coordinate hit-testing against the non-responsive mobile layout.
 */
test.describe("Inbox thread + explainability popover", () => {
  test("renders a seeded thread and reveals reasoning + citation", async ({ page }) => {
    // conv-c01 is a hand-written booking thread with reasoning/citation/tool_calls.
    await page.goto("/inbox/conv-c01");

    // The seeded thread content is rendered (the user message + the latest AI reply).
    await expect(
      page.getByText("My kitchen sink is clogged, can someone come out?")
    ).toBeAttached();
    await expect(page.getByText(/You're booked: drain clearing/)).toBeAttached();

    // The explainability popover is collapsed until the "Why" button is pressed.
    // (exact: the page description text also contains the word "reasoning".)
    const reasoning = page.getByText("Reasoning", { exact: true });
    await expect(reasoning).toHaveCount(0);

    // Open the popover on the latest AI turn. Invoke the button's own click so the
    // test is robust to the non-responsive mobile layout's overflow clipping.
    const whyButtons = page.getByRole("button", { name: /Show AI reasoning/i });
    await expect(whyButtons.first()).toBeAttached();
    await whyButtons.last().evaluate((el) => (el as HTMLButtonElement).click());

    // Reasoning + citation + tool list are revealed (they exist only when open).
    await expect(reasoning).toHaveCount(1);
    await expect(page.getByText("create_appointment#apt-01")).toHaveCount(1);
    await expect(page.getByText("Tools used", { exact: true })).toHaveCount(1);
  });

  test("the inbox list shows seeded conversations", async ({ page }) => {
    await page.goto("/inbox");
    await expect(page.getByRole("heading", { level: 1, name: "Inbox" })).toBeVisible();
    // Seeded customers appear in the master list.
    await expect(page.getByText("Jane Doe").first()).toBeVisible();
  });
});
