import { Metadata } from "next";
import { SupportButtons } from "@/components/shop/support-buttons";

export const metadata: Metadata = {
  title: "Support the workshop | Jesper Makes",
  description:
    "The plans are free and stay free. If they save you time, you can leave something in the jar.",
  alternates: { canonical: "https://jespermakes.com/support" },
};

export default function SupportPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 md:py-32">
      <p className="text-[10px] font-bold tracking-[2px] text-wood-light/[0.4] uppercase mb-4">
        The jar
      </p>
      <h1 className="font-serif text-4xl md:text-5xl text-wood mb-6">
        Support the workshop
      </h1>
      <div className="space-y-4 text-wood-light leading-relaxed mb-10">
        <p>
          The plans and the workshop apps on this site are free, and they stay
          free. That is how I want it: you should be able to build something
          real without paying an entry fee.
        </p>
        <p>
          But everything here comes out of a real workshop with real sawdust.
          If a plan saved you an afternoon, or a tool saved you a headache, you
          can leave something in the jar. It goes straight back into the next
          build, the next plan, and the barn we are raising on South Fyn.
        </p>
        <p>No account, no subscription, no strings. Just a nod between makers.</p>
      </div>
      <SupportButtons />
    </div>
  );
}
