import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages: [name: string, path: string][] = [
  ["Home", "/"],
  ["Pricing", "/pricing"],
  ["Why Handled", "/why-handled"],
  ["Contact", "/contact"],
  ["Features", "/features"]
];

for (const [name, path] of pages) {
  test(`${name} has no serious or critical a11y violations (R30)`, async ({ page }) => {
    await page.goto(path);

    // @axe-core/playwright bundles its own playwright-core, whose Page type differs
    // from @playwright/test's. Cast through the constructor's own parameter type.
    const results = await new AxeBuilder({
      page
    } as unknown as ConstructorParameters<typeof AxeBuilder>[0])
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    expect(
      blocking,
      JSON.stringify(
        blocking.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
        null,
        2
      )
    ).toEqual([]);
  });
}
