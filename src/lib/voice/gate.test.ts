import { describe, it, expect } from "vitest";
import data from "../../../voicecheck/voicecheck.json";
import fixtures from "../../../voicecheck/voicecheck-fixtures.test.json";
import { createChecker, selfTest } from "../../../voicecheck/check.mjs";
import { checkField, checkFields, leafInputs, readOverride, refusalText, flagText, textSha } from "./gate";
import { undashText, undashDeep } from "./output";

// built from code points: no long dash sits in this file
const EM = String.fromCharCode(0x2014);
const EN = String.fromCharCode(0x2013);
const DASHES = [0x2014, 0x2013, 0x2015, 0x2012].map((c) => String.fromCharCode(c));

describe("the JS port agrees with brain/voicecheck", () => {
  it("reproduces every exported fixture verdict", () => {
    expect(selfTest(createChecker(data), fixtures)).toEqual([]);
  });
});

describe("checkField on a new text", () => {
  it("passes plain copy", () => {
    expect(checkField({ field: "title", text: "I built the bench from three old pallets." }).band).toBe("pass");
  });
  it("blocks a long dash", () => {
    const r = checkField({ field: "title", text: `The bench is done ${EM} and it looks great.` });
    expect(r.band).toBe("block");
    expect(r.findings.map((f) => f.tell)).toEqual(["dash"]);
  });
  it("blocks an HTML entity dash too", () => {
    expect(checkField({ field: "content", text: "Oil and wax &mdash; nothing else." }).band).toBe("block");
  });
  it("flags one signature tell", () => {
    expect(checkField({ field: "description", text: "The wood here is genuinely beautiful." }).band).toBe("flag");
  });
  it("blocks two signature tells", () => {
    const r = checkField({ field: "content", text: "Here's the thing. The wood is genuinely beautiful." });
    expect(r.band).toBe("block");
  });
  it("blocks the Not X. Not Y. Z. ladder with a second tell", () => {
    const r = checkField({ field: "content", text: "Not for the views. Not for the money. For my daughter. It is genuinely hers." });
    expect(r.findings.map((f) => f.tell).sort()).toEqual(["genuinely", "not_not_z"]);
    expect(r.band).toBe("block");
  });
  it("does not count a quotation", () => {
    expect(checkField({ field: "content", text: 'She wrote "this is genuinely the best" in the comments.' }).band).toBe("pass");
  });
});

describe("an update is judged on what it adds", () => {
  const before = `## Finish\n\nTwo coats ${EM} then done.\n\nThe oil cures overnight.`;
  it("passes an edit elsewhere in a text that already had a dash", () => {
    const after = `## Finish\n\nTwo coats ${EM} then done.\n\nThe oil cures overnight, then I buff it.`;
    expect(checkField({ field: "content", text: after, before }).band).toBe("pass");
  });
  it("blocks a new dash on another line", () => {
    const after = `${before}\n\nBuff it ${EN} by hand.`;
    const r = checkField({ field: "content", text: after, before });
    expect(r.band).toBe("block");
    expect(r.findings).toHaveLength(1);
  });
  it("blocks when the line that had the dash is edited and keeps it", () => {
    const after = `## Finish\n\nTwo thin coats ${EM} then done.\n\nThe oil cures overnight.`;
    expect(checkField({ field: "content", text: after, before }).band).toBe("block");
  });
  it("judges the whole text when there is no before (create, publish)", () => {
    expect(checkFields([{ field: "content", text: before }]).band).toBe("block");
  });
});

describe("JSON leaves", () => {
  const section = {
    title: "Fresh from the workshop",
    ctaHref: "/blog",
    image: "/images/bench.jpg",
    items: [{ label: `Buy now ${EM} 3 euro`, url: "https://example.com/x" }],
  };
  it("reads copy and skips links, images and ids", () => {
    const fields = leafInputs(section, undefined, "data").map((f) => f.field);
    expect(fields).toEqual(["data.title", "data.items[0].label"]);
  });
  it("compares each leaf with the same path before", () => {
    const r = checkFields(leafInputs(section, section, "data"));
    expect(r.band).toBe("pass");
    const changed = { ...section, title: `New ${EM} fresh` };
    expect(checkFields(leafInputs(changed, section, "data")).band).toBe("block");
  });
});

describe("override and messages", () => {
  it("needs a real reason", () => {
    expect(readOverride(undefined)).toBeNull();
    expect(readOverride({ reason: "ok" })).toBeNull();
    expect(readOverride({ reason: "Jesper said keep it, 2026-10-15" })).toEqual({ reason: "Jesper said keep it, 2026-10-15" });
  });
  it("names the lines, the override and no dash", () => {
    const r = checkFields([{ field: "content", text: `Done ${EM} finally. Here's the thing. It is genuinely good.` }]);
    const msg = refusalText("update_blog_post", r);
    expect(msg).toContain("VOICE GATE: not saved (update_blog_post)");
    expect(msg).toContain("voiceOverride");
    expect(msg).toContain("[dash]");
    for (const d of DASHES) expect(msg).not.toContain(d);
    const flag = flagText(checkFields([{ field: "title", text: "A genuinely good bench." }]));
    expect(flag).toContain("advisory");
  });
  it("hashes text the way the Spark approvals do", () => {
    // brain/voicecheck/approvals.py text_sha of the same text
    expect(textSha(["The bench is done.\n\n  It took a  weekend."])).toBe(
      "e964c90d79d6982512c890a7ef1707d4de74f413a05dd58c507ebad5357fe32d",
    );
  });
});

describe("AI output filter", () => {
  it("turns ranges into hyphens and other dashes into commas", () => {
    expect(undashText(`5${EN}10 days`)).toBe("5-10 days");
    expect(undashText(`I Built a Cabin ${EM} And It Changed Everything`)).toBe("I Built a Cabin, And It Changed Everything");
    expect(undashText(`${EM} optional`)).toBe("optional");
    expect(undashText("plain text")).toBe("plain text");
  });
  it("cleans every string in a parsed answer", () => {
    const out = undashDeep({ a: [`x ${EM} y`], b: { c: `p${EM}q.` }, n: 3 });
    expect(out).toEqual({ a: ["x, y"], b: { c: "p, q." }, n: 3 });
  });
});
