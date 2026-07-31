# The Lamp Generator — Product Vision

*Working name. The name should probably change. "Generator" is cold and mechanical, and the whole point of this thing is that it should feel like the opposite of that. More on naming at the end.*

---

## What we're building

A free, browser-based tool on jespermakes.com that guides anyone, with no design training and no CAD experience, through designing a 3D printable lamp that actually works. Not a modeling program. Not a parameter panel. A guided journey that starts with a question and ends with a print-ready file and the quiet confidence that the thing will look good, print the first time, and be safe to plug in.

The core belief: most "design your own" tools fail in the same way. They drop you into an empty canvas, or a wall of sliders, and call it freedom. It isn't freedom. It's abandonment. The person who just wanted a lamp now has homework. Our tool does the opposite. It already knows things about lamps so the user doesn't have to. It takes them by the hand and walks them, one decision at a time, toward something they are proud of.

## The principle: guided, not exposed

Every competitor exposes the machine. The OpenSCAD customizers show you variables. The CAD tools show you tools. Even the good, polished ones assume you arrive already knowing what a good lamp is.

We do not expose the machine. We expose the decisions, one at a time, in plain language, always with the lamp lit and visible in front of you. The hard-won knowledge from a century of lamp design, Henningsen's geometry, Noguchi's diffusion, the lighting engineering that keeps glare out of your eyes, lives inside the tool as guidance and as quiet guard rails. The user feels creative and capable. They never feel lost.

This is also our competitive moat. The research is clear: tools with good UX exist, audiences exist, real lamp engineering knowledge exists, but nobody has tied all three together. That bundle is the product. Everything below is in service of it.

## The journey

This is the heart of the thing. Eight stages, each one a single clear decision. At every stage: what the user sees, what they do, and how the tool guides them.

### Stage 0 — Start with intention, not a canvas

The first screen is not a 3D editor. It is a warm, simple question: where will this lamp live? You pick from real situations. A bedside table. Over a dining table. A reading corner. A hallway. A shelf. Maybe also: who is it for.

That single answer does invisible work. "Bedside table" tells the tool the eye height of someone lying down, the size that fits a nightstand, and that glare matters a great deal here. "Over a dining table" tells it the light should pool downward onto the table. The user just said where it goes. The tool quietly set a dozen constraints they never had to know existed.

### Stage 1 — A beautiful starting point

You never face a blank canvas. You choose from a small set of starting forms, and every one of them is already a real, working lamp drawn from a tradition: the three-shade form descended from Poul Henningsen, the soft glowing cone in the spirit of Noguchi's Akari, a clean modern pendant. Each one is already good. Your job is not to invent a lamp from nothing. It is to make one of these yours.

### Stage 2 — Shape it, with the rails on

Now you sculpt. You drag the silhouette taller, pull the base wider, soften a curve. The preview updates instantly, lit, turning gently. But the tool is holding the rails. When you push the form toward something that stops being a lamp, an opening so wide the bulb glares straight out, a shade so shallow it does nothing, the tool does not let you walk off the cliff in silence. It gently resists, or it shows you a soft marker: "the bulb is visible from sofa height here." You are always, at every moment, looking at a real lamp.

### Stage 3 — See the light

This is the part nobody else does.

The lamp has been lit this whole time. Now we make the light itself the thing you are working on. You see where the light lands: the glow on the wall, the pool on the table, the spread across the room. You adjust three things in plain terms, how warm the light feels, how wide it spreads, which way it throws. And the tool teaches as you go, in a sentence, not a manual: "bring the opening down and the light gathers on the table instead of the wall." Most people have never thought about light this way. By the end of this step they have, and they did not take a class to get there.

### Stage 4 — Make it yours

Surface and pattern. This is where our existing 2D studio earns its place. You pick or draw a pattern, perforations, a woven texture, a relief, and it wraps onto the form. Light and pattern interact live, so you see the shadows it will throw before you commit. This is the step where the lamp stops being a template and becomes a personal object.

### Stage 5 — The quiet reality check

Before you celebrate, the tool makes sure this thing can actually exist, calmly, without a wall of red warnings. It tells you what to print it in and why ("print this in PETG rather than PLA, because it sits close to a warm bulb"). It confirms that a standard bulb and socket will fit. It checks that the design fits your printer. If something needs attention, it is one clear sentence and a fix, not a lecture.

### Stage 6 — The reveal

You see it finished. Lit, in a room, at dusk. On, and off. This is the emotional payoff, the moment of "I made that." It is also, not by accident, the moment someone wants to share. We design this moment deliberately, because pride is what powers the contest and the community.

### Stage 7 — Take it home

You leave with everything you need and nothing you don't. The print-ready file, with the print settings already baked in. A short, friendly guide on what hardware to buy and how to wire it safely. And a one-click path to upload your design to MakerWorld for the contest. No account wall. No paywall. Just the lamp you made, ready to become real.

## What it should do

The functional spine, framed around that journey:

- Run entirely in the browser. Free. No login, no paywall.
- Walk the user through the full journey above, end to end, even in its simplest first version.
- Keep a real-time, lit 3D preview at the center of the whole experience. The preview is not a feature. It is the interface.
- Carry the lamp-design constraints, bulb concealment, shielding angle, proportions, wall thickness, printability, as invisible guard rails and plain-language guidance, never as a spreadsheet of warnings.
- Build on what we already have. The cone lamp resizer and the 2D pattern studio are the foundation, not a parallel project.
- Export clean, print-ready files that are guaranteed printable: watertight, manifold, correct wall thickness, vase-mode aware. 3MF as the primary format so it can carry materials and settings, STL as a fallback.
- Ship every export with a short safety and hardware guide.
- Offer a direct path to MakerWorld for contest entry.
- Be ready and tested before the Bambu video publishes. This is a hard deadline, not a soft goal.

## What it could be

The horizon, once the core works:

- **The lit preview becomes genuinely accurate.** You see your lamp on your actual wall, in your actual room, through your camera.
- **Designs become seeds.** Every lamp someone makes can become a starting template for the next person. The community builds the template library over time. This is Henningsen's "design a system, not an object" idea made social, which is the exact thing the video is about.
- **It becomes a teaching tool.** People come to make a lamp and leave understanding light. We could lean into that openly: a "why" layer, short lessons surfaced exactly when they are relevant, never before.
- **It connects to the shop.** Curated community designs. Or a "no printer? get this one professionally made" path for people who design something they love but cannot print.
- **It is the first of a family.** The guided-maker philosophy is not lamp-specific. If this works, the same hand-on-the-shoulder approach extends to other objects.
- **It remembers you.** Your printer, your past designs, your filament. The reality check gets smarter because it knows your setup.
- **It hosts its own challenges.** Seasonal and collaborative design prompts beyond the Bambu contest. The tool becomes a reason to keep coming back.

## How we get there

**Phase 1, the contest MVP.** The whole journey, end to end, even if each step is shallow. Two starting templates. The constraint engine doing the quiet invisible work. A working, guaranteed-printable export. The non-negotiable: it must feel guided even in version one, because the guidance is the product. A simple tool that holds your hand beats a powerful tool that does not. This phase has to clear the video publish date.

**Phase 2, right after launch, while the contest runs.** The 2D pattern studio fully integrated. Multi-material export for dual-nozzle printers. A better lit preview. A polished MakerWorld upload path.

**Phase 3, the moat.** The community template gallery. Designs becoming seeds for other designs. The teaching layer. Shop integration.

The build path is the one we already use: Claude writes the briefs with the design and the code inline, Floki builds on a branch, Vercel serves a preview, Jesper reviews, Floki merges. The foundation is the cone lamp resizer and the 2D studio, so this is an extension of proven infrastructure, not a build from scratch.

## What success feels like

Someone who has never designed anything, never touched CAD, maybe never thought hard about light, sits down because they want a lamp for their bedside table. Fifteen minutes later they have a file. They print it that night. It works. It is beautiful. The bulb does not glare in their eyes. And when they show it to someone, they say "I designed this."

They did not learn software. They did not read a manual. They were taken by the hand and walked somewhere good.

If that happens, everything else, the contest entries, the MakerWorld uploads, the channel, the shop traffic, follows on its own. And if it does not happen, no number of features will save it. The guidance is the product. Everything else is in service of it.

## A note on the name

"Lamp Generator" describes the mechanism, not the experience. A generator is a machine you operate. This is meant to feel like a workshop bench with someone knowledgeable standing next to you. Worth finding a name that says *guided, warm, yours* rather than *automated*. Some directions to react to: something built around light itself, something built around the idea of a guided studio or workshop, or something that borrows from the design heritage the tool is built on. Not a decision for today, but the name should grow out of the vision above, not get bolted on after.
