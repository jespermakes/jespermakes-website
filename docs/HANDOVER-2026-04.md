# jespermakes.com — Technical Handover from Floki (Deployment Agent)

This document is for Claude's Web Dev project folder. It covers everything about how the website is built, deployed, and maintained. Written by Floki, the deployment agent who built and ships everything to production.

---

## 1. Architecture Overview

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14.2 (App Router) | Pages in `src/app/`, not `/pages` |
| Language | TypeScript 5 | Strict mode enabled |
| Styling | Tailwind CSS 3.4 | Custom theme, no other CSS frameworks |
| Database | Vercel Postgres (Neon) | Accessed via `@vercel/postgres` + Drizzle ORM |
| Auth | NextAuth v5 (beta 30) | Credentials provider, JWT sessions |
| Payments | Stripe | Live mode, webhook at `/api/webhook/stripe` |
| Email | Resend | Newsletter + transactional (order confirmations) |
| AI | OpenRouter → Claude Sonnet 4 | Title Lab + Storyteller Engine |
| YouTube | YouTube Data API v3 | Video metadata, channel stats |
| Analytics | Vercel Analytics | Built-in |
| Hosting | Vercel | Deployed via CLI: `vercel --prod --yes --token=$VERCEL_TOKEN` |
| Domain | jespermakes.com | DNS on Cloudflare, pointing to Vercel |
| Repo | GitHub: `jespermakes/jespermakes-website` | Main branch = production |

---

## 2. Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── layout.tsx          # Root layout (nav, footer, fonts, SessionProvider)
│   ├── page.tsx            # Homepage
│   ├── blog/               # Blog listing + [slug] pages
│   ├── shop/               # Product pages (pallet kit, wall charts, tee, lamps)
│   ├── tools/              # Tool recommendations + [slug] + category/[categorySlug]
│   ├── title-lab/          # AI title tool (5 tabs)
│   ├── storyteller/        # AI storytelling tool (4 tabs)
│   ├── admin/title-lab/    # Private usage dashboard
│   ├── account/            # User account page
│   ├── login/signup/       # Auth pages
│   ├── about/contact/      # Static pages
│   ├── mediakit/press-kit/ # Brand pages
│   ├── dashboard/          # Internal ops dashboard (logs, revenue)
│   └── api/                # API routes (see section below)
├── components/
│   ├── home/               # Homepage sections (hero, about, blog, tools, youtube)
│   ├── mobile-nav.tsx      # Mobile hamburger menu
│   ├── site-json-ld.tsx    # Structured data
│   └── product-json-ld.tsx # Product structured data
├── data/
│   ├── blog-posts.ts       # All blog content (markdown in template literals)
│   ├── tools.ts            # Tool/product recommendations (82+ items)
│   └── storyteller-data.ts # Story cards, arc shapes, creator profiles
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── db/
│   │   ├── index.ts        # Drizzle instance (import { db } from "@/lib/db")
│   │   └── schema.ts       # All database tables
│   ├── youtube.ts           # YouTube API helpers
│   ├── title-lab-track.ts   # Usage tracking for Title Lab
│   └── storyteller-export.ts # Export helpers (text, markdown, PDF)
└── ...
```

---

## 3. Design System (Tailwind Tokens)

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `cream` | #FAF7F2 | Page background |
| `wood` | #2C1810 | Primary text, headings, buttons |
| `wood-light` | #4A3228 | Secondary text, muted content |
| `amber` | #C17F3C | Accent, links, highlights, CTAs |
| `amber-dark` | #A66B2E | Hover states |
| `amber-light` | #D4993F | Light accent |

### Fonts
- **Headings:** Playfair Display (`font-serif`) — loaded via `next/font/google`
- **Body:** Inter (`font-sans`) — loaded via `next/font/google`
- Both use CSS variables (`--font-playfair`, `--font-inter`)

### Common Patterns
- Max content width: `max-w-5xl mx-auto px-6` (standard pages), `max-w-4xl` (tools)
- Cards: `bg-white/50 border border-wood/[0.06] rounded-2xl p-5`
- Section labels: `text-[10px] font-bold tracking-[2px] text-wood-light/[0.2]`
- Buttons: `bg-wood text-cream rounded-xl text-sm font-semibold`
- Accent buttons: `bg-amber/10 border border-amber/20 text-amber`

### Design Philosophy
Warm, minimal, craft workshop feel. Not tech startup. Not corporate. The site should feel like walking into Jesper's workshop — wood tones, natural light, honest materials.

---

## 4. Database Schema

All tables defined in `src/lib/db/schema.ts`. Access via `import { db } from "@/lib/db"`.

| Table | Purpose |
|-------|---------|
| `users` | User accounts (email, password hash, Stripe ID, newsletter, guild tier) |
| `accounts` | NextAuth OAuth accounts (not used currently, credentials only) |
| `sessions` | NextAuth sessions (JWT mode, so rarely used) |
| `verificationTokens` | NextAuth email verification |
| `purchases` | Digital product purchases (SKU, amount, Stripe session) |
| `downloads` | Download tracking per user per product |
| `passwordResetTokens` | Password reset flow |
| `dailyLogs` | Internal ops logs |
| `titleLabEvents` | Usage tracking for Title Lab (event type, inputs, AI response, country) |
| `titleLabSessions` | User-saved Title Lab analyses |

### Migration Workflow
```bash
# After editing schema.ts:
npx drizzle-kit generate   # Creates SQL migration file in /drizzle
npx drizzle-kit push       # Pushes schema changes to Vercel Postgres
```

**Important:** `drizzle-kit push` needs `POSTGRES_URL` env var. When pulling from Vercel (`vercel env pull .env.local`), the URL has quotes around it that break Neon's parser. Strip them:
```bash
POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
export POSTGRES_URL
npx drizzle-kit push
```

---

## 5. Authentication

- **Provider:** Credentials (email + bcrypt password)
- **Session strategy:** JWT (not database sessions)
- **Pages:** `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/account`
- **Check auth in API routes:**
```typescript
import { auth } from "@/lib/auth";
const session = await auth();
if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```
- **Check auth in client components:** `useSession()` from `next-auth/react`
- **Admin check:** Compare `session.user.email` to `process.env.ADMIN_EMAIL`

---

## 6. API Routes

### Auth
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/auth/signup` | POST | Create account |
| `/api/auth/forgot-password` | POST | Send reset email via Resend |
| `/api/auth/reset-password` | POST | Set new password with token |
| `/api/auth/change-password` | POST | Authenticated password change |

### Shop
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/webhook/stripe` | POST | Stripe webhook (purchase fulfillment) |
| `/api/downloads/[sku]` | GET | Serve protected download files |

### Title Lab
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/title-lab/url-analyze` | POST | Analyze YouTube URL, generate titles |
| `/api/title-lab/guided-brainstorm` | POST | Generate titles from project description |
| `/api/title-lab/stats` | GET | Channel stats + pattern analysis (1h cache) |
| `/api/title-lab/cases` | GET | All channel videos sorted by views (1h cache) |
| `/api/title-lab/sessions` | GET/POST | List/save user title sessions |
| `/api/title-lab/sessions/[id]` | GET/PATCH/DELETE | Single session CRUD |
| `/api/title-lab/admin/dashboard` | GET | Admin usage dashboard data |

### Storyteller
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/storyteller/find-story` | POST | Conversational AI story excavation |

### Other
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/newsletter/subscribe` | POST | Newsletter signup |
| `/api/newsletter/toggle` | POST | Toggle newsletter preference |
| `/api/logs` | GET/POST | Internal ops log management |

---

## 7. AI Integration (Critical Details)

### Provider: OpenRouter
All AI features route through **OpenRouter**, not direct Anthropic API calls.

**Why not direct Anthropic?** The deployment agent (Floki) uses an OAuth agent key (`sk-ant-oat...`) that doesn't work with direct `api.anthropic.com` calls. OpenRouter works with a standard API key and routes to the same models.

### Model: `anthropic/claude-sonnet-4`
- OpenRouter model ID format: `anthropic/claude-sonnet-4` (NOT `anthropic/claude-sonnet-4-20250514`)
- Used for: Title Lab URL analysis, Title Lab brainstorming, Storyteller Engine

### API Pattern
```typescript
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": "https://jespermakes.com",
    "X-Title": "Jesper Makes <Tool Name>",
  },
  body: JSON.stringify({
    model: "anthropic/claude-sonnet-4",
    max_tokens: 2000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  }),
});

const data = await response.json();
const text = data.choices?.[0]?.message?.content || "";
```

**Response format:** OpenRouter uses OpenAI-compatible format (`data.choices[0].message.content`), NOT Anthropic format (`data.content[0].text`).

### JSON Parsing Pattern
AI responses should request JSON only. Parse with fallback:
```typescript
const clean = text.replace(/```json\s?|```/g, "").trim();
const jsonMatch = clean.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error("No JSON found");
const result = JSON.parse(jsonMatch[0]);
```

### YouTube Data API
- Key: `YOUTUBE_API_KEY` (in Vercel env)
- Channel ID: `UCqEcM-ZrWoC7AgGDoxi2X-w`
- Used for: video metadata in Title Lab, channel stats in My Real Data tab
- **Note:** Transcript scraping libraries (like `youtube-transcript-plus`) fail on Vercel because YouTube blocks datacenter IPs. Don't use them. Use the description + tags instead.

---

## 8. Content Architecture

### Blog Posts (`src/data/blog-posts.ts`)
Blog content lives in TypeScript, not MDX files. Each post is an object with markdown in template literals:
```typescript
{
  slug: "how-to-build-with-pallet-wood",
  title: "How to Build with Pallet Wood",
  description: "...",
  content: `## Why Pallet Wood?\n\nI started...`,
  publishedAt: "2025-03-10",
  updatedAt: "2026-04-11",
  author: "Jesper",
  tags: ["pallet wood", "beginner"],
  heroImage: "/images/blog/pallet-wood-guide-hero.jpg",
  heroImageAlt: "...",
  featuredVideo: "jOXvrHeSLzs",  // YouTube video ID
}
```

**Important behavior:** When a blog post has both `heroImage` and `featuredVideo`, the post page shows ONLY the video (not both). The `heroImage` still shows on the blog listing page as the card thumbnail.

### Tools (`src/data/tools.ts`)
82+ tool recommendations with affiliate links, ambassador badges, categories, and buy links.

### Storyteller Data (`src/data/storyteller-data.ts`)
18 story cards, 5 arc shapes (with SVG curve data), 4 creator profiles.

---

## 9. Environment Variables (Vercel Production)

| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | AI model access (Claude Sonnet via OpenRouter) |
| `YOUTUBE_API_KEY` | YouTube Data API v3 |
| `YOUTUBE_CHANNEL_ID` | Jesper Makes channel: `UCqEcM-ZrWoC7AgGDoxi2X-w` |
| `ADMIN_EMAIL` | Admin dashboard access: `hello@jespermakes.com` |
| `ANTHROPIC_API_KEY` | Not currently used (was for direct API, now OpenRouter) |
| `STRIPE_SECRET_KEY` | Stripe live key (DGX account) |
| `STRIPE_DGX_SECRET_KEY` | Stripe DGX-specific key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `RESEND_API_KEY` | Email sending (newsletter, transactional) |
| `AUTH_SECRET` | NextAuth JWT secret |
| `POSTGRES_URL` | Vercel Postgres connection (Neon) |
| `LOG_API_SECRET` | Internal logging API auth |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth (configured but not active) |
| `PRINTFUL_API_KEY` | Merch fulfillment |

---

## 10. Deployment

### Standard Deploy
```bash
cd ~/jesper-makes-ai/website
source ~/.openclaw/workspace/.env
vercel --prod --yes --token=$VERCEL_TOKEN
```

### Git Workflow
- `main` branch = production. Push to main, then deploy.
- Feature branches: `floki/<description>` for previews.
- Vercel auto-deploys on push to main via GitHub integration, but Floki also deploys manually via CLI for immediate control.

### Build Requirements
- TypeScript must compile clean: `npx tsc --noEmit`
- ESLint must pass (part of `next build`)
- Common ESLint issues: unescaped apostrophes in JSX text (use `&apos;`), unused imports

### Vercel Project
- Project: `floki-dgx-spark/jespermakes-website`
- Linked domain: `jespermakes.com`
- Region: Washington, D.C. (iad1)

---

## 11. Gotchas and Lessons Learned

1. **OpenRouter model IDs** don't match Anthropic's model IDs. Use `anthropic/claude-sonnet-4`, not `anthropic/claude-sonnet-4-20250514`.

2. **YouTube transcript scraping** fails on Vercel. Libraries like `youtube-transcript-plus` work locally but YouTube blocks Vercel's datacenter IPs. Use the video description instead.

3. **Vercel env var quotes.** When pulling env vars with `vercel env pull`, values get wrapped in quotes. The Neon Postgres URL parser chokes on quoted URLs. Strip quotes before using with drizzle-kit.

4. **ESLint apostrophes.** Any `'` character in JSX text content (not JS strings) must be `&apos;`. This catches people every time.

5. **`heroImage` + `featuredVideo`:** The blog post page skips the hero image when a featured video exists (to avoid duplicate visual at the top). The listing page still uses the hero image for the card thumbnail.

6. **Blog content is TypeScript, not files.** All blog posts live in `src/data/blog-posts.ts` as template literal markdown. This was a deliberate choice for simplicity but will need migration to MDX or a CMS if the blog grows past ~30 posts.

7. **Stripe has two accounts.** There's a legacy Beacons account and the current DGX account. The DGX account (`STRIPE_DGX_SECRET_KEY`) is the active one.

8. **html2pdf.js** is dynamically imported only when users click the PDF download button. Keeps the main bundle small.

9. **AI response parsing** should always use regex extraction (`text.match(/\{[\s\S]*\}/)`) rather than direct `JSON.parse`, because models sometimes wrap JSON in markdown fences or add preamble text.

---

## 12. What's Built and Working

| Feature | Status | Path |
|---------|--------|------|
| Homepage | ✅ Live | `/` |
| Blog (17 posts) | ✅ Live | `/blog` |
| Shop (5 products) | ✅ Live | `/shop` |
| Tools hub (82+ items) | ✅ Live | `/tools` |
| Title Lab (5 tabs) | ✅ Live | `/title-lab` |
| Storyteller Engine (4 tabs) | ✅ Live | `/storyteller` |
| User accounts | ✅ Live | `/login`, `/signup`, `/account` |
| Digital product delivery | ✅ Live | Stripe → webhook → download |
| Newsletter (Resend) | ✅ Live | 3,372 subscribers |
| Media kit | ✅ Live | `/mediakit` |
| Press kit | ✅ Live | `/press-kit` |
| Admin dashboard | ✅ Live | `/admin/title-lab` |
| SEO (sitemap, JSON-LD) | ✅ Live | Auto-generated |

---

## 13. Future Expansion Opportunities

### Easy Wins (no new infrastructure)
- **More Creator Tools:** The nav dropdown and routing pattern is established. New tools = new `src/app/<tool>/page.tsx` + optional API route. Follow Title Lab or Storyteller as template.
- **Saved Storyteller sessions:** Same pattern as Title Lab saved sessions. Schema + CRUD route + "My Stories" tab.
- **Newsletter checkbox on signup:** Schema field `newsletterSubscribed` already exists on users table. Just add the checkbox to the signup form.
- **More blog posts:** Add to `src/data/blog-posts.ts`. Consider migrating to MDX if volume grows.
- **Tool page improvements:** Each tool has a dedicated page. Could add user reviews, comparison tables, "frequently bought together" sections.

### Medium Effort (some new infrastructure)
- **YouTube Analytics API:** Replace the hardcoded `avgCtr: 6.5` in stats route with real CTR data. Requires OAuth consent screen and YouTube Analytics API scope.
- **Social login:** NextAuth supports Google, GitHub, etc. `GOOGLE_CLIENT_ID/SECRET` already in env. Just needs the provider config added to `auth.ts` and a button on the login page.
- **Rate limiting:** The AI endpoints have no rate limiting. Add `@upstash/ratelimit` or similar before someone discovers the tool and hammers the API.
- **Caching AI responses:** Cache Title Lab results by video ID. Same URL = same analysis. Would save OpenRouter costs.
- **Image optimization:** Blog hero images are `<img>` tags, not Next.js `<Image>`. Migration to `next/image` would improve performance.

### Bigger Moves
- **CMS for blog:** Move blog content from TypeScript to a headless CMS (Sanity, Contentful) or MDX files. Current approach doesn't scale past ~30 posts without the data file becoming unwieldy.
- **Course/membership platform:** The `guildTier` field already exists on the users table. Could build tiered access to premium tools, courses, or community features.
- **Multi-language:** Jesper's audience is global. i18n support would expand reach. Next.js has built-in i18n routing.
- **Video editing tools:** Thumbnail generator (using Canvas API or Sharp), description template builder, tag optimizer.
- **API for third parties:** Expose Title Lab and Storyteller as public APIs with API key auth and usage limits. Monetization opportunity.

### Model Options
- Currently using Claude Sonnet 4 via OpenRouter. Could also route to:
  - `anthropic/claude-opus-4` for higher quality (more expensive)
  - `google/gemini-2.5-pro` for variety
  - `openai/gpt-4o` as fallback
  - A fine-tuned model trained on Jesper's specific title patterns and voice
- OpenRouter makes model switching trivial — just change the `MODEL` constant.

---

## 14. Code Conventions

- **No em dashes** in any user-facing text (Jesper hates them)
- **Short, natural copy.** No corporate language. No academic wording.
- Use `&apos;` not `'` in JSX text content
- Tailwind only — no inline styles, no CSS modules
- Use the design tokens — never hardcode hex colors
- `"use client"` only on pages/components that need interactivity
- API routes use Next.js App Router format: `export async function POST(request: NextRequest)`
- Fire-and-forget tracking: `trackEvent({...}).catch(() => {})` — never await, never block

---

*Written by Floki — deployment agent for Jesper Makes. April 12, 2026.*
