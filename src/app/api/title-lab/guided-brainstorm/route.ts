import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const MODEL = "anthropic/claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are a YouTube title brainstorming engine. The user will provide structured information about a video they're planning:

1. DESCRIPTION — what the video is about
2. VIEWER PROMISE — what does the viewer GET from watching this?
3. STORY — what's the narrative arc, the emotional journey?
4. INTRO HOOK — what happens in the first 30 seconds that grabs attention?

Using ALL of this context, generate title suggestions in these categories:

1. JESPER MAKES STYLE (3 titles)
Jesper is a Danish woodworker/YouTuber. His rules:
- Title = promise TO the viewer, not report ABOUT the creator
- Curiosity gap — never close the loop before the click
- Specific numbers, timeframes, dollar amounts
- Personal voice — "I promise", casual asides, sounds human
- Under 55 characters when possible
- NEVER: motivational slogans, diary framing, category descriptions
- His best: "This Video Will Change How You See Wood. I Promise." (6.5M views), "She will live in this" (899k, repackaged from "Building a Junk Cabin"), "Beginner to full-time woodworker in 2 years" (4.2M)
- His worst: "Do What You Can't" (68k), "The Hardest Year of My Life: A Build Diary" (72k)
- KEY INSIGHT: The viewer promise they provided is the RAW MATERIAL for the title. Don't just restate it — compress it into tension.

2. MRBEAST STYLE (3 titles)
- Extreme scale, extreme stakes, extreme specificity
- Numbers big, round, front-loaded
- Simple — a 10-year-old gets it instantly
- Challenge/bet framing
- Short, punchy, maximum impact
- Patterns: "$X vs $Y", "I Survived...", "World's Largest..."

3. ALTERNATIVE APPROACHES (4 titles)
Use varied proven patterns:
- Question that creates debate
- Contrarian opinion
- "Nobody expected..." / surprise outcome
- Emotional/identity title
- Time pressure / deadline
- Transformation with proof
Label each with the pattern used.

CRITICAL: Use the VIEWER PROMISE and INTRO HOOK as your primary fuel. These contain what actually makes the video clickable. The description is context; the promise and hook are the title ingredients.

Also suggest 2 thumbnail concepts that would COMPLEMENT (not duplicate) the strongest title.

Respond ONLY with valid JSON:
{
  "jesperStyle": [
    { "title": "...", "reasoning": "..." }
  ],
  "mrbeastStyle": [
    { "title": "...", "reasoning": "..." }
  ],
  "alternatives": [
    { "title": "...", "reasoning": "...", "pattern": "..." }
  ],
  "thumbnailSuggestions": ["...", "..."],
  "titleWarnings": ["<any red flags about the video concept itself — optional, only if genuinely relevant>"]
}`;

export async function POST(request: NextRequest) {
  try {
    const { description, promise, story, hook } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    let userMessage = `VIDEO DESCRIPTION:\n${description}\n`;
    if (promise)
      userMessage += `\nVIEWER PROMISE (what does the viewer get?):\n${promise}\n`;
    if (story)
      userMessage += `\nSTORY ARC (the narrative/emotional journey):\n${story}\n`;
    if (hook)
      userMessage += `\nINTRO HOOK (first 30 seconds):\n${hook}\n`;
    userMessage += `\nGenerate title suggestions in all categories.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://jespermakes.com",
        "X-Title": "Jesper Makes Title Lab",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter error:", await response.text());
      return NextResponse.json(
        { error: "Brainstorm failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    const clean = text.replace(/```json\s?|```/g, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Guided brainstorm error:", error);
    return NextResponse.json(
      { error: "Brainstorm failed" },
      { status: 500 }
    );
  }
}
