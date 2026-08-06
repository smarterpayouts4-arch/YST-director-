import { describe, expect, it } from "vitest";
import { redactDeep } from "@/ai/context/redact";
import { lintPromptContract } from "@/features/research-prompt-builder/validation/prompt-contract";

describe("injection red-team surfaces", () => {
  it("redacts obvious secret-like tokens before model context", () => {
    const packet = {
      note: "key sk-abcdefghijklmnopqrstuvwxyz123456",
      email: "owner@example.com",
    };
    const redacted = JSON.stringify(redactDeep(packet).value);
    expect(redacted).not.toMatch(/sk-[a-z0-9]{20,}/i);
    expect(redacted).toMatch(/REDACTED/);
  });

  it("flags video-production instructions as contract violations", () => {
    const bad = `# Title
## 1. ROLE AND EXPERTISE
Senior researcher
## 2. COMPANY CONTEXT
Audience customer moment with viewer reward and restriction labels.
## 3. OWNER-CONFIRMED DECISIONS
Owner confirmed.
## 4. WORKING HYPOTHESES
Working hypothesis A vs B.
## 5. RESEARCH QUESTIONS
What to research.
## 6. EVIDENCE AND RED-TEAM REQUIREMENTS
Seek disconfirming evidence. Classify direct, adjacent, aspirational competitors.
## 7. REQUIRED REPORT STRUCTURE
Deliver 3 content pillars with 2 experiments each, one primary platform, CTA hypothesis, success and failure criteria.
## 8. QUALITY CHECK BEFORE SUBMISSION
Return the completed research output only; do not propose additional workflows.
Also produce a seven-scene short video shot list with scroll-retention hooks.
`;
    const result = lintPromptContract(bad);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => /video production/i.test(i))).toBe(true);
  });
});
