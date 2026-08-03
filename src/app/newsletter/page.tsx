import Link from "next/link";
import Image from "next/image";
import { getSubscriberCount } from "@/lib/homepage/fetch";
import { NotesSignupForm } from "@/components/newsletter/notes-signup-form";

export const revalidate = 60;

// The apps in the site nav. Each one exists because something in the
// business needed it. They are the proof behind the pitch on this page.
const TOOLS = [
  { name: "2D Design Studio", href: "/studio" },
  { name: "Box Joint Jig", href: "/box-joint-jig" },
  { name: "Cone Lamp", href: "/cone-lamp" },
  { name: "Title Lab", href: "/title-lab" },
  { name: "Storyteller Engine", href: "/storyteller" },
  { name: "Rubio Finish Guide", href: "/rubio" },
];

function Kicker({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={`text-[10px] font-bold tracking-[0.15em] mb-4 ${
        dark ? "text-cream/40" : "text-wood-light/40"
      }`}
    >
      {children}
    </p>
  );
}

export default async function NewsletterPage() {
  const count = await getSubscriberCount();

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-16 md:pt-24 md:pb-20">
        <Kicker>NOTES FROM THE WORKSHOP</Kicker>
        <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] text-wood mb-8 max-w-3xl">
          Not a woodworking newsletter.
        </h1>
        <div className="max-w-2xl space-y-5 text-lg md:text-xl text-wood-light/80 leading-relaxed mb-10">
          <p>On YouTube I make films about wood. This is the other half.</p>
          <p>
            I run a one-man business from a workshop on Fyn, Denmark: films,
            furniture, free plans, and the apps I build to keep it all running.
            The letter is me being completely honest about how that goes. The
            problems, the numbers, the fixes.
          </p>
        </div>

        <div className="max-w-xl">
          <NotesSignupForm source="newsletter_page" variant="hero" />
          <p className="text-sm text-wood-light/50 mt-4 leading-relaxed">
            {count > 0 && (
              <span className="text-wood-light/70 font-medium">
                {count.toLocaleString()} people read it.{" "}
              </span>
            )}
            Your address stays here. One click out, any time.
          </p>
        </div>
      </section>

      {/* What lands in your inbox */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-wood/10">
        <Kicker>WHAT LANDS IN YOUR INBOX</Kicker>
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-10 max-w-3xl">
          Every letter is built from three things.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-6">
            <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-3">
              01 &nbsp; THE PROBLEM
            </p>
            <h3 className="font-serif text-xl text-wood mb-3">
              Something always breaks
            </h3>
            <p className="text-wood-light/80 leading-relaxed">
              A sponsor deal goes sideways. A video dies. A product sells four
              copies. I write down what happened, what I tried, and whether it
              worked. The failed fixes go in too. Those are usually the useful
              ones.
            </p>
          </div>

          <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-6">
            <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-3">
              02 &nbsp; THE NUMBERS
            </p>
            <h3 className="font-serif text-xl text-wood mb-3">
              The real ones
            </h3>
            <p className="text-wood-light/80 leading-relaxed">
              Revenue, views, subscriber counts, what a brand actually pays for
              an integration. Creators tend to share their numbers when they
              look good. I share mine when they are real, which is not always
              the same thing.
            </p>
          </div>

          <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-6">
            <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-3">
              03 &nbsp; THE TOOLS
            </p>
            <h3 className="font-serif text-xl text-wood mb-3">
              Built to fix my own problems
            </h3>
            <p className="text-wood-light/80 leading-relaxed">
              When a problem needs software, I build it. Then I give it away,
              free whenever I can possibly make it free. Subscribers get every
              new tool first.
            </p>
          </div>
        </div>
      </section>

      {/* The ledger */}
      <section className="bg-wood">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
          <Kicker dark>THE LEDGER</Kicker>
          <h2 className="font-serif text-3xl md:text-4xl text-cream mb-12 max-w-2xl">
            If I sell transparency, this page should have some.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
            <div>
              <p className="font-serif text-4xl md:text-5xl text-cream mb-2">2020</p>
              <p className="text-sm text-cream/60 leading-relaxed">
                The year I started. No background in wood or video.
              </p>
            </div>
            <div>
              <p className="font-serif text-4xl md:text-5xl text-cream mb-2">360,000</p>
              <p className="text-sm text-cream/60 leading-relaxed">
                Subscribers on YouTube.
              </p>
            </div>
            <div>
              <p className="font-serif text-4xl md:text-5xl text-cream mb-2">44.1M</p>
              <p className="text-sm text-cream/60 leading-relaxed">
                Views, all time.
              </p>
            </div>
            <div>
              <p className="font-serif text-4xl md:text-5xl text-cream mb-2">7</p>
              <p className="text-sm text-cream/60 leading-relaxed">
                Free tools built and running on this site.
              </p>
            </div>
            {count > 0 && (
              <div>
                <p className="font-serif text-4xl md:text-5xl text-cream mb-2">
                  {count.toLocaleString()}
                </p>
                <p className="text-sm text-cream/60 leading-relaxed">
                  People on this list, live from the database.
                </p>
              </div>
            )}
            <div>
              <p className="font-serif text-4xl md:text-5xl text-cream mb-2">1</p>
              <p className="text-sm text-cream/60 leading-relaxed">
                Barn on South Fyn, being rebuilt the 1850s way.
              </p>
            </div>
          </div>

          <p className="text-cream/70 leading-relaxed mt-12 max-w-2xl">
            The letter is where these numbers get explained. What they cost,
            what they pay, and which ones actually matter.
          </p>
        </div>
      </section>

      {/* The tools, as proof */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <Kicker>PROOF</Kicker>
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-4 max-w-3xl">
          Problems that became tools.
        </h2>
        <p className="text-lg text-wood-light/80 leading-relaxed max-w-2xl mb-10">
          When the business needs a tool that does not exist, I build it. These
          run in your browser and cost nothing.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white/60 border border-wood/5 rounded-xl px-5 py-4 flex items-center justify-between hover:border-forest/30 transition-colors"
            >
              <span className="font-serif text-lg text-wood group-hover:text-forest transition-colors">
                {tool.name}
              </span>
              <span className="text-forest/40 group-hover:text-forest transition-colors" aria-hidden>
                &rarr;
              </span>
            </Link>
          ))}
        </div>

        <p className="text-wood-light/60 mt-8">
          Subscribers hear about every new tool before anyone else.
        </p>
      </section>

      {/* Who it's for */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-wood/10">
        <Kicker>WHO IT&apos;S FOR</Kicker>
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-8 max-w-3xl">
          The films show what worked. The letter shows what it cost.
        </h2>
        <div className="max-w-2xl space-y-5 text-lg text-wood-light/80 leading-relaxed">
          <p>
            Maybe you want the woodworking. Maybe the YouTube channel, or the
            app building, or the day you hand in your notice on a job that pays
            fine and means nothing. Most readers want one piece of what I do.
            That is enough.
          </p>
          <p>
            I write the whole machine anyway, because the parts only make sense
            together. The sponsor money pays for the tools. The tools feed the
            films. The films bring the sponsors. Around it goes.
          </p>
        </div>
      </section>

      {/* How I run the list */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-wood/10">
        <Kicker>THE RULES</Kicker>
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-10 max-w-3xl">
          How I run the list.
        </h2>
        <div className="space-y-5 text-lg text-wood-light/80 leading-relaxed max-w-2xl">
          <p>
            <span className="text-wood font-semibold">Cadence.</span> A letter
            goes out when there is something worth sending. The aim is monthly.
            Some months the business eats the letter. When that happens, the
            next one tells you why, and that story is usually better than the
            letter it replaced.
          </p>
          <p>
            <span className="text-wood font-semibold">No manufactured
            urgency.</span> No countdowns, no last chances. Nothing here is
            ever about to run out.
          </p>
          <p>
            <span className="text-wood font-semibold">Your address.</span>{" "}
            Stays with me. Never sold, never shared, never rented. Unsubscribe
            is one click, in every letter.
          </p>
        </div>
      </section>

      {/* Closer */}
      <section className="max-w-3xl mx-auto px-6 py-16 pb-24 border-t border-wood/10">
        <div className="bg-forest/10 border border-forest/20 rounded-2xl p-8 md:p-10">
          <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-3">
            LAST THING
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-wood mb-4">
            Read the next one.
          </h2>
          <p className="text-wood-light/80 leading-relaxed mb-6">
            It costs nothing. It takes one click to leave. And it might save
            you a few of the mistakes I paid full price for.
          </p>
          <NotesSignupForm source="newsletter_page" variant="band" />
          <div className="mt-8 flex items-center gap-3">
            <Image
              src="/images/press/latvia/jesper-portrait-barn.jpg"
              alt="Jesper"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="font-serif italic text-xl text-wood">Jesper</span>
          </div>
        </div>
      </section>
    </main>
  );
}
