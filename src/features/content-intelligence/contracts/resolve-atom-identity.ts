import type { TopicPacket } from "@/features/content-intelligence/contracts/topic-packet";

/**
 * Fail-closed Atom identity agreement for cross-domain handoff (TE → Social Media nav,
 * channel ingest). Lives on the Atom contract — not a channel creative brain.
 */
export type ResolveAtomIdentityInput = {
  packet: Pick<TopicPacket, "artifactId"> & { projectId?: string | null };
  sessionProjectId?: string | null;
  sessionArtifactId?: string | null;
  queryProjectId?: string | null;
  queryArtifactId?: string | null;
};

export type ResolveAtomIdentityResult =
  | { ok: true; projectId: string; artifactId: string }
  | { ok: false; reason: "identity_disagreement" | "missing_projectId" };

function nonEmpty(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function resolveAtomIdentity(
  input: ResolveAtomIdentityInput,
): ResolveAtomIdentityResult {
  const projectIds = new Set<string>();
  for (const candidate of [
    nonEmpty(input.packet.projectId),
    nonEmpty(input.sessionProjectId),
    nonEmpty(input.queryProjectId),
  ]) {
    if (candidate) projectIds.add(candidate);
  }

  if (projectIds.size === 0) {
    return { ok: false, reason: "missing_projectId" };
  }
  if (projectIds.size > 1) {
    return { ok: false, reason: "identity_disagreement" };
  }

  const artifactId = input.packet.artifactId;
  for (const candidate of [
    nonEmpty(input.sessionArtifactId),
    nonEmpty(input.queryArtifactId),
  ]) {
    if (candidate && candidate !== artifactId) {
      return { ok: false, reason: "identity_disagreement" };
    }
  }

  return {
    ok: true,
    projectId: [...projectIds][0]!,
    artifactId,
  };
}
