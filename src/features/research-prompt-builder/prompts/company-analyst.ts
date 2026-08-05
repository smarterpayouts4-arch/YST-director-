import type { CsvEvidencePacket } from "@/features/research-prompt-builder/schemas";
import { RUNTIME_PROMPT_VERSION } from "@/features/research-prompt-builder/prompts/prompt-version";
import {
  SHARED_ANALYST_PERSONA,
  wrapUntrustedJson,
} from "@/features/research-prompt-builder/prompts/shared-guardrails";

export function buildCompanyAnalystPrompt(evidence: CsvEvidencePacket) {
  const instructions = [
    SHARED_ANALYST_PERSONA,
    "",
    "Outcome: Convert the evidence packet into a structured company understanding.",
    "Separate observed facts, working assumptions, and important unknowns.",
    "Do not invent demographics, traffic claims, or strategy without evidence.",
    "Cite evidence references for material fields.",
    "Identify regulated or sensitive-industry concerns when present.",
    `Prompt version: ${RUNTIME_PROMPT_VERSION}`,
  ].join("\n");

  const input = [
    "Task: Analyze this company evidence packet and return only the structured company understanding.",
    wrapUntrustedJson("EVIDENCE_PACKET", {
      fileName: evidence.fileName,
      headers: evidence.headers,
      columnSummaries: evidence.columnSummaries,
      evidenceRows: evidence.evidenceRows,
      warnings: evidence.warnings,
      wasTruncated: evidence.wasTruncated,
    }),
  ].join("\n\n");

  return { instructions, input };
}
