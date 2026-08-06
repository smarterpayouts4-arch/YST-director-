/**
 * Guardian finding code registry for Research Prompt Builder knowledge plane.
 */
export const CODES = {
  "PK-HARD-001": {
    severity: "hard",
    title: "Missing required doctrine document",
  },
  "PK-HARD-002": {
    severity: "hard",
    title: "Generated artifact missing do-not-hand-edit marker",
  },
  "PK-HARD-003": {
    severity: "hard",
    title: "File exceeds hard line limit",
  },
  "PK-HARD-004": {
    severity: "hard",
    title: "Client module imports server-only",
  },
  "PK-HARD-005": {
    severity: "hard",
    title: "Required generated index missing",
  },
  "PK-WARN-001": {
    severity: "warn",
    title: "File exceeds warning line threshold",
  },
  "PK-WARN-002": {
    severity: "warn",
    title: "Runtime prompt version heuristic failed",
  },
  "PK-WARN-003": {
    severity: "warn",
    title: "CURRENT_STATE area possibly missing from docs",
  },
  "PK-WARN-004": {
    severity: "warn",
    title: "Reference manifest missing or unreadable",
  },
  "PK-WARN-005": {
    severity: "warn",
    title: "MCP directory absent",
  },
};

export function formatFinding(code, detail, file = null) {
  const meta = CODES[code] ?? { severity: "warn", title: "Unknown" };
  return {
    code,
    severity: meta.severity,
    title: meta.title,
    detail,
    file,
  };
}
