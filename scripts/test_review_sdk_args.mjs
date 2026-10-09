/** Offline actual upstream parser + locked SDK spawn capture. Never launches CLI. */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "../site/node_modules/typescript/lib/typescript.js";
import { buildReviewOptions } from "../.github/claude-runtime/options.mjs";
const root = path.resolve(import.meta.dirname, "..");
const cache = path.join(root, ".agent/review-test-deps");
const hash = (p) =>
  crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const parserFile = path.join(cache, "parse-sdk-options.ts");
const sdkFile = path.join(cache, "sdk.mjs");
assert.equal(
  hash(parserFile),
  "b42cc8daa1d15fb00321784cec375b1c855bb2e41bf03b37dfd462385f9e5548",
);
assert.equal(
  hash(sdkFile),
  "86ba133f4d52e80d03f04cb47f1022d5c8010a7971c7ed937a45a629c0bf2cf0",
);
// Same runtime shell-quote substitution used by the coordinator reproduction.
// The actual pinned action parser is unchanged apart from import resolution/type erasure.
const shellPath = path.join(
  root,
  "site/node_modules/next/dist/compiled/shell-quote/index.js",
);
const source = fs
  .readFileSync(parserFile, "utf8")
  .replace(
    'import { parse as parseShellArgs } from "shell-quote";',
    `import shellQuote from ${JSON.stringify(pathToFileURL(shellPath).href)}; const {parse: parseShellArgs} = shellQuote;`,
  );
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { parseSdkOptions } = await import(
  "data:text/javascript;base64," + Buffer.from(compiled).toString("base64")
);
const { query } = await import(pathToFileURL(sdkFile).href);
async function capture(options) {
  let captured;
  try {
    for await (const unused of query({
      prompt: "Offline argv capture only",
      options: {
        ...options,
        pathToClaudeCodeExecutable: "/bin/false",
        spawnClaudeCodeProcess(spec) {
          captured = spec;
          throw new Error("BG5_STOP_BEFORE_SPAWN");
        },
      },
    }))
      throw new Error("Unexpected SDK output before spawn interception");
  } catch (error) {
    if (!captured) throw error;
    assert.match(String(error), /BG5_STOP_BEFORE_SPAWN/);
  }
  assert.ok(
    captured,
    "Actual SDK must reach the non-launching capture callback",
  );
  return captured;
}
const broken = parseSdkOptions({
  claudeArgs: '--tools "" --setting-sources "" --safe-mode',
}).sdkOptions;
assert.equal(broken.extraArgs.tools, null);
assert.deepEqual(broken.settingSources, ["user", "project", "local"]);
const old = await capture({ ...broken, env: {} });
assert.ok(old.args.includes("--tools"));
assert.ok(old.args.includes("--setting-sources=user,project,local"));
const options = buildReviewOptions({
  apiKey: "OFFLINE_UNUSED_PLACEHOLDER",
  cwd: root,
  searchPath: "/bin",
});
assert.deepEqual(options.tools, []);
assert.deepEqual(options.settingSources, []);
assert.deepEqual(options.mcpServers, {});
assert.equal(options.strictMcpConfig, true);
assert.equal(options.permissionMode, "plan");
assert.equal(options.persistSession, false);
assert.deepEqual(Object.keys(options.env).sort(), [
  "ANTHROPIC_API_KEY",
  "PATH",
]);
process.env.BG5_TEST_SECRET_SENTINEL = "MUST_NOT_REACH_CHILD";
let isolated;
try {
  isolated = await capture(options);
} finally {
  delete process.env.BG5_TEST_SECRET_SENTINEL;
}
assert.equal(isolated.env.BG5_TEST_SECRET_SENTINEL, undefined);
assert.equal(isolated.env.ANTHROPIC_API_KEY, "OFFLINE_UNUSED_PLACEHOLDER");
assert.deepEqual(
  isolated.args.filter((a) => a.startsWith("--tools")),
  ["--tools="],
);
assert.deepEqual(
  isolated.args.filter((a) => a.startsWith("--setting-sources")),
  ["--setting-sources="],
);
for (const flag of [
  "--strict-mcp-config",
  "--disallowedTools=mcp__*",
  "--permission-mode=plan",
  "--no-session-persistence",
  "--safe-mode",
])
  assert.ok(isolated.args.includes(flag), flag);
assert.equal(
  isolated.args.some(
    (a) => a.includes("bypassPermissions") || a.includes("dangerously-skip"),
  ),
  false,
);
const lock = JSON.parse(
  fs.readFileSync(path.join(root, ".github/claude-runtime/package-lock.json")),
);
assert.equal(
  lock.packages["node_modules/@anthropic-ai/claude-agent-sdk"].version,
  "0.3.295",
);
assert.equal(
  lock.packages["node_modules/@anthropic-ai/claude-agent-sdk"].integrity,
  "sha512-GaLZbMAqyT4ZCtDQYq2p26bjpqqRfoobVxCK+Ao283I12sGyw2ttMvjdCXclS9VKhs+/IIu8/AtjqyrX73FZ/g==",
);
console.log(
  JSON.stringify(
    {
      method:
        "Actual pinned parser + published SDK 0.3.295; spawn callback throws before any process launch; fake key only; no model/API/CLI call",
      original: {
        tools: broken.extraArgs.tools,
        settingSources: broken.settingSources,
        argv: old.args,
      },
      repaired: {
        tools: options.tools,
        settingSources: options.settingSources,
        argv: isolated.args,
      },
      passed: true,
    },
    null,
    2,
  ),
);
