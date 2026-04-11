"use client";

import { useState, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TitleSuggestion {
  title: string;
  reasoning: string;
  pattern?: string;
}

interface VideoInfo {
  id: string;
  title: string;
  channelTitle: string;
  views: number;
  likes: number;
  comments: number;
  thumbnail: string;
  duration: string;
  publishedAt: string;
}

interface UrlAnalysisResult {
  video: VideoInfo;
  currentTitleDiagnosis: string;
  jesperStyle: TitleSuggestion[];
  mrbeastStyle: TitleSuggestion[];
  alternatives: TitleSuggestion[];
  thumbnailSuggestion: string;
}

interface BrainstormResult {
  jesperStyle: TitleSuggestion[];
  mrbeastStyle: TitleSuggestion[];
  alternatives: TitleSuggestion[];
  thumbnailSuggestions: string[];
  titleWarnings: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1e6
    ? `${(n / 1e6).toFixed(1)}M`
    : n >= 1e3
    ? `${(n / 1e3).toFixed(0)}k`
    : String(n);
}

function Dots() {
  return (
    <span className="inline-flex gap-1 justify-center">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="w-1.5 h-1.5 rounded-full bg-amber animate-bounce"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}

// ─── Title Group Component ──────────────────────────────────────────────────

function TitleGroup({
  label,
  icon,
  borderColor,
  labelColor,
  titles,
  showPattern,
}: {
  label: string;
  icon: string;
  borderColor: string;
  labelColor: string;
  titles: TitleSuggestion[];
  showPattern?: boolean;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div
      className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5 mb-2.5"
      style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <span className="text-lg">{icon}</span>
        <span
          className="text-[11px] font-bold tracking-[2px]"
          style={{ color: labelColor }}
        >
          {label}
        </span>
      </div>
      {titles.map((t, i) => (
        <div key={i} className={i < titles.length - 1 ? "mb-3" : ""}>
          <div
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="cursor-pointer flex items-baseline gap-2.5"
          >
            <span className="text-[11px] text-wood/[0.15] font-mono shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1">
              <p className="font-serif text-base text-wood leading-snug m-0">
                {t.title}
              </p>
              {showPattern && t.pattern && (
                <span className="text-[10px] font-semibold tracking-[1px] text-wood/[0.25] mt-0.5 inline-block">
                  {t.pattern}
                </span>
              )}
            </div>
            <span className="text-[11px] text-wood/[0.15] shrink-0">
              {expanded === i ? "▴" : "▾"}
            </span>
          </div>
          {expanded === i && (
            <p className="text-[13px] text-wood-light/[0.45] leading-normal mt-2 ml-[22px] pl-2.5 border-l-2 border-wood/[0.06]">
              {t.reasoning}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Repackage ─────────────────────────────────────────────────────────

function RepackageTab() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const run = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/title-lab/url-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        150
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-wood-light/50 leading-relaxed">
        Paste any YouTube video URL. The tool reads the current title,
        description, and metadata, then generates new title suggestions in
        different creative styles.
      </p>
      <div className="my-5">
        <label className="text-[10px] font-bold tracking-[3px] text-wood-light/[0.2] block mb-1.5">
          YOUTUBE VIDEO URL
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full px-4 py-3.5 bg-white border border-wood/[0.08] rounded-2xl text-wood text-sm font-sans outline-none focus:border-amber/30 transition-colors"
        />
      </div>
      <button
        onClick={run}
        disabled={!url.trim() || loading}
        className="w-full py-3.5 bg-wood text-cream rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-30 hover:bg-wood-light transition-colors"
      >
        {loading ? <Dots /> : "Analyze & generate titles"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div ref={resultRef} className="mt-7">
          {/* Current video card */}
          <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5 mb-2.5 flex gap-4 items-center">
            {result.video.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.video.thumbnail}
                alt=""
                className="w-[120px] h-[68px] object-cover rounded-lg shrink-0"
              />
            ) : (
              <div className="w-[120px] h-[68px] bg-wood rounded-lg shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-cream/30 tracking-[1px]">
                  THUMB
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-serif text-[15px] text-wood mb-1 truncate">
                {result.video.title}
              </p>
              <div className="flex gap-3 text-xs text-wood-light/30">
                <span>{result.video.channelTitle}</span>
                <span>{fmt(result.video.views)} views</span>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div
            className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5 mb-2.5"
            style={{ borderLeftWidth: 3, borderLeftColor: "rgba(220,38,38,0.4)" }}
          >
            <p className="text-[10px] font-bold tracking-[3px] text-red-500/40 mb-3">
              DIAGNOSIS OF CURRENT TITLE
            </p>
            <p className="text-sm text-wood-light/[0.55] leading-relaxed m-0">
              {result.currentTitleDiagnosis}
            </p>
          </div>

          <TitleGroup
            label="HOW JESPER MAKES WOULD TITLE IT"
            icon="🪵"
            borderColor="#C17F3C"
            labelColor="#C17F3C"
            titles={result.jesperStyle}
          />
          <TitleGroup
            label="HOW MRBEAST WOULD TITLE IT"
            icon="🔥"
            borderColor="#dc2626"
            labelColor="#dc2626"
            titles={result.mrbeastStyle}
          />
          <TitleGroup
            label="OTHER STRONG APPROACHES"
            icon="💡"
            borderColor="#3b82f6"
            labelColor="#3b82f6"
            titles={result.alternatives}
            showPattern
          />

          {/* Thumbnail suggestion */}
          <div
            className="bg-amber/[0.04] border border-wood/[0.06] rounded-2xl p-5 mb-2.5"
            style={{
              borderLeftWidth: 3,
              borderLeftColor: "rgba(193,127,60,0.3)",
            }}
          >
            <p className="text-[10px] font-bold tracking-[3px] text-amber/50 mb-3">
              THUMBNAIL CONCEPT
            </p>
            <p className="text-sm text-wood-light/[0.55] leading-relaxed m-0">
              {result.thumbnailSuggestion}
            </p>
          </div>

          <button
            onClick={() => {
              setUrl("");
              setResult(null);
            }}
            className="mt-2 bg-transparent border-none text-wood-light/[0.2] cursor-pointer text-[13px] hover:text-wood-light/40 transition-colors"
          >
            Try another video
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Plan ──────────────────────────────────────────────────────────────

function PlanTab() {
  const [step, setStep] = useState(0);
  const [desc, setDesc] = useState("");
  const [promise, setPromise] = useState("");
  const [story, setStory] = useState("");
  const [hook, setHook] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BrainstormResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const fields = [
    {
      key: "desc",
      label: "WHAT'S THE VIDEO ABOUT?",
      placeholder:
        "I found a 200-year-old oak beam in a demolished barn. I'm turning it into a dining table for my family. The wood has old nail holes and axe marks from another century.",
      value: desc,
      set: setDesc,
      rows: 3,
      help: "What are you making, doing, or showing? Give enough context for the AI to understand the video.",
    },
    {
      key: "promise",
      label: "WHAT DOES THE VIEWER GET?",
      placeholder:
        "They'll see that the wood everyone throws away is actually the most beautiful material you can work with. And they'll learn how to work with old, damaged timber.",
      value: promise,
      set: setPromise,
      rows: 3,
      help: "Not what YOU get from making it. What the VIEWER gets from watching it. Knowledge? Inspiration? A new perspective?",
    },
    {
      key: "story",
      label: "WHAT'S THE STORY ARC?",
      placeholder:
        "I almost ruined the beam twice. Once with the wrong saw and once when I discovered hidden metal inside. My daughter helped pick the final shape. The finished table has 200 years of history visible in the grain.",
      value: story,
      set: setStory,
      rows: 3,
      help: "The emotional journey. Where does it start, what goes wrong, what's the turning point, what's the payoff?",
    },
    {
      key: "hook",
      label: "WHAT'S THE FIRST 30 SECONDS?",
      placeholder:
        "I'm standing in a demolished barn with beams scattered everywhere. I pick up this massive oak beam and say 'This is older than anyone alive. And I'm going to eat dinner on it.'",
      value: hook,
      set: setHook,
      rows: 2,
      help: "The intro hook often contains the best title material. What's the most arresting moment or line from your opening?",
    },
  ];

  const currentField = fields[step];
  const canProceed = step === 0 ? desc.trim() : true;
  const isLast = step === fields.length - 1;

  const generate = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/title-lab/guided-brainstorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc, promise, story, hook }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Brainstorm failed");
      setResult(data);
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        150
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setDesc("");
    setPromise("");
    setStory("");
    setHook("");
    setResult(null);
    setError(null);
  };

  const nextLabels = [
    "Next — tell me the promise",
    "Next — the story",
    "Next — the hook",
  ];

  if (result) {
    return (
      <div ref={resultRef}>
        {/* Summary */}
        <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5 mb-5">
          <p className="text-[10px] font-bold tracking-[3px] text-wood-light/[0.2] mb-3">
            YOUR VIDEO
          </p>
          <p className="text-sm text-wood-light/[0.55] leading-normal m-0">
            {desc}
          </p>
          {promise && (
            <p className="text-xs text-wood-light/30 mt-1.5">
              <strong className="text-wood-light/40">Promise:</strong>{" "}
              {promise}
            </p>
          )}
        </div>

        <TitleGroup
          label="HOW JESPER MAKES WOULD TITLE IT"
          icon="🪵"
          borderColor="#C17F3C"
          labelColor="#C17F3C"
          titles={result.jesperStyle}
        />
        <TitleGroup
          label="HOW MRBEAST WOULD TITLE IT"
          icon="🔥"
          borderColor="#dc2626"
          labelColor="#dc2626"
          titles={result.mrbeastStyle}
        />
        <TitleGroup
          label="OTHER STRONG APPROACHES"
          icon="💡"
          borderColor="#3b82f6"
          labelColor="#3b82f6"
          titles={result.alternatives}
          showPattern
        />

        {result.thumbnailSuggestions?.length > 0 && (
          <div
            className="bg-amber/[0.04] border border-wood/[0.06] rounded-2xl p-5 mb-2.5"
            style={{
              borderLeftWidth: 3,
              borderLeftColor: "rgba(193,127,60,0.3)",
            }}
          >
            <p className="text-[10px] font-bold tracking-[3px] text-amber/50 mb-3">
              THUMBNAIL CONCEPTS
            </p>
            {result.thumbnailSuggestions.map((t, i) => (
              <p
                key={i}
                className="text-[13px] text-wood-light/50 leading-normal mb-2 pl-3 border-l-2 border-amber/[0.15]"
              >
                {t}
              </p>
            ))}
          </div>
        )}

        {result.titleWarnings?.length > 0 && (
          <div
            className="bg-red-500/[0.03] border border-wood/[0.06] rounded-2xl p-5 mb-2.5"
            style={{
              borderLeftWidth: 3,
              borderLeftColor: "rgba(220,38,38,0.3)",
            }}
          >
            <p className="text-[10px] font-bold tracking-[3px] text-red-500/40 mb-3">
              WATCH OUT
            </p>
            {result.titleWarnings.map((w, i) => (
              <p
                key={i}
                className="text-[13px] text-wood-light/50 mb-1 m-0"
              >
                {w}
              </p>
            ))}
          </div>
        )}

        <button
          onClick={reset}
          className="mt-2 bg-transparent border-none text-wood-light/[0.2] cursor-pointer text-[13px] hover:text-wood-light/40 transition-colors"
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-wood-light/50 leading-relaxed">
        Walk through four quick prompts about your video. The more context you
        give, the better the titles. Only the first field is required, but the
        magic is in the promise and hook.
      </p>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Progress bar */}
      <div className="flex gap-1 my-5">
        {fields.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-sm transition-colors duration-300"
            style={{
              background: i <= step ? "#C17F3C" : "rgba(44,24,16,0.06)",
            }}
          />
        ))}
      </div>

      {/* Current field */}
      <div>
        <label className="text-[10px] font-bold tracking-[3px] text-wood-light/[0.2] block mb-1.5">
          {currentField.label}
        </label>
        <p className="text-xs text-wood-light/30 mb-2">{currentField.help}</p>
        <textarea
          value={currentField.value}
          onChange={(e) => currentField.set(e.target.value)}
          rows={currentField.rows}
          placeholder={currentField.placeholder}
          className="w-full px-4 py-3 bg-white border border-wood/[0.08] rounded-xl text-wood text-sm font-sans outline-none resize-none leading-relaxed focus:border-amber/30 transition-colors"
          autoFocus
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mt-3.5">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-5 py-3 bg-transparent border border-wood/10 rounded-xl text-wood-light/40 cursor-pointer text-[13px] font-medium hover:border-wood/20 transition-colors"
          >
            &larr; Back
          </button>
        )}
        {!isLast ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed}
            className="flex-1 py-3 bg-wood text-cream rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-30 hover:bg-wood-light transition-colors"
          >
            {nextLabels[step]}
          </button>
        ) : (
          <button
            onClick={generate}
            disabled={!desc.trim() || loading}
            className="flex-1 py-3 bg-wood text-cream rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-30 hover:bg-wood-light transition-colors"
          >
            {loading ? <Dots /> : "Generate titles"}
          </button>
        )}
        {!isLast && step > 0 && (
          <button
            onClick={generate}
            disabled={!desc.trim() || loading}
            className="px-5 py-3 bg-transparent border border-amber/30 rounded-xl text-amber cursor-pointer text-[13px] font-semibold hover:bg-amber/5 transition-colors"
          >
            {loading ? <Dots /> : "Skip & generate"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Playbook ──────────────────────────────────────────────────────────

function PlaybookTab() {
  const rules = [
    {
      t: "The Viewer Promise",
      b: 'Every title answers one question from the viewer: "Why should I give you my time?" My 6.5M video says "how YOU see wood." My 68k video says "Do What You Can\'t." Same format, same length. 95x difference. One talks to the viewer. The other talks about me.',
      h: 'Read it out loud. If a stranger says "so what?" — kill it. If they say "wait, how?" — ship it.',
    },
    {
      t: "Never Close the Loop",
      b: '"Building a Junk Cabin with my Daughter" sat at 500k for a year. I changed it to "She will live in this." Same video. Nearly doubled. +9,500 subscribers. The old title answered the question before the click.',
      h: "If your title closes the loop, the video becomes optional.",
    },
    {
      t: "Title ≠ Thumbnail",
      b: "Two halves of one machine. Thumbnail creates the emotional hook — something visual that stops the scroll. Title delivers the intellectual hook — the promise, the reason, the stakes. If both say the same thing, you're wasting 50%.",
      h: null,
    },
    {
      t: "No Video Is Dead",
      b: "The cabin video sat flat for 550 days. One title change woke it up and generated kr. 53,000 in new revenue. Every month: find videos with strong watch time but low CTR. That's packaging failure, not content failure.",
      h: null,
    },
    {
      t: "The First 48 Hours",
      b: "YouTube decides whether to push in the first 48 hours. If CTR is below your channel average, swap immediately. Have backup titles and thumbnails READY before you publish. Don't wait. Don't hope.",
      h: null,
    },
    {
      t: "The Banned List",
      b: 'Motivational slogans ("Do What You Can\'t" — 68k). Diary framing ("A Build Diary" — 72k). Category descriptions ("Workshop Tour"). Anything that could be a LinkedIn post.',
      h: "If it sounds meaningful to you but useless to a stranger, it's the wrong title.",
    },
  ];

  return (
    <div>
      <p className="text-sm text-wood-light/50 leading-relaxed">
        These aren&apos;t theory. They&apos;re patterns from 127 videos and years of
        changing titles until something clicked.
      </p>
      <div className="mt-6">
        {rules.map((r, i) => (
          <div key={i} className="mb-8">
            <h3 className="font-serif text-[17px] text-wood mb-2">{r.t}</h3>
            <p className="text-sm text-wood-light/50 leading-relaxed m-0">
              {r.b}
            </p>
            {r.h && (
              <div className="mt-2.5 pl-3.5 border-l-2 border-amber/30">
                <p className="text-sm text-amber/[0.65] italic leading-normal m-0">
                  {r.h}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab Button ─────────────────────────────────────────────────────────────

function TabBtn({
  active,
  onClick,
  icon,
  sub,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-[140px] p-3.5 rounded-xl border-none cursor-pointer text-left transition-all duration-150 ${
        active ? "bg-wood" : "bg-white/50 hover:bg-white/80"
      }`}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-base">{icon}</span>
        <span
          className={`text-[13px] font-semibold ${
            active ? "text-cream" : "text-wood"
          }`}
        >
          {children}
        </span>
      </div>
      <p
        className={`text-[11px] m-0 ml-[26px] leading-snug ${
          active ? "text-cream/50" : "text-wood-light/30"
        }`}
      >
        {sub}
      </p>
    </button>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function TitleLabPage() {
  const [tab, setTab] = useState("repackage");

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
      <p className="text-[10px] font-bold tracking-[5px] text-amber mb-3.5">
        JESPER MAKES
      </p>
      <h1 className="font-serif text-4xl md:text-[38px] font-bold text-wood leading-tight mb-3">
        The Title Lab
      </h1>
      <p className="text-sm text-wood-light/50 leading-relaxed mb-7">
        Apart from making a great video, the single most important thing is the
        right packaging. A bad title can bury a masterpiece. A good title can
        resurrect a forgotten video and add thousands of subscribers overnight.
        I&apos;ve seen both happen on my channel.
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <TabBtn
          active={tab === "repackage"}
          onClick={() => setTab("repackage")}
          icon="🔗"
          sub="Paste a URL, get new titles"
        >
          Repackage a Video
        </TabBtn>
        <TabBtn
          active={tab === "plan"}
          onClick={() => setTab("plan")}
          icon="✏️"
          sub="Describe it, get AI titles"
        >
          Plan a New Video
        </TabBtn>
        <TabBtn
          active={tab === "playbook"}
          onClick={() => setTab("playbook")}
          icon="📖"
          sub="My rules, my data"
        >
          The Playbook
        </TabBtn>
      </div>

      {tab === "repackage" && <RepackageTab />}
      {tab === "plan" && <PlanTab />}
      {tab === "playbook" && <PlaybookTab />}

      <div className="mt-16 pt-6 border-t border-wood/[0.06] text-center">
        <p className="text-[11px] text-wood-light/[0.15]">
          Built by Jesper Makes — from pallet wood to 350k+ subscribers.
        </p>
      </div>
    </div>
  );
}
