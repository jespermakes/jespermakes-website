const ISSUER = process.env.MCP_ISSUER_URL || "https://jespermakes.com";

export function protectedResourceMetadata() {
  return {
    resource: `${ISSUER}/mcp`,
    authorization_servers: [ISSUER],
    bearer_methods_supported: ["header"],
    resource_documentation: `${ISSUER}/admin/mcp-tokens`,
  };
}

export function authorizationServerMetadata() {
  return {
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/mcp/authorize`,
    token_endpoint: `${ISSUER}/api/mcp/oauth/token`,
    registration_endpoint: `${ISSUER}/api/mcp/oauth/register`,
    revocation_endpoint: `${ISSUER}/api/mcp/oauth/revoke`,
    scopes_supported: ["mcp"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    service_documentation: `${ISSUER}/admin/mcp-tokens`,
  };
}
