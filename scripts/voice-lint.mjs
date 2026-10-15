#!/usr/bin/env node
// Voice lint: the build ratchet for site copy (DR-287). The canonical copy lives in brain-server at
// brain/voicecheck/site/voice-lint.mjs; site copies are written by scripts/voicecheck_export_site.py.
//
// Runs before `next build` (package.json "build"), so it runs on Vercel for every deploy, whoever
// pushed. It fails the build when the copy in the source ADDS a long dash, an invisible character,
// a look-alike letter or a Claude signature tell (the short list of brain/voicecheck) compared with
// the committed baseline (voice-baseline.json). What is in the baseline today does not break a
// deploy; touching a line that carries one means fixing it.
//
//   node scripts/voice-lint.mjs                    check (exit 1 on anything new, 2 on a broken port)
//   node scripts/voice-lint.mjs --write-baseline   tighten: drop what was fixed (adds nothing)
//   node scripts/voice-lint.mjs --accept --reason "Jesper OK'd the 'genuine leather' line, 2026-10-15"
//                                                  take what is there now into the baseline, logged
//   node scripts/voice-lint.mjs --json             machine output
//
// What counts as copy: in .ts/.tsx/.js/.jsx/.mjs, string literals, template text and JSX text
// (comments, import paths, type literals, property names, class names, console.* arguments and
// sql`` templates are skipped); in .json, every string value; in .md/.mdx, the whole file.
// The checker itself (voicecheck/ at the repo root) is never scanned: it is the tell catalogue.
// Before it scans, it runs the fixture file (voicecheck-fixtures.test.json): if this port no longer
// gives the verdicts brain/voicecheck gave at export time, the build stops (exit 2).
//
// The baseline holds a hash of each line that carries a finding, never the line itself, so no
// dash is copied into it; "preview" shows the line with [dash] in place of the character.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : dflt;
};

const ROOT = resolve(opt("--root", join(HERE, "..")));
const VOICE_DIR = resolve(ROOT, opt("--voice-dir", "voicecheck"));
const BASELINE = resolve(ROOT, opt("--baseline", "voice-baseline.json"));
const DIRS = (opt("--dirs", "src") || "src").split(",").map((d) => resolve(ROOT, d.trim()));
const JSON_OUT = flag("--json");
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const MD_EXT = new Set([".md", ".mdx"]);
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "__tests__", ".vercel", "dist", "build", "out"]);
const SKIP_FILES = new Set(["check.mjs", "voicecheck.json"]);
// JSX attributes that never hold copy a reader sees
const SKIP_ATTRS = new Set([
  "className", "class", "href", "src", "srcSet", "id", "key", "type", "rel", "target", "role", "method",
  "action", "d", "viewBox", "fill", "stroke", "xmlns", "as", "variant", "size", "htmlFor", "name", "style",
  "sizes", "loading", "encType", "autoComplete", "inputMode", "pattern", "lang", "dir", "media",
]);
const INLINE_TAGS = new Set([
  "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn", "em", "i", "kbd", "mark", "q", "s",
  "samp", "small", "span", "strong", "sub", "sup", "time", "u", "var", "Link", "Trans",
]);

const { createChecker, selfTest } = await import(pathToFileURL(join(VOICE_DIR, "check.mjs")).href);
const data = JSON.parse(readFileSync(join(VOICE_DIR, "voicecheck.json"), "utf8"));
const fixtures = JSON.parse(readFileSync(join(VOICE_DIR, "voicecheck-fixtures.test.json"), "utf8"));
const checker = createChecker(data);
const DASHES = new Set(data.dash_chars.map((cp) => String.fromCharCode(cp)));
const undash = (s) => Array.from(s, (c) => (DASHES.has(c) ? "[dash]" : c)).join("");

function fail(code, lines) {
  for (const l of lines) console.error(l);
  process.exit(code);
}

// 1. the port must still agree with Python on the exported fixtures
const disagree = selfTest(checker, fixtures);
if (disagree.length) {
  fail(2, [
    `voice-lint: the JS voice check disagrees with brain/voicecheck on ${disagree.length} fixture text(s).`,
    ...disagree.slice(0, 5).map((d) => `  ${undash(d.text).slice(0, 90)}\n    want ${JSON.stringify(d.want)}\n    got  ${JSON.stringify(d.got)}`),
    "Re-export from brain-server (scripts/voicecheck_export_site.py) instead of editing voicecheck/ by hand.",
  ]);
}

const require = createRequire(join(ROOT, "package.json"));
let ts;
try {
  ts = require("typescript");
} catch (e) {
  fail(2, [`voice-lint: cannot load the typescript package from ${ROOT} (${e.message}). It is a devDependency of every site.`]);
}

// 2. collect the copy
function walk(dir, out) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (st.isFile()) {
      const ext = name.slice(name.lastIndexOf("."));
      if (/\.(test|spec)\./.test(name)) continue;
      if (dirname(p) === VOICE_DIR && SKIP_FILES.has(name)) continue;
      if (CODE_EXT.has(ext) || MD_EXT.has(ext) || ext === ".json") out.push(p);
    }
  }
  return out;
}

// A segment is one text checked as a whole, built from pieces of the source. Each piece knows the
// source offset of its first character and whether its text is verbatim (no escapes) so an offset in
// the text maps back to a source line.
class Seg {
  constructor() {
    this.text = "";
    this.pieces = [];
  }
  add(text, srcPos, verbatim) {
    this.pieces.push({ at: this.text.length, text, srcPos, verbatim });
    this.text += text;
  }
  gap(sep) {
    this.text += sep;
  }
  srcPos(off) {
    let p = null;
    for (const pc of this.pieces) {
      if (pc.at <= off) p = pc;
      else break;
    }
    if (!p) return this.pieces.length ? this.pieces[0].srcPos : 0;
    return p.verbatim ? p.srcPos + Math.min(off - p.at, p.text.length) : p.srcPos;
  }
}

function codeSegments(file, src) {
  const kind = file.endsWith(".tsx") || file.endsWith(".jsx") ? ts.ScriptKind.TSX : file.endsWith(".ts") ? ts.ScriptKind.TS : ts.ScriptKind.JSX;
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, kind);
  const segs = [];
  const K = ts.SyntaxKind;
  const verbatimAt = (node, text) => src.slice(node.getStart(sf) + 1, node.getEnd() - 1) === text;

  const skipString = (node) => {
    const p = node.parent;
    if (!p) return false;
    if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isExternalModuleReference(p)) return true;
    if (ts.isImportTypeNode?.(p) || ts.isLiteralTypeNode(p)) return true;
    if ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isPropertySignature(p) || ts.isMethodDeclaration(p) || ts.isEnumMember(p)) && p.name === node) return true;
    if (ts.isElementAccessExpression(p) && p.argumentExpression === node) return true;
    if (ts.isCallExpression(p)) {
      const callee = p.expression.getText(sf);
      if (callee === "require" || p.expression.kind === K.ImportKeyword) return true;
      if (/^console\.\w+$/.test(callee)) return true;
    }
    if (ts.isExpressionStatement(p)) return true; // "use client", "use server"
    if (ts.isJsxAttribute(p) && SKIP_ATTRS.has(p.name.getText(sf))) return true;
    if (ts.isJsxExpression(p) && p.parent && ts.isJsxAttribute(p.parent) && SKIP_ATTRS.has(p.parent.name.getText(sf))) return true;
    return false;
  };
  const insideConsole = (node) => {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isCallExpression(p) && /^console\.\w+$/.test(p.expression.getText(sf))) return true;
      if (ts.isSourceFile(p)) break;
    }
    return false;
  };

  function templateSeg(node) {
    const seg = new Seg();
    if (ts.isNoSubstitutionTemplateLiteral(node)) {
      seg.add(node.text, node.getStart(sf) + 1, verbatimAt(node, node.text));
      return seg;
    }
    const head = node.head;
    seg.add(head.text, head.getStart(sf) + 1, src.slice(head.getStart(sf) + 1, head.getEnd() - 2) === head.text);
    for (const span of node.templateSpans) {
      seg.gap("X");
      const lit = span.literal;
      const end = ts.isTemplateTail(lit) ? lit.getEnd() - 1 : lit.getEnd() - 2;
      seg.add(lit.text, lit.getStart(sf) + 1, src.slice(lit.getStart(sf) + 1, end) === lit.text);
    }
    return seg;
  }

  // JSX: one segment per outermost JSX tree; block elements are separated by a blank line, inline
  // elements run on, expressions read as one neutral word
  function jsxSeg(root) {
    const seg = new Seg();
    const attrs = [];
    const visit = (n) => {
      if (ts.isJsxText(n)) {
        // a JSX text node starts at pos: getStart would skip its leading whitespace
        if (n.text.trim()) seg.add(n.text, n.pos, src.slice(n.pos, n.getEnd()) === n.text);
        return;
      }
      if (ts.isJsxExpression(n)) {
        const e = n.expression;
        if (!e) return;
        if (ts.isStringLiteral(e)) seg.add(e.text, e.getStart(sf) + 1, verbatimAt(e, e.text));
        else if (ts.isNoSubstitutionTemplateLiteral(e)) seg.add(e.text, e.getStart(sf) + 1, verbatimAt(e, e.text));
        else {
          seg.gap(" X ");
          collect(e);
        }
        return;
      }
      if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) {
        const opening = ts.isJsxElement(n) ? n.openingElement : ts.isJsxSelfClosingElement(n) ? n : null;
        const tag = opening ? opening.tagName.getText(sf) : "";
        const inline = INLINE_TAGS.has(tag);
        if (opening) {
          for (const a of opening.attributes.properties) attrs.push(a);
        }
        if (!inline) seg.gap("\n\n");
        if (!ts.isJsxSelfClosingElement(n)) for (const c of n.children) visit(c);
        if (!inline) seg.gap("\n\n");
        return;
      }
    };
    visit(root);
    if (seg.pieces.length) segs.push(seg);
    for (const a of attrs) collect(a);
  }

  function collect(node) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
      jsxSeg(node);
      return;
    }
    if (ts.isTaggedTemplateExpression(node)) {
      const tag = node.tag.getText(sf);
      if (/^(sql|css|gql|graphql|html\.raw)$/.test(tag)) return;
      if (!insideConsole(node)) segs.push(templateSeg(node.template));
      ts.forEachChild(node.template, collect);
      return;
    }
    if (ts.isStringLiteral(node)) {
      if (!skipString(node) && !insideConsole(node) && node.text.trim()) {
        const seg = new Seg();
        seg.add(node.text, node.getStart(sf) + 1, verbatimAt(node, node.text));
        segs.push(seg);
      }
      return;
    }
    if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) {
      if (!insideConsole(node) && !(node.parent && ts.isJsxExpression(node.parent) && node.parent.parent && ts.isJsxAttribute(node.parent.parent) && SKIP_ATTRS.has(node.parent.parent.name.getText(sf)))) {
        const seg = templateSeg(node);
        if (seg.text.trim()) segs.push(seg);
      }
      if (ts.isTemplateExpression(node)) for (const span of node.templateSpans) collect(span.expression);
      return;
    }
    ts.forEachChild(node, collect);
  }
  collect(sf);
  return segs;
}

function jsonSegments(src) {
  const segs = [];
  let obj;
  try {
    obj = JSON.parse(src);
  } catch {
    return segs;
  }
  let cursor = 0;
  const visit = (v, isKey) => {
    if (typeof v === "string") {
      const enc = JSON.stringify(v);
      const at = src.indexOf(enc, cursor);
      const pos = at >= 0 ? at + 1 : cursor;
      if (at >= 0) cursor = at + enc.length;
      if (!isKey && v.trim()) {
        const seg = new Seg();
        seg.add(v, pos, enc.slice(1, -1) === v);
        segs.push(seg);
      }
    } else if (Array.isArray(v)) v.forEach((x) => visit(x, false));
    else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) {
        visit(k, true);
        visit(x, false);
      }
    }
  };
  visit(obj, false);
  return segs;
}

function lineStarts(src) {
  const out = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === "\n") out.push(i + 1);
  return out;
}
const lineOf = (starts, pos) => {
  let lo = 0;
  let hi = starts.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (pos < starts[mid]) hi = mid;
    else lo = mid + 1;
  }
  return lo;
};

const hits = []; // {file, line, endLine, tell, name, fix, quote, key, preview}
const files = DIRS.flatMap((d) => walk(d, []));
for (const file of files) {
  const src = readFileSync(file, "utf8");
  const rel = relative(ROOT, file).split(sep).join("/");
  let segs;
  if (MD_EXT.has(file.slice(file.lastIndexOf(".")))) {
    const s = new Seg();
    s.add(src, 0, true);
    segs = [s];
  } else if (file.endsWith(".json")) segs = jsonSegments(src);
  else segs = codeSegments(file, src);
  const starts = lineStarts(src);
  for (const seg of segs) {
    if (!seg.text.trim()) continue;
    const v = checker.check(seg.text);
    for (const f of v.findings) {
      const a = lineOf(starts, seg.srcPos(f.start));
      const b = Math.max(a, lineOf(starts, seg.srcPos(Math.max(f.start, f.end - 1))));
      const lines = src.slice(starts[a - 1], b < starts.length ? starts[b] - 1 : src.length);
      const norm = lines.replace(/\s+/g, " ").trim();
      const key = createHash("sha1").update(`${f.tell}\n${norm}`).digest("hex").slice(0, 16);
      hits.push({ file: rel, line: a, endLine: b, tell: f.tell, name: f.name, fix: f.fix, quote: f.quote, key, preview: undash(norm).slice(0, 140) });
    }
  }
}

// 3. compare with the baseline
const current = {};
for (const h of hits) {
  const k = `${h.file}\t${h.key}`;
  (current[k] ||= { file: h.file, key: h.key, tell: h.tell, count: 0, preview: h.preview }).count++;
}
let base = { entries: [], history: [] };
if (existsSync(BASELINE)) base = JSON.parse(readFileSync(BASELINE, "utf8"));
const baseMap = {};
for (const e of base.entries || []) baseMap[`${e.file}\t${e.key}`] = e;

const added = [];
const used = {};
for (const h of hits) {
  const k = `${h.file}\t${h.key}`;
  used[k] = (used[k] || 0) + 1;
  if (used[k] > (baseMap[k] ? baseMap[k].count : 0)) added.push(h);
}
const gone = [];
for (const [k, e] of Object.entries(baseMap)) {
  const now = current[k] ? current[k].count : 0;
  if (now < e.count) gone.push({ ...e, now });
}

function writeBaseline(reason, accepted) {
  const entries = Object.values(current).sort((x, y) => (x.file < y.file ? -1 : x.file > y.file ? 1 : x.key < y.key ? -1 : 1));
  const history = (base.history || []).slice(-49);
  history.push({
    at: new Date().toISOString().slice(0, 10),
    reason: reason || "tightened: lines that were fixed are no longer allowed",
    added: accepted.length,
    removed: gone.reduce((n, g) => n + g.count - g.now, 0),
  });
  const out = {
    about: "Voice lint baseline (DR-287): findings already in the copy when the ratchet started, one entry per line hash. A build fails only on findings that are not in here. Written by scripts/voice-lint.mjs; never edit by hand.",
    engine: { version: data.version, engine_sha: data.engine_sha },
    total: entries.reduce((n, e) => n + e.count, 0),
    entries,
    history,
  };
  writeFileSync(BASELINE, JSON.stringify(out, null, 1) + "\n");
}

if (flag("--accept")) {
  const reason = opt("--reason", "");
  if (!reason.trim()) fail(3, ['voice-lint: --accept needs --reason "<who approved what>". Only on Jesper\'s word.']);
  writeBaseline(reason, added);
  console.log(`voice-lint: baseline written, ${added.length} new finding(s) accepted: ${undash(reason)}`);
  process.exit(0);
}
if (flag("--write-baseline")) {
  if (added.length && existsSync(BASELINE)) {
    fail(1, [`voice-lint: ${added.length} finding(s) are not in the baseline. --write-baseline only tightens; use --accept --reason "..." to take them in.`]);
  }
  writeBaseline(existsSync(BASELINE) ? "" : opt("--reason", "first baseline: the copy as it stood when the ratchet started"), added);
  console.log(`voice-lint: baseline written (${Object.values(current).reduce((n, e) => n + e.count, 0)} findings in ${new Set(hits.map((h) => h.file)).size} files)`);
  process.exit(0);
}

if (JSON_OUT) {
  console.log(JSON.stringify({ files: files.length, findings: hits.length, added, gone }, null, 1));
  process.exit(added.length ? 1 : 0);
}
if (gone.length) {
  console.log(`voice-lint: ${gone.length} baseline line(s) were fixed. Run "npm run voice:baseline" so they cannot come back.`);
}
if (!added.length) {
  console.log(`voice-lint: ok, ${files.length} files, nothing new (${hits.length} findings sit in the baseline).`);
  process.exit(0);
}
const lines = [
  `voice-lint: ${added.length} new finding(s) in user-facing copy. The build stops here (DR-287).`,
  "",
];
for (const h of added.slice(0, 40)) {
  lines.push(`${h.file}:${h.line}  ${h.name}`);
  lines.push(`    ${h.quote}`);
  lines.push(`    fix: ${undash(h.fix)}`);
}
if (added.length > 40) lines.push(`... and ${added.length - 40} more (node scripts/voice-lint.mjs --json)`);
lines.push(
  "",
  "Rewrite those lines (a comma, a full stop, or say the thing plainly; the voice guide is",
  "~/.claude/skills/humanizer/references/voice-guide.md on the Spark). Only if Jesper approved the exact",
  'text: npm run voice:accept -- --reason "<what he said>" (the reason is logged in voice-baseline.json).',
);
fail(1, lines);
