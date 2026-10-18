// The voice gate as the MCP handlers and the admin API call it: check, refuse or note, and log
// every refusal, override and flag (DR-287). The log is a row in mcp_activity (method
// "voice_gate.<outcome>", the override reason in error_message, the fields and tells in
// request_body), written whether or not the token has verbose logging, so an override is never
// silent. A gate that cannot run fails open with a note and a log row, like the Spark gates.

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mcpActivity } from "@/lib/db/schema";
import {
  checkFields,
  flagText,
  refusalBody,
  refusalText,
  summary,
  VOICE_VERSION,
  type FieldInput,
  type GateResult,
  type VoiceOverride,
} from "./gate";

type Outcome = "refused" | "overridden" | "flagged" | "error";

interface Who {
  userId?: string | null;
  tokenId?: string | null;
  clientId?: string | null;
}

async function logVoiceGate(source: "mcp" | "admin", tool: string, outcome: Outcome, who: Who, result: GateResult | null, reason?: string | null, error?: string) {
  const sha = result?.sha ?? "";
  console.warn(`[voice-gate] ${source} ${tool} ${outcome} band=${result?.band ?? "?"} sha=${sha.slice(0, 12)}${reason ? ` reason=${JSON.stringify(reason)}` : ""}${error ? ` error=${error}` : ""}`);
  try {
    await db.insert(mcpActivity).values({
      tokenId: who.tokenId ?? null,
      clientId: who.clientId ?? (source === "admin" ? "admin" : null),
      userId: who.userId ?? null,
      method: `voice_gate.${outcome}`,
      toolName: tool,
      durationMs: null,
      success: outcome !== "refused",
      errorMessage: reason ? `override: ${reason}` : error ?? null,
      requestBody: { source, band: result?.band ?? null, sha, version: VOICE_VERSION, fields: result ? summary(result) : [], reason: reason ?? null },
      responseBody: null,
      ipAddress: null,
    });
  } catch (err) {
    console.error("[voice-gate] could not write the log row:", err);
  }
}

type McpText = { type: "text"; text: string };
export interface McpGate {
  refuse?: { isError: true; content: McpText[] };
  note?: string;
}

// For an MCP write tool. Returns refuse (send it back as the tool result) or an optional note to
// append to the success text.
export async function mcpVoiceGate(tool: string, who: Who, inputs: FieldInput[], override: VoiceOverride | null): Promise<McpGate> {
  let r: GateResult;
  try {
    r = checkFields(inputs);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await logVoiceGate("mcp", tool, "error", who, null, null, msg.slice(0, 300));
    return { note: `VOICE GATE could not check this call (${msg.slice(0, 200)}). It went ahead unchecked: read the text back and check it before it goes live.` };
  }
  if (r.band === "block") {
    if (override) {
      await logVoiceGate("mcp", tool, "overridden", who, r, override.reason);
      return { note: `VOICE GATE: block overridden on Jesper's approval ("${override.reason}"). Logged.` };
    }
    await logVoiceGate("mcp", tool, "refused", who, r);
    return { refuse: { isError: true, content: [{ type: "text", text: refusalText(tool, r) }] } };
  }
  if (r.band === "flag") {
    await logVoiceGate("mcp", tool, "flagged", who, r);
    return { note: flagText(r) };
  }
  return {};
}

export interface AdminGate {
  response?: NextResponse;
  voice?: ReturnType<typeof refusalBody>["voice"];
}

// For an admin API route. A block without an override returns a 422 the admin editor understands
// (it shows the lines and asks for a reason); with an override the write goes ahead and is logged.
export async function adminVoiceGate(route: string, userId: string | null, inputs: FieldInput[], rawOverride: VoiceOverride | null): Promise<AdminGate> {
  let r: GateResult;
  try {
    r = checkFields(inputs);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await logVoiceGate("admin", route, "error", { userId }, null, null, msg.slice(0, 300));
    return {};
  }
  if (r.band === "block") {
    if (rawOverride) {
      await logVoiceGate("admin", route, "overridden", { userId }, r, rawOverride.reason);
      return { voice: refusalBody(r).voice };
    }
    await logVoiceGate("admin", route, "refused", { userId }, r);
    return { response: NextResponse.json(refusalBody(r), { status: 422 }) };
  }
  if (r.band === "flag") {
    await logVoiceGate("admin", route, "flagged", { userId }, r);
    return { voice: refusalBody(r).voice };
  }
  return {};
}
