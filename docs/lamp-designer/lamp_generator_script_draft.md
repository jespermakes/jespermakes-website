# A Study Into Light
## Draft script — lamp generator video, Jesper Makes x Bambu Lab x MakerWorld

**Estimated runtime:** 12 to 15 minutes
**Sponsor:** Bambu Lab (H2D)
**Platform integration:** MakerWorld contest

---

## COLD OPEN

**[Close-up: the cone lamp glowing on a workbench. Quiet. Soft hum of a heater somewhere off-screen.]**

**JESPER (V.O.):**
I made this lamp two years ago.

**[Comment notifications start appearing on screen, slowly at first.]**

**JESPER (V.O.):**
Lots of people downloaded the files. Lots of people printed it. And then the messages started.

**[Comments scrolling, faster now. Read aloud, building.]**

**JESPER (V.O.):**
"Could you make it taller?" "Can you do a hexagonal version?" "What about smaller, for a bedside table?" "A wall-mount version?" "One for a kid's room?" "Spirals?" "Stripes?" "A cube?" "A cone but a different cone?"

**[Cut. Jesper at his workshop bench. Deadpan.]**

**JESPER:**
I made one lamp. And then everyone wanted twelve.

**[Title card: A STUDY INTO LIGHT]**

---

## ACT 1 — THE PROBLEM

**[Jesper walking through the workshop, the cone lamp in hand. Soft afternoon light through the barn windows.]**

**JESPER:**
When I designed the cone lamp, I thought I was making a thing. Turns out I was making a starting point. Every comment, every email, every "could you just tweak this for me," people are telling me the same thing. They don't want my lamp. They want their lamp.

**[He sets the cone lamp on his desk next to his computer.]**

**JESPER:**
So I'm going to stop designing lamps. And start designing a tool that designs lamps.

**[Quick cut: a rough wireframe of a browser-based design tool on his screen.]**

**JESPER:**
A lamp generator. You design it. You print it. The whole thing free, on jespermakes.com.

**[He sits back.]**

**JESPER:**
There's only one problem.

**[Beat.]**

**JESPER:**
I don't actually know how lamps work.

---

## ACT 2 — THE STUDY

**[Cut to a stack of design books on his bench. A Louis Poulsen catalogue. A Noguchi monograph. An old lighting reference book. He flips through.]**

**JESPER:**
I know how to make wood look beautiful. I know how to cut, how to glue, how to finish. I do not know light. So before I build anything, I have to learn what makes a lamp actually work.

**[Cuts to archival image of Poul Henningsen.]**

**JESPER:**
This is Poul Henningsen. Danish, like me. Born in 1894. In 1925 he won gold at the Paris exhibition for a design he called the Three-Shade System. The same year, the same exhibition that gave us Art Deco.

**[Visual: cutaway diagram or 3D animation showing the three-shade system, light rays bouncing off each shade.]**

**JESPER:**
Here's what's strange about it. Henningsen wasn't designing for beauty first. He was doing math. Logarithmic spirals. He was calculating exactly where each shade had to sit, what curve it had to follow, so the bulb itself would never be visible from any angle, and the light would spread evenly without glare.

**[Closeup of a PH lamp glowing.]**

**JESPER:**
He was trying to recreate something that had been lost. Before electricity, people lit their homes with candles. Petroleum lamps. Gaslight. The light was warm, soft, low. Then bulbs arrived and everyone's living room got harsh. Henningsen spent his whole life trying to put the candle back.

**[Beat.]**

**[Cut to an Akari lamp.]**

**JESPER:**
On the other side of the world, around the same problem, a different answer.

**[Archival photo of Isamu Noguchi.]**

**JESPER:**
This is Isamu Noguchi. Half Japanese, half American. Sculptor mostly. In 1951 he visited a town in Japan called Gifu, famous for paper lanterns. The mayor asked him to help, because traditional lantern-making was dying out as electric light took over.

**[Visual: a paper lantern being hand-made. Washi paper, bamboo ribs, slow craft.]**

**JESPER:**
Noguchi designed something he called Akari. The word means light. Illumination. But it also means lightness. Weightlessness. Both meanings at once. Mulberry paper on a bamboo frame. He called them sculptures, not lamps. He said the light through Akari was like the sun coming through shoji screens.

**[Closeup of an Akari lamp glowing.]**

**JESPER:**
Same problem as Henningsen. Different language. Both spent decades trying to give back the warmth that electricity had taken away.

**[Pause. Jesper to camera, holding the cone lamp.]**

**JESPER:**
That's the story of every lamp ever made. We had fire. Then we lost it. And we've been trying to design our way back ever since.

---

## ACT 3 — THE RULES

**[Jesper at his desk, sketching diagrams. Quick montage of Henningsen lamp specifications, shade angle diagrams, geometric ratios.]**

**JESPER:**
So here's what I learned. Lamps aren't just shapes you like. There are rules. Geometric rules. Henningsen literally numbered his lamps by shade ratio. The PH 3/2, the PH 4/3, the PH 5. Those aren't names. Those are dimensions. The numbers tell you exactly how the parts relate.

**[Animated diagrams showing key principles in motion: shade angle, bulb visibility cone, light coverage zone.]**

**JESPER:**
A shade has to hide the bulb at the angle you'll typically look at it from. The opening below has to direct light where you actually want it, on the table, on the floor, on the wall. The translucent parts have to balance with the opaque parts. Get any of these wrong and you get glare, hotspots, dead zones.

**[Beat.]**

**JESPER:**
These rules are old. They've been worked out by people much smarter than me. Which is good news. I don't have to be brilliant. I just have to encode what's already known.

---

## ACT 4 — THE TOOL (sponsor integration)

**[Cut to the H2D printer in the workshop. Jesper standing next to it.]**

**JESPER:**
This video is sponsored by Bambu Lab. They sent me their newest printer, the H2D, and there's a specific reason I wanted this machine for this project. It's not just the bigger build volume, though that helps when you start scaling lamps up.

**[Macro shot: the H2D's dual nozzle in action.]**

**JESPER:**
It has two nozzles. Which means it can print two materials in a single job. And for a lamp, that's the difference between a useful generator and a toy. Because a good lamp shade isn't one material. It's at least two: a translucent part that diffuses the light, and an opaque part that holds the structure and hides the wiring.

**[Print bed close-up: a lamp being printed, opaque base from one nozzle, translucent shade from the other, growing together.]**

**JESPER:**
Without dual head you'd print these separately and glue them together. Or compromise. With this, the whole lamp comes off the bed in one piece. That's what unlocks the generator.

**[Funny montage: Jesper testing different filaments. Some clearly fail. A foggy one. A blobby one. He holds up a stringy mess.]**

**JESPER (deadpan):**
This was supposed to be transparent.

**[Cut to a cleaner print, glowing softly.]**

**JESPER:**
After a lot of bad prints, here's what I landed on. Translucent PETG in vase mode, single wall, 0.6 millimeter nozzle. PETG diffuses softer than PLA because of how the polymer is structured. Vase mode means the printer lays down one continuous spiral instead of stacked layers, which sounds like it would look bad, but when light hits it the texture becomes part of the design. PLA can crack if a hot bulb gets close. PETG handles the heat better. So PETG and modern LED bulbs together, that's the sweet spot.

---

## ACT 5 — THE BUILD

**[Cut to laptop screen: the lamp generator UI.]**

**JESPER:**
We've been quietly building tools like this for a while. The cone lamp resizer at jespermakes.com slash cone-lamp lets you scale and tweak the original design. The 2D studio at jespermakes.com slash studio is a pattern editor I built earlier this year. This new tool builds on both, and it goes further. It's a full lamp generator.

**[Visual: Jesper using the tool. Selecting a base shape, cone, dome, cylinder, organic. Setting height, diameter. Choosing a pattern, smooth, perforated, geometric, organic. Adjusting wall thickness. Real-time 3D preview rotating.]**

**JESPER:**
You pick a base shape. Set the dimensions. Pick a pattern. Adjust the wall thickness. The tool keeps the proportions inside the rules I learned from Henningsen and Noguchi, so the lamp you design is one that actually works. You can't make a shade that fails to hide the bulb. The geometry won't let you.

**[He clicks export. A file downloads.]**

**JESPER:**
When you're done, you get a printable file. Free. No login, no paywall. Print it on whatever printer you have.

---

## ACT 6 — THE RIPPLE

**[Cut to Ditte in the garden, herbs in raised beds behind her.]**

**JESPER (V.O.):**
The first person I tested it on was my wife, Ditte. She runs a Danish garden Instagram. She doesn't care about lamp design history. She wanted a lamp for the herb beds. Outdoor. Has to survive Danish winters.

**[Ditte at the laptop, designing. She is fast, decisive.]**

**DITTE:**
This shape. Taller. More holes. Done.

**[Cut to her finished lamp glowing over the herbs at dusk, mounted on a copper rod.]**

**JESPER (V.O.):**
It took her four minutes.

**[Cut to Julie at the laptop. Quiet, slow movements.]**

**JESPER (V.O.):**
My daughter Julie practices in the Theravada Forest Tradition. Her aesthetic is restrained.

**[Julie's design appears on screen: a simple hexagonal hanging lantern, almost monastic.]**

**JULIE (quietly):**
It just needs to be quiet light.

**[Cut to her finished lamp in a small meditation space.]**

**JESPER (V.O.):**
Two people. Two completely different lamps. Same tool.

**[Cut to Jesper holding both lamps side by side, lit. Then placing them on a shelf next to the original cone lamp.]**

**JESPER:**
This is what I couldn't do with one design. I couldn't build a thing that became Ditte's garden, and Julie's quiet, and a stranger's bedroom, and someone else's wall-mount, and a hexagonal one and a spiral one and all the others the comments asked for.

**[Beat.]**

**JESPER:**
A tool can do that. One lamp can't.

---

## ACT 7 — THE CONTEST (MakerWorld integration)

**[Jesper at his bench, looking straight at the camera.]**

**JESPER:**
So here's where you come in. The generator is free. It's live now. Go design a lamp.

**[On-screen graphic with the generator URL and contest details.]**

**JESPER:**
And we're doing something else with Bambu Lab and MakerWorld. If you upload your design to MakerWorld with the tag we'll put in the description below, you're entered into a contest. The designs that surprise me, I'll print here on the H2D, photograph properly, and feature on this channel and on MakerWorld. Bambu's putting up some prizes for the winners, details at the end of the video.

**[Visual: example MakerWorld submission template.]**

**JESPER:**
This is the part I'm actually excited about. I've been building lamps in this workshop for years. I'm one person. Whatever I make in a year is whatever I make. But if a thousand people each design one lamp on this tool, that's a thousand lamps the world has now that didn't exist last week. I get to see all of them. I get to feature the ones that surprise me. That's a much better deal than just making more cone lamps.

---

## ACT 8 — THE CLOSE

**[Slow cut: the cone lamp in foreground, soft-focus generator-designed lamps glowing behind it.]**

**JESPER:**
When I designed the cone lamp, I thought I was finishing something. I now think I was starting something.

**[He picks up the cone lamp, sets it down. Picks up Ditte's lamp, Julie's lamp, others.]**

**JESPER:**
Henningsen didn't design a lamp. He designed a system. The PH 3/2, the PH 5, the Artichoke, all of those came out of one set of rules he worked out in the 1920s. Noguchi didn't design a lamp. He designed a method. Over a hundred Akari sculptures came out of his trips to Gifu. Their lamps were the first outputs of those systems. The variations came after.

**[He looks at the camera.]**

**JESPER:**
I'm not Henningsen. I'm not Noguchi. But the move is the same. Stop polishing one object. Build the tool that makes the next thousand. Then hand it over.

**[Pause. Closer shot.]**

**JESPER:**
Light is the first thing humans noticed about the world. It might be the last thing we lose. Every lamp anyone has ever designed is just someone trying to put a little of that warmth back into the room. The candle, the bulb, the screen. All of it.

**[Final shot: Jesper switches off the workshop overheads. Just the lamps glow. Various shapes. His, Ditte's, Julie's, the original cone, others.]**

**JESPER (quietly):**
Now it's your turn.

**[End card: generator URL, contest details, Bambu Lab and MakerWorld credits, prize info.]**

---

## NOTES FOR PRODUCTION

- **Tone:** Contemplative throughout, with two or three pockets of dry humor (the comment montage, "this was supposed to be transparent," Ditte's four-minute design). Avoid quirky energy. Match the cinematic-score / Cure / Depeche Mode register.
- **Music:** Sparse in the early acts, building under the family ripple, restrained at the close. Avoid generic YouTube background music.
- **B-roll heavy:** The script intentionally leaves room for long visual moments, the print bed, the lamps glowing, the workshop. Pacing should feel slow.
- **Henningsen and Noguchi visuals:** Use legally cleared archival photos and product images where possible. Louis Poulsen and the Noguchi Foundation may have press kits.
- **The generator UI footage:** Worth filming in real-time at the resolution it'll be used at. Sound-design the clicks and parameter changes for clarity.
- **Family scenes:** Keep them brief and authentic. Ditte and Julie should sound like themselves, not actors.

## OPEN QUESTIONS FOR BAMBU

- Specific contest mechanic and prize structure (we landed on "Bambu putting up some prizes" without details).
- Whether the H2D dual-head opaque-base/translucent-shade demo should use specific Bambu filaments by name.
- Tag system for MakerWorld submissions.
- Timing of the publish window so we can confirm "live now" framing in the script holds.
