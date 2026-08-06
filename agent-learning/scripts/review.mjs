#!/usr/bin/env node
/**
 * List pending learning candidates. Does not approve.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidatesPath = path.resolve(__dirname, "../candidates.ndjson");

if (!fs.existsSync(candidatesPath)) {
  console.log("No candidates.ndjson");
  process.exit(0);
}

const lines = fs
  .readFileSync(candidatesPath, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);

const pending = [];
for (const line of lines) {
  try {
    const obj = JSON.parse(line);
    if ((obj.status ?? "pending") === "pending") pending.push(obj);
  } catch {
    console.warn("Skipping invalid line");
  }
}

if (!pending.length) {
  console.log("No pending candidates.");
  process.exit(0);
}

console.log(`Pending candidates (${pending.length}):\n`);
for (const c of pending) {
  console.log(`- ${c.id} [${c.area}] ${c.summary}${c.example ? " (example)" : ""}`);
}
console.log("\nHuman approval required for permanence into approved/.");
