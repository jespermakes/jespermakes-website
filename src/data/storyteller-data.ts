// ─── The Storyteller Engine Card Deck ─────────────────────────────────────
// 18 cards curated from:
// - Jesper Makes Storytelling DNA document
// - Pip Decks Storyteller Tactics (54-card system)
// - Storyworthy, The YouTube Formula, The Anatomy of Story

export interface StoryCard {
  id: string;
  title: string;
  emoji: string;
  category: "transformation" | "tension" | "structure" | "emotion" | "perspective";
  tagline: string;
  prompt: string;
  howToUse: string;
  jesperExample: string;
  questions: string[];
  arcType?: string;
}

export const STORY_CARDS: StoryCard[] = [
  // ─── TRANSFORMATION ──────────────────────────────────────────────────
  {
    id: "junk-to-treasure",
    title: "Junk to Treasure",
    emoji: "♻️",
    category: "transformation",
    tagline: "The thing everyone threw away is the thing worth keeping.",
    prompt: "Your project starts with something discarded, cheap, or ugly. The story is about revealing hidden value — proving that what others overlook is actually the most interesting material.",
    howToUse: "Show the raw material at its worst. Let the audience judge it. Then slowly reveal what it can become. The gap between 'worthless' and 'beautiful' IS the story.",
    jesperExample: "Jesper's entire pallet wood era. 'I made a coffee table from this. Sold for $1599' — the 'this' was scrap wood nobody wanted. The transformation isn't just visual, it's moral: waste has dignity.",
    questions: [
      "What would most people throw away about this material or project?",
      "What's hidden inside it that only becomes visible through work?",
      "What does this transformation say about value — not just the object, but in life?"
    ],
  },
  {
    id: "becoming",
    title: "The Becoming",
    emoji: "🦋",
    category: "transformation",
    tagline: "You're not just building a thing. You're becoming the person who can build it.",
    prompt: "The real transformation isn't the project — it's you. This story is about capability, growth, and identity change through the act of making.",
    howToUse: "Be honest about where you started. Show the gap between ambition and skill. Let the audience see you stretch. The finished object is proof that you changed.",
    jesperExample: "'Beginner to full-time woodworker in 2 years' — 4.2M views. The video isn't really about woodworking. It's about identity transformation: who am I becoming by continuing?",
    questions: [
      "What couldn't you do at the start of this project that you can do now?",
      "What scared you about attempting this?",
      "If you finish this, what does it prove about who you're becoming?"
    ],
  },
  {
    id: "before-after",
    title: "The Time Bridge",
    emoji: "⏳",
    category: "transformation",
    tagline: "This object connects the past to the future.",
    prompt: "The material, the method, or the meaning of this project bridges two eras. Old wood carrying history. A technique from another century. A build that's meant to outlast you.",
    howToUse: "Anchor the object in time. Where did this material come from? What era? What hands touched it before yours? What will this object witness after you're gone?",
    jesperExample: "Jesper's turntable cabinet from junk wood — framed as something that 'could have come from the 1980s and survive until the 2080s.' That's not product description. That's a time bridge.",
    questions: [
      "What history does this material carry?",
      "Who will use this object after you?",
      "What does this build connect — which past to which future?"
    ],
  },

  // ─── TENSION ──────────────────────────────────────────────────────────
  {
    id: "man-in-hole",
    title: "Man in a Hole",
    emoji: "🕳️",
    category: "tension",
    tagline: "Things get worse before they get better.",
    prompt: "Your project starts okay, then something goes wrong — badly wrong. You fall into the hole. The story is about the climb back out. The deeper the hole, the more satisfying the recovery.",
    howToUse: "Don't skip the failure. Don't minimize the mistake. Let the audience feel the pit. Then show the slow, uncertain climb back up. The payoff hits harder because they suffered with you.",
    jesperExample: "Almost every Jesper build has this moment — the cut that went wrong, the wood that split, the design that failed. 'I almost destroyed a 200-year-old beam. Twice.' The 'twice' is the deeper hole.",
    questions: [
      "What's the worst thing that happened or could happen during this build?",
      "How did it feel in that moment — honestly?",
      "What did you do differently after the failure?"
    ],
    arcType: "fall-then-rise",
  },
  {
    id: "the-dragon",
    title: "The Dragon",
    emoji: "🐉",
    category: "tension",
    tagline: "Something threatens what you're trying to protect.",
    prompt: "Every good story has an antagonist. In maker videos, the dragon isn't a villain — it's the thing that threatens your project, your vision, or your ability to finish. Name it. Fight it.",
    howToUse: "Identify the threat clearly: is it time? Money? Skill gap? Bad material? Self-doubt? A client who wants something awful? Name the dragon early, then show the battle.",
    jesperExample: "In 'The Hardest Year of My Life: A Build Diary,' the dragon isn't a woodworking problem — it's life itself pressing against the build. Time, energy, mood. That immediately raises the stakes beyond craft.",
    questions: [
      "What is the biggest threat to this project succeeding?",
      "What happens if the dragon wins?",
      "What are you willing to sacrifice to defeat it?"
    ],
  },
  {
    id: "the-deadline",
    title: "The Clock",
    emoji: "⏰",
    category: "tension",
    tagline: "Time is running out.",
    prompt: "A deadline turns any build into a race. The constraint creates natural tension — will you finish? What gets cut? What do you refuse to compromise on even under pressure?",
    howToUse: "State the deadline early and make it real. Show the calendar. Count the days. Let the audience feel the pressure compress your decisions. Time pressure reveals character.",
    jesperExample: "'I Had 7 Days to Build This Bench' — 576k views. The deadline isn't just a constraint. It's a character test. What do you prioritize when you can't do everything?",
    questions: [
      "What's the real deadline for this project?",
      "What will you have to skip or simplify to meet it?",
      "What absolutely cannot be compromised, even under time pressure?"
    ],
    arcType: "countdown",
  },
  {
    id: "proving-wrong",
    title: "Proving Them Wrong",
    emoji: "💪",
    category: "tension",
    tagline: "Someone — maybe you — said this couldn't be done.",
    prompt: "Doubt is fuel. Whether it's external skepticism or your own inner voice saying 'this is above your level,' the story becomes about defiance. Not arrogance — honest determination.",
    howToUse: "Name the doubt. Who said it? Was it someone else, or your own fear? Then show the work. Let the result speak. You don't need to gloat — the finished object IS the argument.",
    jesperExample: "'My Dad Said I'd Never Make Anything From This Log.' The doubt is specific, personal, and familial. The build becomes an answer to a specific person's specific skepticism.",
    questions: [
      "Who doubted this would work — including yourself?",
      "What specifically did they think would go wrong?",
      "What does it prove if you pull this off?"
    ],
  },

  // ─── STRUCTURE ────────────────────────────────────────────────────────
  {
    id: "voyage-return",
    title: "Voyage & Return",
    emoji: "🧭",
    category: "structure",
    tagline: "Leave home. Enter the unknown. Come back changed.",
    prompt: "You start in familiar territory — your workshop, your usual materials, your comfort zone. Then you venture into something new. Different technique, different material, different scale. You return with new knowledge.",
    howToUse: "Establish 'home' first — what's normal for you. Then show the departure: what makes this project different? Let the audience feel the unfamiliarity. End by showing how home looks different now.",
    jesperExample: "The off-grid cabin build with his daughter. Home → forest → building something from scratch in a new environment → returning with a new understanding of what 'building' means.",
    questions: [
      "What's your 'home' — your comfort zone in making?",
      "Where does this project take you outside that zone?",
      "What will you bring back that changes how you work?"
    ],
    arcType: "voyage-return",
  },
  {
    id: "no-easy-way",
    title: "No Easy Way",
    emoji: "🪨",
    category: "structure",
    tagline: "The honest path is harder. That's why it's worth showing.",
    prompt: "Reject the shortcut. Show the real effort, the real difficulty, the real grind. This isn't suffering for drama — it's trust-building through honesty. Viewers respect creators who don't pretend it's easy.",
    howToUse: "Show the struggle without self-pity. Name what makes this hard. Show the repetitive, unglamorous parts. Then let the payoff land harder because the audience knows what it cost.",
    jesperExample: "Jesper consistently chooses difficult methods and materials. Hand tools over power tools. Reclaimed wood over clean lumber. The difficulty is the story — it signals that this matters enough to do the hard way.",
    questions: [
      "What's the easy way to do this, and why aren't you taking it?",
      "What part of this process is genuinely boring or painful?",
      "Why is the hard path worth it for this specific project?"
    ],
    arcType: "struggle-payoff",
  },
  {
    id: "five-second-moment",
    title: "The Five-Second Moment",
    emoji: "⚡",
    category: "structure",
    tagline: "Every great story is really about one tiny turning point.",
    prompt: "Somewhere in your build, there's a five-second moment where everything shifts. A realization. A mistake. A decision. A feeling. Find that moment — your entire video points toward it or away from it.",
    howToUse: "Identify the moment first, then build backward. What needs to happen before it so the audience feels it? What happens after it that proves it mattered? The moment is small. The meaning is big.",
    jesperExample: "From Storyworthy: 'Every great story is essentially about a five-second moment.' In Jesper's videos, it's often the moment when the object stops being a project and starts being meaningful.",
    questions: [
      "What's the single moment in this build where something changed?",
      "What did you believe before that moment, and what did you believe after?",
      "If you had to tell this whole story in five seconds, what would you show?"
    ],
  },

  // ─── EMOTION ──────────────────────────────────────────────────────────
  {
    id: "the-gift",
    title: "The Gift",
    emoji: "🎁",
    category: "emotion",
    tagline: "This isn't for you. It's for someone who matters.",
    prompt: "The project is for someone else — a family member, a friend, a partner. That immediately changes the stakes. It's no longer about craft. It's about whether the object can carry the feeling you're trying to express.",
    howToUse: "Tell us who it's for and why they matter. Show the build through the lens of 'will this be good enough for them?' The reveal at the end isn't about the object — it's about the reaction.",
    jesperExample: "Building a Junk Cabin with his daughter. The cabin is the object, but the story is shared effort, season, and relationship. The family layer gives the project an emotional stake without announcing it.",
    questions: [
      "Who is this for, and what do they mean to you?",
      "What are you trying to say to them through this object?",
      "What would their reaction mean to you?"
    ],
  },
  {
    id: "memory-keeper",
    title: "The Memory Keeper",
    emoji: "📷",
    category: "emotion",
    tagline: "This object holds a memory that would otherwise disappear.",
    prompt: "The build is tied to something from the past — a person, a place, an era, a feeling. The object becomes a vessel for memory. You're not just making furniture. You're preserving something.",
    howToUse: "Tell the memory first. Be specific — not 'my grandmother' but the specific thing about her you're trying to hold onto. Then show how the build physically embodies that memory.",
    jesperExample: "The door reel that became 'a thousand people talking about loss, memory, and what we carry.' A door. Just a door. But the way Jesper framed it turned it into a conversation about holding onto the past.",
    questions: [
      "What memory is connected to this project?",
      "What specific detail — a sound, a smell, a moment — are you trying to preserve?",
      "If this object could talk, what story would it tell?"
    ],
  },
  {
    id: "honest-fear",
    title: "The Honest Fear",
    emoji: "😰",
    category: "emotion",
    tagline: "Say the thing you're afraid to say.",
    prompt: "Vulnerability isn't weakness — it's proof of stakes. If you're nervous about this build, say so. If you're not sure you're good enough, admit it. The audience invests more when they see real doubt.",
    howToUse: "Name the fear early, not late. 'I'm not sure I can do this' is more powerful in minute one than in minute fifteen. Let the fear sit with the viewer. Then let the work be the answer.",
    jesperExample: "Jesper uses vulnerability as evidence of stakes, not as performance of softness. 'I'm not sure I'm good enough' becomes the engine that makes you watch to see if he is.",
    questions: [
      "What genuinely scares you about this project?",
      "What's the worst thing that could happen?",
      "What would it mean to fail at this publicly?"
    ],
  },

  // ─── PERSPECTIVE ──────────────────────────────────────────────────────
  {
    id: "the-reframe",
    title: "The Reframe",
    emoji: "🔄",
    category: "perspective",
    tagline: "What you think this video is about is not what it's actually about.",
    prompt: "The surface project is one thing. The real story is another. A shelf isn't about storage — it's about making order from chaos. A chair isn't about sitting — it's about the year you built it during.",
    howToUse: "Start with the object. Build normally. Then, somewhere in the middle or back half, reveal what this is really about. The reframe is where your video lifts off from 'maker content' into something people remember.",
    jesperExample: "This is Jesper's signature move. The cabinet becomes about time. The chair becomes about the year. The log becomes about proving something. Phase 4 of every Jesper video: the reframe.",
    questions: [
      "If this project is a metaphor, what is it really about?",
      "What life theme does this build accidentally represent?",
      "Finish this sentence: 'This isn't really about building a ___. It's about ___.'"
    ],
  },
  {
    id: "shock-of-old",
    title: "The Shock of the Old",
    emoji: "🏛️",
    category: "perspective",
    tagline: "The old way is actually better. And nobody remembers why.",
    prompt: "Take something ancient — a technique, a material, a tool, a method — and show why it's still superior. The surprise isn't that new things exist. It's that old things were already solving the problem.",
    howToUse: "Set up the expectation: 'everyone uses X now.' Then introduce the old method. Show it working. The contrast between modern assumption and ancient solution is inherently interesting.",
    jesperExample: "Jesper's whole relationship with hand tools and traditional methods. When he chooses the slow, old way, it's not nostalgia — it's an argument about craft, attention, and what matters.",
    questions: [
      "What old technique or approach are you using that most people have forgotten?",
      "Why does it work better than the modern alternative?",
      "What does this say about what we've lost by 'upgrading'?"
    ],
  },
  {
    id: "strong-opinion",
    title: "The Line in the Sand",
    emoji: "⚔️",
    category: "perspective",
    tagline: "Take a position. Not everyone will agree. That's the point.",
    prompt: "Say something you believe about your craft that's controversial, unpopular, or against the mainstream. Opinions create engagement because they invite people to agree or argue. Both are engagement.",
    howToUse: "State the opinion clearly and early. Don't hedge. Then support it with evidence from your own work. The opinion doesn't have to be aggressive — it just has to be real and specific.",
    jesperExample: "'Idiot YouTubers Are Destroying Their Houses' — 1.4M views. Strong opinion + specific target. The opinion creates debate energy. People click to see if they agree or disagree.",
    questions: [
      "What do you believe about your craft that most people get wrong?",
      "What common practice makes you genuinely frustrated?",
      "If you had to write a manifesto for your approach, what would rule #1 be?"
    ],
  },
  {
    id: "cinema-mind",
    title: "Cinema of the Mind",
    emoji: "🎬",
    category: "perspective",
    tagline: "Don't explain it. Show it so they feel it.",
    prompt: "Stop telling the viewer what happened. Put them inside the moment instead. The sound of the chisel. The smell of the wood. The light at 6am in the workshop. Sensory detail creates presence.",
    howToUse: "Pick one moment in your build — the most important one. Now describe it like a film director: what do we see? Hear? Feel? Hold that shot longer than feels comfortable. Let it breathe.",
    jesperExample: "Jesper's pacing instinct: he slows down when the object begins to feel meaningful. He lets quiet moments feel quiet. That's cinema — trusting the image to carry the story without narration.",
    questions: [
      "What's the most beautiful or intense moment in this build?",
      "If you removed all narration, what single shot would tell the story?",
      "What does this moment sound, smell, and feel like?"
    ],
  },
  {
    id: "but-therefore",
    title: "But & Therefore",
    emoji: "🔗",
    category: "structure",
    tagline: "Stop saying 'and then.' Start saying 'but' and 'so.'",
    prompt: "Every beat in your video should connect to the next through cause and effect — not just sequence. 'I cut the board BUT it split, SO I had to rethink the design' is a story. 'I cut the board AND THEN I sanded it' is a list.",
    howToUse: "Write out your video beats. Between each one, write 'but' or 'therefore.' If you can only write 'and then,' that beat might not be earning its place. Cut it or connect it.",
    jesperExample: "From Storyworthy: 'But and Therefore' forces cause and effect. Jesper does this instinctively — his videos don't just show process, they show how each decision leads to the next problem or the next insight.",
    questions: [
      "What went wrong BECAUSE of a decision you made?",
      "What did you have to change BECAUSE of a failure?",
      "Can you connect every beat in your video with 'but' or 'so' instead of 'and then'?"
    ],
  },
];

export const CARD_CATEGORIES = {
  transformation: { label: "Transformation", color: "#22c55e", description: "Stories about change — material, personal, or both." },
  tension: { label: "Tension", color: "#dc2626", description: "Stories about conflict, risk, stakes, and pressure." },
  structure: { label: "Structure", color: "#3b82f6", description: "How to organize your story beats for maximum impact." },
  emotion: { label: "Emotion", color: "#C17F3C", description: "Stories driven by feeling — vulnerability, memory, love, fear." },
  perspective: { label: "Perspective", color: "#8b5cf6", description: "Stories about seeing things differently." },
};

// ─── Story Arc Shapes ────────────────────────────────────────────────────────

export interface ArcShape {
  id: string;
  name: string;
  emoji: string;
  description: string;
  beats: { label: string; position: number; prompt: string }[];
  // SVG path points for the emotional curve (x: 0-100, y: 0-100 where 50 is neutral)
  curve: { x: number; y: number }[];
  jesperExample: string;
}

export const ARC_SHAPES: ArcShape[] = [
  {
    id: "man-in-hole",
    name: "Man in a Hole",
    emoji: "🕳️",
    description: "Start okay → fall into trouble → climb out better than before. The most common story shape for maker videos.",
    beats: [
      { label: "Starting Point", position: 0, prompt: "Where do you begin? What's the normal state before things go wrong?" },
      { label: "The Fall", position: 25, prompt: "What goes wrong? What's the mistake, the setback, the problem?" },
      { label: "The Bottom", position: 45, prompt: "How bad does it get? What's the lowest moment?" },
      { label: "The Climb", position: 65, prompt: "What do you try? How do you start fixing it?" },
      { label: "The Recovery", position: 85, prompt: "What works? What did you learn?" },
      { label: "New Normal", position: 100, prompt: "Where do you end up? How is it better than where you started?" },
    ],
    curve: [
      { x: 0, y: 55 }, { x: 15, y: 50 }, { x: 30, y: 25 },
      { x: 45, y: 15 }, { x: 60, y: 35 }, { x: 75, y: 55 },
      { x: 90, y: 70 }, { x: 100, y: 80 },
    ],
    jesperExample: "Almost every build video where something breaks, splits, or fails mid-project. The mistake IS the story.",
  },
  {
    id: "transformation",
    name: "The Transformation",
    emoji: "🦋",
    description: "Steady rise from raw to refined. The before/after arc — but with enough struggle in the middle to make the payoff earned.",
    beats: [
      { label: "The Raw Material", position: 0, prompt: "What does this look like at its worst? Show the 'before' honestly." },
      { label: "The Vision", position: 15, prompt: "What do you see in this that others don't? Why is it worth saving?" },
      { label: "First Effort", position: 30, prompt: "What's the first step, and what does it reveal?" },
      { label: "The Hard Middle", position: 55, prompt: "Where does the work get difficult, repetitive, or uncertain?" },
      { label: "The Turn", position: 75, prompt: "When does the object start becoming what you imagined?" },
      { label: "The Reveal", position: 100, prompt: "Show the finished result — but also what it means, not just how it looks." },
    ],
    curve: [
      { x: 0, y: 15 }, { x: 15, y: 25 }, { x: 30, y: 35 },
      { x: 45, y: 40 }, { x: 55, y: 42 }, { x: 70, y: 55 },
      { x: 85, y: 70 }, { x: 100, y: 85 },
    ],
    jesperExample: "The pallet wood era. Scrap → furniture. The curve rises slowly because the transformation takes work — that's what makes the reveal hit.",
  },
  {
    id: "voyage-return",
    name: "Voyage & Return",
    emoji: "🧭",
    description: "Leave what's familiar, enter unknown territory, return changed. Great for projects that push you outside your comfort zone.",
    beats: [
      { label: "Home", position: 0, prompt: "What's your normal — your workshop, your usual materials, your comfort zone?" },
      { label: "The Call", position: 15, prompt: "What pulls you out of the familiar? A new material? A request? A challenge?" },
      { label: "The Unknown", position: 35, prompt: "What's different here? What don't you know? What feels strange?" },
      { label: "The Test", position: 55, prompt: "What's the hardest moment in the new territory?" },
      { label: "The Lesson", position: 75, prompt: "What do you learn that you couldn't have learned at home?" },
      { label: "Return Changed", position: 100, prompt: "You're back — but different. What did you bring home with you?" },
    ],
    curve: [
      { x: 0, y: 50 }, { x: 15, y: 45 }, { x: 30, y: 30 },
      { x: 45, y: 25 }, { x: 55, y: 20 }, { x: 65, y: 35 },
      { x: 80, y: 55 }, { x: 100, y: 65 },
    ],
    jesperExample: "The off-grid cabin with his daughter. Home → forest → unfamiliar building environment → return with new understanding of craft and family.",
  },
  {
    id: "countdown",
    name: "The Countdown",
    emoji: "⏰",
    description: "A deadline compresses everything. Tension rises steadily as time runs out. Great for challenge videos or commissions.",
    beats: [
      { label: "The Challenge", position: 0, prompt: "What's the goal and how long do you have?" },
      { label: "Early Confidence", position: 15, prompt: "Things seem manageable. What's the plan?" },
      { label: "First Problem", position: 35, prompt: "What goes wrong that eats into your time?" },
      { label: "The Crunch", position: 60, prompt: "Time is running out. What do you sacrifice? What do you protect?" },
      { label: "The Sprint", position: 80, prompt: "The final push. What does desperation look like?" },
      { label: "Did You Make It?", position: 100, prompt: "The clock hits zero. Did you finish? What did it cost?" },
    ],
    curve: [
      { x: 0, y: 50 }, { x: 15, y: 55 }, { x: 30, y: 45 },
      { x: 50, y: 35 }, { x: 65, y: 25 }, { x: 80, y: 20 },
      { x: 90, y: 40 }, { x: 100, y: 70 },
    ],
    jesperExample: "'I Had 7 Days to Build This Bench.' The deadline compresses decisions, creates natural conflict, and gives the video a ticking clock the audience can feel.",
  },
  {
    id: "pride-fall",
    name: "Pride & Fall",
    emoji: "⚠️",
    description: "Things are going well — too well. A warning is ignored. Consequences follow. Great for cautionary or teaching videos.",
    beats: [
      { label: "The Rise", position: 0, prompt: "What's going well? What success are you building on?" },
      { label: "The Warning", position: 25, prompt: "What sign did you ignore? What should have worried you?" },
      { label: "Overconfidence", position: 45, prompt: "Where did you get careless, lazy, or arrogant?" },
      { label: "The Fall", position: 65, prompt: "What breaks? What goes wrong because of what you ignored?" },
      { label: "The Cost", position: 80, prompt: "What did the failure cost — time, materials, money, pride?" },
      { label: "The Lesson", position: 100, prompt: "What do you know now that you wish you'd known then?" },
    ],
    curve: [
      { x: 0, y: 45 }, { x: 15, y: 60 }, { x: 30, y: 72 },
      { x: 45, y: 78 }, { x: 55, y: 65 }, { x: 65, y: 35 },
      { x: 80, y: 20 }, { x: 90, y: 30 }, { x: 100, y: 45 },
    ],
    jesperExample: "Any video where early success led to a mistake. The arc is honest and educational — it's not about shame, it's about what overconfidence actually costs.",
  },
];

// ─── Creator DNA Profiles ────────────────────────────────────────────────────

export interface CreatorProfile {
  id: string;
  name: string;
  channel: string;
  subscribers: string;
  tagline: string;
  avatar?: string;
  storytellingDNA: {
    coreTruth: string;
    signatureMoves: { name: string; description: string; example: string }[];
    storyEngine: string;
    tensionSources: string[];
    hookPatterns: string[];
    blindSpots: string[];
    voiceDescription: string;
    lessonsForOthers: string[];
  };
}

export const CREATOR_PROFILES: CreatorProfile[] = [
  {
    id: "jesper-makes",
    name: "Jesper Makes",
    channel: "@JesperMakes",
    subscribers: "353k",
    tagline: "Story-led maker films where the build is physical evidence for a bigger emotional narrative.",
    storytellingDNA: {
      coreTruth: "You do not make woodworking videos with some storytelling layered on top. You make story videos where woodworking is the physical proof.",
      signatureMoves: [
        {
          name: "The Reframe",
          description: "Somewhere mid-video, the project stops being about the object and becomes about something bigger — identity, time, memory, proving something.",
          example: "The cabinet becomes about time. The chair becomes about the year around it. The door becomes about loss and what we carry.",
        },
        {
          name: "Vulnerability as Stakes",
          description: "Uses honesty not as performance of softness but as evidence that something is at risk. Doubt, fear, and uncertainty make the audience invest.",
          example: "'I'm not sure I can do this' becomes the engine that keeps people watching to see if he can.",
        },
        {
          name: "Humor as Pressure Control",
          description: "Punctures pretension, keeps sincerity from becoming heavy, turns failure into forward motion. Dry, self-aware, absurd understatement.",
          example: "Lets the audience feel two things at once: 'this matters' and 'I know how ridiculous this all is.'",
        },
        {
          name: "Cinematic Pacing",
          description: "Slows down when the object begins to feel meaningful. Speeds up through grind. The contrast between quiet reverence and busy momentum creates rhythm.",
          example: "When the finished object appears, the video goes quiet. The image does the work. No explanation needed.",
        },
        {
          name: "Transformation as Moral Argument",
          description: "Material transformation isn't just visual — it's moral. Waste has dignity. Discarded things deserve attention. The build argues for hidden value.",
          example: "Pallet wood isn't just cheap material. It's a symbol system about waste, potential, judgment, and surprise.",
        },
      ],
      storyEngine: "Can something discarded become meaningful? Can I become the kind of person who can do this? Can craft carry emotional weight?",
      tensionSources: [
        "Material risk — can ugly, weak, discarded material become great?",
        "Personal risk — am I good enough? Can I pull off the vision?",
        "Meaning risk — will this object become what it emotionally needs to be?",
        "Life-friction risk — can the build survive reality, time, energy, mood?",
      ],
      hookPatterns: [
        "Provocative premise: weird object, impossible goal, loaded title",
        "Transformation promise: something will become something else",
        "Personal stake: this matters to me specifically, and here's why",
        "Tonal signal: playful, reflective, stubborn, or slightly unhinged",
      ],
      blindSpots: [
        "Sometimes trusts vibe more than structure — middles can drift",
        "Can understate the conflict too long because he dislikes fake drama",
        "Occasionally relies on project scale to carry narrative weight",
        "Emotional material sometimes discovered late instead of planted early",
        "Process loyalty can lead to indulgent middle sections",
      ],
      voiceDescription: "Dry, self-aware, funny, reflective, occasionally philosophical, sincere without wanting to sound self-important.",
      lessonsForOthers: [
        "The object is never the real story. The real story is what the object proves, heals, remembers, or transforms.",
        "Your vulnerability is not weakness — it's proof that something is at stake.",
        "Humor protects sincerity. Use it to relieve pressure so the emotional beats land harder.",
        "Slow down when the moment matters. Speed up through the grind. Never flatten everything into one tempo.",
        "Plant the emotional seed early. Don't wait until the end to tell us why this matters.",
      ],
    },
  },
  {
    id: "blacktail-studio",
    name: "Blacktail Studio",
    channel: "@BlacktailStudio",
    subscribers: "3.3M",
    tagline: "Radical transparency as entertainment — showing the real business of making expensive things.",
    storytellingDNA: {
      coreTruth: "Cam doesn't separate the making from the business. The financial stakes, the client relationships, the pricing decisions, and the mistakes are ALL part of the story. That transparency is his superpower.",
      signatureMoves: [
        {
          name: "The Price Tag as Story",
          description: "Openly discusses costs, pricing, profit margins. Turns the business reality into narrative tension: will this commission be worth it?",
          example: "'How I Priced My Largest Commission Ever' — the pricing process IS the story. Most makers hide this. Cam makes it the hook.",
        },
        {
          name: "Mistake Ownership",
          description: "Shows failures, bad cuts, epoxy disasters without hiding them. The honesty builds trust and creates natural man-in-hole arcs.",
          example: "Frequently shows mistakes on camera, explains what went wrong, and shows the fix. The audience learns AND feels tension.",
        },
        {
          name: "Scale as Spectacle",
          description: "Enormous slabs, expensive materials, high-value commissions. The scale itself creates 'will he pull this off?' tension.",
          example: "A $10K table build in a garage. The contrast between setting and ambition IS the story.",
        },
        {
          name: "Direct Address Authenticity",
          description: "Talks to the camera like a friend. No script-reading feel. The conversational tone makes expensive, high-end work feel accessible.",
          example: "Tells stories of his earliest sales mistakes (selling a table for $350 and losing $150 on shipping) with self-deprecating humor.",
        },
      ],
      storyEngine: "Can I build something extraordinary in an ordinary setting? Can transparency about money and mistakes make premium craft accessible?",
      tensionSources: [
        "Financial stakes — real money, real commissions, real consequences",
        "Material risk — expensive slabs that can't be replaced if ruined",
        "Client expectations — someone paid thousands and is waiting",
        "Scale vs skill — projects that push the limits of one-person capability",
      ],
      hookPatterns: [
        "Dollar amount in title: '$10,000 Table', '$24,000 Saved'",
        "Mistake/failure cold open: showing the disaster before explaining it",
        "Behind-the-business transparency: pricing, client calls, real revenue",
        "Scale reveal: showing the enormous slab or ambitious commission",
      ],
      blindSpots: [
        "Can become formula-dependent — expensive slab + epoxy + reveal",
        "Business transparency can overshadow the craft story itself",
        "Less emotional depth than story-driven channels — stakes are financial more than existential",
        "The 'big table' format can feel repetitive without story variation",
      ],
      voiceDescription: "Straightforward, honest, conversational, self-deprecating. Feels like a friend explaining their work, not a creator performing.",
      lessonsForOthers: [
        "Don't hide the business side. Money is tension. Pricing is drama. Clients are characters.",
        "Show your mistakes on camera. Every failure is a free man-in-hole arc.",
        "Talk to the viewer like a friend, not an audience. Conversational beats performative.",
        "Scale creates instant curiosity — but you need story underneath it or it's just spectacle.",
      ],
    },
  },
  {
    id: "foureyes-furniture",
    name: "Foureyes Furniture",
    channel: "@_foureyes",
    subscribers: "1.2M",
    tagline: "Design-thinking as narrative — the 'why' behind every aesthetic decision becomes the story.",
    storytellingDNA: {
      coreTruth: "Chris doesn't just build furniture — he thinks about furniture design on camera. The intellectual process of solving a design problem is his primary narrative engine. You watch to understand HOW a designer thinks, not just what they make.",
      signatureMoves: [
        {
          name: "Design Process as Plot",
          description: "Shows the actual thinking: sketches, CAD iterations, rejected ideas, design principles. The decision-making process IS the story structure.",
          example: "Videos often start with a design problem, show 3-4 rejected approaches, then arrive at the solution. Each rejection is a plot beat.",
        },
        {
          name: "Intellectual Curiosity Hooks",
          description: "Opens with questions about design, copying, creativity, or aesthetics that go beyond woodworking into philosophy.",
          example: "'Improving On a Stolen Design' — a 33-minute video about creativity, copying, and what originality actually means. The build is secondary to the ideas.",
        },
        {
          name: "Cinematic Visual Language",
          description: "Macro close-ups, environmental wide shots, custom guitar music. The visual style signals 'this is art, not a tutorial.'",
          example: "Pioneered the 'weird angles + improvised guitar' style that made woodworking content feel like film, not instructional video.",
        },
        {
          name: "Essay-Form Structure",
          description: "Videos often function as visual essays with a thesis, not just build documentation. There's an argument being made.",
          example: "Videos about design principles, the uncanny valley in furniture, or what makes something 'honest' — these are essays with builds as evidence.",
        },
      ],
      storyEngine: "Why does this design work? What makes something beautiful versus merely functional? Can intellectual curiosity be as compelling as physical craft?",
      tensionSources: [
        "Design tension — will this idea work in reality, or only on paper?",
        "Intellectual tension — questions about creativity, copying, originality",
        "Aesthetic risk — will the final piece match the vision?",
        "Identity tension — being a content creator vs being a designer/maker",
      ],
      hookPatterns: [
        "Design question as hook: 'Why does this look right and this doesn't?'",
        "Intellectual provocation: 'Is it okay to copy someone's design?'",
        "Process reveal: showing the iteration from bad idea to good idea",
        "Visual beauty as hook: stunning opening shot of the finished piece",
      ],
      blindSpots: [
        "Intellectual approach can feel inaccessible to viewers who just want to build",
        "Design focus can overshadow the emotional/personal story layer",
        "Videos can feel more like lectures than narratives when the essay mode dominates",
        "The maker persona can get lost behind the design-thinker persona",
      ],
      voiceDescription: "Thoughtful, witty, design-literate, slightly nerdy. Sounds like a smart friend who happens to think deeply about why chairs look the way they do.",
      lessonsForOthers: [
        "Your design decisions are story beats. Show the rejected ideas — each one is a turning point.",
        "Intellectual curiosity is a valid story engine. 'Why does this work?' is as compelling as 'will this work?'",
        "Your visual style IS your voice. Invest in how things look, not just what you show.",
        "Essay-form videos can work if the thesis is clear and the evidence is physical.",
      ],
    },
  },
  {
    id: "swedish-maker",
    name: "The Swedish Maker",
    channel: "@TheSwedishMaker",
    subscribers: "60k",
    tagline: "The Nordic neighbor building in his barn — authenticity and community as the quiet story engine.",
    storytellingDNA: {
      coreTruth: "The Swedish Maker's strength is relatable ambition — he's not a polished expert, he's a regular guy who dives in and figures it out. The audience roots for him because he feels like someone they know.",
      signatureMoves: [
        {
          name: "The Everyman Approach",
          description: "Positions himself as a regular person learning and growing, not an expert teaching down. The audience identifies with the struggle.",
          example: "Started with pallet wood in the barn. His courage and creativity inspire people to start making, because if he can do it, maybe they can too.",
        },
        {
          name: "Community Integration",
          description: "Part of a network (Three Northern Makers podcast, ambassador relationships). The community connections add social proof and relatability.",
          example: "Co-hosts @threenorthernmakers podcast. The collaborative energy makes it feel like a community, not a solo performance.",
        },
        {
          name: "Technology + Tradition Mix",
          description: "Blends 3D printing with traditional woodworking. The collision of old and new creates natural curiosity and 'can you really do that?' tension.",
          example: "Using 3D-printed jigs and accessories alongside hand tools — the combination is inherently interesting because most makers choose one lane.",
        },
        {
          name: "Farm/Workshop Atmosphere",
          description: "The setting — a farm in Sweden — is itself a character. The environment adds texture, season, and a sense of place that urban workshops can't match.",
          example: "Walking around the farm, transforming fallen logs and found materials. The location isn't backdrop — it's part of the story.",
        },
      ],
      storyEngine: "Can an ordinary person with courage and curiosity build extraordinary things? Can community and authenticity compete with polish and expertise?",
      tensionSources: [
        "Skill gap tension — attempting things above current ability",
        "Resource tension — working with what's available, not ideal",
        "Innovation tension — combining 3D printing with traditional methods",
        "Growth tension — building a creative life from a small Swedish farm",
      ],
      hookPatterns: [
        "Value/savings hooks: '$24,000 Saved'",
        "Everyman curiosity: 'what everyone gets wrong about DIY'",
        "Technology meets tradition: unexpected tools in a woodshop",
        "Personal journey: the ongoing story of building a creative life",
      ],
      blindSpots: [
        "Titles can be too vague or motivational without clear viewer promise",
        "The everyman positioning can undersell genuine expertise",
        "Community content can dilute the individual narrative voice",
        "Technology integration needs clearer storytelling about WHY, not just WHAT",
      ],
      voiceDescription: "Warm, humble, curious, community-minded. The Scandinavian neighbor who shows up with a coffee and a weird idea.",
      lessonsForOthers: [
        "You don't need to be an expert to tell a compelling story. Being honest about learning IS the story.",
        "Your setting is a character. Use your environment — it adds texture no studio can match.",
        "Combining unexpected tools or methods creates natural curiosity gaps.",
        "Build community. Collaborate. The 'lone maker' narrative is powerful but so is 'makers together.'",
      ],
    },
  },
];
