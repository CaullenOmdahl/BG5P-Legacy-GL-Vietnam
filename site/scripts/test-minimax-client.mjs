import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "lib/chat/minimax.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

const sandbox = {
  exports: {},
  process,
  fetch,
  console,
};

vm.runInNewContext(transpiled.outputText, sandbox, { filename: sourcePath });

const {
  createMiniMaxAnthropicRequestForTest,
  extractMiniMaxAnthropicTextForTest,
} = sandbox.exports;

assert.equal(
  typeof createMiniMaxAnthropicRequestForTest,
  "function",
  "MiniMax client should expose an Anthropic request builder for regression tests"
);
assert.equal(
  typeof extractMiniMaxAnthropicTextForTest,
  "function",
  "MiniMax client should expose Anthropic text extraction for regression tests"
);

const request = createMiniMaxAnthropicRequestForTest(
  [
    { role: "system", name: "BG5P_Diagnostic_Expert", content: "Use BG5P docs only." },
    { role: "user", name: "user", content: "What is flash code 22?" },
  ],
  {
    baseUrl: "https://api.minimax.io",
    model: "MiniMax-M2.7",
    maxTokens: 1800,
    temperature: 1,
    topP: 0.95,
  }
);

assert.equal(request.endpoint, "https://api.minimax.io/anthropic/v1/messages");
assert.equal(request.body.model, "MiniMax-M2.7");
assert.equal(request.body.system, "Use BG5P docs only.");
assert.equal(request.body.max_tokens, 1800);
assert.equal(request.body.temperature, 1);
assert.equal(
  JSON.stringify(request.body.messages),
  JSON.stringify([{ role: "user", content: "What is flash code 22?" }])
);
assert.ok(
  !request.endpoint.includes("chatcompletion_v2"),
  "MiniMax client must not call the deprecated chatcompletion_v2 endpoint"
);

const text = extractMiniMaxAnthropicTextForTest({
  content: [
    { type: "thinking", thinking: "private reasoning" },
    { type: "text", text: "DTC 22 = knock sensor." },
  ],
});

assert.equal(text, "DTC 22 = knock sensor.");

console.log("MiniMax Anthropic client regression tests passed");
