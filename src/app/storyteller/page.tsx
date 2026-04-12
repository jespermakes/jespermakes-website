"use client";

import { useState, useRef } from "react";
import {
  STORY_CARDS,
  CARD_CATEGORIES,
  ARC_SHAPES,
  CREATOR_PROFILES,
  type StoryCard,
  type ArcShape,
  type CreatorProfile,
} from "@/data/storyteller-data";

// ─── Helpers ────────────────────────────────────────────────────────────────

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
      className={`flex-1 min-w-[160px] p-3.5 rounded-xl border-none cursor-pointer text-left transition-all duration-150 ${
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

// ─── Find Your Story ────────────────────────────────────────────────────────

interface ConvoExchange {
  question: string;
  answer: string;
}

interface QuestionResponse {
  type: "question";
  question: string;
  why: string;
  questionNumber: number;
}

interface StoryBrief {
  type: "story_brief";
  yourStory: string;
  storyArc: string;
  theHook: string;
  theStakes: string;
  theTension: string;
  thePayoff: string;
  theReframe: string;
  beatSuggestions: string[];
  titleIdeas: string[];
  warning: string;
}

function FindStoryTab() {
  const [desc, setDesc] = useState("");
  const [convo, setConvo] = useState<ConvoExchange[]>([]);
  const [currentQ, setCurrentQ] = useState<QuestionResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [brief, setBrief] = useState<StoryBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const callApi = async (
    description: string,
    conversation: ConvoExchange[]
  ) => {
    const res = await fetch("/api/storyteller/find-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, conversation }),
    });
    if (!res.ok) throw new Error("AI failed");
    return res.json();
  };

  const start = async () => {
    if (!desc.trim()) return;
    setStarted(true);
    setLoading(true);
    setError(null);
    try {
      const result = await callApi(desc, []);
      if (result.type === "story_brief") {
        setBrief(result);
      } else {
        setCurrentQ(result);
      }
    } catch {
      setError("Something went wrong. Try again.");
      setStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !currentQ) return;
    const newConvo = [
      ...convo,
      { question: currentQ.question, answer: answer.trim() },
    ];
    setConvo(newConvo);
    setAnswer("");
    setCurrentQ(null);
    setLoading(true);
    setError(null);

    try {
      const result = await callApi(desc, newConvo);
      if (result.type === "story_brief") {
        setBrief(result);
      } else {
        setCurrentQ(result);
      }
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDesc("");
    setConvo([]);
    setCurrentQ(null);
    setBrief(null);
    setStarted(false);
    setError(null);
  };

  if (brief) {
    return (
      <div>
        {/* Your Story */}
        <div
          className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5 mb-5"
          style={{ borderLeftWidth: 3, borderLeftColor: "#22c55e" }}
        >
          <p className="text-[10px] font-bold tracking-[3px] text-emerald-500/60 mb-2">
            YOUR STORY
          </p>
          <p className="font-serif text-lg text-wood leading-relaxed m-0">
            {brief.yourStory}
          </p>
        </div>

        {/* Hook / Stakes / Tension / Payoff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
          {[
            { label: "THE HOOK", text: brief.theHook },
            { label: "THE STAKES", text: brief.theStakes },
            { label: "THE TENSION", text: brief.theTension },
            { label: "THE PAYOFF", text: brief.thePayoff },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5"
            >
              <p className="text-[10px] font-bold tracking-[2px] text-wood-light/[0.2] mb-1.5">
                {item.label}
              </p>
              <p className="text-sm text-wood-light/60 leading-relaxed m-0">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Reframe */}
        <div
          className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5 mb-4"
          style={{ borderLeftWidth: 3, borderLeftColor: "#8b5cf6" }}
        >
          <p className="text-[10px] font-bold tracking-[2px] text-purple-500/50 mb-1.5">
            THE REFRAME
          </p>
          <p className="font-serif text-base text-wood italic m-0">
            {brief.theReframe}
          </p>
        </div>

        {/* Beats */}
        <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-bold tracking-[2px] text-wood-light/[0.2] mb-2.5">
            SUGGESTED BEATS
          </p>
          {brief.beatSuggestions.map((b, i) => (
            <div key={i} className="flex gap-2.5 mb-2 items-baseline">
              <span className="text-[11px] text-wood/[0.15] font-mono w-[18px] shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-wood-light/[0.55] m-0 leading-relaxed">
                {b}
              </p>
            </div>
          ))}
        </div>

        {/* Title ideas */}
        <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-bold tracking-[2px] text-amber/50 mb-2.5">
            TITLE IDEAS
          </p>
          {brief.titleIdeas.map((t, i) => (
            <p key={i} className="font-serif text-base text-wood mb-1.5 m-0">
              {t}
            </p>
          ))}
        </div>

        {/* Warning */}
        <div
          className="bg-red-500/[0.02] border border-wood/[0.06] rounded-2xl p-5 mb-4"
          style={{ borderLeftWidth: 3, borderLeftColor: "rgba(220,38,38,0.3)" }}
        >
          <p className="text-[10px] font-bold tracking-[2px] text-red-500/40 mb-1.5">
            WATCH OUT
          </p>
          <p className="text-sm text-wood-light/[0.55] m-0">{brief.warning}</p>
        </div>

        <button
          onClick={reset}
          className="mt-3 bg-transparent border-none text-wood-light/[0.2] cursor-pointer text-[13px] hover:text-wood-light/40 transition-colors"
        >
          Start over with a new project
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-wood-light/50 leading-relaxed">
        Describe your project in the most boring way possible. &quot;I&apos;m
        building a shelf from pine.&quot; The AI will interview you until the
        real story falls out.
      </p>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {!started ? (
        <div className="mt-4">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="e.g. I'm building a shelf for my living room from some pine boards I got at the hardware store."
            className="w-full px-4 py-3.5 bg-white border border-wood/[0.08] rounded-xl text-wood text-[15px] font-serif outline-none resize-none leading-relaxed focus:border-amber/30 transition-colors placeholder:text-wood-light/35"
          />
          <button
            onClick={start}
            disabled={!desc.trim() || loading}
            className="w-full mt-2.5 py-3.5 bg-wood text-cream rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-30 hover:bg-wood-light transition-colors"
          >
            {loading ? <Dots /> : "Find my story"}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          {/* Project summary */}
          <div className="bg-wood/[0.03] border border-wood/[0.06] rounded-2xl p-5 mb-4">
            <p className="text-xs text-wood-light/30 mb-1">YOUR PROJECT</p>
            <p className="text-sm text-wood-light/60 m-0">{desc}</p>
          </div>

          {/* Conversation history */}
          {convo.map((c, i) => (
            <div key={i} className="mb-4">
              <div
                className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5"
                style={{ borderLeftWidth: 3, borderLeftColor: "#C17F3C" }}
              >
                <p className="text-sm text-wood font-medium m-0">
                  {c.question}
                </p>
              </div>
              <div className="pt-2 pl-5">
                <p className="text-sm text-wood-light/50 italic m-0">
                  {c.answer}
                </p>
              </div>
            </div>
          ))}

          {/* Current question */}
          {currentQ && !loading && (
            <div className="mb-4">
              <div
                className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5"
                style={{ borderLeftWidth: 3, borderLeftColor: "#C17F3C" }}
              >
                <p className="text-[15px] text-wood font-medium mb-1 m-0">
                  {currentQ.question}
                </p>
                <p className="text-[11px] text-amber/50 italic m-0">
                  {currentQ.why}
                </p>
              </div>
              <div className="mt-2">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={3}
                  placeholder="Your honest answer..."
                  className="w-full px-3.5 py-3 bg-white border border-wood/[0.08] rounded-xl text-wood text-sm outline-none resize-none leading-relaxed focus:border-amber/30 transition-colors placeholder:text-wood-light/35"
                  autoFocus
                />
                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim()}
                  className="w-full mt-2 py-3 bg-wood text-cream rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-30 hover:bg-wood-light transition-colors"
                >
                  Answer
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-5 text-wood-light/25 text-[13px]">
              Thinking <Dots />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

// ─── Draw a Card ────────────────────────────────────────────────────────────

function DrawCardTab() {
  const [drawn, setDrawn] = useState<StoryCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState("all");

  const draw = () => {
    const pool =
      filter === "all"
        ? STORY_CARDS
        : STORY_CARDS.filter((c) => c.category === filter);
    const card = pool[Math.floor(Math.random() * pool.length)];
    setDrawn(card);
    setFlipped(false);
    setTimeout(() => setFlipped(true), 300);
  };

  const catEntries = Object.entries(CARD_CATEGORIES) as [
    string,
    (typeof CARD_CATEGORIES)[keyof typeof CARD_CATEGORIES]
  ][];

  return (
    <div>
      <p className="text-sm text-wood-light/50 leading-relaxed">
        Draw a random story card. Each one gives you a lens to look at your
        project differently. Apply it to whatever you&apos;re building.
      </p>

      {/* Filter buttons */}
      <div className="flex gap-1.5 mt-4 mb-4 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-3.5 py-1.5 rounded-lg border-none cursor-pointer transition-colors ${
            filter === "all"
              ? "bg-wood text-cream"
              : "bg-white/50 text-wood-light/35 hover:text-wood-light/60"
          }`}
        >
          All Cards
        </button>
        {catEntries.map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs px-3.5 py-1.5 rounded-lg border-none cursor-pointer transition-colors ${
              filter === key
                ? "bg-wood text-cream"
                : "bg-white/50 text-wood-light/35 hover:text-wood-light/60"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <button
        onClick={draw}
        className="w-full py-4 bg-wood text-cream rounded-xl text-[15px] font-semibold border-none cursor-pointer tracking-wide hover:bg-wood-light transition-colors"
      >
        {drawn ? "Draw another card" : "Draw a card"}
      </button>

      {drawn && flipped && (
        <div className="mt-6">
          <div
            className="bg-white/50 border border-wood/[0.06] rounded-2xl p-7"
            style={{
              borderLeftWidth: 4,
              borderLeftColor:
                CARD_CATEGORIES[drawn.category]?.color || "#C17F3C",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{drawn.emoji}</span>
              <div>
                <h3 className="font-serif text-[22px] text-wood m-0">
                  {drawn.title}
                </h3>
                <p
                  className="text-xs font-semibold tracking-[1px] mt-0.5 uppercase"
                  style={{
                    color:
                      CARD_CATEGORIES[drawn.category]?.color || "#C17F3C",
                  }}
                >
                  {CARD_CATEGORIES[drawn.category]?.label}
                </p>
              </div>
            </div>

            <p className="font-serif text-base text-wood italic mb-4 leading-snug">
              &quot;{drawn.tagline}&quot;
            </p>

            <p className="text-sm text-wood-light/[0.55] leading-relaxed mb-4">
              {drawn.prompt}
            </p>

            {/* Jesper example */}
            <div className="bg-amber/[0.06] rounded-xl p-4 mb-4">
              <p className="text-[10px] font-bold tracking-[2px] text-amber/50 mb-1.5">
                JESPER&apos;S EXAMPLE
              </p>
              <p className="text-[13px] text-wood-light/[0.55] m-0 leading-relaxed">
                {drawn.jesperExample}
              </p>
            </div>

            {/* Questions */}
            <div>
              <p className="text-[10px] font-bold tracking-[2px] text-wood-light/[0.2] mb-2">
                ASK YOURSELF
              </p>
              {drawn.questions.map((q, i) => (
                <p
                  key={i}
                  className="text-sm text-wood-light/[0.55] mb-1.5 pl-3 border-l-2 border-wood/[0.06]"
                >
                  {q}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Map Your Arc ───────────────────────────────────────────────────────────

function ArcCurve({ curve }: { curve: ArcShape["curve"] }) {
  const w = 600;
  const h = 120;
  const pad = 10;
  const points = curve.map((p) => [
    pad + (p.x / 100) * (w - 2 * pad),
    pad + ((100 - p.y) / 100) * (h - 2 * pad),
  ]);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
    .join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
      <line
        x1={pad}
        y1={h / 2}
        x2={w - pad}
        y2={h / 2}
        stroke="rgba(44,24,16,0.06)"
        strokeWidth="1"
      />
      <path
        d={d}
        fill="none"
        stroke="#C17F3C"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#C17F3C" />
      ))}
      <text x={pad} y={h - 2} fill="rgba(74,50,40,0.15)" fontSize="9">
        Low tension
      </text>
      <text x={pad} y={12} fill="rgba(74,50,40,0.15)" fontSize="9">
        High tension
      </text>
    </svg>
  );
}

function MapArcTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const [beats, setBeats] = useState<Record<number, string>>({});

  const arc = ARC_SHAPES.find((a) => a.id === selected);

  return (
    <div>
      <p className="text-sm text-wood-light/50 leading-relaxed">
        Pick a story shape, then fill in each beat for your project. The visual
        curve shows the emotional shape of your video.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-4 mb-5">
        {ARC_SHAPES.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setSelected(a.id);
              setBeats({});
            }}
            className={`bg-white/50 rounded-2xl p-3.5 text-left cursor-pointer transition-all ${
              selected === a.id
                ? "border-2 border-amber"
                : "border border-wood/[0.06] hover:border-wood/10"
            }`}
          >
            <span className="text-2xl">{a.emoji}</span>
            <p className="font-serif text-sm text-wood mt-1.5 mb-0.5">
              {a.name}
            </p>
            <p className="text-[11px] text-wood-light/35 leading-snug m-0">
              {a.description.split(".")[0]}.
            </p>
          </button>
        ))}
      </div>

      {arc && (
        <div>
          <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-4">
            <ArcCurve curve={arc.curve} />
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-bold tracking-[3px] text-wood-light/[0.2] mb-3">
              FILL IN YOUR BEATS
            </p>
            {arc.beats.map((beat, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-amber font-bold font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-wood">
                    {beat.label}
                  </span>
                </div>
                <textarea
                  value={beats[i] || ""}
                  onChange={(e) =>
                    setBeats({ ...beats, [i]: e.target.value })
                  }
                  rows={2}
                  placeholder={beat.prompt}
                  className="w-full px-3 py-2.5 bg-white border border-wood/[0.08] rounded-lg text-wood text-[13px] outline-none resize-none leading-relaxed focus:border-amber/30 transition-colors placeholder:text-wood-light/35"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Creator DNA ────────────────────────────────────────────────────────────

function CreatorDNATab() {
  const [selected, setSelected] = useState<string | null>(null);

  const creator = CREATOR_PROFILES.find((c) => c.id === selected);

  return (
    <div>
      <p className="text-sm text-wood-light/50 leading-relaxed">
        Study how real makers tell stories. Each profile breaks down their
        signature moves, what makes them work, and what you can learn from them.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-4 mb-5">
        {CREATOR_PROFILES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`bg-white/50 rounded-2xl p-4 text-left cursor-pointer transition-all ${
              selected === c.id
                ? "border-2 border-amber"
                : "border border-wood/[0.06] hover:border-wood/10"
            }`}
          >
            <p className="font-serif text-base text-wood mb-0.5">{c.name}</p>
            <p className="text-[11px] text-wood-light/30 mb-1.5">
              {c.subscribers} subscribers
            </p>
            <p className="text-xs text-wood-light/45 leading-snug m-0">
              {c.tagline}
            </p>
          </button>
        ))}
      </div>

      {creator && (
        <div>
          {/* Core Truth */}
          <div
            className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5 mb-4"
            style={{ borderLeftWidth: 3, borderLeftColor: "#C17F3C" }}
          >
            <p className="text-[10px] font-bold tracking-[2px] text-amber/50 mb-1.5">
              CORE TRUTH
            </p>
            <p className="font-serif text-base text-wood leading-relaxed m-0">
              {creator.storytellingDNA.coreTruth}
            </p>
          </div>

          {/* Signature Moves */}
          <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5 mb-4">
            <p className="text-[10px] font-bold tracking-[2px] text-wood-light/[0.2] mb-2.5">
              SIGNATURE MOVES
            </p>
            {creator.storytellingDNA.signatureMoves.map((m, i) => (
              <div
                key={i}
                className="mb-2.5 pl-3 border-l-2 border-wood/[0.06]"
              >
                <p className="text-sm font-semibold text-wood mb-0.5">
                  {m.name}
                </p>
                <p className="text-[13px] text-wood-light/45 leading-relaxed m-0">
                  {m.description}
                </p>
              </div>
            ))}
          </div>

          {/* Lessons */}
          <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5">
            <p className="text-[10px] font-bold tracking-[2px] text-emerald-500/50 mb-2.5">
              WHAT YOU CAN LEARN
            </p>
            {creator.storytellingDNA.lessonsForOthers.map((l, i) => (
              <p
                key={i}
                className="text-sm text-wood-light/[0.55] mb-2 flex gap-2"
              >
                <span className="text-emerald-500 shrink-0">&rarr;</span>
                {l}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function StorytellerPage() {
  const [tab, setTab] = useState("find");

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      <p className="text-[10px] font-bold tracking-[5px] text-amber mb-3.5">
        JESPER MAKES
      </p>
      <h1 className="font-serif text-4xl md:text-[38px] font-bold text-wood leading-tight mb-3">
        The Storyteller Engine
      </h1>
      <p className="text-sm text-wood-light/50 leading-relaxed mb-7 max-w-2xl">
        Most makers think storytelling means adding something that isn&apos;t
        there. The truth is the opposite: the story is already inside your
        project. You just haven&apos;t excavated it yet. These tools help you
        find it, shape it, and tell it.
      </p>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
        <TabBtn
          active={tab === "find"}
          onClick={() => setTab("find")}
          icon="🔍"
          sub="AI interviews you until the story falls out"
        >
          Find Your Story
        </TabBtn>
        <TabBtn
          active={tab === "card"}
          onClick={() => setTab("card")}
          icon="🃏"
          sub="Random story starters for any project"
        >
          Draw a Card
        </TabBtn>
        <TabBtn
          active={tab === "arc"}
          onClick={() => setTab("arc")}
          icon="📐"
          sub="Plot your beats on a visual timeline"
        >
          Map Your Arc
        </TabBtn>
        <TabBtn
          active={tab === "dna"}
          onClick={() => setTab("dna")}
          icon="🧬"
          sub="How real creators tell stories"
        >
          Creator DNA
        </TabBtn>
      </div>

      {tab === "find" && <FindStoryTab />}
      {tab === "card" && <DrawCardTab />}
      {tab === "arc" && <MapArcTab />}
      {tab === "dna" && <CreatorDNATab />}

      <div className="mt-16 pt-6 border-t border-wood/[0.06] text-center">
        <p className="text-[11px] text-wood-light/[0.15]">
          Built by Jesper Makes — because great videos deserve great stories.
        </p>
      </div>
    </div>
  );
}
