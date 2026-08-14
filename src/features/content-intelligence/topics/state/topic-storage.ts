import {
  CURRENT_TE_STORAGE_VERSION,
  TE_STORAGE_KEY,
} from "@/features/content-intelligence/topics/config/constants";
import {
  TopicEngineSessionSchema,
  type TopicEngineSession,
} from "@/features/content-intelligence/topics/schemas/topic-session";

type TeEnvelope = {
  storageVersion: number;
  savedAt: string;
  session: TopicEngineSession;
};

export function loadTopicSession(artifactId: string): TopicEngineSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TeEnvelope;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.storageVersion !== "number" ||
      parsed.storageVersion > CURRENT_TE_STORAGE_VERSION
    ) {
      return null;
    }
    const session = TopicEngineSessionSchema.parse(parsed.session);
    if (session.artifactId !== artifactId) return null;
    return session;
  } catch {
    return null;
  }
}

export function saveTopicSession(session: TopicEngineSession): void {
  if (typeof window === "undefined") return;
  const envelope: TeEnvelope = {
    storageVersion: CURRENT_TE_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    session: TopicEngineSessionSchema.parse(session),
  };
  window.localStorage.setItem(TE_STORAGE_KEY, JSON.stringify(envelope));
}

/** Drop stale TE workspace when Librarian handoff mints a fresh Library. */
export function clearTopicSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TE_STORAGE_KEY);
}
