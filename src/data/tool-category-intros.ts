/**
 * Intro copy for each tool category page.
 *
 * The category pages were the thinnest thing on the site (150-290 words of
 * mostly card titles) while being the natural landing page for "best X for Y"
 * searches. This gives each one something of its own to say.
 *
 * Drafted to match the site's voice and approved by Jesper on 2026-08-10, so
 * treat it as his words rather than placeholder. Every string is plain prose
 * with no markup, so editing is just editing.
 *
 * Where a category is entirely ambassador products the intro says so up front.
 * That is honest, and it is also the disclosure that belongs next to the
 * rel="sponsored" buy links on the tool pages themselves.
 */

export const toolCategoryIntros: Record<string, string> = {
  festool:
    "Festool makes up a large part of this workshop, and I am an ambassador for them in Denmark, which is worth knowing before you read a word of this. The system argument is the real one: a single battery platform, a dust extractor that talks to the tools, and rails that fit across the range. It is expensive kit. Whether that trade makes sense depends entirely on how many hours a week you spend behind the tool. Each page below has what I actually use it for.",

  "power-tools":
    "The machines that are not part of the Festool system but have earned their floor space anyway. Bandsaw, drum sander, cyclone extraction, the cordless nailer. This is the heavy, dusty, repetitive end of the work: the jobs that would take an afternoon by hand and ten minutes by machine. Most of these arrived because a specific build demanded them rather than because I planned the shop around them.",

  "hand-tools":
    "Chisels, saws, axes, mallets. Tools that need no power and do not care whether the extension lead reaches. A lot of the barn work on South Fyn is cut by hand, so this list keeps growing. Good hand tools also last decades and improve with use, which quietly makes them the cheapest things in the workshop over their lifetime.",

  finishing:
    "Finishing is where a build either comes alive or goes flat, and it is the step most people rush after doing everything else carefully. I use Rubio Monocoat on nearly everything and I am an ambassador for them, so read these with that in mind. It is a hardwax oil: one coat, bonded to the fibre, no plastic film sitting on top of the wood. What is listed here is what stays on my shelf.",

  plywood:
    "Plywood done properly is not a compromise, and the birch and spruce panels here are a long way from the sheet goods in a builders' merchant. I work with WISA, so that is on the table before you read further. These pages cover what each grade is for, how it behaves under a cutter, and where to buy it. There is a much longer argument on the plywood page if you want it.",

  "3d-printing-laser":
    "The digital corner of the workshop. Laser cutters, 3D printers, and the machines that turn a file into a physical part. I use these mostly for jigs, templates and prototypes, and occasionally for a finished piece. If you have ever wondered whether a laser earns its space next to a bandsaw, these pages are the honest answer.",

  "workshop-essentials":
    "The unglamorous half of the workshop. Clamps, tape measures, squares, the bench itself. Nobody films a video about a tape measure, but you touch these more often than any machine in the room, and a bad one quietly costs you accuracy on every single cut.",

  "office-youtube-gear":
    "The other half of the job. Cameras, lights, audio and the software behind the videos. The workshop is paid for by YouTube, so this gear is every bit as much a work tool as the track saw is. Fair warning: this list is shorter than it should be, and I am still filling it in.",

  "gardening-outdoors":
    "What lives outside the workshop doors. There is not much here yet, and I would rather list one thing I actually use than pad it out with gear I do not. Right now that means keeping the ground around the barn under control while we are busy raising it, so the machine that does the mowing while I am inside cutting joinery has earned its place.",
};
