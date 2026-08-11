/** SHA-256 hex digest for artifact contentHash (Web Crypto — browser + Node 20+). */
export async function hashText(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto subtle digest is unavailable.");
  }
  const data = new TextEncoder().encode(text);
  const digest = await subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
