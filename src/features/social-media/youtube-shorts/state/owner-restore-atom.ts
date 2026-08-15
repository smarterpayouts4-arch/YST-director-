import {
  YouTubeShortsEnvelopeSchema,
  YouTubeShortsSessionSchema,
  type YouTubeShortsSession,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-session";
import { persistSession } from "@/features/social-media/youtube-shorts/state/shorts-storage";

/** Frozen price-per-serving test Atom — owner restore only. */
export const OWNER_RESTORE_TOPIC_PACKET_ID =
  "tp_79e3748f-f3df-488d-911a-62f2512b9682";
export const OWNER_RESTORE_ARTIFACT_ID =
  "art_5b7de8d7-3b07-448d-ab9f-1a69bed933cd";
export const OWNER_RESTORE_ENVELOPE_PATH = "/owner-restore-shorts-atom.json";

export function ownerRestoreIdsMatch(
  topicPacketId?: string,
  artifactId?: string,
): boolean {
  return (
    topicPacketId === OWNER_RESTORE_TOPIC_PACKET_ID &&
    artifactId === OWNER_RESTORE_ARTIFACT_ID
  );
}

/**
 * Pull the matching session from a Shorts envelope. Strict ID match.
 * Returns null when envelope/session invalid or IDs disagree.
 */
export function extractOwnerRestoreSession(
  envelopeRaw: unknown,
  topicPacketId: string,
  artifactId: string,
): YouTubeShortsSession | null {
  if (!ownerRestoreIdsMatch(topicPacketId, artifactId)) return null;

  const envelope = YouTubeShortsEnvelopeSchema.safeParse(envelopeRaw);
  if (!envelope.success) return null;

  const entry = envelope.data.sessionsByTopicPacketId[topicPacketId];
  if (entry === undefined) return null;

  const session = YouTubeShortsSessionSchema.safeParse(entry);
  if (!session.success) return null;
  if (session.data.artifactId !== artifactId) return null;
  if (session.data.topicPacketId !== topicPacketId) return null;

  return session.data;
}

export async function fetchAndPersistOwnerRestore(input: {
  topicPacketId: string;
  artifactId: string;
  fetchImpl?: typeof fetch;
}): Promise<
  | { ok: true; session: YouTubeShortsSession }
  | { ok: false; reason: "ids_mismatch" | "fetch_failed" | "invalid_envelope" | "save_failed" }
> {
  if (!ownerRestoreIdsMatch(input.topicPacketId, input.artifactId)) {
    return { ok: false, reason: "ids_mismatch" };
  }

  const fetchFn = input.fetchImpl ?? fetch;
  let raw: unknown;
  try {
    const res = await fetchFn(OWNER_RESTORE_ENVELOPE_PATH, { method: "GET" });
    if (!res.ok) return { ok: false, reason: "fetch_failed" };
    raw = await res.json();
  } catch {
    return { ok: false, reason: "fetch_failed" };
  }

  const session = extractOwnerRestoreSession(
    raw,
    input.topicPacketId,
    input.artifactId,
  );
  if (!session) return { ok: false, reason: "invalid_envelope" };

  // Stamp updatedAt so persist is fresh; keep createdAt / ingestedAtom frozen.
  const stamped: YouTubeShortsSession = {
    ...session,
    updatedAt: new Date().toISOString(),
  };

  const saved = persistSession(stamped);
  if (!saved.ok) return { ok: false, reason: "save_failed" };
  return { ok: true, session: saved.session };
}
