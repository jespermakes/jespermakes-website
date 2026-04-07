export type BuyLink = {
  label: string;
  url: string;
  region?: "us" | "eu" | "global";
  badge?: string;
};

export type ColorSwatch = {
  name: string;
  hex: string;
  collection?: string;
};

export type Tool = {
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  categoryIcon: string;
  image?: string;
  badge?: "Ambassador";
  buyLinks: BuyLink[];
  youtubeVideos?: string[];
  colorGrid?: ColorSwatch[];
  productList?: string[];
  gallery?: string[];
};

export const tools: Tool[] = [
  // Festool
  {
    slug: "festool-track-saw-ts-55",
    name: "Festool TS 55 FEBQ-Plus Track Saw",
    description:
      "My most-used tool. Perfectly straight cuts every time. Worth every penny if you're serious about woodworking.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-cordless-drill-t-18",
    name: "Festool Cordless Drill T 18",
    description:
      "Lightweight, powerful, and the battery system works across all Festool cordless tools.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-random-orbital-sander-ets-150",
    name: "Festool ETS 150/3 EQ-Plus",
    description:
      "Dust extraction is unreal. Makes sanding almost enjoyable.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-domino-df-500",
    name: "Festool DOMINO DF 500 Q-Plus",
    description:
      "Game changer for joinery. Fast, accurate, and makes strong joints without complicated setups.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-hkc-55-keb",
    name: "Festool HKC 55 KEB Cordless Circular Saw",
    description:
      "The tool I reach for most when I just need to cut something. Cordless circular saw with a guide rail attachment for perfectly repeatable angle cuts.",
    longDescription:
      "This is honestly the saw I grab first in the workshop. The HKC 55 KEB is a cordless circular saw that you can attach a Festool guide rail directly to, giving you dead-straight cuts every time without the setup time of a track saw. On a job site it's essential. In the workshop it's the quick, reliable cut when you don't want to set up the big saw. The KickbackStop (KEB) adds a safety layer that kills the blade if it binds. Runs on the same 18V battery system as all Festool cordless tools. 55mm cutting depth, clean cuts, zero hassle.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    image: "/images/tools/festool-hkc-55/hkc-55-workshop.jpg",
    gallery: [
      "/images/tools/festool-hkc-55/hkc-55-workshop.jpg",
      "/images/tools/festool-hkc-55/hkc-55-closeup.jpg",
      "/images/tools/festool-hkc-55/hkc-55-bench.jpg",
    ],
    buyLinks: [
      { label: "Festool International", url: "https://www.festool.com/products/cordless-products/cordless-portable-circular-saws/578302---hkc-55-keb-basic", region: "global" },
      { label: "Festool Denmark", url: "https://www.festool.dk/produkter/nyheder/v%C3%A6rkt%C3%B8j/578302---hkc-55-keb-basic", region: "eu" },
      { label: "Festool USA", url: "https://www.festoolusa.com/products/cordless-products/cordless-portable-circular-saws/578302---hkc-55-keb-basic", region: "us" },
      { label: "Festool UK", url: "https://www.festool.co.uk/products/cordless-products/cordless-portable-circular-saws/578302---hkc-55-keb-basic", region: "global" },
    ],
    youtubeVideos: [],
  },
  {
    slug: "ap-700-nail-pusher",
    name: "Air Locker AP700 Nail Remover",
    description:
      "Essential for pallet work. Pushes nails out cleanly without destroying the wood.",
    category: "Power Tools",
    categoryIcon: "🔨",
    buyLinks: [
      { label: "Amazon", url: "https://amzn.to/3PHAdM3", region: "us" },
    ],
  },

  // Festool Saws
  {
    slug: "festool-tks-80",
    name: "Festool TKS 80 EBS",
    description:
      "Compact table saw that fits in a Systainer. Precise, portable, and surprisingly capable for its size.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-csc-sys-50",
    name: "Festool CSC SYS 50 EBI Table Saw",
    description:
      "A full table saw that lives inside a Systainer. Cordless, ultra-portable, and more precise than it has any right to be at this size.",
    longDescription:
      "This thing shouldn't exist. A proper table saw that folds into a Systainer you can carry with one hand. The CSC SYS 50 runs on the Festool 18V battery system, has a digital display for exact fence positioning, and cuts with the kind of precision you'd expect from a machine three times its size. I find myself reaching for this instead of my big table saw more often than I'd like to admit. When I need a quick, precise rip cut, I just put it on the bench and go. No setup, no alignment fuss. The fold-out extensions give you enough table surface for real work, and the dust extraction port keeps things clean. On a job site, it's a game changer. In the workshop, it's the lazy man's table saw, and I mean that as the highest compliment.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    image: "/images/tools/festool-csc-sys-50/csc-systainer.jpg",
    gallery: [
      "/images/tools/festool-csc-sys-50/csc-systainer.jpg",
      "/images/tools/festool-csc-sys-50/csc-display.jpg",
      "/images/tools/festool-csc-sys-50/csc-cutting.jpg",
      "/images/tools/festool-csc-sys-50/csc-result.jpg",
    ],
    buyLinks: [
      { label: "Festool International", url: "https://www.festool.com/products/cordless-products/cordless-table-saw/576820---csc-sys-50", region: "global" },
      { label: "Festool Denmark", url: "https://www.festool.dk/produkter/nyheder/v%C3%A6rkt%C3%B8j/576820---csc-sys-50", region: "eu" },
      { label: "Festool UK", url: "https://www.festool.co.uk/products/cordless-products/cordless-table-saw/576820---csc-sys-50", region: "global" },
    ],
    youtubeVideos: ["xCPccV9pYOk"],
  },
  {
    slug: "festool-kapex-ks-120",
    name: "Festool KAPEX KS 120 REB Sliding Compound Miter Saw",
    description:
      "Festool's flagship miter saw. The quick clamp system is so fast I actually use it, which says everything.",
    longDescription:
      "Most miter saw clamps are so annoying that you stop using them after a week. The KAPEX is different. The quick clamp system is so fast and intuitive that I actually clamp every single cut. That's the difference between a feature on paper and a feature in practice. The KS 120 REB gives you a 120mm cutting height with a dual-rail sliding system that takes up zero space behind the saw. The cut quality is surgical. Miters, bevels, compound angles, it handles everything without drama. Dust extraction is Festool-level good, meaning your shop stays clean while you work. This saw sits on a custom station in my workshop and gets used on almost every project. It's one of those tools where you wonder what you did before you had it.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    image: "/images/tools/festool-kapex/kapex-workshop.jpg",
    gallery: [
      "/images/tools/festool-kapex/kapex-workshop.jpg",
      "/images/tools/festool-kapex/kapex-closeup.jpg",
      "/images/tools/festool-kapex/kapex-cuts.jpg",
    ],
    buyLinks: [
      { label: "Festool International", url: "https://www.festool.com/products/saws/sliding-compound-mitre-saws/575302---ks-120-reb", region: "global" },
      { label: "Festool Denmark", url: "https://www.festool.dk/produkter/save/kap-geringssave/575302---ks-120-reb", region: "eu" },
      { label: "Festool USA", url: "https://www.festoolusa.com/products/saws/sliding-compound-mitre-saws/575302---ks-120-reb", region: "us" },
    ],
    youtubeVideos: ["Rjn-C-ZgjYI"],
  },

  {
    slug: "festool-hk-85",
    name: "Festool HK 85 EB Circular Saw",
    description:
      "The big saw. 85mm cutting depth for thick timber, beams, and anything the track saw can't reach. This is what I pull out for timber framing and heavy ripping.",
    longDescription:
      "When the track saw isn't enough, the HK 85 steps in. 85mm cutting depth means you can cut through material that would take two passes on any other saw. I use it for timber framing, thick hardwood slabs, and any cut where the TS 55 just can't reach. It runs on a guide rail like the rest of the Festool system, so you still get that dead-straight precision even on heavy cuts. The dust extraction keeps the cut line visible and your lungs clean. It's a big, serious tool for big, serious work. Not something you use every day, but when you need it, nothing else will do.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    image: "/images/tools/festool-hk-85/hk-85-cutting.jpg",
    gallery: [
      "/images/tools/festool-hk-85/hk-85-cutting.jpg",
      "/images/tools/festool-hk-85/hk-85-bench.jpg",
    ],
    buyLinks: [
      { label: "Festool International", url: "https://www.festool.com/products/saws/circular-saws/576147---hk-85-eb-plus", region: "global" },
      { label: "Festool Denmark", url: "https://www.festool.dk/produkter/save/rundrundsave/576147---hk-85-eb-plus", region: "eu" },
      { label: "Festool USA", url: "https://www.festoolusa.com/products/saws/circular-saws/576147---hk-85-eb-plus", region: "us" },
    ],
    youtubeVideos: ["o6Zi2ickrig"],
  },
  {
    slug: "festool-rsc-18",
    name: "Festool RSC 18",
    description:
      "Cordless reciprocating saw. For demolition and rough cuts when finesse isn't the point.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-carvex-ps-420",
    name: "Festool CARVEX PS 420 EBQ Jigsaw",
    description:
      "I generally don't like jigsaws. That was until I got my hands on the Carvex. Ridiculous shapes, tight corners where circular saws can't reach. This changed my mind about what a jigsaw can do.",
    longDescription:
      "I used to avoid jigsaws. They wandered, they splintered, they felt imprecise. Then I tried the Carvex and realized the problem wasn't jigsaws, it was every other jigsaw I'd used. The PS 420 cuts curves that look like they were routed. It gets into the corners where the round blade on a circular saw can't reach, which means I actually finish cuts properly instead of leaving little triangles of uncut material. The three-way guidance system keeps the blade tracking true even through thick hardwood. Dust extraction is Festool-level good. And the tool-free blade change means I actually swap blades when I should instead of forcing one blade through everything. It's the tool that made me stop hating jigsaws.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    image: "/images/tools/festool-carvex/carvex-action.jpg",
    gallery: [
      "/images/tools/festool-carvex/carvex-systainer.jpg",
      "/images/tools/festool-carvex/carvex-cutting.jpg",
      "/images/tools/festool-carvex/carvex-closeup.jpg",
      "/images/tools/festool-carvex/carvex-action.jpg",
    ],
    buyLinks: [
      { label: "Festool International", url: "https://www.festool.com/products/saws/jigsaws/576178---psc-420-ebi-basic", region: "global" },
      { label: "Festool Denmark", url: "https://www.festool.dk/produkter/save/stiksave/576178---psc-420-ebi-basic", region: "eu" },
      { label: "Festool USA", url: "https://www.festoolusa.com/products/saws/jigsaws/576178---psc-420-ebi-basic", region: "us" },
    ],
    youtubeVideos: [],
  },

  // Festool Joinery
  {
    slug: "festool-domino-xl-df-700",
    name: "Festool DOMINO XL DF 700 EQ Joining Machine",
    description:
      "The big brother. When the DF 500 isn't enough, the 700 steps in for heavy timber, thick slabs, and joinery that needs to hold a house together.",
    longDescription:
      "The DF 700 is the Domino you reach for when the material gets serious. Thick hardwood slabs, bed frames, heavy tables, timber framing joints. The larger tenon sizes (up to 14x140mm) create joints that are genuinely structural. I use it for anything where the DF 500's tenons would feel undersized. The machine is heavier, the plunge is deeper, and the mortises it cuts are massive. You can see the slots it leaves in thick timber and know that joint isn't going anywhere. Same principle as the DF 500 (pendulum milling, adjustable stops, repeatable positioning), just scaled up for serious work. If you're joining anything thicker than 40mm, this is the one.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    image: "/images/tools/festool-domino-xl/df700-hands.jpg",
    gallery: [
      "/images/tools/festool-domino-xl/df700-hands.jpg",
      "/images/tools/festool-domino-xl/df700-plunge.jpg",
      "/images/tools/festool-domino-xl/df700-mortises.jpg",
      "/images/tools/festool-domino-xl/df700-result.jpg",
      "/images/tools/festool-domino-xl/df700-action.jpg",
    ],
    buyLinks: [
      { label: "Festool International", url: "https://www.festool.com/products/domino-jointing-system/domino-joining-machine-df-700/574320---df-700-eq-plus", region: "global" },
      { label: "Festool Denmark", url: "https://www.festool.dk/produkter/domino-samlingssystem/domino-maskine-df-700/574320---df-700-eq-plus", region: "eu" },
      { label: "Festool USA", url: "https://www.festoolusa.com/products/domino-joiners/domino-joining-machine-df-700/574320---df-700-eq-plus", region: "us" },
    ],
    youtubeVideos: [],
  },

  // Festool Drilling/Driving
  {
    slug: "festool-quadrive-tpc-18",
    name: "Festool QUADRIVE TPC 18/4 Percussion Drill",
    description:
      "Four-speed gearbox, EC-TEC brushless motor. This is the drill you bring when a regular drill gives up. Auger bits through end grain, lag bolts into timber, no sweat.",
    longDescription:
      "The TPC 18/4 is Festool's answer to \"what if a drill just never stopped?\". The four-speed QUADRIVE gearbox means you always have the right speed and torque combination, whether you're driving small screws into softwood or pushing a massive auger bit through a tree stump. The EC-TEC brushless motor doesn't waste energy. The percussion mode handles masonry when you need it. It runs on the same 18V battery platform as every other Festool cordless tool, and it's the one drill in the workshop that has never made me wish I had something more powerful. For timber framing, cabin building, and any project where you're working with serious material, this is the one.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    image: "/images/tools/festool-tpc-18/tpc-18-stump.jpg",
    gallery: [
      "/images/tools/festool-tpc-18/tpc-18-hand.jpg",
      "/images/tools/festool-tpc-18/tpc-18-stump.jpg",
      "/images/tools/festool-tpc-18/tpc-18-auger.jpg",
      "/images/tools/festool-tpc-18/tpc-18-badge.jpg",
    ],
    buyLinks: [
      { label: "Festool International", url: "https://www.festool.com/products/drills-and-screwdrivers/cordless-percussion-drills/577600---tpc-18-4", region: "global" },
      { label: "Festool USA", url: "https://www.festoolusa.com/products/drills-and-screwdrivers/cordless-percussion-drills/576998---tpc-18-4-i-plus", region: "us" },
    ],
    youtubeVideos: [],
  },
  {
    slug: "festool-txs-12",
    name: "Festool TXS 12",
    description:
      "Compact drill that's tiny but capable. Perfect for tight spaces and delicate work.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },

  // Festool Sanding
  {
    slug: "festool-ets-ec-150",
    name: "Festool ETS EC 150/5 EQ",
    description:
      "Brushless random orbital sander. The upgraded version with EC motor — quieter and more powerful.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-rotex-ro-90",
    name: "Festool ROTEX RO 90",
    description:
      "Geared eccentric sander that sands, polishes, and does coarse stock removal. Three tools in one.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-rts-400",
    name: "Festool RTS 400",
    description:
      "Rectangular orbital sander for flat surfaces and edges. Gets into corners the round sanders can't.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-bs-75",
    name: "Festool BS 75 E Belt Sander",
    description:
      "The only belt sander I know of with a real dust collection system. The frame around it isn't decorative, it's a dust extraction frame. You can actually use this thing indoors without coating everything in fine dust.",
    longDescription:
      "Most belt sanders are outdoor tools. You take them outside, sand something, and come back covered in dust. The BS 75 E is different. That aluminium frame mounted around it is a dust collection system that connects to a Festool extractor. It actually works. You can belt sand inside your workshop without destroying your lungs or coating every surface in fine particles. That alone makes it unique. Beyond the dust collection, it's a serious belt sander. 75mm wide belt, variable speed, and it removes material fast. I use it for leveling rough slabs, cleaning up live edges, and anywhere I need to take off a lot of material quickly before switching to an orbital sander for finishing. The belt change is tool-free, the tracking adjustment is simple, and the frame doubles as a flat reference surface when you're sanding boards.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    image: "/images/tools/festool-bs-75/bs75-sanding.jpg",
    gallery: [
      "/images/tools/festool-bs-75/bs75-sanding.jpg",
      "/images/tools/festool-bs-75/bs75-frame-detail.jpg",
      "/images/tools/festool-bs-75/bs75-full-view.jpg",
      "/images/tools/festool-bs-75/bs75-live-edge.jpg",
      "/images/tools/festool-bs-75/bs75-belt-change.jpg",
    ],
    buyLinks: [
      { label: "Festool International", url: "https://www.festool.com/products/sanders-and-grinders/belt-sanders/575769---bs-75-e-plus", region: "global" },
      { label: "Festool Denmark", url: "https://www.festool.dk/produkter/slibemaskiner/baandslibere/575769---bs-75-e-plus", region: "eu" },
      { label: "Festool USA", url: "https://www.festoolusa.com/products/sanders-and-grinders/belt-sanders/575769---bs-75-e-plus", region: "us" },
    ],
    youtubeVideos: [],
  },

  // Festool Other Power Tools
  {
    slug: "festool-agc-18",
    name: "Festool AGC 18-125",
    description:
      "Cordless angle grinder. 125mm disc, runs on the battery system.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-vecturo-osc-18",
    name: "Festool VECTURO OSC 18",
    description:
      "Cordless oscillating multi-tool. Cuts, scrapes, sands — the Swiss army knife of power tools.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-hlc-82",
    name: "Festool HLC 82",
    description:
      "Cordless planer. 82mm width, runs on the battery system. Clean surfaces anywhere.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },

  // Festool Dust Extraction
  {
    slug: "festool-ctm-36",
    name: "Festool CTM 36 E",
    description:
      "Mobile dust extractor with 36-liter capacity. Auto-starts when you plug in a tool.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-cth-26",
    name: "Festool CTH 26 E",
    description:
      "Hazardous dust extractor with H-class filtration. For when you're working with toxic or fine dust.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-ct-va-20",
    name: "Festool CT-VA 20",
    description:
      "Cyclone pre-separator. Goes between your tool and extractor — catches the heavy stuff before it hits the filter.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },

  // Festool Workshop
  {
    slug: "festool-sys-air",
    name: "Festool SYS-AIR H",
    description:
      "Workshop air purifier. Cleans the air you breathe while working. Essential for your health.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-syslite-kbs",
    name: "Festool SYSLITE KBS C",
    description:
      "Cordless work light. Bright, runs on the battery system. Good light makes everything easier.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-energy-set",
    name: "Festool SYS 18V Energy Set",
    description:
      "Battery and charger set. SCA16 charger plus TCL 6 rapid charger — keeps everything topped up.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-kv-sys-d8",
    name: "Festool KV-SYS D8",
    description:
      "Domino connector system for knockdown furniture joints. Assemble and disassemble without glue.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-zs-of-1010",
    name: "Festool ZS-OF 1010 M",
    description:
      "Router accessory set for the OF 1010 router. Everything you need to get the most out of it.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-vn-hk85-groove",
    name: "Festool VN-HK85 Groove Cutter",
    description:
      "Groove cutting attachment for the HK 85. Removes material like crazy. Grooves, half-lap joints, dados. Does the work of a big router but on the guide rail.",
    longDescription:
      "This attachment turns the HK 85 into something completely different. Swap the saw blade for the groove cutter head and you've got a machine that eats through material for grooves, half-lap joints, and dados. It's the kind of work you'd normally do with a big router and a massive bit, but this runs on the Festool guide rail so it's dead precise and controlled. I use it for timber framing joints, housing dados for shelves, and anywhere I need to remove a lot of material in a straight line. It's fast, it's powerful, and the cuts are clean. One of those Festool accessories that makes you wonder why every circular saw doesn't have this option.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    image: "/images/tools/festool-groove-cutter/groove-blade-closeup.jpg",
    gallery: [
      "/images/tools/festool-groove-cutter/groove-systainer.jpg",
      "/images/tools/festool-groove-cutter/groove-blade-closeup.jpg",
      "/images/tools/festool-groove-cutter/hk85-workshop.jpg",
    ],
    buyLinks: [
      { label: "Festool International", url: "https://www.festool.com/accessory/saws/machine-accessories/groove-cutting-unit/576803---vn-hk85-130x16-25", region: "global" },
      { label: "Festool Denmark", url: "https://www.festool.dk/tilbehoer/save/maskintilbeh%C3%B8r/notanordning/576803---vn-hk85-130x16-25", region: "eu" },
    ],
    youtubeVideos: ["o6Zi2ickrig", "1VTyhDuV4Is"],
  },
  {
    slug: "festool-fsk-guide-rail",
    name: "Festool FSK Cross-Cutting Guide Rail",
    description:
      "Guide rail for precise crosscuts with track saws. Quick setup, accurate results.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },

  // Festool Storage
  {
    slug: "festool-systainer-org",
    name: "Festool SYS3 ORG & SORT/3 Systainers",
    description:
      "The Systainer organizer system. Modular storage that stacks and locks together. Keeps the chaos organized.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },
  {
    slug: "festool-tool-bag",
    name: "Festool Open-Top Tool Bag",
    description:
      "Simple canvas tool tote. Durable, practical, gets the job done.",
    category: "Festool",
    categoryIcon: "⚡",
    badge: "Ambassador",
    buyLinks: [],
  },

  // Laguna Tools
  {
    slug: "laguna-18bx-bandsaw",
    name: "Laguna 18|BX Bandsaw",
    description:
      "18-inch bandsaw with serious resawing capability. For when you need to slice thick stock.",
    category: "Power Tools",
    categoryIcon: "🔨",
    buyLinks: [],
  },
  {
    slug: "laguna-supermax-drum-sander",
    name: "Laguna SuperMax 16|32 Drum Sander",
    description:
      "Drum sander for consistent thickness sanding on wide boards. Saves hours of hand sanding.",
    category: "Power Tools",
    categoryIcon: "🔨",
    buyLinks: [],
  },
  {
    slug: "laguna-cflux-cyclone",
    name: "Laguna C|Flux Cyclone Collector",
    description:
      "Cyclone dust collector with high capacity. The backbone of workshop dust management.",
    category: "Power Tools",
    categoryIcon: "🔨",
    buyLinks: [],
  },

  // Other Brands
  {
    slug: "shaper-origin",
    name: "Shaper Origin",
    description:
      "Handheld CNC router guided by computer vision. Cuts precise shapes — a truly unique tool.",
    category: "Power Tools",
    categoryIcon: "🔨",
    buyLinks: [],
  },
  {
    slug: "makita-40v-xgt",
    name: "Makita 40V Max XGT",
    description:
      "Cordless drill for when you need raw power the Festool doesn't deliver.",
    category: "Power Tools",
    categoryIcon: "🔨",
    buyLinks: [],
  },
  {
    slug: "paslode-cordless-nailer",
    name: "Paslode Cordless Nailer",
    description:
      "Cordless gas-powered nail gun. Fast framing and construction work without hoses.",
    category: "Power Tools",
    categoryIcon: "🔨",
    buyLinks: [],
  },

  // Finishing
  {
    slug: "rubio-monocoat-oil-plus-2c",
    name: "Rubio Monocoat Oil Plus 2C",
    description:
      "I use Oil Plus 2C because it's the best choice for indoor wood protection. Wood gets protected while it still feels like wood, it's food safe, it makes the wood look good, and you can color the wood in any color you like, darker or lighter. I simply love it.",
    category: "Finishing",
    categoryIcon: "🎨",
    badge: "Ambassador",
    buyLinks: [
      { label: "Rubio Monocoat EU", url: "https://www.rubiomonocoat.co.uk/products/oil-plus-2c?sca_ref=10907821.Lg4k4U0lSMUKN", region: "eu", badge: "Affiliate" },
      { label: "Rubio Monocoat US", url: "https://www.rubiomonocoatusa.com/collections/oil-plus-2c", region: "us" },
    ],
    colorGrid: [
      { name: "Affogato", hex: "#7A5A38" },
      { name: "Almond", hex: "#A08060" },
      { name: "Arabica", hex: "#6A4A28" },
      { name: "Ash Grey", hex: "#9E9585" },
      { name: "Black", hex: "#1A1510" },
      { name: "Bourbon", hex: "#704020" },
      { name: "Castle Brown", hex: "#4A2810" },
      { name: "Charcoal", hex: "#3A3530" },
      { name: "Chocolate", hex: "#3A1A08" },
      { name: "Cocoa", hex: "#4A2A15" },
      { name: "Cortado", hex: "#7A5A35" },
      { name: "Cotton White", hex: "#E5D8C4" },
      { name: "Dark Oak", hex: "#5A3818" },
      { name: "Dark Roast", hex: "#3A2010" },
      { name: "Dulce", hex: "#9A7550" },
      { name: "Dunes", hex: "#B8A07A" },
      { name: "Fern", hex: "#4A5A30" },
      { name: "Golden Hour", hex: "#B88A40" },
      { name: "Hazelnut", hex: "#8A6A48" },
      { name: "Honey", hex: "#C09850" },
      { name: "Light Roast", hex: "#9A7A58" },
      { name: "Linen", hex: "#D5C6AD" },
      { name: "Macchiato", hex: "#8A6A45" },
      { name: "Midnight Sky", hex: "#2A2530" },
      { name: "Mist", hex: "#C5B8A0" },
      { name: "Mist 5%", hex: "#D0C4AC" },
      { name: "Mocha", hex: "#5A3A20" },
      { name: "Natural", hex: "#C4A67D" },
      { name: "Oyster", hex: "#BFB199" },
      { name: "Pure", hex: "#D4B896" },
      { name: "Red Velvet", hex: "#6A2020" },
      { name: "Shell Grey", hex: "#B0A590" },
      { name: "Smoke", hex: "#8A8070" },
      { name: "Smoke 5%", hex: "#A09680" },
      { name: "Super White", hex: "#F0EAE0" },
      { name: "Vanilla", hex: "#DBCAA5" },
      { name: "Vienna", hex: "#6A4020" },
      { name: "Walnut", hex: "#5A3A20" },
      { name: "White", hex: "#E8DFD0" },
      { name: "White 5%", hex: "#DDD4C5" },
    ],
  },
  {
    slug: "rubio-monocoat-durogrit",
    name: "Rubio Monocoat DuroGrit",
    description:
      "A fantastic product when you want to protect wood for the outdoors. It's for raw wood, because it binds with the wood fibers, it's not just a surface. You can have a very close to natural color, or you can go crazy and make it bison brown, black, blue or white.",
    category: "Finishing",
    categoryIcon: "🎨",
    badge: "Ambassador",
    buyLinks: [
      { label: "Rubio Monocoat EU", url: "https://www.rubiomonocoat.co.uk/products/durogrit-1?sca_ref=10907821.Lg4k4U0lSMUKN", region: "eu", badge: "Affiliate" },
      { label: "Rubio Monocoat US", url: "https://www.rubiomonocoatusa.com/products/durogrit", region: "us" },
    ],
    colorGrid: [
      { name: "Light Sand", hex: "#D4C4A0", collection: "Great Plains" },
      { name: "Prairie Dust", hex: "#BCA878", collection: "Great Plains" },
      { name: "Grassland Beige", hex: "#A89468", collection: "Great Plains" },
      { name: "Foxy Brown", hex: "#8A6A40", collection: "Great Plains" },
      { name: "Rocky Umber", hex: "#6A4A28", collection: "Great Plains" },
      { name: "Steppe Look", hex: "#5A3A18", collection: "Great Plains" },
      { name: "Bison Brown", hex: "#4A2A10", collection: "Great Plains" },
      { name: "Charred Black", hex: "#2A2018", collection: "Great Plains" },
      { name: "Saddle Black", hex: "#1A1510", collection: "Great Plains" },
      { name: "Sutton Grey", hex: "#9A9488", collection: "Salt Lakes" },
      { name: "Atacama Grey", hex: "#7A7568", collection: "Salt Lakes" },
      { name: "Tuz White", hex: "#D4CCC0", collection: "Salt Lakes" },
      { name: "Utah Pink", hex: "#C4A098", collection: "Salt Lakes" },
      { name: "Salinas Blue", hex: "#6A7A88", collection: "Salt Lakes" },
      { name: "Salt Lake Green", hex: "#5A7A58", collection: "Salt Lakes" },
      { name: "Rubio Monocoat Green", hex: "#3A5A38", collection: "Salt Lakes" },
    ],
  },
  {
    slug: "rubio-monocoat-woodcream",
    name: "Rubio Monocoat WoodCream",
    description:
      "WoodCream is for restoration work, if you paint windows that already have a layer of paint.",
    category: "Finishing",
    categoryIcon: "🎨",
    badge: "Ambassador",
    buyLinks: [
      { label: "Rubio Monocoat EU", url: "https://www.rubiomonocoat.co.uk/products/woodcream?sca_ref=10907821.Lg4k4U0lSMUKN", region: "eu", badge: "Affiliate" },
      { label: "Rubio Monocoat US", url: "https://www.rubiomonocoatusa.com/collections/woodcream", region: "us" },
    ],
  },
  {
    slug: "rubio-monocoat-care-kit",
    name: "Rubio Monocoat Care & Maintenance",
    description:
      "Everything you need to keep your Rubio Monocoat finishes looking their best. Maintenance oil for refreshing, cleaner for daily care, and surface prep for new applications.",
    category: "Finishing",
    categoryIcon: "🎨",
    badge: "Ambassador",
    buyLinks: [
      { label: "Rubio Monocoat US", url: "https://www.rubiomonocoatusa.com/collections/clean-care", region: "us" },
    ],
    productList: [
      "Universal Maintenance Oil",
      "Surface Care",
      "Raw Wood Cleaner",
      "Limespot Remover",
    ],
  },

  // 3D Printing & Laser
  {
    slug: "bambu-lab-h2c",
    name: "Bambu Lab H2C",
    description:
      "Uncompromising multi-material. The newest flagship with Core XY and AMS, built for serious multi-color and multi-material printing.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/bambu-h2c.jpg",
    buyLinks: [
      { label: "Bambu Lab EU", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Feu.store.bambulab.com%2Fproducts%2Fh2c", region: "eu" },
      { label: "Bambu Lab US", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Fstore.bambulab.com%2Fproducts%2Fh2c", region: "us" },
    ],
  },
  {
    slug: "bambu-lab-h2d",
    name: "Bambu Lab H2D",
    description:
      "Rethink personal manufacturing. 3D printer with integrated laser engraving. Print and engrave from one machine.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/bambu-h2d.jpg",
    buyLinks: [
      { label: "Bambu Lab EU", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Feu.store.bambulab.com%2Fproducts%2Fh2d", region: "eu" },
      { label: "Bambu Lab US", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Fstore.bambulab.com%2Fproducts%2Fh2d", region: "us" },
    ],
  },
  {
    slug: "bambu-lab-p2s",
    name: "Bambu Lab P2S",
    description:
      "Flagship performance at a mid-range price. Fast, enclosed, and capable of handling advanced filaments.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    buyLinks: [
      { label: "Bambu Lab EU", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Feu.store.bambulab.com%2Fproducts%2Fp2s", region: "eu" },
      { label: "Bambu Lab US", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Fstore.bambulab.com%2Fproducts%2Fp2s", region: "us" },
    ],
  },
  {
    slug: "bambu-lab-p1s",
    name: "Bambu Lab P1S",
    description:
      "The reliable workhorse. I have two of these running in the workshop. Enclosed, fast, handles everything from PLA to ABS. If you want one printer that just works, this is it.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/bambu-p1s.jpg",
    buyLinks: [
      { label: "Bambu Lab EU", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Feu.store.bambulab.com%2Fproducts%2Fp1s", region: "eu" },
      { label: "Bambu Lab US", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Fstore.bambulab.com%2Fproducts%2Fp1s", region: "us" },
    ],
  },
  {
    slug: "bambu-lab-a1",
    name: "Bambu Lab A1",
    description:
      "The best seller for a reason. Open frame, dead simple setup, and print quality that punches way above its price. Great entry point into 3D printing.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/bambu-a1.jpg",
    buyLinks: [
      { label: "Bambu Lab EU", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Feu.store.bambulab.com%2Fproducts%2Fa1", region: "eu" },
      { label: "Bambu Lab US", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Fstore.bambulab.com%2Fproducts%2Fa1", region: "us" },
    ],
  },
  {
    slug: "bambu-lab-a1-mini",
    name: "Bambu Lab A1 Mini",
    description:
      "Tiny, affordable, and surprisingly capable. Perfect for small workshop prints, jigs, and accessories. Takes up almost no space.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    buyLinks: [
      { label: "Bambu Lab EU", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Feu.store.bambulab.com%2Fproducts%2Fa1-mini", region: "eu" },
      { label: "Bambu Lab US", url: "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Fstore.bambulab.com%2Fproducts%2Fa1-mini", region: "us" },
    ],
  },
  {
    slug: "xtool-p3",
    name: "xTool P3 80W CO2 Laser Cutter",
    description:
      "The flagship. 80W CO2 laser, the most powerful desktop laser cutter in the xTool lineup. For makers who need maximum cutting power and speed.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/xtool-p3.jpg",
    buyLinks: [
      { label: "xTool EU", url: "https://www.xtool.eu/pages/xtool-p3-the-flagship-80w-co2-laser-cutter?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5307", region: "eu" },
      { label: "xTool US", url: "https://www.xtool.com/pages/xtool-p3-the-flagship-80w-co2-laser-cutter?ref=jfYq7B0iIf4uJl&utm_medium=affiliate&utm_source=goaffpro&utm_term=5306", region: "us" },
      { label: "xTool UK", url: "https://uk.xtool.com/pages/xtool-p3-the-flagship-80w-co2-laser-cutter?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5312", region: "global" },
    ],
  },
  {
    slug: "xtool-p2s",
    name: "xTool P2S 55W CO2 Laser Cutter",
    description:
      "The big desktop CO2 laser. 55W cuts through wood, acrylic, leather, and more. Enclosed design with built-in camera for precise positioning. The successor to the P2 I use in my workshop.",
    longDescription:
      "This is the machine I reach for when I need real cutting power. 55W CO2 laser handles thick wood and acrylic with clean edges. The enclosed design means no fumes in the workshop, and the built-in camera makes positioning dead simple. I used the P2 for the laser version of the Cone Lamp project. The P2S is the upgraded version with improved software and faster processing.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/xtool-p2s.jpg",
    buyLinks: [
      { label: "xTool EU", url: "https://www.xtool.eu/products/xtool-p2-55w-co2-laser-cutter?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5307", region: "eu" },
      { label: "xTool US", url: "https://www.xtool.com/products/xtool-p2-55w-co2-laser-cutter?ref=jfYq7B0iIf4uJl&utm_medium=affiliate&utm_source=goaffpro&utm_term=5306", region: "us" },
      { label: "xTool UK", url: "https://uk.xtool.com/products/xtool-p2-55w-co2-laser-cutter?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5312", region: "global" },
    ],
  },
  {
    slug: "xtool-pf-duo",
    name: "xTool P+F Duo",
    description:
      "The ultimate productive business duo. Combines the P2S CO2 laser cutter with the F1 Ultra engraver in one bundle for makers who want both cutting power and engraving precision.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/xtool-pf-duo.jpg",
    buyLinks: [
      { label: "xTool EU", url: "https://www.xtool.eu/products/xtool-p2-f1-ultimate-productive-business-duo?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5307", region: "eu" },
      { label: "xTool US", url: "https://www.xtool.com/products/ultimate-productive-business-duo?ref=jfYq7B0iIf4uJl&utm_medium=affiliate&utm_source=goaffpro&utm_term=5306", region: "us" },
      { label: "xTool UK", url: "https://uk.xtool.com/products/ultimate-productive-business-duo?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5312", region: "global" },
    ],
  },
  {
    slug: "xtool-f1-ultra",
    name: "xTool F1 Ultra Dual Laser Engraver",
    description:
      "Compact powerhouse with both fiber and diode lasers. Engraves on metal, wood, leather, acrylic, and more. Insanely fast and portable.",
    longDescription:
      "The F1 Ultra is the tool that surprised me most. Two lasers in one compact machine: a 20W fiber laser for metal engraving and a diode laser for wood and organic materials. It's fast, portable, and the dual-laser setup means you can engrave on basically anything. I use it for detail work and smaller projects where the P2S would be overkill.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/xtool-f1-ultra.jpg",
    buyLinks: [
      { label: "xTool EU", url: "https://www.xtool.eu/collections/machine/products/xtool-f1-ultra-20w-fiber-diode-dual-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5307", region: "eu" },
      { label: "xTool US", url: "https://www.xtool.com/products/xtool-f1-ultra-20w-fiber-diode-dual-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=affiliate&utm_source=goaffpro&utm_term=5306", region: "us" },
      { label: "xTool UK", url: "https://uk.xtool.com/products/xtool-f1-ultra-20w-fiber-diode-dual-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5312", region: "global" },
    ],
  },
  {
    slug: "xtool-f2-ultra",
    name: "xTool F2 Ultra 60W MOPA Laser Engraver",
    description:
      "The most powerful in the F series. 60W MOPA fiber laser plus 40W diode. Color marking on metal, fastest engraving speeds, massive upgrade for serious makers.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/xtool-f2-ultra.jpg",
    buyLinks: [
      { label: "xTool EU", url: "https://www.xtool.eu/collections/machine/products/xtool-f2-ultra-60w-mopa-40w-diode-dual-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5307", region: "eu" },
      { label: "xTool US", url: "https://www.xtool.com/products/xtool-f2-ultra-60w-mopa-40w-diode-dual-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=affiliate&utm_source=goaffpro&utm_term=5306", region: "us" },
      { label: "xTool UK", url: "https://uk.xtool.com/products/xtool-f2-ultra-60w-mopa-40w-diode-dual-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5312", region: "global" },
    ],
  },
  {
    slug: "xtool-f2-ultra-uv",
    name: "xTool F2 Ultra UV Laser Engraver",
    description:
      "5W UV laser engraver for ultra-fine detail work. Engraves on glass, crystal, transparent materials, and plastics that other lasers can't touch.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/xtool-f2-ultra-uv.jpg",
    buyLinks: [
      { label: "xTool EU", url: "https://www.xtool.eu/pages/xtool-f2-ultra-uv-5w-uv-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5307", region: "eu" },
      { label: "xTool US", url: "https://www.xtool.com/pages/xtool-f2-ultra-uv-5w-uv-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=affiliate&utm_source=goaffpro&utm_term=5306", region: "us" },
      { label: "xTool UK", url: "https://uk.xtool.com/pages/xtool-f2-ultra-uv-5w-uv-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5312", region: "global" },
    ],
  },
  {
    slug: "xtool-f2",
    name: "xTool F2 Portable Dual Laser Engraver",
    description:
      "5W IR + 15W diode portable dual laser engraver. Compact and versatile for on-the-go engraving on wood, metal, leather, and more.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/xtool-f2.jpg",
    buyLinks: [
      { label: "xTool EU", url: "https://www.xtool.eu/pages/xtool-f2-5w-ir-15w-diode-portable-dual-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5307", region: "eu" },
      { label: "xTool US", url: "https://www.xtool.com/pages/xtool-f2-5w-ir-15w-diode-portable-dual-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=affiliate&utm_source=goaffpro&utm_term=5306", region: "us" },
      { label: "xTool UK", url: "https://uk.xtool.com/pages/xtool-f2-5w-ir-15w-diode-portable-dual-laser-engraver?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5312", region: "global" },
    ],
  },
  {
    slug: "xtool-metalfab",
    name: "xTool MetalFab",
    description:
      "Laser welder and CNC cutter in one machine. For serious metalwork: welding, cutting, and engraving metal with industrial precision.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/xtool-metalfab.jpg",
    buyLinks: [
      { label: "xTool EU", url: "https://www.xtool.eu/pages/xtool-metalfab-laser-welder-and-cnc-cutter?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5307", region: "eu" },
      { label: "xTool US", url: "https://www.xtool.com/pages/xtool-metalfab-laser-welder-and-cnc-cutter?ref=jfYq7B0iIf4uJl&utm_medium=affiliate&utm_source=goaffpro&utm_term=5306", region: "us" },
      { label: "xTool UK", url: "https://uk.xtool.com/pages/xtool-metalfab-laser-welder-and-cnc-cutter?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5312", region: "global" },
    ],
  },
  {
    slug: "xtool-apparel-printer",
    name: "xTool Apparel Printer",
    description:
      "DTF apparel printer for custom prints on t-shirts, hoodies, bags, and more. Print your own merch or maker branding with professional quality.",
    category: "3D Printing & Laser",
    categoryIcon: "🖨️",
    image: "/images/tools/xtool-apparel-printer.jpg",
    buyLinks: [
      { label: "xTool EU", url: "https://www.xtool.eu/products/xtool-apparel-printer-a-new-era-of-apparel-printing?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5307", region: "eu" },
      { label: "xTool US", url: "https://www.xtool.com/products/xtool-apparel-printer-a-new-era-of-apparel-printing?ref=jfYq7B0iIf4uJl&utm_medium=affiliate&utm_source=goaffpro&utm_term=5306", region: "us" },
      { label: "xTool UK", url: "https://uk.xtool.com/products/xtool-apparel-printer-a-new-era-of-apparel-printing?ref=jfYq7B0iIf4uJl&utm_medium=influencer&utm_source=goaffpro&utm_term=5312", region: "global" },
    ],
  },

  // Hand Tools
  {
    slug: "northmen-guild-axes",
    name: "Northmen Guild Axes (Set of 4)",
    description:
      "Hand-forged axes in the traditional Scandinavian style. Beautiful and functional craft tools.",
    category: "Hand Tools",
    categoryIcon: "✋",
    buyLinks: [],
  },
  {
    slug: "temple-pull-saws",
    name: "Temple Tool Co Japanese Pull Saws (Set of 4)",
    description:
      "Japanese-style pull saws for precise hand cuts. Cuts on the pull stroke for better control.",
    category: "Hand Tools",
    categoryIcon: "✋",
    buyLinks: [],
  },
  {
    slug: "halder-simplex-40",
    name: "Halder Simplex 40 Mallet",
    description:
      "Soft-face mallet that won't damage your work. Essential for chisel work and assembly.",
    category: "Hand Tools",
    categoryIcon: "✋",
    buyLinks: [],
  },
  {
    slug: "irwin-jack-handsaw",
    name: "Irwin Jack Handsaw",
    description:
      "General purpose handsaw. Reliable, affordable, and gets the job done when you don't need power.",
    category: "Hand Tools",
    categoryIcon: "✋",
    buyLinks: [],
  },
  {
    slug: "clamps",
    name: "Clamps (you never have enough)",
    description:
      "Seriously. Buy more clamps. Then buy more. F-clamps, bar clamps, spring clamps — all of them.",
    category: "Hand Tools",
    categoryIcon: "✋",
    buyLinks: [],
  },
  {
    slug: "tape-measure-and-speed-square",
    name: "Tape Measure & Speed Square",
    description:
      "The two tools I check every single measurement with. Nothing fancy, just reliable.",
    category: "Hand Tools",
    categoryIcon: "✋",
    buyLinks: [],
  },

  // Workshop Essentials
  {
    slug: "tormek-t-8",
    name: "Tormek T-8",
    description:
      "Water-cooled sharpening system. Keeps chisels and plane irons razor sharp without overheating.",
    category: "Workshop Essentials",
    categoryIcon: "🔧",
    buyLinks: [],
  },
  {
    slug: "workbench",
    name: "Workbench",
    description:
      "Built my own from construction timber. Doesn't need to be pretty — needs to be solid and flat.",
    category: "Workshop Essentials",
    categoryIcon: "🔧",
    buyLinks: [],
  },

  // Gardening & Outdoors
  {
    slug: "segway-navimow-x450",
    name: "Segway Navimow X450",
    description:
      "Wire-free robotic mower that handles the lawn while I'm in the workshop. GPS navigation, no boundary wire needed. Just set the zones and let it work.",
    longDescription:
      "The Navimow X450 is a robotic lawn mower that uses RTK+GPS positioning instead of boundary wires. That means no digging up your garden to install it. Set it up with the app, define your mowing zones, and it handles the rest. Covers up to 450m2. I nicknamed mine RoboCut. It's genuinely one of those tools where you wonder how you managed without it.",
    category: "Gardening & Outdoors",
    categoryIcon: "🌿",
    image: "/images/tools/navimow/navimow-profile.jpg",
    gallery: [
      "/images/tools/navimow/navimow-side.jpg",
      "/images/tools/navimow/navimow-front.jpg",
      "/images/tools/navimow/navimow-profile.jpg",
      "/images/tools/navimow/navimow-garden.jpg",
    ],
    buyLinks: [
      { label: "Navimow Denmark", url: "https://dk.navimow.com/?ref=JESPERMAKES&utm_medium=goaffpro&utm_source=affiliate", region: "eu" },
    ],
    youtubeVideos: ["1rPkyi83qyM"],
  },

  // Office & YouTube Gear
  {
    slug: "epidemic-sound",
    name: "Epidemic Sound",
    description:
      "Where all my music comes from. Every track in every video. Cinematic scores, ambient textures, everything.",
    longDescription:
      "Music makes or breaks a video. I've used Epidemic Sound since I started the channel and it's in every single video I've made. The library is massive, the quality is consistently high, and the licensing is simple: one subscription covers everything, no copyright strikes, no claims. I spend a lot of time finding the right track for each edit. It's as much a part of the storytelling as the footage itself. If you're making videos, this is the one subscription I'd say is non-negotiable.",
    category: "Office & YouTube Gear",
    categoryIcon: "📷",
    badge: "Ambassador",
    image: "/images/tools/epidemic-sound.jpg",
    buyLinks: [
      { label: "Try Epidemic Sound", url: "https://www.epidemicsound.com/referral/45z08g", region: "global", badge: "Affiliate" },
    ],
    youtubeVideos: [],
  },
  {
    slug: "camera-and-lenses",
    name: "Camera & Lenses",
    description:
      "Details coming soon — I'll add the full filming setup here.",
    category: "Office & YouTube Gear",
    categoryIcon: "📷",
    buyLinks: [],
  },
];

export type Category = {
  title: string;
  slug: string;
  icon: string;
  description: string;
};

export const categories: Category[] = [
  {
    title: "Festool",
    slug: "festool",
    icon: "⚡",
    description: "My go-to power tools. Festool ambassador since 2024.",
  },
  {
    title: "Power Tools",
    slug: "power-tools",
    icon: "🔨",
    description: "Other power tools I use and recommend.",
  },
  {
    title: "Hand Tools",
    slug: "hand-tools",
    icon: "✋",
    description: "The hand tools that never need charging.",
  },
  {
    title: "Finishing",
    slug: "finishing",
    icon: "🎨",
    description:
      "What I use to protect and bring out the beauty of the wood.",
  },
  {
    title: "3D Printing & Laser",
    slug: "3d-printing-laser",
    icon: "🖨️",
    description: "My digital fabrication tools for the more creative builds.",
  },
  {
    title: "Workshop Essentials",
    slug: "workshop-essentials",
    icon: "🔧",
    description: "The unglamorous stuff that makes everything else work.",
  },
  {
    title: "Office & YouTube Gear",
    slug: "office-youtube",
    icon: "📷",
    description: "What I use to film and edit the videos.",
  },
  {
    title: "Gardening & Outdoors",
    slug: "gardening-outdoors",
    icon: "🌿",
    description: "Tools and gear for the garden and outdoor projects.",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((t) => t.category === category);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryByTitle(title: string): Category | undefined {
  return categories.find((c) => c.title === title);
}
