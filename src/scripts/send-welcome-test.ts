// Render the Starter Kit welcome email, write a preview HTML, and (with
// --send) test-send it to jespermakes@gmail.com with a [test] subject.
// Run: npx tsx src/scripts/send-welcome-test.ts [--send]

import { writeFileSync } from "fs";
import { welcomeEmailFor } from "@/lib/email/welcome";

const { subject, html: resolved, headers } = welcomeEmailFor("jespermakes@gmail.com", "Jesper");
console.log("headers:", JSON.stringify(headers));
writeFileSync("docs/newsletter/welcome-preview.html", resolved);
console.log("Wrote docs/newsletter/welcome-preview.html", resolved.length, "bytes");

if (process.argv.includes("--send")) {
  fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Jesper Makes <hello@jespermakes.com>",
      to: ["jespermakes@gmail.com"],
      subject: `${subject} [test]`,
      html: resolved,
      headers,
    }),
  }).then(async (r) => {
    const body = await r.json().catch(() => ({}));
    console.log("test send:", r.status, body.id ?? JSON.stringify(body).slice(0, 200));
    process.exit(r.ok ? 0 : 1);
  });
}
