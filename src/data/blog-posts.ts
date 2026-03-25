export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  heroImage?: string;
  heroImageAlt?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-build-with-pallet-wood",
    title: "How to Build with Pallet Wood: A Complete Beginner's Guide",
    description:
      "Everything you need to know to start building with pallet wood — where to find pallets, what to look for, tools you need, and first project ideas.",
    publishedAt: "2025-03-10",
    author: "Jesper",
    tags: ["pallet wood", "beginner", "woodworking", "guide"],
    content: `## Why Pallet Wood?

I started woodworking with pallet wood in 2020. No fancy tools, no expensive lumber — just a pile of pallets someone left outside a warehouse and a borrowed circular saw. That was it.

Pallet wood is rough, unpredictable, and sometimes full of nails. It's also free, widely available, and genuinely fun to work with. If you're just getting started, there's no better way to learn without putting real money on the line.

This guide covers everything I wish I'd known at the start.

---

## Finding Pallets

The easiest place to find free pallets is behind shops, warehouses, and industrial estates. Garden centres, furniture stores, and builders merchants all receive stock on pallets and often can't get rid of them fast enough.

Just ask. Walk in, explain you're a hobbyist woodworker, and most places will be happy to let you take them. Some will even hold them for you.

**What to look for:**

- **HT stamped pallets** — this means "heat treated". Safe for indoor use. The stamp is usually on the side of the pallet.
- **MB stamped pallets** — avoid these. MB stands for methyl bromide, a toxic fumigant. It's now banned in most countries but older pallets can still turn up.
- **DB** — debarked. Fine.
- **No stamp** — usually fine for outdoor projects, but avoid using indoors around food or where kids will be.

Avoid any pallet that looks like it's been soaked in chemicals or has an unusual stain or smell. Common sense goes a long way.

---

## What Species Are You Getting?

Usually pine. Sometimes spruce or fir. Occasionally hardwood, but that's rare.

The good news: pine is a perfectly decent wood for furniture and home projects. It dents easily, but it's light, takes paint and stain well, and has a nice grain when you clean it up.

Don't expect consistency. The boards will vary in thickness, width, and quality — sometimes on the same pallet. That's part of working with free material.

---

## Tools You'll Need

You don't need much to start:

**Disassembly:**
- Pry bar or flat bar (essential — don't try to use a screwdriver)
- Hammer
- Nail punch or nail puller for the hidden nails

**Preparation:**
- Circular saw or jigsaw to cut boards to length
- Hand plane or belt sander to clean up faces (a lot of pallet wood has rough surfaces and mill marks)
- Planer-thicknesser if you want flat, consistent boards — not essential to start

**Basic joinery:**
- Drill and screws
- Pocket hole jig (cheap ones work fine for pallet projects)
- Clamps — always more clamps than you think

I've put together a full list of recommended tools for beginners over at the [tools hub](/tools) — everything from budget picks to what I actually use in my own workshop.

---

## Disassembling Pallets Without Destroying Everything

This is where most beginners lose half their wood. The boards split, the nails tear through, and you end up with short, cracked pieces.

A few things that help:

1. **Work from the end** — use your pry bar at the very end of a board and lever against the stringer (the thick central piece). Don't try to prise in the middle.
2. **Go slow** — a little bit from each end, working along the board rather than forcing one end all the way up.
3. **Use a reciprocating saw** — many experienced makers just cut the nails instead of pulling boards. You lose a centimetre or two off the end, but the boards come off in one piece.
4. **Keep the off-cuts** — even short pieces and broken boards have uses. Nothing goes in the bin.

---

## Preparing the Wood

Pallet wood is rough. Before you build anything, you need to:

1. **Pull all the nails** — every single one. Run a magnet over the boards to find the hidden ones. Your planer will thank you.
2. **Let it dry** — if the pallets were stored outside, the wood may be damp. Stack them with sticks between each layer (called stickering) and let them sit for a few weeks.
3. **Flatten and thickness** — if you have a planer, run each board through to get a consistent thickness. If not, a belt sander with 60 or 80 grit will clean up the face enough for most projects.
4. **Joint an edge** — for anything that needs to look good, run one edge through a jointer or use a hand plane to get a straight reference edge.

You won't get furniture-grade lumber. But you can get clean, flat boards that look genuinely good once they're finished.

---

## Safety

A few things worth saying:

- **Eye and ear protection, always.** Even when it feels unnecessary.
- **Watch for nails.** A hidden nail in a circular saw is dangerous. Slow down.
- **Wear gloves when disassembling.** Pallet wood splinters badly.
- **Don't use MB pallets indoors.** Not worth the risk.
- **Dust mask when sanding.** Pine dust is irritating even if it's not toxic.

---

## First Project Ideas

Start simple. Seriously.

**A small shelf** — three boards, two brackets (cut from pallet stringers), screws. Done in an afternoon. You'll learn how to measure, cut, sand, and finish. Everything after that is just more of the same.

**A garden planter** — pallet wood is perfect here. You can use the rougher boards, it doesn't need to be perfect, and the weathered look suits outdoor projects.

**A serving tray** — flat boards, a couple of handles, some finish. This one punches above its weight visually and makes a great gift.

**A wall-mounted coat rack** — back panel from pallet boards, some hooks, done. You'll learn how to hang something properly and deal with walls.

---

## Taking It Further

Once you've done a few small projects, you start to see what pallet wood can actually do. I've built full workshop benches, storage units, and display shelves from pallets. The material has real character — especially once you've sanded it back and added a natural oil finish.

If you want to get serious about pallet builds, I put together [The Pallet Builder's Starter Kit](/shop/pallet-starter-kit) — a set of printable plans and reference sheets designed specifically for working with reclaimed pallet wood. Cut lists, joinery details, beginner-friendly dimensions. Everything I wished I'd had when I started.

And if you want to follow along with actual builds, I document most of my projects on [YouTube at @jespermakes](https://youtube.com/@jespermakes) — you can see the process, the mistakes, and what actually works.

---

Pallet wood taught me more in six months than I'd have learned buying expensive timber and trying to do everything right. The low stakes mean you actually build things instead of overthinking them.

Get a few pallets. Make something. You'll figure it out as you go.
`,
  },
  {
    slug: "best-wood-for-beginners",
    title: "Best Wood for Beginners: What to Buy (and What to Avoid)",
    description:
      "A practical guide to choosing your first wood — common species explained, where to buy, what to avoid, and how to not waste money.",
    publishedAt: "2025-03-17",
    author: "Jesper",
    tags: ["wood", "beginner", "woodworking", "guide"],
    content: `## The Problem with "Just Start with Pine"

Every beginner guide says the same thing: start with pine, it's cheap, it's easy. And that's mostly right. But "pine" covers a huge range of wood quality, and buying the wrong stuff from the wrong place will make your first projects harder than they need to be.

This guide cuts through the noise. Here's what's actually worth buying, what to avoid, and where to get it.

---

## The Species Worth Knowing About

### Pine (Scots pine, Radiata pine)

**Good for:** Furniture, shelving, boxes, practice joints
**Cost:** Low
**Where to buy:** Every builder's merchant, most DIY stores

Pine is soft, workable, and widely available. It takes screws well, accepts stain and paint, and is forgiving when you make mistakes. The main downside is that it dents easily — drop a mallet on it and you'll leave a mark.

Go to a builder's merchant rather than a big DIY chain if you can. The timber is usually better dried and more consistent. Look for boards that are straight-grained and free of large knots.

Avoid anything that feels heavy and damp — green (undried) pine will warp as it dries in your workshop.

### Poplar

**Good for:** Painted projects, jigs, drawer boxes
**Cost:** Low to medium
**Where to buy:** Specialist timber merchants, some DIY stores

Poplar is underrated. It's harder than pine, mills cleanly, and takes paint beautifully. The grain is a bit bland, so it's not ideal for natural finishes, but for anything that's getting painted it's excellent.

Good choice if you're building furniture with painted faces.

### Oak

**Good for:** Furniture, joinery, anything you want to last
**Cost:** Medium to high
**Where to buy:** Specialist timber merchants

Oak is the classic furniture hardwood. Heavy, strong, and with a grain that looks great with almost any finish. The main barrier is cost — good oak is several times the price of pine.

Don't start here. When you're learning, you're making mistakes, and making mistakes in expensive wood is demoralising. Learn the basics first, then step up to oak when you know what you're doing.

When you do buy it, buy from a proper hardwood merchant. The oak at big DIY chains is often low quality and poorly dried.

### Beech

**Good for:** Workbenches, tool handles, shop furniture
**Cost:** Medium
**Where to buy:** Specialist timber merchants

Beech is dense, stable, and very strong. It's the standard choice for workbench tops because it can take a beating. Not the most exciting grain, but a very capable wood.

### MDF and Plywood

Not solid wood, but worth mentioning. MDF is flat, stable, and cheap — good for painted panels and jigs. Plywood (especially birch ply) is strong, stable, and works beautifully for furniture, shelving, and boxes.

For your first projects, a sheet of birch ply will often give you better results than solid wood — it won't warp, the edges are clean, and it's dimensionally consistent.

---

## What to Avoid as a Beginner

### Exotic Hardwoods

Walnut, teak, padauk, purpleheart — stunning woods, but expensive and often difficult to work. Some are oily and don't glue well. Some need carbide tools or they'll dull your blades. Save these for when you're confident.

### Poorly Dried Timber

This is the single biggest source of beginner problems. Wood that isn't properly dried will move — warp, cup, twist — after you've cut and joined it. A beautiful piece of furniture can become a mess in weeks if the wood wasn't dry when you bought it.

Buy from places that store timber properly (indoors, stickered). Ask about moisture content if you're unsure. Aim for around 8–12% for indoor furniture.

### Very Cheap Pine from Large DIY Chains

Not always bad, but often inconsistent. Knots, twist, and green timber show up regularly. If you're buying from a chain, take your time picking through the rack — pull boards out, sight down the length, reject anything with a bow or twist.

### Wide Single Boards for Large Panels

A 300mm-wide single board is more likely to cup than two 150mm boards glued together. For table tops, cabinet sides, and similar large panels, gluing up narrower boards gives a more stable result.

---

## Where to Buy

**Builder's merchants** — best for construction timber (pine, spruce) in standard sizes. Usually better quality and better dried than DIY chains.

**Specialist hardwood merchants** — for oak, ash, beech, walnut, and anything else. Often sell by the cubic metre or board foot. Many will dimension to length for you.

**Online hardwood suppliers** — increasingly good, especially if you don't have a local merchant. Can be more expensive but gives you access to species and sizes you won't find locally.

**Reclaimed and salvage** — old floorboards, scaffold boards, beam sections. Fully dried, full of character, often cheap. Needs more prep but can be spectacular.

---

## A Note on Finishing

The wood you choose matters less than how you prepare and finish it. A piece of well-sanded, properly finished pine looks better than a piece of poorly prepared oak.

Sand progressively — 80, 120, 180, sometimes 240. Remove all machine marks. Then choose your finish based on the project:

- **Hard wax oil** (Rubio Monocoat, Osmo) — natural look, easy to apply, repairable
- **Danish oil** — simple, penetrating, good for first projects
- **Paint** — hides a lot, great for pine and poplar
- **Varnish/lacquer** — more durable but harder to apply well

I've put together reference sheets covering wood species, finish types, and tool selection in the [Workshop Wall Charts](/shop/workshop-wall-charts) — printable cheat sheets that live on the workshop wall so you don't have to remember everything.

---

## The Short Answer

**Start with pine or poplar.** Buy from a builder's merchant, not a big DIY chain. Look for straight grain, no large knots, and make sure it feels dry. Build a few things. Make mistakes. Then move up to hardwoods when you know what you're doing.

The tool choices matter too — check out the [tools hub](/tools) for recommendations on what to buy at each stage.

The most expensive wood in your workshop should be what's on your bench, not what's in the bin.
`,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
