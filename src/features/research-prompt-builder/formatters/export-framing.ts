/**
 * Deterministic clipboard framing for ChatGPT execution.
 * Source of truth for anti-meta / execute-now contract — not LLM-generated.
 */

export const RESEARCH_PROMPT_EXECUTE_PREAMBLE = [
  "EXECUTE THIS RESEARCH NOW.",
  "",
  "Produce the full decision report required in section 7.",
  "Do not ask clarifying questions.",
  "Do not ask what I want you to do with this brief.",
  "Do not offer to critique, tighten, rewrite, summarize, or convert this prompt.",
  "If information is unavailable, record the limitation in the report and continue.",
  "Return only the completed research report.",
].join("\n");

export const RESEARCH_PROMPT_STOP_FOOTER = [
  "Return the completed research output only.",
  "Do not ask follow-up questions.",
  "Do not ask what the user would like you to do.",
  "Do not offer alternative workflows, critiques, rewrites, summaries, or next steps.",
  "If evidence is unavailable or inconclusive, state that within the required report and continue.",
].join("\n");
