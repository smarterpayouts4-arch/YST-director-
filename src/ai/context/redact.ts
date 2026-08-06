const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "api_key", pattern: /\b(?:sk|rk)-[A-Za-z0-9_-]{16,}\b/g },
  { name: "bearer", pattern: /\bBearer\s+[A-Za-z0-9._-]{16,}\b/gi },
  { name: "password_assign", pattern: /\b(?:password|passwd|pwd)\s*[:=]\s*\S+/gi },
  { name: "email", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  {
    name: "phone",
    pattern: /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
  },
];

export type RedactionResult = {
  text: string;
  redactions: string[];
};

export function redactSensitiveText(text: string): RedactionResult {
  let next = text;
  const redactions: string[] = [];
  for (const { name, pattern } of SECRET_PATTERNS) {
    const before = next;
    next = next.replace(pattern, `[REDACTED_${name.toUpperCase()}]`);
    if (next !== before) redactions.push(name);
  }
  return { text: next, redactions: [...new Set(redactions)] };
}

export function redactDeep<T>(value: T): { value: T; redactions: string[] } {
  const redactions: string[] = [];
  const walk = (node: unknown): unknown => {
    if (typeof node === "string") {
      const result = redactSensitiveText(node);
      redactions.push(...result.redactions);
      return result.text;
    }
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(node)) {
        out[key] = walk(child);
      }
      return out;
    }
    return node;
  };
  return {
    value: walk(value) as T,
    redactions: [...new Set(redactions)],
  };
}
