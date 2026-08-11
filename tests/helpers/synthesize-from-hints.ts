/**
 * Deterministic hint-follower for Prompt Contract reliability proofs.
 * Uses ONLY rendered hint strings + a structural skeleton — never reads
 * anchorPolicy / selectAnchorHints directly.
 */

import { formatResearchPrompt } from "@/features/research-prompt-builder/formatters/format-research-prompt";
import { makeFinalPrompt } from "../fixtures/api/final-prompt";

const STRUCTURAL_EVIDENCE_PAD =
  "Seek disconfirming evidence. Classify competitors into direct, adjacent, aspirational, and substitute classes. Cite sources. Require demand evidence and a pursue/reject/modify verdict per selected hypothesis. Capture customer language and category conventions and content gaps versus business opportunities.";

const STRUCTURAL_REPORT_PAD =
  "Deliver 3 content pillars with 2 experiments per pillar. Each experiment must establish an audience moment, a tension or planted question, a viewer reward for what the audience gains, evidence-backed research support or confidence, a commercial bridge or none warranted, success criteria, and failure criteria. Also require one primary platform and one report-level CTA hypothesis. Six experiments does not imply six distinct customer problems.";

/** Pull `"exact phrases"` listed in rendered checklist/repair hints. */
export function extractQuotedPhrases(hint: string): string[] {
  const out: string[] = [];
  const re = /"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(hint)) !== null) {
    if (match[1]?.trim()) out.push(match[1].trim());
  }
  return out;
}

/** Strip list markers and keep the actionable sentence body. */
export function normalizeHintBody(hint: string): string {
  return hint.replace(/^[-*]\s*/, "").trim();
}

/**
 * Build formatted markdown by embedding each rendered hint as a continuous
 * paragraph (space-joined, no blank lines) in the matching section field.
 */
export function synthesizeFromHints(hints: string[]): string {
  const evidenceParts: string[] = [STRUCTURAL_EVIDENCE_PAD];
  const reportParts: string[] = [STRUCTURAL_REPORT_PAD];

  for (const raw of hints) {
    const body = normalizeHintBody(raw);
    if (!body) continue;
    const phrases = extractQuotedPhrases(body);
    // Keep methodology wording from the hint; append exact phrases unquoted.
    const withoutQuotes = body.replace(/"/g, "");
    const phraseTail = phrases.length ? ` ${phrases.join(" ")}` : "";
    const paragraph = `${withoutQuotes}${phraseTail}`.replace(/\s+/g, " ").trim();

    if (/requiredReportStructure/i.test(body)) {
      reportParts.push(paragraph);
    } else if (/evidenceAndRedTeamRequirements/i.test(body)) {
      evidenceParts.push(paragraph);
    } else if (
      /hypothesis-blind|quotation discipline|evidence hierarchy|demand triangulation/i.test(
        body,
      )
    ) {
      evidenceParts.push(paragraph);
    } else if (/confidence|surprising findings/i.test(body)) {
      reportParts.push(paragraph);
    } else {
      // Non-anchored checklist lines: put global/structural requirements in both pads.
      evidenceParts.push(paragraph);
      reportParts.push(paragraph);
    }
  }

  return formatResearchPrompt(
    makeFinalPrompt({
      evidenceAndRedTeamRequirements: evidenceParts.join(" "),
      requiredReportStructure: reportParts.join(" "),
    }),
  );
}
