import { createHash } from "node:crypto";

export function verifyPkce(codeVerifier: string, codeChallenge: string): boolean {
  const computed = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  if (computed.length !== codeChallenge.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ codeChallenge.charCodeAt(i);
  }
  return mismatch === 0;
}
