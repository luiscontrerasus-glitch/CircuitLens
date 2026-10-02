import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const files = ["server.js"];
for (const dir of ["src", "public", "scripts", "tests", "test-support"]) {
  for (const name of await readdir(dir))
    if (name.endsWith(".js")) files.push(`${dir}/${name}`);
}
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`Syntax checks passed: ${files.length} JavaScript files.`);
