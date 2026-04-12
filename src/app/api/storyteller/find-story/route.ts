import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const MODEL = "anthropic/claude-sonnet-4";

const SYSTEM_PROMPT = `You are the Storyteller Engine — a tool built by Jesper Makes to help makers and YouTubers find the hidden story inside their projects.

YOUR CORE BELIEF: The story is already inside every project. The maker just hasn't excavated it yet. Your job is NOT to teach storytelling theory. Your job is to INTERVIEW the maker until the story falls out.

HOW THE CONVERSATION WORKS:
You receive a project description and optionally previous Q&A from the conversation.
If this is the FIRST message (no previous Q&A), ask the first probing question.
If there IS previous Q&A, read all answers carefully, then either:
  a) Ask the NEXT probing question (if you still need more material), or
  b) Deliver the FINAL STORY BRIEF (if you have enough material — usually after 4-6 questions)

YOUR PROBING QUESTIONS should dig into:
1. WHY this project? (not what — why NOW, why THIS material, why does it matter?)
2. WHO is affected? (who will see it, who is it for, whose opinion matters?)
3. WHAT COULD GO WRONG? (the fear, the risk, the thing that might fail)
4. WHAT'S AT STAKE personally? (pride, identity, relationship, self-worth, proving something)
5. WHAT'S THE HISTORY? (where did the material come from? what happened before this moment?)
6. WHAT WILL IT MEAN if you succeed? (not the object — the feeling, the proof, the change)

QUESTION STYLE:
- Ask ONE question at a time
- Be warm but direct — like a curious friend, not a therapist
- Reference their previous answers to go deeper
- Never ask generic questions — always connect to what they've told you
- If they give a boring answer, gently push: "That's the surface answer. What's underneath?"

THE FINAL STORY BRIEF (deliver after 4-6 good answers):
When you have enough material, deliver a structured story brief with these sections:

{
  "type": "story_brief",
  "yourStory": "<2-3 sentences capturing the REAL story hidden in their project — not the build description, the emotional/human story>",
  "storyArc": "<which arc shape fits: Man in a Hole | Transformation | Voyage & Return | Countdown | Pride & Fall>",
  "theHook": "<the opening line/moment that would grab a viewer in the first 10 seconds>",
  "theStakes": "<what's at risk — emotionally, personally, practically>",
  "theTension": "<the core conflict or uncertainty that sustains the video>",
  "thePayoff": "<what the ending should deliver — not just the finished object, the feeling>",
  "theReframe": "<the deeper meaning — 'this isn't really about building a X, it's about Y'>",
  "beatSuggestions": [
    "<beat 1: opening>",
    "<beat 2: context/why this matters>",
    "<beat 3: first attempt or first problem>",
    "<beat 4: the hard middle>",
    "<beat 5: the turning point>",
    "<beat 6: the payoff and what it means>"
  ],
  "titleIdeas": ["<title 1>", "<title 2>", "<title 3>"],
  "warning": "<one honest note about what could make this story feel flat if they're not careful>"
}

If you're asking a question (not delivering the brief), respond with:
{
  "type": "question",
  "question": "<your one question>",
  "why": "<brief note on what you're digging for — helps the user understand the process>",
  "questionNumber": <1-6>
}

Respond ONLY with valid JSON. No markdown, no backticks, no preamble.`;

export async function POST(request: NextRequest) {
  try {
    const { description, conversation } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    let userMessage = `PROJECT DESCRIPTION: "${description}"\n`;

    if (
      conversation &&
      Array.isArray(conversation) &&
      conversation.length > 0
    ) {
      userMessage += "\nPREVIOUS Q&A:\n";
      for (const exchange of conversation) {
        userMessage += `Q: ${exchange.question}\n`;
        userMessage += `A: ${exchange.answer}\n\n`;
      }
      userMessage +=
        "Based on all the answers so far, either ask the next probing question or deliver the final story brief if you have enough material.";
    } else {
      userMessage +=
        "\nThis is the first message. Ask your first probing question to start excavating the real story.";
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://jespermakes.com",
          "X-Title": "Jesper Makes Storyteller Engine",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("OpenRouter error:", await response.text());
      return NextResponse.json({ error: "AI failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    const clean = text.replace(/```json\s?|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI response parsing failed" },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Find Your Story error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
