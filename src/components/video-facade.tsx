"use client";

// Click-to-play facade for third-party video embeds (YouTube, Instagram).
//
// Why: a plain YouTube iframe sets five youtube.com cookies and calls
// doubleclick.net the moment the page loads, before the visitor has agreed to
// anything (measured 2026-11-20 with scripts/consent-probe.cjs). In the EU
// that needs consent first. Until the visitor clicks play, this renders only
// first-party markup: the YouTube poster goes through next/image, so the
// browser asks jespermakes.com for it and never talks to Google. The click is
// the consent; only then does the player load, from youtube-nocookie.com.
//
// Every facade carries data-video-facade so the probe can find and click it.

import Image from "next/image";
import { useState } from "react";
import { instagramEmbedUrl, youTubeId } from "@/lib/video-embed";

type Common = {
  title: string;
  /** Classes for the outer box. It must give the box a size (aspect + width). */
  className?: string;
};

type Props =
  | (Common & { provider: "youtube"; video: string })
  | (Common & { provider: "instagram"; embedUrl: string; poster?: string | null });

function PlayIcon() {
  return (
    <span
      aria-hidden
      className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 ring-1 ring-white/30 transition-colors group-hover:bg-forest group-focus-visible:bg-forest"
    >
      <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-white">
        <path d="M8 5.5v13l11-6.5z" />
      </svg>
    </span>
  );
}

export function VideoFacade(props: Props) {
  const [playing, setPlaying] = useState(false);
  // maxresdefault is sharp but missing on some older uploads; hqdefault
  // always exists, so a failed HD poster drops back to it.
  const [hd, setHd] = useState(true);
  const box = `relative overflow-hidden bg-black ${props.className ?? ""}`;

  if (props.provider === "youtube") {
    const id = youTubeId(props.video);
    if (!id) return null;
    if (playing) {
      return (
        <div className={box}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={props.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      );
    }
    return (
      <div className={box}>
        <button
          type="button"
          data-video-facade="youtube"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${props.title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <Image
            src={`https://i.ytimg.com/vi/${id}/${hd ? "maxresdefault" : "hqdefault"}.jpg`}
            onError={() => setHd(false)}
            alt=""
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            className="object-cover"
          />
          <span className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
          <span className="absolute inset-0 flex items-center justify-center">
            <PlayIcon />
          </span>
          <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[11px] text-white/85">
            Plays from YouTube when you click
          </span>
        </button>
      </div>
    );
  }

  const url = instagramEmbedUrl(props.embedUrl);
  if (!url) return null;
  if (playing) {
    return (
      <div className={box}>
        <iframe
          src={url}
          title={props.title}
          scrolling="no"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }
  return (
    <div className={box}>
      <button
        type="button"
        data-video-facade="instagram"
        onClick={() => setPlaying(true)}
        aria-label={`Play video: ${props.title}`}
        className="group absolute inset-0 h-full w-full cursor-pointer"
      >
        {props.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={props.poster} alt="" className="absolute inset-0 h-full w-full bg-white object-contain" />
        ) : null}
        <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/5" />
        <span className="absolute inset-0 flex items-center justify-center">
          <PlayIcon />
        </span>
        <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[11px] text-white/85">
          Plays from Instagram when you click
        </span>
      </button>
    </div>
  );
}
