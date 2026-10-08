import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils/cn";

// Stage-3 smoke test: confirms the toolchain (Vitest + @/ alias + jsdom) runs.
// Replaced/expanded by the real suites in Stage 5 (testing.md).
describe("scaffold", () => {
  it("merges class names and de-dupes conflicting Tailwind utilities", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-grey-900", false && "hidden")).toBe("text-grey-900");
  });
});
