import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PricingTable } from "@/components/marketing/PricingTable";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { pricingTiers } from "@/content/pricing";
import { capabilityComparison } from "@/content/comparison";

describe("Button (R3)", () => {
  it("renders an anchor when href is provided", () => {
    render(<Button href="/pricing">See pricing</Button>);
    const link = screen.getByRole("link", { name: "See pricing" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/pricing");
  });

  it("renders a button and applies disabled state when no href", () => {
    render(
      <Button type="submit" disabled>
        Submit
      </Button>
    );
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});

describe("Badge", () => {
  it("applies the tone's classes", () => {
    render(<Badge tone="green">Live</Badge>);
    const badge = screen.getByText("Live");
    expect(badge).toHaveClass("bg-green-50", "border-green-200", "text-green-700");
  });
});

describe("Card", () => {
  it("applies the brand border when highlighted", () => {
    const { container } = render(<Card highlight>Highlighted</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveClass("border-2", "border-brand");
  });
});

describe("PricingTable", () => {
  it("renders a card per tier and the Most popular badge once", () => {
    render(<PricingTable tiers={pricingTiers} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(pricingTiers.length);
    expect(screen.getAllByText("Most popular")).toHaveLength(1);
  });
});

describe('ComparisonTable variant="capability"', () => {
  it("renders a row per capabilityComparison entry with yes/no indicators", () => {
    const { container } = render(
      <ComparisonTable
        variant="capability"
        rows={capabilityComparison}
        colA="Handled"
        colB="A receptionist"
      />
    );
    const table = container.querySelector("table") as HTMLTableElement;
    expect(table).toBeTruthy();
    const bodyRows = table.querySelectorAll("tbody tr");
    expect(bodyRows).toHaveLength(capabilityComparison.length);

    // Booleans render check/x icons with sr-only "Yes"/"No" accessible labels.
    const scoped = within(table);
    expect(scoped.getAllByText("Yes").length).toBeGreaterThan(0);
    expect(scoped.getAllByText("No").length).toBeGreaterThan(0);
  });
});
