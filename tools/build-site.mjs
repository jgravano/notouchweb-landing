import { copyFile, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(toolsDir, "..");
const output = resolve(root, "dist", "site");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const fileName of ["index.html", "styles.css", "app.js"]) {
  await copyFile(resolve(root, fileName), resolve(output, fileName));
}

await cp(resolve(root, "assets"), resolve(output, "assets"), { recursive: true });
await writeFile(resolve(output, ".nojekyll"), "");

console.log("Built dist/site");
