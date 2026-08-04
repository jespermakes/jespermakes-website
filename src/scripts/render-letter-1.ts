// Render Workshop Letter #1 through the branded template into a preview HTML.
// Canonical draft: Brain writing desk piece wp_1335e61c9b7e4dca98e66ef0025f
// (Newsletter #1: Business in public), draft v3, 2026-08-04. Keep this file in
// sync with the desk draft; the desk is the source of truth for the words.
// Run: npx tsx src/scripts/render-letter-1.ts

import { writeFileSync } from "fs";
import { renderWorkshopLetter } from "@/lib/email/letter-template";

const A = (href: string, text: string) =>
  `<a href="${href}" style="color:#C17F3C;">${text}</a>`;

const html = renderWorkshopLetter({
  title: "Running my business in public",
  preheader:
    "The numbers, a desk full of nails, a dead barn, and a video that might burn a bridge.",
  greeting: "Hi,",
  sections: [
    {
      paragraphs: [
        "This is the first email I have ever sent to this list. 3,398 people signed up for a newsletter that did not exist. Some of you have waited a long time. I know. It bothered me more than it bothered you.",
        "The reason it took so long is simple: I did not know what this should be about. Now I do.",
        "It is not about woodworking. Woodworking is boring to read about. Woodworking you should watch, that is what the videos are for. This newsletter is about everything else. The business around the channel. The part you do not see.",
        "I am going to run my business in public here. The thoughts, the doubts, the successes, the failures, the numbers. All of it. If you are a creator, a YouTuber, or you run a small business of your own, I think you are going to love this. If you are none of those things, this is perhaps not for you. No hard feelings. The unsubscribe link is at the bottom and it works.",
      ],
    },
    {
      heading: "Zero background, full time anyway",
      paragraphs: [
        "I started woodworking in 2020. Started a YouTube channel the same year. Zero background in either. In 2023 I went full time doing what I love: making things from wood and telling stories on YouTube.",
        "Over the years the videos have become more honest. More personal. That is harder than it sounds. When I burned my father's workbench and talked about letting go, it sparked more comments than almost anything I have made. That taught me something: the honest stuff is the stuff that matters. This newsletter is the same honesty, just pointed at the business side.",
      ],
    },
    {
      heading: "AI ate the how-to video",
      paragraphs: [
        "We have been through the phases together. Shorts. The super long videos. Then the AI slop wave. I think we are mostly through that one. YouTube is cracking down harder on unoriginal, repetitive content, and good riddance.",
        `The bigger shift is AI chat. A lot of the how-to searches that used to start on YouTube now start in a chat window. Some of that traffic is not coming back. My channel was never a DIY or how-to channel, and I am grateful for that today. It would have been easy to go down that rabbit hole, just producing "how to do x with y" videos forever. That is exactly the traffic the chat windows are eating first.`,
        "Personally, I use YouTube differently now too: to get inspired outside my own niche, to stay up to date on a few topics, to learn new tools. Not to ask how long screws should be.",
        "What does that mean for my channel? I will keep making the videos, the long ones and the shorter ones. But I am also looking at new formats. Maybe it is time for more regular, shorter videos alongside the big builds. I am figuring it out in real time, and you will read about it here first.",
      ],
    },
    {
      heading: "The full numbers, if you want them",
      paragraphs: [
        "YouTube income fluctuates. A lot. I can have a very low month and then a very high one, with no obvious reason in between.",
        "I have no problem publishing the full numbers every month. If you want that, reply to this email and say so. Enough interest, and the next issue has the numbers in it.",
      ],
    },
    {
      heading: "A barbershop desk full of nails",
      paragraphs: [
        "Right now: furniture for a barbershop in my local area. A commissioned piece, built from old cable reels. Yes, the owner approved that.",
        "Boutique interiors from reclaimed wood are still going strong, and I love it. But reclaimed is the hard way. The cable reel sides I am turning into a desk are full of nails. I am not taking the sides apart, so the nails stay in. Every cut goes through wood and steel, which means metal-cutting blades. First sanding is a wire brush on an angle grinder. The regular sandpaper suffers after that. And still: you get a look you cannot get any other way. Video incoming.",
      ],
    },
    {
      heading: "The workshop without sawdust",
      paragraphs: [
        "Wood is not the only thing I build. I also build online tools. Small, free, browser things for makers, and everything I build goes on the site for everyone to use.",
        "Three of them are live right now:",
        `<strong>The Box Joint Jig Designer.</strong> Generates a cut-ready box joint template for any wood thickness. Drop the SVG into your Shaper Origin, laser cutter, or CNC. ${A("https://jespermakes.com/box-joint-jig", "jespermakes.com/box-joint-jig")}`,
        `<strong>The Cone Lamp Designer.</strong> Build my pinecone pendant lamp from whatever plywood you have. Pick your thickness, and it gives you a cut-ready file with all 159 pieces sized to your stock. ${A("https://jespermakes.com/cone-lamp", "jespermakes.com/cone-lamp")}`,
        `<strong>The Storyteller Engine.</strong> For the makers who also film. Most people think storytelling means adding something that is not there. It is the opposite: the story is already inside your project, and this digs it out. ${A("https://jespermakes.com/storyteller", "jespermakes.com/storyteller")}`,
        "And here is the deal going forward: new tools land with newsletter subscribers first, before I mention them anywhere else. You are already in the right place.",
      ],
    },
    {
      heading: "A dead barn and a stubborn plan",
      paragraphs: [
        `I have an old barn from the 1850s. It is dead. Rotten, falling apart, past saving in its current form. The vision, and it is not a new one, is to raise it again as a proper timber-framed barn and make it a place for craft here on Sydfyn. A workshop. Courses. A place where the old building craft gets passed on instead of disappearing. The project has a name, Øhavsladen, and a website: ${A("https://ohavsladen.dk", "ohavsladen.dk")}.`,
        "Two honest facts about where that stands. One: I am working with the municipality just to be allowed to rebuild a barn and use it for woodworking. Harder than you would think. Two: I spend a lot of time seeking funding, because woodworking and YouTube do not pay for a real timber frame. And I am not going to be one of the guys putting up a metal sheeting hall. Not on this spot.",
        "I will keep updating you on the barn right here.",
      ],
    },
    {
      heading: "The video that might burn a bridge",
      paragraphs: [
        "A long video. I was in Germany twice. First for the Festool and Friends event last summer. Then events had me go back and investigate further. It became a sort of travel video, a new format for me, and I would lie if I said I am not nervous about releasing it.",
        "Partly because it is about Festool, and that alone will put some viewers off. And partly because it is about Festool, and I do not know what they are going to say about it. I could be burning bridges here. You will hear how it goes either way.",
      ],
    },
    {
      heading: "Same time next month",
      paragraphs: [
        "The plan is roughly monthly. Shorter than this, probably. If you want the monthly numbers, reply and tell me. If you have a question about the business side of any of this, reply with that too. I read everything.",
      ],
    },
  ],
});

writeFileSync("docs/newsletter/letter-1-preview.html", html);
console.log("Wrote docs/newsletter/letter-1-preview.html", html.length, "bytes");
