// Parsers for the third-party video embeds VideoFacade renders. Kept free of
// JSX so they can be unit tested (vitest here does not transform JSX).

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Accepts a bare id or any common YouTube URL; returns the 11 character id. */
export function youTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  if (YT_ID.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = u.searchParams.get("v");
      if (!id) {
        const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
        id = m ? m[1] : null;
      }
    }
    return id && YT_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Only https Instagram embed URLs get through; anything else renders nothing. */
export function instagramEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    const u = new URL(input.trim());
    const host = u.hostname.replace(/^www\./, "");
    if (u.protocol !== "https:" || host !== "instagram.com") return null;
    return u.toString();
  } catch {
    return null;
  }
}
