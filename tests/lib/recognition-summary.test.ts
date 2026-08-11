import { describe, expect, it } from "vitest";
import { selectRecognitionItems } from "@/features/research-prompt-builder/lib/recognition-summary";
import { makeCompanyUnderstanding } from "../fixtures/api/company-understanding";

describe("selectRecognitionItems", () => {
  it("selects at most 8 items and never dumps every generated field", () => {
    const understanding = makeCompanyUnderstanding();
    const items = selectRecognitionItems(understanding);
    expect(items.length).toBeLessThanOrEqual(8);
    expect(items.length).toBeGreaterThan(0);
    const supported = items.filter((i) => i.bucket === "supported_by_file");
    const worth = items.filter((i) => i.bucket === "worth_checking");
    const research = items.filter((i) => i.bucket === "research_should_investigate");
    expect(supported.length).toBeLessThanOrEqual(3);
    expect(worth.length).toBeLessThanOrEqual(2);
    expect(research.length).toBeLessThanOrEqual(3);
  });
});
