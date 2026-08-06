#!/usr/bin/env node
/**
 * Append one learning candidate JSON line. Does not approve or rewrite canon.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const candidatesPath = path.join(root, "candidates.ndjson");

function arg(name, fallback = null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

const area = arg("area", "coding");
const summary = arg("summary");
if (!summary) {
  console.error('Usage: node propose.mjs --area <coding|ux|prompt|security> --summary "..."');
  process.exit(1);
}

const record = {
  id: `cand-${crypto.randomBytes(4).toString("hex")}`,
  createdAt: new Date().toISOString(),
  area,
  summary,
  status: "pending",
  example: false,
};

fs.appendFileSync(candidatesPath, JSON.stringify(record) + "\n", "utf8");
console.log("Appended candidate:", record.id);
console.log("Human approval required before permanence.");
