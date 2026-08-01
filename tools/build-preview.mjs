import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(toolsDir, "..");
const dist = resolve(root, "dist");

let html = await readFile(resolve(root, "index.html"), "utf8");
const css = await readFile(resolve(root, "styles.css"), "utf8");
const js = await readFile(resolve(root, "app.js"), "utf8");

html = html
  .replace(/<link rel="stylesheet" href="\.\/styles\.css(?:\?[^\"]*)?" \/>/, `<style>${css}</style>`)
  .replace(/<script src="\.\/app\.js(?:\?[^\"]*)?" defer><\/script>/, `<script>${js}</script>`);

for (const fileName of ["hero-desktop.webp", "hero-tablet.webp", "hero-mobile.webp"]) {
  const bytes = await readFile(resolve(root, "assets", fileName));
  const dataUri = `data:image/webp;base64,${bytes.toString("base64")}`;
  html = html.replaceAll(`./assets/${fileName}`, dataUri);
}

await mkdir(dist, { recursive: true });
await writeFile(resolve(dist, "notouchweb-preview.html"), html);
console.log("Built dist/notouchweb-preview.html");
