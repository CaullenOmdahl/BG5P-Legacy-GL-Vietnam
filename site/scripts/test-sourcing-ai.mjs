import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bg5-ai-test-"));
try {
  fs.mkdirSync(path.join(dir, "chat"));
  for (const name of ["sourcing", "i18n", "chat/knowledge"]) {
    const source = fs.readFileSync("lib/" + name + ".ts", "utf8");
    const out = ts
      .transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      })
      .outputText.replaceAll('"@/lib/i18n"', '"../i18n.mjs"')
      .replaceAll("'../sourcing'", "'../sourcing.mjs'")
      .replaceAll('"../sourcing"', '"../sourcing.mjs"');
    fs.writeFileSync(path.join(dir, name + ".mjs"), out);
  }
  const k = await import(path.join(dir, "chat/knowledge.mjs"));
  const data = JSON.parse(fs.readFileSync("public/data/sourcing.json"));
  for (const query of [
    "D722",
    "09.5673.11",
    "brake pads for my car",
    "clutch",
    "16546AA020",
    "timing belt",
  ]) {
    const r = k.retrieveKnowledge(query);
    assert.ok(
      r.context.startsWith("{"),
      "Canonical context must precede historical excerpts",
    );
    assert.ok(r.context.includes(data.content_version));
    assert.ok(r.context.includes("rear_brakes"));
    assert.ok(
      r.context.length < 24500,
      `Bounded context for ${query}: ${r.context.length}`,
    );
    const first = JSON.parse(r.context.split("\n\n---\n\n")[0]);
    assert.equal(first.vehicle.facts.build_date.value, null);
    assert.ok(first.rules.toLowerCase().includes("unreviewed"));
    if (query === "clutch")
      assert.equal(first.procedures[0].review_status, "unreviewed");
  }
  assert.ok(
    k
      .retrievePublicLinks("D722", [])
      .some((s) => s.url.endsWith("/find-part/reference-p78009")),
  );
  console.log(
    "Canonical AI context, conditional facts, public part links, procedures and bounded retrieval passed; no model API invoked.",
  );
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
