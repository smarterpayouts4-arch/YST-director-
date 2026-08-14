import type { PromptContextPacket } from "@/ai/context";
import type { CompanyAnchors } from "@/features/research-prompt-builder/lib/company-anchors";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";
import {
  SHARED_ANALYST_PERSONA,
  wrapUntrustedJson,
} from "@/features/research-prompt-builder/prompts/shared-guardrails";
import { renderCompilerChecklist } from "@/features/research-prompt-builder/validation/prompt-contract-rules";

export function buildResearchPromptCompilerPrompt(input: {
  contextPacket: PromptContextPacket;
  anchors?: CompanyAnchors;
}) {
  const instructions = [
    SHARED_ANALYST_PERSONA,
    "",
    "Outcome: Produce structured sections for one copy-ready ChatGPT research prompt.",
    "",
    "Density: Be concise and information-dense. Use extra length only where company-specific research controls, evidence requirements, or report instructions require it. Do not repeat methodology.",
    "",
    "Narrative governance:",
    "- Audience-first / customer moment: open company context and research questions with audience tension, not company promo.",
    "- Frame research as evidence-seeking with contested or unclear claims — not as confirmation of preferred angles.",
    "- Require a distinct educational angle (category of one), not generic industry content.",
    "- Provenance labels: distinguish observed fact vs owner-confirmed decision vs working hypothesis vs research question vs restriction.",
    "",
    "Research protocol order inside the exported prompt:",
    "1) Hypothesis-blind / neutral discovery for this company's category, audience, and market",
    "2) Evaluate supplied hypotheses (see packet.suppliedAssumptions) without preferential treatment",
    "3) Demand triangulation (multi-signal; content gap alone is not demand)",
    "4) Evidence hierarchy (quantity is not quality)",
    "5) Disconfirming evidence and competitor classification",
    "6) Confidence (High/Medium/Low) plus what evidence would change each major conclusion",
    "7) Surprising findings against supplied assumption ids (no quota manufacturing)",
    "",
    "Structural deliverables:",
    "- Provide exactly 3 content pillars with exactly 2 experiments under each pillar (6 total).",
    "- Treat each experiment as a selectable, evidence-backed content opportunity — not merely a measurement plan.",
    "- Opportunity first: for each experiment establish topic (subject being explored); audience moment (concrete evidence-supported decision — not a generic advice shell); tension (observed or explicitly hypothesized; do not infer severity beyond the evidence); planted question (curiosity mechanism created by the tension — not a restatement of topic); viewer reward; evidence basis (what supports it; observed vs hypothesis); confidence (High/Medium/Low + why + what would materially change it); restrictions (contextual; shared OK — no artificial uniqueness); one commercial bridge after reward (may be a testable hypothesis) or \"none warranted\"; then success criteria, failure criteria, and minimum useful metrics.",
    "- Discover topics/tensions/questions from research. Do not invent misconceptions or generic advice shells to fill six slots. If evidence supports fewer distinct tensions, vary moment, planted question, evidence angle, viewer reward, or comparison frame. Six experiments does not imply six distinct customer problems.",
    "- The opportunity comes first. Measurement validates it; it does not define it. Per experiment: one commercial bridge after value (or \"none warranted\") — do not require a second duplicative per-experiment CTA field. Report-level: one primary platform and one strategic CTA hypothesis from the research (including none/weak when unsupported).",
    "- Stop line in qualityCheckBeforeSubmission: return the completed research output only; do not propose additional workflows. (Formatter appends an anti-meta footer — still include the stop line in §8.)",
    "",
    "Paragraph discipline for export-gate controls:",
    "- Keep evidenceAndRedTeamRequirements and requiredReportStructure as continuous prose.",
    "- Do not insert blank lines between research-control sentences; blank lines split paragraphs and break the same-paragraph company-token lint.",
    "- Each research-control requirement must be one continuous paragraph containing both the methodology phrase and the listed distinctive phrases.",
    "",
    "Must-include checklist (export gate — put these into the relevant section bodies; instantiate with this company's particulars, not boilerplate):",
    ...renderCompilerChecklist(input.anchors),
    "",
    "Do not invent rejected fields. Do not dump raw CSV.",
    "Do not include video production, scripts, shot lists, or scroll-retention instructions.",
    `Prompt version: ${RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const user = [
    "Compile the final research prompt sections.",
    "Satisfy the must-include checklist in the section bodies so the formatted Markdown passes the export contract lint.",
    "Instantiate every research-control requirement using this company's category, audience, geography, offer, customer moment, or hypotheses from the packet — never as company-agnostic boilerplate.",
    "When the checklist lists exact phrases for a control, embed those exact phrases in the same continuous paragraph as that control's methodology sentence.",
    wrapUntrustedJson("PROMPT_COMPILER_INPUT", {
      packet: input.contextPacket.packet,
      provenanceNotes: input.contextPacket.provenanceNotes,
      truncationWarnings: input.contextPacket.truncationWarnings,
    }),
  ].join("\n\n");

  return { instructions, input: user };
}
