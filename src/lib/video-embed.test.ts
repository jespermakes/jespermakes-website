import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { instagramEmbedUrl, youTubeId } from "./video-embed";

describe("youTubeId", () => {
  it("takes a bare id", () => {
    expect(youTubeId("2BHyRzhCAPY")).toBe("2BHyRzhCAPY");
    expect(youTubeId("  Rjn-C-ZgjYI ")).toBe("Rjn-C-ZgjYI");
  });

  it("pulls the id out of the usual URLs", () => {
    expect(youTubeId("https://www.youtube.com/watch?v=GCzn9aFKa-4&t=30")).toBe("GCzn9aFKa-4");
    expect(youTubeId("https://youtu.be/uFguK77AQxE")).toBe("uFguK77AQxE");
    expect(youTubeId("https://www.youtube.com/embed/H1akbcvsSVA")).toBe("H1akbcvsSVA");
    expect(youTubeId("https://www.youtube-nocookie.com/embed/H1akbcvsSVA?rel=0")).toBe("H1akbcvsSVA");
    expect(youTubeId("https://m.youtube.com/shorts/iVkazXhTvX0")).toBe("iVkazXhTvX0");
  });

  it("refuses anything that is not a YouTube video", () => {
    expect(youTubeId(null)).toBeNull();
    expect(youTubeId("")).toBeNull();
    expect(youTubeId("not-an-id")).toBeNull();
    expect(youTubeId("https://evil.example/watch?v=GCzn9aFKa-4")).toBeNull();
    expect(youTubeId('"><script>')).toBeNull();
  });
});

describe("instagramEmbedUrl", () => {
  it("passes an https Instagram embed", () => {
    expect(instagramEmbedUrl("https://www.instagram.com/p/DRFFW_iCNzz/embed")).toBe(
      "https://www.instagram.com/p/DRFFW_iCNzz/embed",
    );
  });

  it("refuses other hosts and schemes", () => {
    expect(instagramEmbedUrl("http://www.instagram.com/p/x/embed")).toBeNull();
    expect(instagramEmbedUrl("https://instagram.com.evil.example/p/x")).toBeNull();
    expect(instagramEmbedUrl("javascript:alert(1)")).toBeNull();
    expect(instagramEmbedUrl(undefined)).toBeNull();
  });
});

// The guard: a plain YouTube or Instagram iframe anywhere in the app loads
// Google or Meta before the visitor has agreed to anything. Every video goes
// through VideoFacade, which is the only file allowed to hold such an iframe.
describe("no third-party video iframes outside the facade", () => {
  const src = join(__dirname, "..");
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) files.push(full);
    }
  };
  walk(src);

  it("finds the source files", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("has no youtube.com/embed or instagram embed iframe outside video-facade.tsx", () => {
    const offenders = files
      .filter((f) => !f.endsWith(join("components", "video-facade.tsx")))
      .filter((f) => {
        const s = readFileSync(f, "utf-8");
        return /youtube\.com\/embed|youtube-nocookie\.com\/embed/.test(s) ||
          (/<iframe/.test(s) && /videoEmbedUrl|instagram\.com/.test(s));
      })
      .map((f) => f.slice(src.length + 1));
    expect(offenders).toEqual([]);
  });
});
