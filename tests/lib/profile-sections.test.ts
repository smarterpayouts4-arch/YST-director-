import { describe, expect, it } from "vitest";
import {
  PROFILE_SECTIONS,
  buildConfirmedProfile,
  getActiveProfileSections,
  getUnderstandingFields,
  sectionIsReviewed,
  sectionsReady,
} from "@/features/research-prompt-builder/lib/profile";
import { makeCompanyUnderstanding } from "../fixtures/api/company-understanding";

describe("profile confirmation sections", () => {
  it("always exposes exactly five sections with approved labels", () => {
    const fields = getUnderstandingFields(makeCompanyUnderstanding());
    const sections = getActiveProfileSections(fields);

    expect(sections).toHaveLength(5);
    expect(PROFILE_SECTIONS).toHaveLength(5);
    expect(sections.map((s) => s.id)).toEqual([
      "who_we_help",
      "company_and_offer",
      "focus_and_next",
      "trust_and_proof",
      "limits_and_notes",
    ]);
    expect(sections.map((s) => s.label)).toEqual([
      "Who we’re helping",
      "Company and offer",
      "Focus and next step",
      "Trust and proof",
      "Off-limits",
    ]);
  });

  it("keeps underlying IR field keys separate across sections", () => {
    const fields = getUnderstandingFields(makeCompanyUnderstanding());
    const sections = getActiveProfileSections(fields);
    const byId = Object.fromEntries(sections.map((s) => [s.id, s.fieldKeys]));

    expect(byId.who_we_help).toEqual(
      expect.arrayContaining(["likelyAudience", "customerProblem"]),
    );
    expect(byId.company_and_offer).toEqual(
      expect.arrayContaining(["companyName", "industry", "offer"]),
    );
    expect(byId.focus_and_next).toEqual(
      expect.arrayContaining(["geography", "websiteAction"]),
    );
    expect(byId.trust_and_proof).toEqual(
      expect.arrayContaining(["differentiator_0", "expertise_0"]),
    );
    expect(byId.limits_and_notes).toEqual(expect.arrayContaining(["claim_0"]));

    const allKeys = sections.flatMap((s) => s.fieldKeys);
    expect(new Set(allKeys).size).toBe(allKeys.length);
  });

  it("requires an explicit Looks right click even when a section has no array fields", () => {
    const understanding = makeCompanyUnderstanding({
      differentiators: [],
      expertiseSignals: [],
      claimsAndRestrictions: [],
    });
    const fields = getUnderstandingFields(understanding);
    const sections = getActiveProfileSections(fields);
    const limits = sections.find((s) => s.id === "limits_and_notes");
    expect(limits).toBeDefined();
    expect(limits!.fieldKeys).toEqual([]);

    const decisions = Object.fromEntries(
      fields.map((f) => [f.key, { status: "confirmed", value: f.field.value }]),
    );

    expect(sectionIsReviewed(limits!, decisions, {})).toBe(false);
    expect(
      sectionIsReviewed(limits!, decisions, { limits_and_notes: true }),
    ).toBe(true);
  });

  it("preserves corrected statuses when building the confirmed profile", () => {
    const understanding = makeCompanyUnderstanding();
    const fields = getUnderstandingFields(understanding);
    const decisions: Record<
      string,
      { status: "confirmed" | "corrected" | "rejected" | "unresolved"; value: string }
    > = Object.fromEntries(
      fields.map((f) => [f.key, { status: "confirmed" as const, value: f.field.value }]),
    );
    decisions.likelyAudience = {
      status: "corrected",
      value: "Health-curious parents comparing kids vitamins",
    };

    const profile = buildConfirmedProfile(
      understanding,
      decisions,
      "Focus on form education first",
    );

    expect(profile.fields.likelyAudience.status).toBe("corrected");
    expect(profile.fields.likelyAudience.value).toBe(
      "Health-curious parents comparing kids vitamins",
    );
    expect(profile.fields.companyName.status).toBe("confirmed");
    expect(profile.ownerNotes).toBe("Focus on form education first");
  });

  it("unlocks continue only when all five sections are confirmed", () => {
    const fields = getUnderstandingFields(makeCompanyUnderstanding());
    const sections = getActiveProfileSections(fields);
    const decisions = Object.fromEntries(
      fields.map((f) => [f.key, { status: "confirmed", value: f.field.value }]),
    );

    expect(sectionsReady(sections, decisions, {})).toBe(false);
    expect(
      sectionsReady(sections, decisions, {
        who_we_help: true,
        company_and_offer: true,
        focus_and_next: true,
        trust_and_proof: true,
      }),
    ).toBe(false);
    expect(
      sectionsReady(sections, decisions, {
        who_we_help: true,
        company_and_offer: true,
        focus_and_next: true,
        trust_and_proof: true,
        limits_and_notes: true,
      }),
    ).toBe(true);
  });
});
