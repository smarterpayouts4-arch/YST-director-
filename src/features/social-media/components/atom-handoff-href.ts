/**
 * Build Social Media / channel hrefs that carry Atom identity query only.
 * No ingest, no persistence — navigation handoff.
 */
export function atomHandoffHref(
  path: string,
  ids: {
    topicPacketId?: string;
    projectId?: string;
    artifactId?: string;
    returnHref?: string;
  },
): string {
  const params = new URLSearchParams();
  if (ids.topicPacketId) params.set("topicPacketId", ids.topicPacketId);
  if (ids.projectId) params.set("projectId", ids.projectId);
  if (ids.artifactId) params.set("artifactId", ids.artifactId);
  if (ids.returnHref) params.set("return", ids.returnHref);
  const q = params.toString();
  return q ? `${path}?${q}` : path;
}
