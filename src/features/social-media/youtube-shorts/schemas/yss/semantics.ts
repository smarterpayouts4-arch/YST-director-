import type {
  StoryboardPhraseSources,
  YouTubeShortsStoryboard,
  YouTubeShortsStoryboardScene,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

export const NARRATION_MAX_SENTENCES = 2;
export const NARRATION_MAX_WORDS = 22;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "can",
  "do",
  "for",
  "from",
  "has",
  "have",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "not",
  "of",
  "on",
  "or",
  "same",
  "that",
  "the",
  "then",
  "this",
  "to",
  "was",
  "when",
  "with",
  "you",
  "your",
]);

function contentTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 4 && !STOP_WORDS.has(token)),
  );
}

function hasContentTokens(text: string): boolean {
  return contentTokens(text).size > 0;
}

function hasTokenOverlap(left: string, right: string): boolean {
  const a = contentTokens(left);
  const b = contentTokens(right);
  for (const token of a) {
    if (b.has(token)) return true;
  }
  return false;
}

/** Skip overlap when the architecture source has no ≥4-char content tokens. */
function requireTokenOverlap(
  source: string,
  haystack: string,
  issue: string,
  issues: string[],
): void {
  if (!hasContentTokens(source)) return;
  if (!hasTokenOverlap(source, haystack)) issues.push(issue);
}

/** Carrier may be paraphrased; require most distinctive words, not the exact phrase. */
function hasCarrierCoverage(carrier: string, haystack: string): boolean {
  const needed = [...contentTokens(carrier)];
  if (needed.length === 0) {
    return haystack.includes(carrier.trim().toLowerCase());
  }
  const found = needed.filter((token) => contentTokens(haystack).has(token));
  const required = needed.length === 1 ? 1 : Math.ceil(needed.length / 2);
  return found.length >= required;
}

function sceneText(
  scene: YouTubeShortsStoryboardScene,
  fields: Array<keyof YouTubeShortsStoryboardScene>,
): string {
  return fields.map((field) => String(scene[field] ?? "")).join(" ");
}

function phraseWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 0);
}

function isContentToken(word: string): boolean {
  return word.length >= 4 && !STOP_WORDS.has(word);
}

/** Adjacent content-token pairs in narration (topic-agnostic concept-name signature). */
function contentTokenBigrams(text: string): Set<string> {
  const words = phraseWords(text);
  const grams = new Set<string>();
  for (let i = 0; i < words.length - 1; i += 1) {
    const left = words[i];
    const right = words[i + 1];
    if (!left || !right || !isContentToken(left) || !isContentToken(right)) {
      continue;
    }
    grams.add(`${left} ${right}`);
  }
  return grams;
}

function bigramUsesCarrierToken(bigram: string, carrierTokens: Set<string>): boolean {
  if (carrierTokens.size === 0) return false;
  const [left, right] = bigram.split(" ");
  return Boolean(
    (left && carrierTokens.has(left)) || (right && carrierTokens.has(right)),
  );
}

const SOURCE_EXCERPT_MAX_CHARS = 64;

function sourceExcerpt(text: string): string {
  const collapsed = text.trim().replace(/\s+/g, " ");
  if (collapsed.length <= SOURCE_EXCERPT_MAX_CHARS) return collapsed;
  return `${collapsed.slice(0, SOURCE_EXCERPT_MAX_CHARS).trimEnd()}…`;
}

/** First matching minWords run, or null. Predicate unchanged from 1.5.0. */
export function firstCopiedSourcePhrase(
  source: string,
  dest: string,
  minWords = 5,
  distinctiveness = false,
): string | null {
  const src = phraseWords(source);
  const destWords = phraseWords(dest);
  if (src.length < minWords || destWords.length < minWords) return null;
  const destGrams = new Set<string>();
  for (let i = 0; i <= destWords.length - minWords; i += 1) {
    destGrams.add(destWords.slice(i, i + minWords).join(" "));
  }
  for (let i = 0; i <= src.length - minWords; i += 1) {
    const gram = src.slice(i, i + minWords).join(" ");
    if (!destGrams.has(gram)) continue;
    if (!distinctiveness || contentTokens(gram).size >= 2) return gram;
  }
  return null;
}

/** True when dest copies minWords consecutive words from source. */
export function narrationCopiesSourcePhrase(
  source: string,
  dest: string,
  minWords = 5,
  distinctiveness = false,
): boolean {
  return firstCopiedSourcePhrase(source, dest, minWords, distinctiveness) !== null;
}

export function countNarrationSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/[.!?]+(?:\s+|$)/).filter((part) => part.trim().length > 0)
    .length;
}

export function countNarrationWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const ORDINAL_CHECKLIST_JOB =
  /\b(?:first|second|third|fourth|fifth|sixth|seventh)\s+(?:check|match|step)\b|\bstep\s+[1-7]\b/i;

export function isOrdinalChecklistJob(job: string): boolean {
  return ORDINAL_CHECKLIST_JOB.test(job);
}

type NamedPhraseSource = {
  name: string;
  text: string;
  minSourceWords: number;
  distinctiveness: boolean;
};

function namedPhraseSources(phrases?: StoryboardPhraseSources): NamedPhraseSource[] {
  const core: Array<[string, string | undefined]> = [
    ["tension", phrases?.tension],
    ["desiredTakeaway", phrases?.desiredTakeaway],
    ["decisionQuestion", phrases?.decisionQuestion],
  ];
  const long: Array<[string, string | undefined]> = [
    ["premise", phrases?.premise],
    ["whyItMatters", phrases?.whyItMatters],
    ["opportunity", phrases?.opportunity],
    ...(phrases?.supportingInsights ?? []).map(
      (text): [string, string] => ["supportingInsights", text],
    ),
    ...(phrases?.evidenceQuotes ?? []).map(
      (text): [string, string] => ["evidenceQuotes", text],
    ),
  ];
  return [
    ...core
      .filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()))
      .map(([name, text]) => ({
        name,
        text,
        minSourceWords: 5,
        distinctiveness: false,
      })),
    ...long
      .filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()))
      .filter(([, text]) => phraseWords(text).length >= 8)
      .map(([name, text]) => ({
        name,
        text,
        minSourceWords: 5,
        distinctiveness: true,
      })),
  ];
}

export function validateStoryboardShape(
  board: YouTubeShortsStoryboard,
): string[] {
  const issues: string[] = [];
  if (board.scenes.length !== 7) {
    issues.push("Storyboard must contain exactly 7 scenes.");
  }
  const numbers = board.scenes.map((scene) => scene.sceneNumber).sort();
  if (numbers.join(",") !== "1,2,3,4,5,6,7") {
    issues.push("sceneNumber must be exactly 1 through 7.");
  }
  return issues;
}

/** Deterministic story-lock checks. Topic-agnostic. No second model. */
export function validateStoryboardSemantics(
  board: YouTubeShortsStoryboard,
  phrases?: StoryboardPhraseSources,
): string[] {
  const issues: string[] = [];
  const architecture = board.storyArchitecture;
  if (!architecture) {
    issues.push("storyArchitecture is required for a new storyboard.");
    return issues;
  }

  const beatNumbers = architecture.beats.map((beat) => beat.sceneNumber).sort();
  if (beatNumbers.join(",") !== "1,2,3,4,5,6,7") {
    issues.push("storyArchitecture.beats must be sceneNumber 1 through 7.");
  }

  if (architecture.carrierMode === "single") {
    if (!architecture.primaryCarrier.trim()) {
      issues.push("carrierMode single requires a nonempty primaryCarrier.");
    }
    if (architecture.comparisonCarriers.length > 0) {
      issues.push("carrierMode single must not list comparisonCarriers.");
    }
    const opening = board.scenes
      .filter((scene) => scene.sceneNumber <= 3)
      .map((scene) =>
        sceneText(scene, ["purpose", "narration", "sceneDescription"]),
      )
      .join(" ")
      .toLowerCase();
    if (
      architecture.primaryCarrier.trim() &&
      !hasCarrierCoverage(architecture.primaryCarrier, opening)
    ) {
      issues.push(
        "primaryCarrier must be grounded in scenes 1–3 (distinctive words, not a delayed example).",
      );
    }
  }

  if (architecture.carrierMode === "declared_comparison") {
    if (architecture.comparisonCarriers.length < 2) {
      issues.push(
        "carrierMode declared_comparison requires at least two comparisonCarriers.",
      );
    }
  }

  if (architecture.carrierMode === "none" && architecture.primaryCarrier.trim()) {
    issues.push("carrierMode none must leave primaryCarrier empty.");
  }

  const later = board.scenes.filter((scene) => scene.sceneNumber >= 2);
  for (const excluded of architecture.excludedCarriers) {
    const needle = excluded.trim().toLowerCase();
    if (!needle) continue;
    const hijack = later.some((scene) =>
      sceneText(scene, ["purpose", "narration", "onScreenText"])
        .toLowerCase()
        .includes(needle),
    );
    if (hijack) {
      issues.push(
        "An excludedCarrier appears in a later scene purpose, narration, or on-screen text.",
      );
    }
  }

  const scene1 = board.scenes.find((scene) => scene.sceneNumber === 1);
  const scene7 = board.scenes.find((scene) => scene.sceneNumber === 7);
  if (scene1) {
    requireTokenOverlap(
      architecture.openingQuestion,
      `${scene1.purpose} ${scene1.sceneDescription}`,
      "Scene 1 purpose or sceneDescription must overlap the locked openingQuestion.",
      issues,
    );
  }
  if (scene7) {
    requireTokenOverlap(
      architecture.payoff,
      `${scene7.purpose} ${scene7.sceneDescription}`,
      "Scene 7 purpose or sceneDescription must overlap the locked payoff.",
      issues,
    );
  }
  if (scene1 && scene7) {
    const driftSources = [scene1.narration, architecture.primaryCarrier].filter(
      (text) => hasContentTokens(text),
    );
    if (
      driftSources.length > 0 &&
      !driftSources.some((source) => hasTokenOverlap(source, scene7.narration))
    ) {
      issues.push(
        "scenes[7].narration must share a content token with scenes[1].narration or primaryCarrier.",
      );
    }
  }

  for (const beat of architecture.beats) {
    if (isOrdinalChecklistJob(beat.job)) {
      issues.push(
        `storyArchitecture.beats[${beat.sceneNumber}].job is an ordinal checklist label.`,
      );
    }
    const scene = board.scenes.find(
      (item) => item.sceneNumber === beat.sceneNumber,
    );
    if (scene) {
      requireTokenOverlap(
        beat.job,
        scene.purpose,
        `Scene ${beat.sceneNumber} purpose must overlap its storyArchitecture beat job.`,
        issues,
      );
    }
    if (beat.sceneNumber >= 2 && !beat.because?.trim()) {
      issues.push(
        `storyArchitecture.beats[${beat.sceneNumber}].because must be nonempty for scenes 2–7.`,
      );
    }
  }

  for (const scene of board.scenes) {
    const sentences = countNarrationSentences(scene.narration);
    const words = countNarrationWords(scene.narration);
    if (sentences > NARRATION_MAX_SENTENCES) {
      issues.push(
        `scenes[${scene.sceneNumber}].narration exceeds ${NARRATION_MAX_SENTENCES} sentences.`,
      );
    }
    if (words > NARRATION_MAX_WORDS) {
      issues.push(
        `scenes[${scene.sceneNumber}].narration exceeds ${NARRATION_MAX_WORDS} words.`,
      );
    }
  }

  const carrierTokens = contentTokens(architecture.primaryCarrier);
  const repeatedBigramScenes = new Map<string, number[]>();
  for (const scene of board.scenes) {
    for (const bigram of contentTokenBigrams(scene.narration)) {
      if (bigramUsesCarrierToken(bigram, carrierTokens)) continue;
      const scenes = repeatedBigramScenes.get(bigram) ?? [];
      scenes.push(scene.sceneNumber);
      repeatedBigramScenes.set(bigram, scenes);
    }
  }
  const echoed = [...repeatedBigramScenes.entries()]
    .filter(([, scenes]) => scenes.length >= 3)
    .sort((left, right) => {
      const leftFirst = left[1][0] ?? 0;
      const rightFirst = right[1][0] ?? 0;
      if (leftFirst !== rightFirst) return leftFirst - rightFirst;
      return left[0].localeCompare(right[0]);
    });
  for (const [bigram, scenes] of echoed) {
    const listed = [...scenes].sort((a, b) => a - b).join(", ");
    issues.push(
      `narration repeats the phrase "${bigram}" across scenes ${listed} — rename it in viewer language.`,
    );
  }

  const sources = namedPhraseSources(phrases);
  for (const scene of board.scenes) {
    for (const field of ["narration", "onScreenText"] as const) {
      const dest = scene[field];
      if (!dest.trim()) continue;
      for (const source of sources) {
        const gram = firstCopiedSourcePhrase(
          source.text,
          dest,
          source.minSourceWords,
          source.distinctiveness,
        );
        if (!gram) continue;
        issues.push(
          `scenes[${scene.sceneNumber}].${field} copies ${source.name} ("${gram}" from "${sourceExcerpt(source.text)}")`,
        );
        break;
      }
    }
  }

  return issues;
}
