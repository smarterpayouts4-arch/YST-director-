import { describe, expect, it } from "vitest";
import { formatResearchPrompt } from "@/features/research-prompt-builder/formatters/format-research-prompt";
import {
  buildCompanyAnchors,
  emptyCompanyAnchors,
  stripAnchors,
} from "@/features/research-prompt-builder/lib/company-anchors";
import { lintPromptContract } from "@/features/research-prompt-builder/validation/prompt-contract";
import { makeConfirmedProfile } from "../fixtures/api/confirmed-profile";
import { makeFinalPrompt } from "../fixtures/api/final-prompt";
import { makeResearchBrief } from "../fixtures/api/research-brief";
import {
  ANCHOR_TEST_ARCHETYPES,
  buildArchetypeAnchors,
  buildArchetypePrompt,
} from "../helpers/anchor-test-archetypes";
import { renderCompilerChecklist } from "@/features/research-prompt-builder/validation/prompt-contract-rules";

describe("prompt contract anchored controls", () => {
  it("ZYNAVA fixture passes under its own anchors", () => {
    const md = formatResearchPrompt(makeFinalPrompt());
    const anchors = buildCompanyAnchors(
      makeConfirmedProfile(),
      makeResearchBrief(),
    );
    const result = lintPromptContract(md, { anchors });
    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.anchorCoverage.length).toBeGreaterThanOrEqual(6);
    expect(result.anchorCoverage.every((c) => c.satisfied)).toBe(true);
  });

  it.each(ANCHOR_TEST_ARCHETYPES)(
    "$id: own anchors PASS, cross-company FAIL, stripped FAIL",
    (arch) => {
      const md = formatResearchPrompt(buildArchetypePrompt(arch));
      const own = buildArchetypeAnchors(arch);
      const other =
        arch.id === "supplement"
          ? buildArchetypeAnchors(ANCHOR_TEST_ARCHETYPES[1]!)
          : buildArchetypeAnchors(ANCHOR_TEST_ARCHETYPES[0]!);

      const ownResult = lintPromptContract(md, { anchors: own });
      expect(ownResult.ok, ownResult.issues.join("; ")).toBe(true);

      const swapResult = lintPromptContract(md, { anchors: other });
      expect(swapResult.ok).toBe(false);
      expect(
        swapResult.issues.some((issue) => /anchor coverage insufficient/i.test(issue)),
      ).toBe(true);

      const stripped = stripAnchors(md, own);
      const mutationResult = lintPromptContract(stripped, { anchors: own });
      expect(mutationResult.ok).toBe(false);
      expect(
        mutationResult.issues.some((issue) =>
          /anchor coverage insufficient/i.test(issue),
        ),
      ).toBe(true);
    },
  );

  it("reports degraded coverage when required buckets are empty", () => {
    const md = formatResearchPrompt(makeFinalPrompt());
    const thin = emptyCompanyAnchors();
    thin.company = ["zynava"];
    // industry/audience/geography empty → blind-discovery degrades
    thin.hypotheses = ["form decoding education"];
    thin.customerMoment = ["form and label comparison"];
    thin.offer = ["supplement search"];
    const result = lintPromptContract(md, { anchors: thin });
    const blind = result.anchorCoverage.find(
      (c) => c.ruleId === "hypothesis_blind_discovery",
    );
    expect(blind).toBeTruthy();
    expect(blind!.degraded).toBe(true);
  });

  it("live-shaped boilerplate: phrase match without co-located anchors fails with exact issue shape", () => {
    // Geography empty (CSV path); industry-only in blind paragraph; surprising findings
    // names assumption ids but no hypothesis phrases — mirrors the live Zynava failure.
    const anchors = buildCompanyAnchors(
      makeConfirmedProfile(),
      makeResearchBrief(),
    );
    anchors.geography = [];

    const md = formatResearchPrompt(
      makeFinalPrompt({
        evidenceAndRedTeamRequirements: [
          "Label every claim as observed fact, owner-confirmed decision, working hypothesis, or research question.",
          "Hypothesis-blind discovery: before evaluating the supplied hypotheses, run a neutral scan of dietary supplements category, customer language, search behavior, competitor positioning, and recurring decision problems. Do not give supplied hypotheses preferential treatment.",
          "",
          "Quotation discipline: present language as a direct customer quote only when the exact words are present in a cited source; otherwise label it as a paraphrased language pattern. Never manufacture representative customer quotations.",
          "",
          "Evidence hierarchy: do not allow many weak commercial sources to outweigh one strong primary or authoritative source. Evidence quantity is not evidence quality. When sources disagree, explain the disagreement rather than averaging them.",
          "",
          "Demand triangulation: treat demand as multi-signal evidence. Look for convergence among search behavior, recurring questions, marketplace behavior, survey/research evidence, competitor investment, community discussion, and commercial intent. A content gap alone is not demand. Search volume alone is not business opportunity.",
          "",
          "Red-team each selected strategic hypothesis: find supporting evidence and disconfirming evidence, then issue a pursue/reject/modify verdict. Cite sources. Require demand evidence. Classify every competitor as direct, adjacent, aspirational, or substitute.",
        ].join("\n\n"),
        requiredReportStructure: [
          "The report must contain executive summary, demand synthesis, competitor landscape, and per-hypothesis investigation.",
          "",
          "For every major conclusion, assign High / Medium / Low confidence and state what additional evidence would most likely change the conclusion.",
          "",
          "Report up to 3–5 material surprising findings that contradict, complicate, or substantially expand the supplied assumptions (including hypothesis:contentHypothesis and hypothesis:challengeHypothesis). Do not manufacture surprising findings to satisfy a quota. If fewer than three are genuinely supported, report fewer and explain why. Each finding must name which supplied assumption id it affects.",
          "",
          "Deliver 3 content pillars with 2 experiments per pillar. Each experiment must establish an audience moment, a tension or planted question, a viewer reward for what the audience gains, evidence-backed research support or confidence, success criteria, and failure criteria. Also require one primary platform, one CTA hypothesis, customer language, category conventions, and content gaps versus business opportunities.",
        ].join("\n\n"),
      }),
    );

    // Without anchors, structural phrase gates still pass.
    expect(lintPromptContract(md).ok).toBe(true);

    const result = lintPromptContract(md, { anchors });
    expect(result.ok).toBe(false);

    const blindIssue = result.issues.find((i) =>
      i.startsWith("Missing hypothesis-blind / neutral discovery requirement."),
    );
    expect(blindIssue).toBeTruthy();
    expect(blindIssue!).toMatch(/need 2 bucket\(s\).*matched 1 bucket\(s\)/i);
    expect(blindIssue!).not.toMatch(/degraded thin-CSV anchors/i);

    const surpriseIssue = result.issues.find((i) =>
      i.startsWith(
        "Missing surprising-findings / supplied-assumption reference requirement.",
      ),
    );
    expect(surpriseIssue).toBeTruthy();
    expect(surpriseIssue!).toMatch(/need 1 bucket\(s\).*matched 0 bucket\(s\)/i);
    expect(surpriseIssue!).not.toMatch(/degraded thin-CSV anchors/i);
  });

  it("compiler checklist without anchors still renders, and with anchors adds exact phrases", () => {
    const plain = renderCompilerChecklist();
    expect(plain.some((line) => /Hypothesis-blind discovery/i.test(line))).toBe(true);
    expect(plain.join("\n")).not.toMatch(/Same continuous paragraph/);

    const anchors = buildCompanyAnchors(
      makeConfirmedProfile(),
      makeResearchBrief(),
    );
    const withAnchors = renderCompilerChecklist(anchors).join("\n");
    expect(withAnchors).toMatch(/same continuous paragraph/i);
    expect(withAnchors).toMatch(/"/); // quoted phrases
  });
});
