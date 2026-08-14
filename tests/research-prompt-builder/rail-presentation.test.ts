import { describe, expect, it } from "vitest";
import { railPresentation } from "@/features/research-prompt-builder/components/rail-presentation";

describe("railPresentation", () => {
  it("keeps Research open and Social Media quiet upcoming while unsettled (Topics)", () => {
    const p = railPresentation({
      activeId: "topics",
      researchSettled: false,
    });
    expect(p.headerMode).toBe("step");
    expect(p.activeStep).toBe(7);
    expect(p.foundationComplete).toBe(true);
    expect(p.researchOpen).toBe(true);
    expect(p.researchComplete).toBe(false);
    expect(p.socialMedia.state).toBe("upcoming");
    expect(p.socialMedia.emphasizedNext).toBe(false);
  });

  it("settles Research and opens next-chapter header when Topic Packet exists", () => {
    const p = railPresentation({
      activeId: "atom",
      researchSettled: true,
    });
    expect(p.headerMode).toBe("next-chapter");
    expect(p.researchOpen).toBe(false);
    expect(p.researchComplete).toBe(true);
    expect(p.socialMedia.state).toBe("upcoming");
    expect(p.socialMedia.emphasizedNext).toBe(true);
    // Ready Atom (TE): Social Media is next, not current / Step 09
    expect(p.socialMedia.state).not.toBe("current");
  });

  it("marks Social Media current on channel surfaces (no Next-chapter fluff)", () => {
    const p = railPresentation({
      activeId: "atom",
      researchSettled: true,
      channelActive: true,
    });
    expect(p.headerMode).toBe("chapter");
    expect(p.researchComplete).toBe(true);
    expect(p.socialMedia.state).toBe("current");
    expect(p.socialMedia.emphasizedNext).toBe(false);
  });

  it("reopens Research when returning to Topics (settlement cleared)", () => {
    const p = railPresentation({
      activeId: "topics",
      researchSettled: false,
    });
    expect(p.headerMode).toBe("step");
    expect(p.researchOpen).toBe(true);
    expect(p.researchComplete).toBe(false);
    expect(p.socialMedia.emphasizedNext).toBe(false);
  });

  it("does not settle Research for atom without researchSettled", () => {
    const p = railPresentation({
      activeId: "atom",
      researchSettled: false,
    });
    expect(p.headerMode).toBe("step");
    expect(p.researchOpen).toBe(true);
    expect(p.researchComplete).toBe(false);
    expect(p.socialMedia.emphasizedNext).toBe(false);
  });

  it("keeps Librarian unsettled with Research open", () => {
    const p = railPresentation({
      activeId: "librarian",
      researchSettled: false,
    });
    expect(p.headerMode).toBe("step");
    expect(p.activeStep).toBe(6);
    expect(p.researchOpen).toBe(true);
    expect(p.socialMedia.emphasizedNext).toBe(false);
  });
});
