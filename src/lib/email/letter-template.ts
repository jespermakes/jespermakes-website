// The Workshop Letter: HTML email template, v2 design (2026-08-04).
// Reads like a letter, not a campaign: cream page, no boxed blocks, plain
// serif headings (no rules or ornaments), 17px body with generous leading,
// small logo up top, portrait signature, quiet footer. Email-client-safe:
// single column, max 560px, all styles inline. The {{{RESEND_UNSUBSCRIBE_URL}}}
// merge tag is filled by Resend at send time.

const INK = "#2C1B12"; // headings + strong text
const BODY = "#3A2A1F"; // body text, dark enough to read in sunlight
const MUTED = "#8A776A";
const AMBER = "#B26E2E"; // links (darker than the site accent for contrast)
const PAPER = "#F7F3EC";
const HAIRLINE = "#E6DCCD";
const SITE = "https://jespermakes.com";

export interface LetterSection {
  /** Optional serif heading, plain, no ornament. */
  heading?: string;
  /** Paragraph HTML (already-safe content; <p> tags added here). */
  paragraphs: string[];
  /** Optional single photo below the section's text. Use sparingly (one per
   * letter at most): image-heavy emails drift into the Promotions tab. Must be
   * hosted on jespermakes.com and carry real alt text. */
  image?: { src: string; alt: string; caption?: string };
}

export interface WorkshopLetter {
  /** Subject is set on the broadcast; title renders at the top of the body. */
  title: string;
  /** Hidden inbox preview text. */
  preheader: string;
  /** Greeting line, e.g. "Hi," */
  greeting?: string;
  sections: LetterSection[];
  /** Short closing line above the signature. */
  signoff?: string;
}

const FONT = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

const paragraph = (html: string) =>
  `<p style="margin:0 0 18px 0;font-family:${FONT};font-size:17px;line-height:1.75;color:${BODY};">${html}</p>`;

const sectionHeading = (text: string) =>
  `<h2 style="margin:34px 0 14px 0;font-family:${SERIF};font-size:22px;line-height:1.3;font-weight:bold;color:${INK};">${text}</h2>`;

const sectionImage = (img: { src: string; alt: string; caption?: string }) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px 0;">
    <tr>
      <td>
        <img src="${img.src}" alt="${img.alt}" width="512" style="width:100%;max-width:512px;height:auto;border-radius:8px;display:block;">
        ${img.caption ? `<p style="margin:8px 0 0 0;font-family:${FONT};font-size:13px;line-height:1.5;color:${MUTED};">${img.caption}</p>` : ""}
      </td>
    </tr>
  </table>`;

export function renderWorkshopLetter(letter: WorkshopLetter): string {
  const sections = letter.sections
    .map(
      (s) =>
        (s.heading ? sectionHeading(s.heading) : "") +
        s.paragraphs.map(paragraph).join("") +
        (s.image ? sectionImage(s.image) : ""),
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${letter.title}</title>
</head>
<body style="margin:0;padding:0;background-color:${PAPER};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${letter.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PAPER};">
    <tr>
      <td align="center" style="padding:32px 16px 40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Masthead: small and quiet -->
          <tr>
            <td style="padding:0 4px 26px 4px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td><img src="${SITE}/logo.png" width="36" height="36" alt="Jesper Makes" style="border-radius:50%;display:block;"></td>
                  <td style="padding-left:10px;font-family:${FONT};font-size:12px;letter-spacing:2px;color:${MUTED};font-weight:bold;">THE WORKSHOP LETTER</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Letter body -->
          <tr>
            <td style="padding:0 4px;">
              <h1 style="margin:0 0 22px 0;font-family:${SERIF};font-size:30px;line-height:1.25;font-weight:bold;color:${INK};">${letter.title}</h1>
              ${letter.greeting ? paragraph(letter.greeting) : ""}
              ${sections}
              ${letter.signoff ? paragraph(letter.signoff) : ""}
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:10px 4px 0 4px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td><img src="${SITE}/images/press/latvia/jesper-portrait-barn.jpg" width="44" height="44" alt="Jesper" style="border-radius:50%;display:block;"></td>
                  <td style="padding-left:12px;font-family:${SERIF};font-style:italic;font-size:19px;color:${AMBER};">Jesper</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 4px 0 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${HAIRLINE};">
                <tr>
                  <td style="padding-top:16px;">
                    <p style="margin:0 0 6px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};">
                      You get this letter because you signed up at
                      <a href="${SITE}" style="color:${AMBER};text-decoration:none;">jespermakes.com</a>.
                      About once a month.
                    </p>
                    <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};">
                      <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>
                      &nbsp;&middot;&nbsp; Jesper Makes, Fyn, Denmark
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
