// Render Workshop Letter #1 (docs/newsletter/letter-1-draft.md content)
// through the branded template into a preview HTML file.
// Run: npx tsx src/scripts/render-letter-1.ts

import { writeFileSync } from "fs";
import { renderWorkshopLetter } from "@/lib/email/letter-template";

const html = renderWorkshopLetter({
  title: "It got quiet. Here is why.",
  preheader:
    "The barn, the free plans, and a small tool for your finishing decisions.",
  greeting: "Hi,",
  sections: [
    {
      paragraphs: [
        "You signed up for a letter from my workshop and then heard nothing. That is on me. Here is the first one, and from now on there will be about one a month. Short, useful, no fluff.",
      ],
    },
    {
      heading: "What I have been building",
      paragraphs: [
        "On South Fyn we are rebuilding an 1850s barn into a timber frame workshop. Real bindingsværk: axes, chisels, oak pegs, and friends from The Northmen. The timber was felled in winter and is drying in Latvia while we fight the paperwork.",
        `If you want the full story, it lives at <a href="https://ohavsladen.dk" style="color:#C17F3C;">ohavsladen.dk</a>, and I will keep you posted here.`,
      ],
    },
    {
      heading: "Everything is free now",
      paragraphs: [
        "I moved my site off the link-in-bio service and onto jespermakes.com, and while doing that I made a call: the plans are free to download. All of them. The workshop cheat sheets, and yes, the cone lamp files too, laser and 3D print.",
        `If they save you time or light up a corner of your home, there is a price field with a zero in it. The zero is editable. That is the whole business model, and I like it that way. <a href="https://jespermakes.com/shop" style="color:#C17F3C;">The plan shelf is here.</a>`,
      ],
    },
    {
      heading: "One useful thing",
      paragraphs: [
        `If you finish wood with Rubio Monocoat (I do, on almost everything), I built a small guide that picks the right product and color for your project: <a href="https://jespermakes.com/rubio" style="color:#C17F3C;">jespermakes.com/rubio</a>`,
      ],
    },
    {
      heading: "Coming next",
      paragraphs: [
        `A 3D lamp designer you can use in the browser: shape your own lamp, check it will actually print, then make it. It is <a href="https://jespermakes.com/lamp-designer" style="color:#C17F3C;">in beta on the site now</a>. The full version lands together with a video I am very much looking forward to filming.`,
      ],
    },
  ],
  signoff:
    "Build something real. And you can reply to this letter, it lands in my actual inbox.",
});

writeFileSync("docs/newsletter/letter-1-preview.html", html);
console.log("Wrote docs/newsletter/letter-1-preview.html", html.length, "bytes");
