// Admin editors save through the voice gate (DR-287). When the server refuses a text (HTTP 422 with
// a voice block), this shows the lines it found and lets Jesper save anyway by typing why; the
// server logs the reason. Cancel leaves the 422 in place, so the editor shows the error and he can
// fix the lines instead.

interface VoiceFinding {
  field: string;
  line: number;
  name: string;
  quote: string;
  fix: string;
}

export async function voiceFetch(url: string, init: RequestInit & { body?: string }): Promise<Response> {
  const res = await fetch(url, init);
  if (res.status !== 422) return res;
  const data = await res
    .clone()
    .json()
    .catch(() => null);
  if (!data?.voice) return res;
  const findings = (data.voice.findings ?? []) as VoiceFinding[];
  const lines = findings.slice(0, 8).map((f) => `* ${f.field}, line ${f.line}: "${f.quote}"\n  ${f.name}. ${f.fix}`);
  const more = findings.length > 8 ? `\n...and ${findings.length - 8} more` : "";
  const reason = window.prompt(
    `${data.error}\n\n${lines.join("\n")}${more}\n\nTo save it as it is, write a few words on why (it is logged). Cancel to go back and fix it.`,
  );
  if (!reason || reason.trim().length < 8) return res;
  const body = init.body ? JSON.parse(init.body) : {};
  return fetch(url, { ...init, body: JSON.stringify({ ...body, voiceOverride: { reason: reason.trim() } }) });
}
