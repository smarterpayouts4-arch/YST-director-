import { sha16 } from "../../lib/repo.js";
import { failed, ok, type ToolEnvelope } from "../../contracts/envelope.js";
import { PROJECT_DOCS, type ProjectDocId } from "../../security/docs-registry.js";
import { resolveProjectDoc } from "../../security/paths.js";

const CONCEPT_IDS = Object.keys(PROJECT_DOCS).filter(
  (id) =>
    id.startsWith("ref") ||
    id === "referenceManifest" ||
    id === "referenceIndex"
);

export async function rpbGetReferenceConcept(
  conceptId: string
): Promise<
  ToolEnvelope<{ id: string; path: string; text: string; authority: string }>
> {
  if (!(conceptId in PROJECT_DOCS)) {
    return failed(`Unknown reference concept id: ${conceptId}`, [
      `Known: ${CONCEPT_IDS.join(", ")}`,
    ]);
  }
  if (!CONCEPT_IDS.includes(conceptId) && conceptId !== "referenceManifest") {
    return failed(
      `Document ${conceptId} is not a Reference concept; use rpb_read_project_doc`,
      CONCEPT_IDS
    );
  }
  try {
    const doc = await resolveProjectDoc(conceptId as ProjectDocId);
    return ok(
      {
        id: conceptId,
        path: doc.rel,
        text: doc.text,
        authority: "advisory",
      },
      {
        source: {
          path: doc.rel,
          contentHash: sha16(doc.text),
          mtimeMs: doc.mtimeMs,
        },
        warnings: ["Reference material is advisory — not live product SoT"],
      }
    );
  } catch (e) {
    return failed(e instanceof Error ? e.message : String(e));
  }
}
