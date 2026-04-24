import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolContext } from "./index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerPing(server: McpServer, _ctx: ToolContext) {
  server.registerTool(
    "ping",
    {
      title: "Ping",
      description: "Health check. Returns 'pong' and the current server time. Use this to confirm the MCP connection is working.",
      inputSchema: {},
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `pong at ${new Date().toISOString()}`,
          },
        ],
      };
    },
  );
}
