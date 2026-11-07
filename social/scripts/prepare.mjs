import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
await mkdir("dist/social", { recursive: true });
await rename("dist/assets", "dist/social/assets");
const html = await readFile("dist/index.html", "utf8");
await writeFile("dist/social/index.html", html);
await mkdir("dist/socialdemo", { recursive: true });
await writeFile("dist/socialdemo/index.html", html);
await writeFile("dist/index.html", html);
