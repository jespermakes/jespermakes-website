// Upload the lamp generator's download files to Vercel Blob (DR-301).
// Source: ~/bambu/printed/dist, written by ~/bambu/printed/tools/manifest.py, which holds
// ONLY variants that passed the print checks. Blob path: printed-lamps/<lamp>/<variant>/<file>.
// Resumable: a file already in the store with the same size is skipped.
//   node --env-file=.env.local scripts/upload-printed-lamps.mjs [--dry]
import { put, head } from "@vercel/blob";
import { createReadStream, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { homedir } from "node:os";

const ROOT = join(homedir(), "bambu/printed/dist");
const PREFIX = "printed-lamps";
const TYPES = { ".3mf": "model/3mf", ".zip": "application/zip" };
const dry = process.argv.includes("--dry");

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]
  );
}

const files = walk(ROOT).filter((f) => Object.keys(TYPES).some((ext) => f.endsWith(ext))).sort();
let done = 0, skipped = 0, bytes = 0, base = "";
for (const file of files) {
  const pathname = `${PREFIX}/${relative(ROOT, file)}`;
  const size = statSync(file).size;
  let existing = null;
  try { existing = await head(pathname); } catch { /* not there yet */ }
  if (existing && existing.size === size) {
    skipped++; base ||= existing.url.slice(0, existing.url.indexOf(`/${PREFIX}/`));
    continue;
  }
  if (dry) { console.log("would upload", pathname, size); continue; }
  const t0 = Date.now();
  const blob = await put(pathname, createReadStream(file), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    multipart: size > 20 * 1024 * 1024,
    contentType: TYPES[file.slice(file.lastIndexOf("."))],
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
  done++; bytes += size; base ||= blob.url.slice(0, blob.url.indexOf(`/${PREFIX}/`));
  console.log(`${done + skipped}/${files.length} ${pathname} ${(size / 1e6).toFixed(1)} MB in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
console.log(`DONE uploaded ${done}, skipped ${skipped}, ${(bytes / 1e9).toFixed(2)} GB. Base: ${base}/${PREFIX}`);
