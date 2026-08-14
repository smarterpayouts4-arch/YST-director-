/**
 * Dual Atom smoke for ci-topics-1.1.8:
 *  1) propose-topics (live API) from lean DTO
 *  2) build packets for evidence-dense (price/form) + framework topics
 *  3) assert teaching floor + teach-list hygiene + anti-padding
 *  4) cold YouTube from Atom JSON only
 *
 * Usage: npx tsx scripts/smoke-atom-dual-118.mts
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { buildTopicPacket } from "../src/features/content-intelligence/topics/services/build-topic-packet.ts";
import {
  countSelectedTeachingFacts,
  isTeachingFactItem,
  listRelevantTeachingFactCandidates,
} from "../src/features/content-intelligence/topics/services/teaching-support.ts";
import type { PublishedLibraryDto } from "../src/features/content-intelligence/contracts/published-library.ts";
import type { TopicDirection } from "../src/features/content-intelligence/topics/schemas/direction.ts";
import type { TopicOpportunity } from "../src/features/content-intelligence/topics/schemas/topic-opportunity.ts";
import type { TopicPacket } from "../src/features/content-intelligence/contracts/topic-packet.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]!]) {
      let v = m[2]!;
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      process.env[m[1]!] = v;
    }
  }
}

loadEnvLocal();

type LeanDump = {
  artifactId: string;
  projectId?: string | null;
  promptVersion?: string;
  publishedLibrary: PublishedLibraryDto;
  directions: TopicDirection[];
};

function atomPayload(packet: TopicPacket) {
  return {
    title: packet.title,
    premise: packet.premise,
    audience: packet.audience,
    customerMoment: packet.customerMoment,
    decisionQuestion: packet.decisionQuestion,
    tension: packet.tension,
    opportunity: packet.opportunity,
    whyItMatters: packet.whyItMatters,
    supportingInsights: packet.supportingInsights,
    evidenceQuotes: packet.evidenceQuotes,
    provenanceNotes: packet.provenanceNotes,
    sourceRefs: packet.sourceRefs,
    desiredTakeaway: packet.desiredTakeaway,
    hypothesisDependencies: packet.hypothesisDependencies,
    unresolvedAssumptions: packet.unresolvedAssumptions,
    restrictions: packet.restrictions,
    limitations: packet.limitations,
    confidence: packet.confidence,
  };
}

function insightFactCount(packet: TopicPacket, dto: PublishedLibraryDto): number {
  const byId = new Map(dto.items.map((i) => [i.itemId, i]));
  const statements = new Set(packet.supportingInsights);
  let n = 0;
  for (const id of packet.supportingItemIds) {
    const item = byId.get(id);
    if (!item || !isTeachingFactItem(item)) continue;
    if (statements.has(item.statement.trim())) n += 1;
  }
  return n;
}

function assertPacketHygiene(
  label: string,
  topic: TopicOpportunity,
  packet: TopicPacket,
  dto: PublishedLibraryDto,
): string[] {
  const fails: string[] = [];
  const pool = listRelevantTeachingFactCandidates(dto, {
    title: topic.title,
    premise: topic.premise,
    primaryTension: topic.primaryTension,
    opportunity: topic.opportunity,
    desiredTakeaway: topic.desiredTakeaway,
    audience: topic.audience,
    customerMoment: topic.customerMoment,
  });
  const selectedFacts = countSelectedTeachingFacts(topic.supportingItemIds, dto);
  if (pool.length >= 2 && selectedFacts < 2) {
    fails.push(
      `${label}: teaching-fact floor failed (selected=${selectedFacts}, pool=${pool.length})`,
    );
  }
  const hypStatements = dto.items
    .filter((i) => i.isHypothesis === true)
    .map((i) => i.statement.trim());
  for (const hyp of hypStatements) {
    if (packet.supportingInsights.includes(hyp)) {
      fails.push(`${label}: hypothesis leaked into supportingInsights`);
    }
  }
  const teachInInsights = insightFactCount(packet, dto);
  if (pool.length >= 2 && teachInInsights < 2) {
    fails.push(
      `${label}: supportingInsights has <2 teaching facts (has ${teachInInsights})`,
    );
  }
  const byId = new Map(dto.items.map((i) => [i.itemId, i]));
  const insightKinds = new Set<string>();
  for (const id of packet.supportingItemIds) {
    const item = byId.get(id);
    if (!item || item.isHypothesis) continue;
    if (packet.supportingInsights.includes(item.statement.trim())) {
      insightKinds.add(item.kind);
    }
  }
  if (insightKinds.has("audience") || insightKinds.has("moment")) {
    fails.push(`${label}: audience/moment scaffolding leaked into teach list`);
  }
  if (selectedFacts >= 2) {
    const nonFactKinds = [...insightKinds].filter((k) => k !== "fact");
    if (nonFactKinds.length > 0) {
      fails.push(
        `${label}: facts≥2 but teach list still has non-fact kinds: ${nonFactKinds.join(", ")}`,
      );
    }
    if (teachInInsights !== packet.supportingInsights.length) {
      fails.push(
        `${label}: facts≥2 but teach list length ${packet.supportingInsights.length} ≠ teaching facts ${teachInInsights}`,
      );
    }
  }
  const teachBlob = packet.supportingInsights.join(" ").toLowerCase();
  if (
    /\b71%\s*brand loyalty\b/.test(teachBlob) ||
    /\b84%\b.*\byoutube\b/.test(teachBlob) ||
    /\bbrand loyalty\b/.test(teachBlob) ||
    /\b182,?600\b/.test(teachBlob)
  ) {
    fails.push(
      `${label}: anti-padding — teach list contains loyalty/platform/reach stats`,
    );
  }
  return fails;
}

async function coldChannel(input: {
  client: OpenAI;
  model: string;
  atom: ReturnType<typeof atomPayload>;
}): Promise<string> {
  const system = [
    "You are a cold YouTube educational creator model.",
    "You receive ONE Canonical Topic Packet (Atom) only.",
    "You have NO access to the original research, Librarian library, or Topic Engine.",
    "Build an 8–10 minute YouTube educational outline with timestamps.",
    "Do NOT invent facts, statistics, studies, brand claims, dosages, or medical advice.",
    "Teach only from supportingInsights, evidenceQuotes, sourceRefs, and strategic fields.",
    "sourceRefs are provenance labels only — not permission to recall external source knowledge.",
    "If something is not in the Atom, mark UNKNOWN or omit — never invent.",
    "Obey restrictions/limitations. Flag hypotheses/unresolved as uncertain.",
    "Return markdown only.",
  ].join("\n");

  const user = [
    "CHANNEL: youtube",
    "ATOM JSON (only source of truth):",
    "```json",
    JSON.stringify(input.atom, null, 2),
    "```",
    "",
    "Produce the outline, then:",
    "- INVENTED? checklist (NONE if fully grounded)",
    "- Robustness: YES / YES WITH GAPS / NO for this channel using Atom alone",
  ].join("\n");

  const response = await input.client.responses.create({
    model: input.model,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  } as never);

  return typeof (response as { output_text?: string }).output_text === "string"
    ? (response as { output_text: string }).output_text
    : JSON.stringify(response, null, 2);
}

const leanPath =
  process.env.ATOM_LEAN_DUMP || join(root, "scripts/_live-te-lean.json");
const baseUrl = process.env.ATOM_BASE_URL || "http://localhost:3000";
const model =
  process.env.ATOM_COLD_YOUTUBE_MODEL ||
  process.env.OPENAI_MODEL ||
  "gpt-5.6-terra";
const skipCold = process.env.ATOM_SKIP_COLD === "1";

if (!existsSync(leanPath)) {
  console.error("BLOCKED: lean dump missing at", leanPath);
  process.exit(2);
}
if (!process.env.OPENAI_API_KEY && !skipCold) {
  console.error("BLOCKED: OPENAI_API_KEY missing (or set ATOM_SKIP_COLD=1)");
  process.exit(2);
}

const lean = JSON.parse(readFileSync(leanPath, "utf8")) as LeanDump;
const dto = lean.publishedLibrary;
const artifactId = lean.artifactId;
const projectId = lean.projectId ?? dto.projectId;
const direction =
  lean.directions.find((d) => d.priority === 1) ?? lean.directions[0]!;

console.log("=== ATOM DUAL SMOKE 1.1.8 ===");
console.log("lean:", leanPath);
console.log("session promptVersion:", lean.promptVersion ?? "(n/a)");
console.log("direction:", direction.name);
console.log("baseUrl:", baseUrl);

console.log("\n--- propose-topics ---");
const topicsRes = await fetch(`${baseUrl}/api/content-intelligence/propose-topics`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    publishedLibrary: dto,
    direction,
    artifactId,
    projectId,
  }),
});
const topicsBody = (await topicsRes.json()) as {
  topics?: TopicOpportunity[];
  error?: { message?: string };
  promptVersion?: string;
};
if (!topicsRes.ok) {
  console.error(
    "BLOCKED: propose-topics failed:",
    topicsBody?.error?.message || topicsRes.status,
  );
  process.exit(1);
}
const topics = topicsBody.topics ?? [];
console.log("API promptVersion:", topicsBody.promptVersion ?? "(n/a)");
console.log(
  "topics:",
  topics.map((t) => ({
    priority: t.priority,
    title: t.title,
    teachingFacts: countSelectedTeachingFacts(t.supportingItemIds, dto),
  })),
);
if (topics.length < 2) {
  console.error("BLOCKED: need ≥2 topics for dual smoke");
  process.exit(1);
}

const scored = topics.map((t) => ({
  topic: t,
  facts: countSelectedTeachingFacts(t.supportingItemIds, dto),
}));
scored.sort((a, b) => b.facts - a.facts);
const contrastPreferred =
  scored.find((s) =>
    /magnesium|b12|form|milligram|elemental/i.test(
      `${s.topic.title} ${s.topic.premise} ${s.topic.primaryTension}`,
    ),
  )?.topic ?? scored[0]!.topic;
const evidenceDense = contrastPreferred;
const framework =
  scored.find((s) => s.topic.topicId !== evidenceDense.topicId)?.topic ??
  scored[scored.length - 1]!.topic;

const pairs: { label: string; topic: TopicOpportunity }[] = [
  { label: "evidence-dense", topic: evidenceDense },
  { label: "framework", topic: framework },
];

const assertFails: string[] = [];
const packets: Record<string, TopicPacket> = {};

for (const { label, topic } of pairs) {
  const packet = buildTopicPacket({
    dto,
    direction,
    topic,
    artifactId,
    projectId: projectId ?? undefined,
  });
  packets[label] = packet;
  console.log(`\n--- ${label}: ${topic.title}`);
  console.log(
    "teachingFacts selected:",
    countSelectedTeachingFacts(topic.supportingItemIds, dto),
  );
  console.log("supportingInsights:", packet.supportingInsights.length);
  for (const s of packet.supportingInsights) console.log("  •", s);
  assertFails.push(...assertPacketHygiene(label, topic, packet, dto));
}

writeFileSync(
  join(root, "scripts/_live-atom-118-dual.json"),
  JSON.stringify(
    {
      promptVersion: "ci-topics-1.1.8",
      apiPromptVersion: topicsBody.promptVersion,
      direction: direction.name,
      evidenceDense: {
        topic: evidenceDense,
        packet: packets["evidence-dense"],
        atom: atomPayload(packets["evidence-dense"]!),
      },
      framework: {
        topic: framework,
        packet: packets["framework"],
        atom: atomPayload(packets["framework"]!),
      },
      assertFails,
    },
    null,
    2,
  ),
  "utf8",
);

if (assertFails.length) {
  console.error("\nASSERT FAIL:");
  for (const f of assertFails) console.error(" -", f);
  process.exit(1);
}
console.log(
  "\nASSERT PASS: teaching floor + hyp exclusion + teach-list hygiene + anti-pad",
);

if (skipCold) {
  console.log("ATOM_SKIP_COLD=1 — skipping channel cold smoke");
  process.exit(0);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 180_000,
});
const report: string[] = [
  `# Atom dual cold smoke — ci-topics-1.1.8`,
  ``,
  `- direction: ${direction.name}`,
  `- coldModel: ${model}`,
  `- evidence-dense: ${evidenceDense.title}`,
  `- framework: ${framework.title}`,
  ``,
];

for (const { label } of pairs) {
  const atom = atomPayload(packets[label]!);
  report.push(`## ${label}`, ``, `Title: ${packets[label]!.title}`, ``);
  console.log(`\n--- cold ${label} / youtube ---`);
  const started = Date.now();
  const outline = await coldChannel({ client, model, atom });
  console.log(outline.slice(0, 500) + (outline.length > 500 ? "…" : ""));
  report.push(`### youtube (${Date.now() - started}ms)`, ``, outline, ``);
}

const outPath = join(root, "scripts/_live-atom-118-dual-smoke.md");
writeFileSync(outPath, report.join("\n"), "utf8");
console.log("\nSaved:", outPath);
console.log("=== DONE ===");
