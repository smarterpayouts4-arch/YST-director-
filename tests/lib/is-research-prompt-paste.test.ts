import { describe, expect, it } from "vitest";
import {
  isResearchPromptPaste,
  RESEARCH_PROMPT_PASTE_ERROR,
} from "@/features/research-prompt-builder/lib/is-research-prompt-paste";

const PROMPT = `# ZYNAVA Research

## 1. ROLE
Act as a researcher.

Return the completed research output only; do not propose additional workflows.`;

describe("isResearchPromptPaste", () => {
  it("rejects an exact paste of the exported research prompt", () => {
    expect(isResearchPromptPaste(PROMPT, PROMPT)).toBe(true);
  });

  it("rejects whitespace-only differences from the prompt", () => {
    expect(isResearchPromptPaste(`\n${PROMPT}\r\n`, PROMPT)).toBe(true);
    expect(isResearchPromptPaste(PROMPT.replace(/\n/g, "\r\n"), PROMPT)).toBe(true);
  });

  it("allows a completed ChatGPT research response", () => {
    const completed = `# Findings

Shoppers compare magnesium glycinate vs oxide before purchase.
Sources: https://example.com/study`;
    expect(isResearchPromptPaste(completed, PROMPT)).toBe(false);
  });

  it("exposes a clear owner-facing error string", () => {
    expect(RESEARCH_PROMPT_PASTE_ERROR).toMatch(/ChatGPT created response/i);
    expect(RESEARCH_PROMPT_PASTE_ERROR).toMatch(/not the research prompt/i);
  });
});
