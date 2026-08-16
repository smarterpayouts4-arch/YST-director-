export type PromptSection = {
  heading: string;
  body: string;
};

export function compilePromptSections(
  sections: readonly PromptSection[],
): string {
  return sections
    .map((section) => `# ${section.heading}\n${section.body.trim()}`)
    .join("\n\n");
}
