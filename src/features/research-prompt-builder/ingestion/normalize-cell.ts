export function normalizeCell(value: unknown, maxChars = 2000): string {
  let text = value == null ? "" : String(value);
  text = text.replace(/\u0000/g, "");
  text = text.replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ");
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  text = text.replace(/[ \t]+\n/g, "\n");
  text = text.replace(/[ \t]{2,}/g, " ");
  text = text.trim();
  if (text.length > maxChars) {
    text = `${text.slice(0, maxChars)}…`;
  }
  return text;
}
