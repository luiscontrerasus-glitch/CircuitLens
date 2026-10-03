import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { parseEnv } from "node:util";
import { execFileSync } from "node:child_process";
import path from "node:path";
const localEnv = existsSync(".env.local")
  ? parseEnv(await readFile(".env.local", "utf8"))
  : {};
const secrets = [
  localEnv.OPENAI_API_KEY,
  localEnv.GEMINI_API_KEY,
  process.env.OPENAI_API_KEY,
  process.env.GEMINI_API_KEY,
].filter(Boolean);
let checked = 0;
function check(bytes) {
  const text = bytes.toString("utf8");
  checked++;
  if (
    secrets.some((secret) => text.includes(secret)) ||
    /sk-(?:proj-)?[A-Za-z0-9_-]{30,}/.test(text) ||
    /AIza[A-Za-z0-9_-]{35}/.test(text)
  )
    throw Error(
      "Secret-like content detected; details intentionally suppressed.",
    );
}
const git = (args) =>
  execFileSync("git", args, { maxBuffer: 64 * 1024 * 1024 });
git(["check-ignore", ".env.local"]);
if (git(["ls-files", ".env.local"]).length)
  throw Error("Environment file is tracked.");
for (const file of new Set(
  git(["ls-files", "-co", "--exclude-standard", "-z"])
    .toString()
    .split("\0")
    .filter(Boolean),
)) {
  if (existsSync(file)) check(await readFile(file));
}
// Inspect every reachable Git blob without showing its contents.
for (const line of git(["rev-list", "--objects", "--all"])
  .toString()
  .trim()
  .split("\n")) {
  const oid = line.split(" ")[0];
  if (git(["cat-file", "-t", oid]).toString().trim() === "blob")
    check(git(["cat-file", "blob", oid]));
}
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".env.local", ".env"].includes(entry.name))
      continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else check(await readFile(file));
  }
}
for (const dir of ["public", "dist"]) if (existsSync(dir)) await walk(dir);
// Check local log files without printing their contents.
for (const entry of await readdir("."))
  if (entry.endsWith(".log")) check(await readFile(entry));
console.log(
  `Security scan passed: ${checked} files/blobs checked; .env.local ignored and untracked. Secret bytes were never printed.`,
);
