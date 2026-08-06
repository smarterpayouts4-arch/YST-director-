/** Stdio MCP: stdout is protocol-only. Diagnostics → stderr. */
export function log(...args: unknown[]) {
  console.error("[rpb-mcp]", ...args);
}
