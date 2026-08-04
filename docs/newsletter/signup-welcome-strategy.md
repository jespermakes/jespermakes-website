# Signup email strategy: The Starter Kit

Written 2026-08-04 by Floki, after newsletter #1 shipped and Jesper's test
signup received nothing. Goal: every new subscriber gets an instant welcome
email so good they forward it.

## Current state (verified in code)

- `subscribeToNewsletter` (src/lib/newsletter.ts) writes the Resend contact +
  DB row and sends NOTHING. No welcome, no confirmation, on any signup source.
- Signup sources in play: public_form, homepage, site_footer, blog_post,
  tools_page, plan_download, newsletter_page, ohavsladen, account_toggle.
- List: 3,398 contacts, single opt-in, Resend marketing tier (5,000 contacts).

## Why the welcome email is the highest-leverage email we send

From the research (beehiiv + industry canon, sources at bottom):

- Welcome emails reach open rates up to ~84%, vs ~40% for regular newsletters.
  It is the one email almost everyone reads.
- They generate ~320% more revenue per email than other sends and subscribers
  who get one show ~33% higher long-term engagement.
- Send IMMEDIATELY on signup; the expectation window is minutes, not hours.
- Use it to ask for a safelist/primary-inbox action and a reply; both teach
  mail providers the sender is wanted (deliverability compounding).
- 2026 direction: onboarding differentiates by signup source (a tools_page
  signup cares about tools; an ohavsladen signup cares about the barn).

## Danish consent position (checked, not assumed)

Markedsføringsloven requires prior, informed, specific consent; our signup
forms collect exactly that. Double opt-in is NOT legally required in Denmark;
it is recommended purely as consent documentation. Decision: stay single
opt-in (no confirmation friction), log signup source + timestamp as consent
evidence (already in newsletterSubscribers), revisit double opt-in only if
complaint rates ever say otherwise.

## The strategy

### v1 (built now): one exceptional welcome email, "The Starter Kit"

Concept: the welcome email is a GIFT, not a receipt. It hands the new
subscriber the best of everything free on day zero: the three live tools,
the three films that explain who Jesper is, and the barn story. A gift is
forwardable; a confirmation is not. The forward hook is explicit: "the
starter kit is the gift, send it to a maker friend."

Structure (Workshop Letter template, no content images):
1. What this list is: business in public, monthly, reply-able.
2. One deliverability favor: move to Primary / reply "hi".
3. The starter kit: 3 tools (box-joint-jig, cone-lamp, storyteller).
4. Three films to start with (origin story, the father one, the cabin).
5. The barn, one line + ohavsladen.dk.
6. Bring a friend: forward hook + signup link for forwarded readers.

Send rule: fires on NEW subscriber or RESUBSCRIBE after unsubscribe, never on
repeat toggles of an already-subscribed contact. Non-blocking: a failed
welcome send never fails a signup. From hello@jespermakes.com (replies land
in the triaged inbox). Transactional send via Resend /emails, so it does not
touch broadcast quotas.

Unsubscribe in v1: footer links to mailto:hello@ with subject unsubscribe
(handled same-day by the inbox machinery) + the newsletter page. Follow-up
task: tokenized one-click unsubscribe page, then swap the footer link.

### v2 (later, when v1 metrics exist)

- Source-aware starter kits: tools_page signups lead with tools; ohavsladen
  signups lead with the barn; blog signups lead with films.
- A second email on day 3-4: the story of quitting the job (origin deep-dive)
  + archive of past letters once 3+ issues exist.
- Referral mechanics only when the list is meaningfully growing organically;
  at 3.4k a formal referral program is machinery before its time. The forward
  hook IS the v1 referral program.

### Metrics that decide v2

Resend per-email opens/clicks on the welcome (target: >70% open, >25% click),
signup rate trend on /newsletter, replies to the welcome. Review after 30
days of data.

## Sources

- beehiiv: setting up your welcome email + welcome email craft posts
  (beehiiv.com/support/article/12314772394519, blog.beehiiv.com/p/start-newsletter-successful-welcome-email-template)
- beehiiv State of Newsletters 2026 (beehiiv.com/blog/beehiiv-the-state-of-newsletters-2026)
- Welcome email performance stats roundups (mailmend.io/blogs/welcome-email-performance-statistics,
  campaignmonitor.com/resources/infographics/how-effective-are-welcome-emails)
- Danish consent rules (legiant.ai/en/blog/markedsfoeringsloven-nyhedsbreve,
  siite.dk/en/marketing-dictionary/double-opt-in)
