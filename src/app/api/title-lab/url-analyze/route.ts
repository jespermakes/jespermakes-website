import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

async function fetchVideoData(videoId: string) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
  );
  if (!res.ok) throw new Error("YouTube API error");
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) throw new Error("Video not found");

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description?.slice(0, 1000) || "",
    tags: item.snippet.tags || [],
    channelTitle: item.snippet.channelTitle,
    views: parseInt(item.statistics.viewCount || "0", 10),
    likes: parseInt(item.statistics.likeCount || "0", 10),
    comments: parseInt(item.statistics.commentCount || "0", 10),
    publishedAt: item.snippet.publishedAt,
    duration: item.contentDetails.duration,
    thumbnail:
      item.snippet.thumbnails?.maxres?.url ||
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.medium?.url ||
      "",
    categoryId: item.snippet.categoryId,
  };
}

const SYSTEM_PROMPT = `You are a YouTube title rewriting engine. You will receive metadata about an existing YouTube video — its current title, description, tags, view count, and other data. Your job is to generate new title suggestions in distinct creative voices.

You must generate titles in these categories:

1. JESPER MAKES STYLE
Jesper is a Danish woodworker with 350k+ subscribers. His title philosophy:
- The title is a PROMISE to the viewer, not a report about the video
- Create a curiosity gap — never answer the question in the title
- Use specific numbers, timeframes, dollar amounts for believability
- Add personal voice — phrases like "I promise" or casual asides
- Title and thumbnail should say DIFFERENT things
- Keep under 55 characters when possible
- Never use motivational slogans, diary framing, or category descriptions
- Best performers: "This Video Will Change How You See Wood. I Promise." (6.5M), "She will live in this" (899k after repackaging from "Building a Junk Cabin with my Daughter"), "Beginner to full-time woodworker in 2 years" (4.2M)
Generate 3 titles in this style.

2. MRBEAST STYLE
MrBeast's title philosophy:
- Extreme scale, extreme stakes, extreme specificity
- Numbers are always big, round, and front-loaded
- Simple language a 10-year-old would understand
- The title IS the concept — if the title isn't interesting, the video idea isn't good enough
- Often uses "I" or direct address
- Challenge/bet framing when possible
- Short, punchy, max impact in fewest words
- Best patterns: "$X vs $Y", "I Survived...", "I Built...", "World's Largest/Most..."
Generate 3 titles in this style.

3. ALTERNATIVE STRONG TITLES
These should use other proven YouTube title patterns:
- Question titles that create debate
- "How I..." with specific unexpected outcome
- Contrarian/opinion titles
- Emotional/story-driven titles
- Pattern interrupt titles (something unexpected)
Generate 4 titles using varied strategies.

Also provide:
- A brief diagnosis of the CURRENT title: what's working and what's not (2-3 sentences)
- One thumbnail concept suggestion that would pair well with your best title suggestion

Respond ONLY with valid JSON:
{
  "currentTitleDiagnosis": "<2-3 sentence analysis of current title>",
  "jesperStyle": [
    { "title": "...", "reasoning": "..." },
    { "title": "...", "reasoning": "..." },
    { "title": "...", "reasoning": "..." }
  ],
  "mrbeastStyle": [
    { "title": "...", "reasoning": "..." },
    { "title": "...", "reasoning": "..." },
    { "title": "...", "reasoning": "..." }
  ],
  "alternatives": [
    { "title": "...", "reasoning": "...", "pattern": "<name of pattern used>" },
    { "title": "...", "reasoning": "...", "pattern": "..." },
    { "title": "...", "reasoning": "...", "pattern": "..." },
    { "title": "...", "reasoning": "...", "pattern": "..." }
  ],
  "thumbnailSuggestion": "<one thumbnail concept that pairs with the strongest title>"
}`;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    const video = await fetchVideoData(videoId);

    const userMessage = `Here is the video to analyze:

CURRENT TITLE: "${video.title}"
CHANNEL: ${video.channelTitle}
VIEWS: ${video.views.toLocaleString()}
LIKES: ${video.likes.toLocaleString()}
COMMENTS: ${video.comments.toLocaleString()}
PUBLISHED: ${video.publishedAt}
DURATION: ${video.duration}
TAGS: ${video.tags.slice(0, 15).join(", ")}
DESCRIPTION (first 500 chars): ${video.description.slice(0, 500)}

Generate new title suggestions in all three styles, diagnose the current title, and suggest a thumbnail pairing.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic error:", await response.text());
      return NextResponse.json(
        { error: "AI analysis failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text = data.content
      .map((b: { type: string; text?: string }) =>
        b.type === "text" ? b.text : ""
      )
      .filter(Boolean)
      .join("\n");

    const clean = text.replace(/```json\s?|```/g, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json({
      video: {
        id: video.id,
        title: video.title,
        channelTitle: video.channelTitle,
        views: video.views,
        likes: video.likes,
        comments: video.comments,
        thumbnail: video.thumbnail,
        duration: video.duration,
        publishedAt: video.publishedAt,
      },
      ...result,
    });
  } catch (error) {
    console.error("URL analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
