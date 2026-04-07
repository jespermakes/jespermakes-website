# PRD: Authentication & Guild Membership System

## Overview
Replace the current magic-link purchase-access system with a proper account system that supports purchases, downloads, newsletter, and future Guild membership.

## Current Problems
- Magic link login creates separate sessions per purchase
- No persistent accounts
- Same person buying twice with different emails = two accounts
- No profile, no download history, no identity
- Not ready for Guild membership

## What We're Building

### Phase 1: Proper Auth (build now)
- Email + password registration and login
- Google OAuth (one-click sign up)
- Persistent user account in Vercel Postgres (already have the DB)
- Profile page showing: name, email, member since date
- All Stripe purchases linked to account via email
- Download history with re-download capability
- Newsletter subscription status (toggle on/off via Resend API)
- Session management (stay logged in, logout)

### Phase 2: Guild Foundation (build now, launch later)
- Guild membership model in the database (tier: free/apprentice/journeyman/master)
- Membership status on profile page (shows "Coming soon" for now)
- Database schema ready for: projects completed, skills unlocked, community interactions
- Stripe subscription product for Guild membership (not activated yet)

### Phase 3: Guild Launch (future, NOT this build)
- Project system (assigned projects per tier)
- Progress tracking
- Community features
- AI-powered recommendations
- Physical event integration

## Technical Requirements

### Auth Provider
Replace Auth.js magic link with **NextAuth.js v5** (Auth.js) using:
- Credentials provider (email + password with bcrypt)
- Google OAuth provider
- Session strategy: JWT (stateless, fast)

### Database Schema (Vercel Postgres)
```sql
-- Users table (replace or extend existing)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT, -- null for OAuth users
  avatar_url TEXT,
  provider TEXT DEFAULT 'credentials', -- 'credentials' | 'google'
  stripe_customer_id TEXT,
  newsletter_subscribed BOOLEAN DEFAULT false,
  guild_tier TEXT DEFAULT 'free', -- 'free' | 'apprentice' | 'journeyman' | 'master'
  guild_joined_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchases table
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_session_id TEXT,
  stripe_customer_id TEXT,
  product_sku TEXT NOT NULL,
  product_name TEXT,
  amount INTEGER, -- cents
  currency TEXT DEFAULT 'eur',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Downloads table (track re-downloads)
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  purchase_id UUID REFERENCES purchases(id),
  product_sku TEXT NOT NULL,
  downloaded_at TIMESTAMP DEFAULT NOW()
);
```

### Pages

#### /login (updated)
- Email + password form
- "Sign in with Google" button
- "Don't have an account? Sign up" link
- "Forgot password?" link

#### /signup (new)
- Name, email, password form
- "Sign up with Google" button
- "Already have an account? Sign in" link
- Password requirements: min 8 chars

#### /account (updated, major rework)
- Profile section: name, email, avatar, member since
- Purchases section: list all products bought, with download buttons
- Downloads section: re-download any purchased file
- Newsletter: toggle subscription on/off
- Guild membership: show current tier (or "Coming soon" card)
- Change password
- Sign out

#### /forgot-password (new)
- Email input
- Sends reset link via Resend

### Stripe Webhook Updates
- On successful purchase: find or create user by email, link purchase
- Link Stripe customer ID to user account
- Store purchase with SKU, name, amount

### Download System
- Protected download route: /api/downloads/[sku]
- Verifies user is logged in AND has purchased the product
- Serves file from non-public directory
- Logs download to downloads table

### Product Files
- Move all downloadable files from /public/downloads/ to a non-public location
- Serve through protected API route only

### Migration
- Existing magic link users: keep working, prompt to set password on next login
- Existing purchases: migrate to new purchases table
- Don't break anything for existing customers

## Design
- Keep the existing site design language (warm wood tones, Playfair/Inter fonts)
- Login/signup pages should feel premium, not generic
- Account page: clean, organized, not cluttered
- Guild section: visible but clearly "coming soon"

## Environment
- Vercel Postgres: already configured
- Resend API: already configured  
- Stripe: already configured
- Google OAuth: needs CLIENT_ID and CLIENT_SECRET in Vercel env

## What NOT to build
- Guild project system (Phase 3)
- Community features (Phase 3)
- Admin dashboard
- Social login beyond Google (no Apple, no GitHub)
- Two-factor auth
