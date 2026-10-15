// Voice check, website port (DR-287). The canonical copy lives in brain-server at
// brain/voicecheck/site/check.mjs; every site copy is written by scripts/voicecheck_export_site.py,
// so edit it there and re-export, never in a site repo.
//
// What it is: the SHORT mode of brain/voicecheck in plain JavaScript, for code that cannot reach the
// Python engine (Vercel builds, the site MCP handlers, the admin API). It checks the house policy
// (long dashes in any spelling, invisible characters inside a word, look-alike letters) and the
// short signature tells (Not X. Not Y. Z., the reframe, "genuinely", "here's the thing" and the
// rest of baseline['short']['signatures'], plus the two Danish ones). Every pattern comes from
// voicecheck.json, exported from tells.py and text.py; this file holds only the logic around them,
// ported line by line from text.py (segment) and tells.py (the structural detectors).
//
// What it is not: the long-text check. Density statistics, Jesper's baseline, the mid mode and the
// coverage flag stay in Python. A long Claude-shaped text with no signature tell passes here.
//
// Bands, as in Python short mode: a long dash blocks (policy); two or more signature hits block, one
// flags (scaled per 300 words above 300 words); a hidden character or a look-alike letter flags.
//
// Pure: no imports, no I/O, deterministic. Offsets are UTF-16 code units (Python counts code points;
// the agreement test converts).

const WORD_CLASS = "\\p{L}\\p{N}_";
const BOUNDARY = `(?:(?<=[${WORD_CLASS}])(?![${WORD_CLASS}])|(?<![${WORD_CLASS}])(?=[${WORD_CLASS}]))`;
const SYNTAX = new Set("^$\\.*+?()[]{}|/".split(""));

// Translate a Python `re` pattern to a JS RegExp source with the same meaning under the u flag:
// Unicode \w, \b and \d like Python str patterns, \A and \Z, and identity escapes the u flag rejects.
export function pyToJs(src) {
  let out = "";
  let inClass = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === "\\") {
      const n = src[i + 1];
      i++;
      if (n === undefined) throw new Error("pattern ends in a backslash");
      if (n === "w") out += inClass ? WORD_CLASS : `[${WORD_CLASS}]`;
      else if (n === "W") {
        if (inClass) throw new Error("\\W inside a class is not translated");
        out += `[^${WORD_CLASS}]`;
      } else if (n === "d") out += "\\p{Nd}";
      else if (n === "D") out += "\\P{Nd}";
      else if (n === "b") {
        if (inClass) throw new Error("\\b inside a class is not translated");
        out += BOUNDARY;
      } else if (n === "B") throw new Error("\\B is not translated");
      else if (n === "Z" || n === "z") out += "(?![\\s\\S])";
      else if (n === "A") out += "(?<![\\s\\S])";
      else if (n === "u") {
        out += "\\u" + src.slice(i + 1, i + 5);
        i += 4;
      } else if (n === "x") {
        out += "\\x" + src.slice(i + 1, i + 3);
        i += 2;
      } else if (/[sSntrfv0-9]/.test(n)) out += "\\" + n;
      else if (SYNTAX.has(n)) out += "\\" + n;
      else if (n === "-") out += inClass ? "\\-" : "-";
      else out += n; // an identity escape such as \" or \' : the plain character
      continue;
    }
    if (inClass) {
      if (c === "]") inClass = false;
      out += c;
      continue;
    }
    if (c === "[") {
      inClass = true;
      out += c;
      if (src[i + 1] === "^") {
        out += "^";
        i++;
      }
      if (src[i + 1] === "]") throw new Error("a class opening with ] is not translated");
      continue;
    }
    if (c === "(" && src.startsWith("(?P<", i)) {
      out += "(?<";
      i += 3;
      continue;
    }
    out += c;
  }
  return out;
}

function compile(p, extra = "g") {
  return new RegExp(pyToJs(p.source), extra + p.flags + "u");
}

// Python finditer over string[pos:endpos] semantics: lookbehind sees before pos, the string ends at endpos.
function* finditer(rx, s, pos = 0, endpos = s.length) {
  const r = new RegExp(rx.source, rx.flags.includes("g") ? rx.flags : rx.flags + "g");
  const str = endpos < s.length ? s.slice(0, endpos) : s;
  r.lastIndex = pos;
  let m;
  while ((m = r.exec(str)) !== null) {
    yield m;
    if (m[0].length === 0) r.lastIndex = m.index + (str.codePointAt(m.index) > 0xffff ? 2 : 1);
  }
}

function bisectRight(a, x) {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (x < a[mid]) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

function bisectLeft(a, x) {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

const isUpper = (c) => !!c && c.toUpperCase() === c && c.toLowerCase() !== c;
const isLower = (c) => !!c && c.toLowerCase() === c && c.toUpperCase() !== c;
const isDigit = (c) => !!c && /^\p{Nd}$/u.test(c);
const isSpace = (c) => !!c && /^\s$/u.test(c);
const PY_WS = "\\s";
const lstripLen = (s) => s.length - s.replace(new RegExp(`^[${PY_WS}]+`, "u"), "").length;
const rstrip = (s) => s.replace(new RegExp(`[${PY_WS}]+$`, "u"), "");
const strip = (s) => rstrip(s).replace(new RegExp(`^[${PY_WS}]+`, "u"), "");
function stripChars(s, chars) {
  let a = 0;
  let b = s.length;
  while (a < b && chars.includes(s[a])) a++;
  while (b > a && chars.includes(s[b - 1])) b--;
  return s.slice(a, b);
}

export function createChecker(data) {
  const P = {};
  for (const [k, v] of Object.entries(data.patterns)) P[k] = compile(v);
  const plain = (k) => compile(data.patterns[k], "");
  const sticky = (k) => compile(data.patterns[k], "y");
  const NEG_STRICT = plain("NEG_STRICT");
  const REFRAME_A = plain("REFRAME_A");
  const REFRAME_B = plain("REFRAME_B");
  const REFRAME_VERB_A = plain("REFRAME_VERB_A");
  const REFRAME_VERB_B = plain("REFRAME_VERB_B");
  const STRUCTURAL = plain("STRUCTURAL");
  const DA_NEG = plain("DA_NEG");
  const DA_REF_A = plain("DA_REF_A");
  const DA_REF_B = plain("DA_REF_B");
  const RANGE_DASH = plain("RANGE_DASH");
  const TIMING_LINE_TEST = plain("TIMING_LINE");
  const COMMA_END_TEST = plain("COMMA_END");
  const NEXT = sticky("NEXT");
  const TITLE_SPLIT = compile(data.patterns.TITLE_SPLIT, "g");

  const NORM = new Map(data.norm_map.map(([cp, to]) => [String.fromCharCode(cp), to]));
  const INVIS = new Set(data.invisible.map((cp) => String.fromCharCode(cp)));
  const CONFUSABLE = new Map(data.confusable.map(([cp, to]) => [String.fromCharCode(cp), to]));
  const WIDE = new Set(data.wide_stops.map((cp) => String.fromCharCode(cp)));
  const TERMINAL = new Set(data.terminal_chars.map((cp) => String.fromCharCode(cp)));
  const ABBREV = new Set(data.abbrev);
  const EN_FUNC = new Set(data.en_func);
  const DA_FUNC = new Set(data.da_func);
  const META_ALL = new Set(data.meta_all);
  const META_PREFIX = data.meta_prefix;
  const IRREG = data.irregular;
  const isGreekCyr = (c) => c >= "Ͱ" && c <= "ӿ";

  const words = (t) => Array.from(finditer(P.WORD_RE, t), (m) => m[0]);
  const translate = (s) => {
    let out = "";
    for (const c of s) out += NORM.has(c) ? NORM.get(c) : c;
    return out;
  };

  // text.normalize: same length, so offsets survive
  function normalize(original) {
    const norm = translate(original);
    let any = false;
    for (const c of norm) {
      if (INVIS.has(c) || isGreekCyr(c)) {
        any = true;
        break;
      }
    }
    if (!any) return { norm, hidden: [], mixed: [] };
    const out = norm.split("");
    const hidden = [];
    const mixed = [];
    for (const m of finditer(P.OBF_TOKEN, norm)) {
      const tok = m[0];
      const chars = tok.split("");
      const hasInv = chars.some((c) => INVIS.has(c));
      const hasOther = chars.some(isGreekCyr);
      if (!hasInv && !hasOther) continue;
      let core = chars.filter((c) => !INVIS.has(c)).join("");
      if (hasInv && core) {
        const vis = chars.map((c, i) => (INVIS.has(c) ? -1 : i)).filter((i) => i >= 0);
        if (chars.slice(vis[0], vis[vis.length - 1] + 1).some((c) => INVIS.has(c))) {
          hidden.push([m.index, m.index + tok.length]);
        }
      }
      if (hasOther && /[A-Za-z]/.test(core) && /[Ͱ-ӿ]/.test(core)) {
        core = core
          .split("")
          .map((c) => (CONFUSABLE.has(c) ? CONFUSABLE.get(c) : c))
          .join("");
        mixed.push([m.index, m.index + tok.length]);
      }
      const rep = (core + " ".repeat(tok.length - core.length)).split("");
      for (let k = 0; k < tok.length; k++) out[m.index + k] = rep[k];
    }
    return { norm: out.join(""), hidden, mixed };
  }

  function normTitle(title) {
    let t = title.replace(/\([^)\n]*\)/g, " ");
    t = stripChars(strip(t), "*_ ").toLowerCase();
    t = t.replace(/^(?:\d{1,2}[.):]\s*)/u, "");
    t = t.replace(/[\s:.!?-]+$/u, "");
    return strip(t.replace(/\s+/gu, " "));
  }

  function isMetaHeading(title) {
    const t = normTitle(title);
    if (!t) return false;
    if (META_ALL.has(t) || META_PREFIX.some((p) => t.startsWith(p))) return true;
    const parts = t.split(TITLE_SPLIT).filter((p) => p);
    return parts.length > 1 && parts.every((p) => META_ALL.has(p) || META_PREFIX.some((q) => p.startsWith(q)));
  }

  // text._mask for the article register (the sites never check a script)
  function mask(original) {
    const { norm, hidden, mixed } = normalize(original);
    const buf = norm.split("");
    const counted = {};
    // cat: only the prose categories are counted (they decide the coverage flag)
    const blank = (s, e, cat) => {
      let ws = true;
      for (let i = s; i < e; i++) {
        if (!/\s/u.test(buf[i])) {
          ws = false;
          break;
        }
      }
      if (ws) return;
      if (cat) counted[cat] = (counted[cat] || 0) + words(buf.slice(s, e).join("")).length;
      for (let i = s; i < e; i++) if (buf[i] !== "\n" && buf[i] !== " ") buf[i] = " ";
    };
    const text = () => buf.join("");
    let cur = norm;
    const run = (rx, cat) => {
      for (const m of finditer(rx, cur)) blank(m.index, m.index + m[0].length, cat);
    };
    run(P.FENCE);
    run(P.HTML_COMMENT);
    if (TIMING_LINE_TEST.test(cur)) {
      run(P.TIMING_LINE);
      run(P.WEBVTT);
      run(P.INDEX_LINE);
    }
    run(P.VTT_TAG);
    const policy = text();
    run(P.HTML_TAG);
    run(P.MD_IMAGE);
    for (const m of finditer(P.MD_LINK, cur)) {
      blank(m.index, m.index + 1);
      blank(m.index + 1 + m[1].length, m.index + m[0].length);
    }
    cur = text();
    run(P.URL);
    run(P.EMAIL);
    run(P.INLINE_CODE);
    cur = text();
    const heads = Array.from(finditer(P.HEADING, cur), (m) => [
      m.index,
      m.index + m[0].length,
      m[1].length,
      strip(stripChars(strip(m[2]), "*_ ")),
    ]);
    heads.forEach(([hs, he, lvl, title], i) => {
      blank(hs, he);
      if (isMetaHeading(title)) {
        let end = cur.length;
        for (const [hs2, , lvl2] of heads.slice(i + 1)) {
          if (lvl2 <= lvl) {
            end = hs2;
            break;
          }
        }
        blank(he, end, "meta_section");
      }
    });
    cur = text();
    run(P.RULE);
    run(P.TABLE);
    run(P.DIALOGUE, "dialogue");
    run(P.NOTE_LINE);
    cur = text();
    run(P.WHOLE_EMPH);
    cur = text();
    for (const m of finditer(P.LABEL, cur)) {
      const s = m.index + m[1].length;
      blank(s, s + m[2].length);
    }
    for (const m of finditer(P.LABEL_LINE, cur)) blank(m.index, m.index + m[0].length);
    cur = text();
    for (const m of finditer(P.BRACKET, cur)) {
      // a long bracket is prose hidden as a note, not a note
      const n = words(m[0]).length;
      blank(m.index, m.index + m[0].length);
      if (n >= data.long_note_words) counted.long_note = (counted.long_note || 0) + n;
    }
    run(P.PAREN_NOTE);
    cur = text();
    run(P.QUOTE_MARK);
    for (const m of finditer(P.LIST_MARK, cur)) {
      const s = m.index + m[1].length;
      blank(s, s + m[2].length);
    }
    cur = text();
    for (const m of finditer(P.EMPH_MARK, cur)) blank(m.index, m.index + m[0].length);
    return { work: text(), policy, hidden, mixed, counted };
  }

  function quoteSpans(work) {
    const spans = [];
    let pos = 0;
    for (const para of work.split(/(\n[ ]*\n)/)) {
      const marks = [];
      for (let i = 0; i < para.length; i++) {
        if (para[i] === '"' && !(i > 0 && isDigit(para[i - 1]))) marks.push(pos + i);
      }
      for (let k = 0; k + 1 < marks.length; k += 2) {
        if (marks[k + 1] - marks[k] <= 600) spans.push([marks[k], marks[k + 1] + 1]);
      }
      pos += para.length;
    }
    return spans;
  }

  function lineated(lines) {
    const body = lines.map(strip).filter((l) => l);
    if (body.length < 3) return false;
    const noEnd = body.filter((l) => !TERMINAL.has(l[l.length - 1])).length;
    let caps = 0;
    for (const l of body) {
      const m = /[A-Za-zÀ-ɏ0-9]/.exec(l);
      if (m && (isUpper(m[0]) || isDigit(m[0]))) caps++;
    }
    const avg = body.reduce((n, l) => n + words(l).length, 0) / body.length;
    return noEnd / body.length >= 0.6 && caps / body.length >= 0.8 && avg <= 14;
  }

  function inQuoteAt(pos, quotes, qstarts) {
    const i = bisectLeft(qstarts, pos) - 1;
    return i >= 0 && quotes[i][0] < pos && pos < quotes[i][1];
  }

  function isBoundary(seg, m, base, quotes, qstarts) {
    const mEnd = m.index + m[0].length;
    const endAbs = base + mEnd;
    const punct = m[0];
    const before = seg.slice(Math.max(0, m.index - 40), m.index);
    const tok = /([A-Za-zÀ-ɏ.]+)$/.exec(before);
    NEXT.lastIndex = mEnd;
    const nx = NEXT.exec(seg);
    const nxt = nx ? nx[1] : "";
    if (punct === "." && tok) {
      const t = tok[1].toLowerCase().replace(/\.+$/, "");
      if (["e.g", "i.e", "eg", "ie", "a.m", "p.m"].includes(t)) return false;
      if (t === "no" || t === "nr") {
        if (isDigit(nxt)) return false;
      } else if (ABBREV.has(t)) return false;
      if (tok[1].length === 1 && isUpper(tok[1]) && isUpper(nxt)) return false;
    }
    if ((punct.startsWith("..") || punct.startsWith("…")) && isLower(nxt)) return false;
    if ("\"')]".includes(punct[punct.length - 1]) && isLower(nxt)) return false;
    return !inQuoteAt(endAbs, quotes, qstarts);
  }

  function splitSegment(seg, base, quotes, qstarts, commas, wide) {
    let ends = [];
    for (const m of finditer(P.SENT_END, seg)) {
      if (isBoundary(seg, m, base, quotes, qstarts)) ends.push(m.index + m[0].length);
    }
    if (wide) {
      const lo = bisectLeft(wide, base);
      const hi = bisectLeft(wide, base + seg.length);
      const set = new Set(ends);
      for (const p of wide.slice(lo, hi)) set.add(p - base + 1);
      ends = Array.from(set).sort((a, b) => a - b);
    }
    let out = [];
    let last = 0;
    for (const e of ends) {
      if (e > last) {
        out.push([last, e]);
        last = e;
      }
    }
    if (last < seg.length) out.push([last, seg.length]);
    if (commas) {
      const cut = [];
      for (const [s, e] of out) {
        let p = s;
        for (const m of finditer(P.COMMA_END, seg, s, e)) {
          const me = m.index + m[0].length;
          if (!inQuoteAt(base + me, quotes, qstarts)) {
            cut.push([p, me]);
            p = me;
          }
        }
        cut.push([p, e]);
      }
      out = cut;
    }
    const res = [];
    for (const [s, e] of out) {
      const chunk = seg.slice(s, e);
      const ls = lstripLen(chunk);
      const rs = rstrip(chunk).length;
      if (rs > ls) res.push([base + s + ls, base + s + rs]);
    }
    return res;
  }

  function quotedChars(ss, se, quotes, qstarts) {
    let i = Math.max(0, bisectRight(qstarts, ss) - 1);
    let n = 0;
    while (i < quotes.length && quotes[i][0] < se) {
      const [qs, qe] = quotes[i];
      if (qe > ss) n += Math.min(se, qe) - Math.max(ss, qs);
      i++;
    }
    return n;
  }

  function sentences(work, paraSpans, listStarts, quotes, qstarts, commas, wide) {
    const sents = [];
    let anyLineated = false;
    for (const [, , lines] of paraSpans) {
      const lin = lineated(lines.map(([s, e]) => work.slice(s, e)));
      anyLineated = anyLineated || lin;
      const groups = [];
      for (const [s, e] of lines) {
        if (lin || !groups.length || listStarts.has(s)) groups.push([s, e]);
        else groups[groups.length - 1] = [groups[groups.length - 1][0], e];
      }
      for (const [gs, ge] of groups) {
        const seg = work.slice(gs, ge).replace(/\n/g, " ");
        for (const [ss, se] of splitSegment(seg, gs, quotes, qstarts, commas, wide)) {
          const txt = work.slice(ss, se);
          const toks = words(txt);
          if (!toks.length) continue;
          const qchars = quotedChars(ss, se, quotes, qstarts);
          const wchars = strip(txt).length;
          const quoted = wchars > 0 && qchars >= 0.8 * wchars;
          sents.push({ start: ss, end: se, text: txt, n: toks.length, quoted });
        }
      }
    }
    return { sents, anyLineated };
  }

  function sparse(sents, anyLineated, commas) {
    const scored = sents.filter((s) => !s.quoted);
    const nWords = scored.reduce((n, s) => n + s.n, 0);
    const ends = ".!?…\"')";
    const terminals = commas
      ? scored.length
      : scored.filter((s) => {
          const r = rstrip(s.text);
          return r.length > 0 && ends.includes(r[r.length - 1]);
        }).length;
    return nWords >= 60 && nWords / Math.max(1, terminals) > 40 && !anyLineated;
  }

  function detectLanguage(text) {
    const toks = text.toLowerCase().match(/[a-zæøå']+/g) || [];
    const en = toks.filter((t) => EN_FUNC.has(t)).length;
    let da = toks.filter((t) => DA_FUNC.has(t)).length;
    da += Math.floor((2 * (text.match(/[æøåÆØÅ]/g) || []).length) / 3);
    if (en === 0 && da === 0) return "und";
    return da > en ? "da" : "en";
  }

  // text.segment, article register
  function segment(original) {
    const { work, policy, hidden, mixed, counted } = mask(original);
    const quotes = quoteSpans(work);
    const qstarts = quotes.map((q) => q[0]);
    const lineStarts = [0];
    for (let i = 0; i < work.length; i++) if (work[i] === "\n") lineStarts.push(i + 1);
    const paraSpans = [];
    let cur = [];
    let pos = 0;
    for (const ln of work.split("\n")) {
      const s = pos;
      const e = pos + ln.length;
      if (strip(ln)) cur.push([s, e]);
      else if (cur.length) {
        paraSpans.push([cur[0][0], cur[cur.length - 1][1], cur]);
        cur = [];
      }
      pos = e + 1;
    }
    if (cur.length) paraSpans.push([cur[0][0], cur[cur.length - 1][1], cur]);
    const listStarts = new Set();
    for (const m of finditer(P.LIST_MARK, translate(original))) {
      listStarts.add(lineStarts[bisectRight(lineStarts, m.index) - 1]);
    }
    let wide = null;
    if (original.split("").some((c) => WIDE.has(c))) {
      wide = [];
      for (let i = 0; i < original.length; i++) {
        if (WIDE.has(original[i]) && i + 1 < original.length && !isSpace(original[i + 1])) wide.push(i);
      }
    }
    let { sents, anyLineated } = sentences(work, paraSpans, listStarts, quotes, qstarts, false, wide);
    if (sparse(sents, anyLineated, false) && COMMA_END_TEST.test(work)) {
      const r2 = sentences(work, paraSpans, listStarts, quotes, qstarts, true, wide);
      if (!sparse(r2.sents, r2.anyLineated, true)) ({ sents, anyLineated } = r2);
    }
    const scored = sents.filter((s) => !s.quoted);
    const nWords = scored.reduce((n, s) => n + s.n, 0);
    const quotedWords = sents.filter((s) => s.quoted).reduce((n, s) => n + s.n, 0);
    const unscored = data.prose_cats.reduce((n, c) => n + (counted[c] || 0), 0) + quotedWords;
    const doc = {
      unscored,
      original,
      work,
      policy,
      hidden,
      mixed,
      quotes,
      qstarts,
      lineStarts,
      sentences: sents,
      scored,
      nWords,
      language: detectLanguage(work),
    };
    doc.inQuote = (s, e) => {
      const i = bisectRight(qstarts, s) - 1;
      for (const j of [i, i + 1]) {
        if (j >= 0 && j < quotes.length) {
          const [qs, qe] = quotes[j];
          if (s < qe && e > qs) return true;
        }
      }
      return false;
    };
    doc.lineOf = (off) => bisectRight(lineStarts, off);
    return doc;
  }

  // tells.py detectors
  const lead = (s) => s.text.replace(/^[\s"'(]+/u, "");

  function detNotNotZ(doc) {
    const ss = doc.scored;
    const out = [];
    let i = 0;
    while (i + 2 < ss.length) {
      const [a, b, c] = [ss[i], ss[i + 1], ss[i + 2]];
      if (NEG_STRICT.test(lead(a)) && NEG_STRICT.test(lead(b)) && a.n <= 12 && b.n <= 12 && !NEG_STRICT.test(lead(c))) {
        out.push([a.start, c.end]);
        i += 3;
        continue;
      }
      i++;
    }
    return out;
  }

  function sameVerb(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (["not", "be", "have", "do"].includes(a) || ["not", "n't", "never"].includes(b)) return false;
    return b.startsWith(a) || b === IRREG[a] || (a.length >= 4 && b.slice(0, 4) === a.slice(0, 4));
  }

  function detReframe(doc) {
    const ss = doc.scored;
    const out = [];
    for (let i = 0; i + 1 < ss.length; i++) {
      const [a, b] = [ss[i], ss[i + 1]];
      const la = lead(a);
      const lb = lead(b);
      if (a.n > 16 || rstrip(a.text).endsWith("?")) continue;
      if (REFRAME_A.test(la) && REFRAME_B.test(lb)) {
        out.push([a.start, b.end]);
        continue;
      }
      const va = REFRAME_VERB_A.exec(la);
      const vb = REFRAME_VERB_B.exec(lb);
      if (va && vb && b.n <= 20 && sameVerb(va[2], vb[1])) out.push([a.start, b.end]);
    }
    for (const m of finditer(P.REFRAME_INLINE, doc.work)) {
      if (!doc.inQuote(m.index, m.index + m[0].length)) out.push([m.index, m.index + m[0].length]);
    }
    return uniqSorted(out);
  }

  function detStockMetaphor(doc) {
    const out = [];
    for (const m of finditer(P.STOCK, doc.work)) {
      const s = m.index;
      const e = s + m[0].length;
      if (doc.inQuote(s, e)) continue;
      if (m[0].toLowerCase().startsWith("load")) {
        const sent = doc.sentences.find((x) => x.start <= s && s < x.end);
        const ctx = sent ? sent.text : doc.work.slice(Math.max(0, s - 80), e + 80);
        if (STRUCTURAL.test(ctx)) continue;
      }
      out.push([s, e]);
    }
    return out;
  }

  function detDaLadder(doc) {
    const ss = doc.scored;
    const out = [];
    let i = 0;
    while (i + 2 < ss.length) {
      const [a, b, c] = [ss[i], ss[i + 1], ss[i + 2]];
      if (DA_NEG.test(lead(a)) && DA_NEG.test(lead(b)) && a.n <= 12 && b.n <= 12 && !DA_NEG.test(lead(c))) {
        out.push([a.start, c.end]);
        i += 3;
        continue;
      }
      i++;
    }
    for (const m of finditer(P.DA_LADDER_INLINE, doc.work)) {
      if (!doc.inQuote(m.index, m.index + m[0].length)) out.push([m.index, m.index + m[0].length]);
    }
    return uniqSorted(out);
  }

  function detDaReframe(doc) {
    const ss = doc.scored;
    const out = [];
    for (let i = 0; i + 1 < ss.length; i++) {
      if (DA_REF_A.test(lead(ss[i])) && DA_REF_B.test(lead(ss[i + 1])) && ss[i].n <= 14) {
        out.push([ss[i].start, ss[i + 1].end]);
      }
    }
    return out;
  }

  function uniqSorted(spans) {
    const seen = new Set();
    const out = [];
    for (const sp of spans) {
      const k = sp[0] + ":" + sp[1];
      if (!seen.has(k)) {
        seen.add(k);
        out.push(sp);
      }
    }
    return out.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  }

  const regexDet = (rx) => (doc) => {
    const out = [];
    for (const m of finditer(rx, doc.work)) {
      const s = m.index;
      const e = s + m[0].length;
      if (e > s && !doc.inQuote(s, e)) out.push([s, e]);
    }
    return out;
  };

  const DETECTORS = {};
  for (const [id, t] of Object.entries(data.tells)) {
    if (t.detector === "regex") DETECTORS[id] = regexDet(compile(t.pattern));
    else if (t.detector === "dash") DETECTORS[id] = (doc) => Array.from(finditer(P.DASH, doc.policy || doc.work), (m) => [m.index, m.index + m[0].length]);
    else if (t.detector === "hidden_char") DETECTORS[id] = (doc) => doc.hidden.slice();
    else if (t.detector === "mixed_script") DETECTORS[id] = (doc) => doc.mixed.slice();
    else if (t.detector === "not_not_z") DETECTORS[id] = detNotNotZ;
    else if (t.detector === "reframe") DETECTORS[id] = detReframe;
    else if (t.detector === "stock_metaphor") DETECTORS[id] = detStockMetaphor;
    else if (t.detector === "da_ladder") DETECTORS[id] = detDaLadder;
    else if (t.detector === "da_reframe") DETECTORS[id] = detDaReframe;
    else throw new Error(`voicecheck.json names a detector this port does not have: ${t.detector}`);
  }

  const DASH_SET = new Set(data.dash_chars.map((cp) => String.fromCharCode(cp)));
  const undashed = (s) =>
    s
      .split("")
      .map((c) => (DASH_SET.has(c) ? "[dash]" : c))
      .join("");

  function lineText(doc, s, e) {
    const o = doc.original;
    const a = s === 0 ? 0 : o.lastIndexOf("\n", s - 1) + 1;
    let b = o.indexOf("\n", e);
    if (b < 0) b = o.length;
    return o.slice(a, b);
  }

  function quote(doc, s, e) {
    const line = strip(lineText(doc, s, e).replace(/\s+/gu, " "));
    let q = line;
    if (q.length > 160) {
      const span = strip(doc.original.slice(s, e).replace(/\s+/gu, " "));
      const at = q.indexOf(span.slice(0, 40));
      const from = Math.max(0, (at < 0 ? 0 : at) - 50);
      q = (from > 0 ? "..." : "") + q.slice(from, from + 150) + (from + 150 < q.length ? "..." : "");
    }
    return undashed(q);
  }

  const SHORT = data.short;
  const bandOf = (score) => (score >= SHORT.block ? "block" : score >= SHORT.flag ? "flag" : "pass");
  const ORDER = { pass: 0, flag: 1, block: 2, error: 3 };

  function signatureScore(nSig, nWords) {
    const nEff = nWords > SHORT.per_words ? nSig * Math.min(1, SHORT.per_words / nWords) : nSig;
    if (nEff >= 2) return Math.min(100, SHORT.score["2"] + 10 * (nEff - 2));
    if (nEff >= 1) return SHORT.score["1"];
    return nSig === 0 ? SHORT.score["0"] : 25;
  }

  // The short-mode verdict: {band, score, language, words, findings, policy, signatures}.
  function check(text) {
    text = typeof text === "string" ? text : String(text ?? "");
    const doc = segment(text);
    const lang = doc.language === "en" || doc.language === "da" ? doc.language : "en";
    const sigLang = doc.language === "da" ? "da" : "en";
    const sigs = data.signatures[sigLang].filter((id) => data.tells[id] && data.tells[id].languages.includes(sigLang));
    const hits = {};
    for (const [id, t] of Object.entries(data.tells)) {
      if (!t.languages.includes(lang) && !t.hard) continue;
      hits[id] = DETECTORS[id](doc);
    }
    const findings = [];
    const make = (id, kind, s, e) => {
      const t = data.tells[id];
      const f = { tell: id, name: t.name, kind, line: doc.lineOf(s), start: s, end: e, quote: quote(doc, s, e), why: t.why, fix: t.fix };
      if (id === "dash" && RANGE_DASH.test((doc.policy || doc.work).slice(Math.max(0, s - 3), s))) f.fix = data.range_fix;
      return f;
    };
    const policy = {};
    for (const id of data.policy_ids) {
      const spans = hits[id] || [];
      policy[id] = spans.length;
      for (const [s, e] of spans) findings.push(make(id, "policy", s, e));
    }
    let nSig = 0;
    const sigFindings = [];
    for (const id of sigs) {
      for (const [s, e] of hits[id] || []) {
        nSig++;
        sigFindings.push(make(id, "signature", s, e));
      }
    }
    sigFindings.sort((x, y) => x.start - y.start || (x.tell < y.tell ? -1 : x.tell > y.tell ? 1 : 0));
    findings.push(...sigFindings);
    let score = Math.round(signatureScore(nSig, Math.max(1, doc.nWords)) * 10) / 10;
    let band = bandOf(score);
    const polBand = policy.dash ? "block" : policy.hidden_char || policy.mixed_script ? "flag" : "pass";
    if (ORDER[polBand] > ORDER[band]) {
      band = polBand;
      score = Math.round(Math.max(score, policy.dash ? SHORT.dash_floor : SHORT.flag_floor) * 10) / 10;
    }
    // coverage: a text that hides itself in quotes, dialogue lines or meta sections cannot pass on
    // what was not read (flag only)
    const un = doc.unscored;
    const share = doc.nWords + un === 0 ? 1 : doc.nWords / (doc.nWords + un);
    const [smShare, smWords, smUnscored] = data.unscored_small;
    const [lgShare, lgUnscored] = data.unscored_large;
    const coverage = (share < smShare && doc.nWords < smWords && un >= smUnscored) || (share < lgShare && un >= lgUnscored);
    if (coverage && ORDER.flag > ORDER[band]) {
      band = "flag";
      score = Math.round(Math.max(score, SHORT.flag_floor) * 10) / 10;
    }
    return { band, score, language: doc.language, words: doc.nWords, unscored: un, coverage, signatures: nSig, policy, findings };
  }

  return { check, version: data.version, engineSha: data.engine_sha, segment };
}

// Expand the [[XXXX]] placeholders the fixture file uses for characters it must not carry.
export function expandPlaceholders(s) {
  return s.replace(/\[\[([0-9a-fA-F]{4})\]\]/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Run the fixture file against a checker: [] when every case agrees with Python, else the differences.
export function selfTest(checker, fixtures) {
  const bad = [];
  for (const c of fixtures.cases) {
    const v = checker.check(expandPlaceholders(c.text));
    const got = v.findings.map((f) => [f.tell, f.start, f.end]).sort(cmpTriple);
    const want = c.findings.slice().sort(cmpTriple);
    if (v.band !== c.band || JSON.stringify(got) !== JSON.stringify(want)) {
      bad.push({ text: c.text, want: { band: c.band, findings: want }, got: { band: v.band, findings: got } });
    }
  }
  return bad;
}

function cmpTriple(a, b) {
  if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
  return a[1] - b[1] || a[2] - b[2];
}
