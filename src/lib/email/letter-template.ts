// The Workshop Letter: branded HTML email template.
// Matches the site's v3 design language: night header, cream body,
// Georgia serif headings, amber accents. Email-client-safe: single
// column, max 560px, all styles inline, system font stack for body.
//
// Used for newsletter broadcasts (Resend). The {{{RESEND_UNSUBSCRIBE_URL}}}
// merge tag is filled by Resend at send time.

const NIGHT = "#20100A";
const WOOD = "#2C1810";
const WOOD_LIGHT = "#4A3228";
const CREAM = "#FAF7F2";
const AMBER = "#C17F3C";
const SITE = "https://jespermakes.com";

export interface LetterSection {
  /** Optional serif heading with an amber rule. */
  heading?: string;
  /** Paragraph HTML (already-safe content; <p> tags added here). */
  paragraphs: string[];
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

const paragraph = (html: string) =>
  `<p style="margin:0 0 16px 0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:${WOOD_LIGHT};">${html}</p>`;

const sectionHeading = (text: string) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 12px 0;">
    <tr>
      <td width="28" style="border-top:2px solid ${AMBER};font-size:0;line-height:0;">&nbsp;</td>
      <td style="padding-left:10px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${WOOD};font-weight:bold;">${text}</td>
    </tr>
  </table>`;

export function renderWorkshopLetter(letter: WorkshopLetter): string {
  const sections = letter.sections
    .map(
      (s) =>
        (s.heading ? sectionHeading(s.heading) : "") +
        s.paragraphs.map(paragraph).join(""),
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${letter.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#EFE9DE;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${letter.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFE9DE;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Night header -->
          <tr>
            <td align="center" style="background-color:${NIGHT};border-radius:16px 16px 0 0;padding:28px 24px 24px 24px;">
              <img src="${SITE}/logo.png" width="64" height="64" alt="Jesper Makes" style="border-radius:50%;display:block;margin:0 auto 12px auto;">
              <div style="font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:3px;color:${AMBER};font-weight:bold;">THE WORKSHOP LETTER</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:${CREAM};padding:32px 32px 8px 32px;">
              <h1 style="margin:0 0 20px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:${WOOD};">${letter.title}</h1>
              ${letter.greeting ? paragraph(letter.greeting) : ""}
              ${sections}
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="background-color:${CREAM};padding:8px 32px 32px 32px;">
              ${letter.signoff ? paragraph(letter.signoff) : ""}
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td><img src="${SITE}/images/press/latvia/jesper-portrait-barn.jpg" width="44" height="44" alt="Jesper" style="border-radius:50%;display:block;"></td>
                  <td style="padding-left:12px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:19px;color:${AMBER};">Jesper</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${NIGHT};border-radius:0 0 16px 16px;padding:20px 32px;">
              <p style="margin:0 0 8px 0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#B8A99C;">
                You get this letter because you signed up at
                <a href="${SITE}" style="color:${AMBER};text-decoration:none;">jespermakes.com</a>
                (or back in the beacons days). About once a month.
              </p>
              <p style="margin:0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#B8A99C;">
                <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#B8A99C;text-decoration:underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp; Jesper Makes, Fyn, Denmark
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
