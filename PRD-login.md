# PRD: Customer Login System

## Problem

Customers buy digital products and receive download links via email. If they lose the email, they lose access. There's no account, no order history, no way to re-download. It also means every product delivery depends on Resend email delivery working perfectly.

## Goal

Add a simple login system so customers can:
1. Sign in and see their purchases
2. Re-download any product they've bought
3. See order history

Secondary benefits:
- Download links become protected (no more public URLs anyone can share)
- Foundation for future features (saved preferences, wishlists, member-only content)
- Stripe customers get linked to site accounts automatically

## Approach: Magic Link (Passwordless Email)

No passwords. Customer enters their email, gets a sign-in link, clicks it, they're in. This is the right fit because:
- Jesper's audience skews older/practical. Fewer passwords = fewer support emails.
- We already have their email from Stripe checkout.
- Simple to implement with Auth.js (NextAuth v5).
- No password reset flows, no bcrypt, no security headaches.

## Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Auth library | Auth.js v5 (next-auth@beta) | Standard for Next.js, handles sessions/JWT |
| Auth method | Email magic link | Passwordless, simple |
| Email provider | Resend (existing) | Already set up, already sending purchase emails |
| Database | Vercel Postgres (free tier) | Need to store users + link to Stripe customers |
| ORM | Drizzle | Lightweight, type-safe, works great with Vercel Postgres |

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| email | text | Unique, from magic link or Stripe |
| name | text | Nullable, from Stripe customer_details |
| stripe_customer_id | text | Nullable, linked after first purchase |
| created_at | timestamp | |
| updated_at | timestamp | |

### purchases
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| sku | text | Product identifier (matches checkout route) |
| stripe_session_id | text | For reference/support |
| purchased_at | timestamp | |

### Auth.js tables
Auth.js needs: `accounts`, `sessions`, `verification_tokens` (managed by the adapter).

## Pages & Routes

### New pages
- `/login` - Email input form, "Send magic link" button
- `/account` - Protected. Shows purchases with download buttons, order history
- `/account/downloads/[sku]` - Protected API route that serves the file (replaces public /downloads/ URLs)

### Modified pages
- `layout.tsx` - Add "Sign in" / avatar to header nav
- `/thank-you` - Add "Create account to access your purchases anytime" prompt
- Stripe webhook - Create/link user + record purchase on checkout.session.completed

### API routes
- `/api/auth/[...nextauth]` - Auth.js handler
- `/api/downloads/[sku]` - Protected file download (checks user owns the product)

## User Flows

### New customer (no account)
1. Buys product via Stripe Checkout
2. Receives email with download link (unchanged)
3. Thank-you page now shows: "Sign in to save this purchase to your account"
4. If they sign in (magic link to same email), account is created and purchase auto-linked

### Returning customer (has account)
1. Clicks "Sign in" in header
2. Enters email, receives magic link
3. Clicks link, lands on /account
4. Sees all past purchases with download buttons

### Repeat purchase
1. Already signed in, buys another product
2. Stripe webhook links purchase to existing user (by email match)
3. Product appears in /account immediately

## Download Protection

Current: `/downloads/workshop-wall-charts.pdf` is a public static file.

New: Files move to a non-public location. Downloads go through `/api/downloads/[sku]` which:
1. Checks auth session
2. Checks user has purchased that SKU
3. Streams the file with proper headers
4. Returns 401/403 if not authorized

Existing email download links keep working for 90 days (grace period), then redirect to /login.

## Header Changes

Current nav: Shop | Tools & Links | About | Contact

New nav: Shop | Tools & Links | About | Contact | [Sign in] or [Avatar/Account]

Keep it minimal. Just a text link "Sign in" that becomes the user's first name or a small avatar circle when logged in.

## Implementation Order

### Phase 1: Auth foundation
- [ ] Set up Vercel Postgres database
- [ ] Install Auth.js + Drizzle
- [ ] Create database schema + migrations
- [ ] `/api/auth/[...nextauth]` route with Email provider (Resend)
- [ ] `/login` page with email form
- [ ] Session provider in layout
- [ ] "Sign in" link in header (conditionally shows account link when logged in)

### Phase 2: Account page + purchase linking
- [ ] `/account` page showing user info + purchases
- [ ] Update Stripe webhook to create user + record purchase
- [ ] Backfill: script to import existing Stripe customers as users + purchases
- [ ] Thank-you page update with account prompt

### Phase 3: Protected downloads
- [ ] Move product files to non-public directory
- [ ] `/api/downloads/[sku]` protected download route
- [ ] Update email templates to link to /account instead of direct download
- [ ] Grace period redirect for old direct links

## What This Does NOT Include (yet)
- Social login (Google, GitHub) - can add later if needed
- Password auth - magic links only
- Admin panel - manage through Stripe dashboard
- Subscription/membership tiers - just purchase-based access for now

## Dependencies
- Vercel Postgres provisioned (free tier: 256MB, plenty for this)
- `POSTGRES_URL` env var on Vercel
- Auth.js secret (`AUTH_SECRET` env var)
- Resend API key already exists

## Design Notes
- Match existing site aesthetic (dark wood tones, amber accents, serif headings)
- Login page should be dead simple: one input, one button
- Account page: clean list of purchases with big download buttons
- No unnecessary UI complexity
