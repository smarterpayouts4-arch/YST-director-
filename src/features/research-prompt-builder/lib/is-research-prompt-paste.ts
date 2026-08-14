/**
 * Detect when the owner pasted the exported research assignment
 * into the "completed research" handoff instead of the ChatGPT response.
 */
export function isResearchPromptPaste(paste: string, researchPrompt: string): boolean {
  const a = paste.trim().replace(/\r\n/g, "\n");
  const b = researchPrompt.trim().replace(/\r\n/g, "\n");
  if (!a || !b) return false;
  if (a === b) return true;
  // Clipboard / editor whitespace differences only
  if (a.replace(/\s+/g, " ") === b.replace(/\s+/g, " ")) return true;
  return false;
}

export const RESEARCH_PROMPT_PASTE_ERROR =
  "Please insert the ChatGPT created response from the prompt that you initially gave — not the research prompt itself.";
