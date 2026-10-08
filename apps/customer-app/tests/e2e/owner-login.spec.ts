import { test, expect } from "@playwright/test";

/**
 * Owner login → edit a policy panel → persists (testing.md §E2E). This requires a
 * real Supabase (auth + DB), so it is SKIPPED without env. The demo-mode editor
 * path in demo-stability.spec.ts covers the same UI without a backend.
 *
 * To run: point the app at a test Supabase and set the owner credentials:
 *   E2E_SUPABASE=1 E2E_OWNER_EMAIL=... E2E_OWNER_PASSWORD=... npm run test:e2e
 * (The app itself must be built with NEXT_PUBLIC_SUPABASE_URL / anon key set so it
 * runs in live mode rather than demo mode.)
 */
const LIVE = Boolean(
  process.env.E2E_SUPABASE && process.env.E2E_OWNER_EMAIL && process.env.E2E_OWNER_PASSWORD
);

test.describe("Owner login → edit → persists (live auth)", () => {
  test.skip(!LIVE, "Needs E2E_SUPABASE + E2E_OWNER_EMAIL + E2E_OWNER_PASSWORD against a test Supabase.");

  test("owner signs in, edits identity, and the change persists after reload", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_OWNER_EMAIL as string);
    await page.getByLabel("Password").fill(process.env.E2E_OWNER_PASSWORD as string);
    await page.getByRole("button", { name: /^Sign in$/ }).click();

    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/profile");
    // No demo banner in live mode.
    await expect(page.getByText(/Demo mode/)).toHaveCount(0);

    const marker = `Acme Plumbing ${Date.now()}`;
    await page.getByLabel("Business name").fill(marker);
    await page.getByRole("button", { name: /Save changes/i }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    // Reload and confirm the write persisted to the DB.
    await page.reload();
    await expect(page.getByLabel("Business name")).toHaveValue(marker);
  });
});
