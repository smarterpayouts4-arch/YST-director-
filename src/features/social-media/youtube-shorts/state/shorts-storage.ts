import {
  CURRENT_SHORTS_STORAGE_VERSION,
  YOUTUBE_SHORTS_STORAGE_KEY,
} from "@/features/social-media/youtube-shorts/config/constants";
import {
  YouTubeShortsEnvelopeSchema,
  YouTubeShortsSessionSchema,
  type YouTubeShortsEnvelope,
  type YouTubeShortsSession,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-session";

export type LoadShortsSessionResult =
  | { ok: true; session: YouTubeShortsSession }
  | {
      ok: false;
      reason: "missing" | "corrupt_session" | "envelope_unparseable";
    };

export type PersistSessionResult =
  | { ok: true; session: YouTubeShortsSession }
  | { ok: false; reason: "save_failed" };

type LoadEnvelopeResult =
  | { ok: true; envelope: YouTubeShortsEnvelope }
  | { ok: false; reason: "missing" | "envelope_unparseable" };

export function loadEnvelope(): LoadEnvelopeResult {
  if (typeof window === "undefined") {
    return { ok: false, reason: "missing" };
  }
  try {
    const raw = window.localStorage.getItem(YOUTUBE_SHORTS_STORAGE_KEY);
    if (!raw) return { ok: false, reason: "missing" };
    const parsed: unknown = JSON.parse(raw);
    const envelope = YouTubeShortsEnvelopeSchema.safeParse(parsed);
    if (!envelope.success) {
      return { ok: false, reason: "envelope_unparseable" };
    }
    return { ok: true, envelope: envelope.data };
  } catch {
    return { ok: false, reason: "envelope_unparseable" };
  }
}

export function saveEnvelope(envelope: YouTubeShortsEnvelope): void {
  if (typeof window === "undefined") return;
  const validated = YouTubeShortsEnvelopeSchema.parse(envelope);
  window.localStorage.setItem(
    YOUTUBE_SHORTS_STORAGE_KEY,
    JSON.stringify(validated),
  );
}

export function loadShortsSession(
  topicPacketId: string,
): LoadShortsSessionResult {
  const loaded = loadEnvelope();
  if (!loaded.ok) {
    if (loaded.reason === "missing") {
      return { ok: false, reason: "missing" };
    }
    return { ok: false, reason: "envelope_unparseable" };
  }

  const entry = loaded.envelope.sessionsByTopicPacketId[topicPacketId];
  if (entry === undefined) {
    return { ok: false, reason: "missing" };
  }

  const parsed = YouTubeShortsSessionSchema.safeParse(entry);
  if (!parsed.success) {
    return { ok: false, reason: "corrupt_session" };
  }
  return { ok: true, session: parsed.data };
}

export function persistSession(
  session: YouTubeShortsSession,
): PersistSessionResult {
  if (typeof window === "undefined") {
    return { ok: false, reason: "save_failed" };
  }

  const priorRaw = window.localStorage.getItem(YOUTUBE_SHORTS_STORAGE_KEY);
  let map: Record<string, unknown> = {};

  if (priorRaw !== null) {
    try {
      const parsed: unknown = JSON.parse(priorRaw);
      const envelope = YouTubeShortsEnvelopeSchema.safeParse(parsed);
      if (!envelope.success) {
        return { ok: false, reason: "save_failed" };
      }
      map = { ...envelope.data.sessionsByTopicPacketId };
    } catch {
      return { ok: false, reason: "save_failed" };
    }
  }

  const validated = YouTubeShortsSessionSchema.parse(session);
  map[validated.topicPacketId] = validated;

  const nextEnvelope = YouTubeShortsEnvelopeSchema.parse({
    storageVersion: CURRENT_SHORTS_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    sessionsByTopicPacketId: map,
  });

  try {
    saveEnvelope(nextEnvelope);
    const readBack = loadShortsSession(validated.topicPacketId);
    if (!readBack.ok) {
      if (priorRaw === null) {
        window.localStorage.removeItem(YOUTUBE_SHORTS_STORAGE_KEY);
      } else {
        window.localStorage.setItem(YOUTUBE_SHORTS_STORAGE_KEY, priorRaw);
      }
      return { ok: false, reason: "save_failed" };
    }
    return { ok: true, session: readBack.session };
  } catch {
    if (priorRaw === null) {
      window.localStorage.removeItem(YOUTUBE_SHORTS_STORAGE_KEY);
    } else {
      window.localStorage.setItem(YOUTUBE_SHORTS_STORAGE_KEY, priorRaw);
    }
    return { ok: false, reason: "save_failed" };
  }
}
