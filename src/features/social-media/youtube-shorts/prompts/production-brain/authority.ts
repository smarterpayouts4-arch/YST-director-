export const PRODUCTION_AUTHORITY = [
  "The storyboard block is the approved story. Use it as read-only context.",
  "situationLock is the machine WHAT. Scene Description is the human-readable visible event. Narration is heard. On-Screen Text is overlay.",
  "visualPrompt must serve situationLock plus those three. It may never rewrite, return, mutate, summarize, or substitute situationLock, Scene Description, Narration, or On-Screen Text.",
  "Role, Purpose, Timing, and storyArchitecture may be read. They may never be rewritten, returned, mutated, summarized, or substituted.",
].join("\n");
