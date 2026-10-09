/** Official SDK 0.3.295 isolation options; no shell/action argument parsing. */
export function buildReviewOptions({ apiKey, cwd, searchPath }) {
  return {
    model: "claude-sonnet-4-6",
    effort: "high",
    maxTurns: 1,
    maxBudgetUsd: 5,
    tools: [],
    settingSources: [],
    mcpServers: {},
    strictMcpConfig: true,
    disallowedTools: ["mcp__*"],
    permissionMode: "plan",
    persistSession: false,
    extraArgs: { "safe-mode": null },
    // SDK env replaces the child environment. Never spread runner credentials.
    env: { ANTHROPIC_API_KEY: apiKey, PATH: searchPath },
    cwd,
    outputFormat: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: { report: { type: "string", minLength: 1 } },
        required: ["report"],
        additionalProperties: false,
      },
    },
  };
}
