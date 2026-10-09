import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bg5-search-test-"));
try {
  const source = fs.readFileSync("lib/sourcing.ts", "utf8");
  const file = path.join(dir, "sourcing.mjs");
  fs.writeFileSync(
    file,
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  );
  const { findParts, getSourcing } = await import(file);
  const data = getSourcing();
  assert.equal(findParts(data, "16546-AA020")[0].match, "exact");
  assert.equal(findParts(data, "D722")[0].part.number, "P 78 009");
  assert.equal(findParts(data, "09-5673-11")[0].part.number, "09.5673.11");
  assert.ok(
    findParts(data, "26310AC060").some(
      (r) => r.part.number === "09.5673.11" && r.match === "related",
    ) === false,
    "Do not infer transitive equivalence",
  );
  assert.ok(
    findParts(data, "26310AC06A").some(
      (r) => r.part.number === "09.5673.11" && r.match === "related",
    ),
  );
  assert.ok(findParts(data, "", { status: "confirmed" }).length === 0);
  assert.ok(
    findParts(data, "", { position: "rear" }).some(
      (r) => r.part.position === "unknown",
    ),
  );
  assert.ok(
    findParts(data, "", { configuration: "owner-candidates" }).every(
      (r) => r.part.fitment.status !== "rejected",
    ),
  );
  assert.ok(
    findParts(data, "", { configuration: "source-variants" }).every(
      (r) => r.part.catalog,
    ),
  );
  assert.equal(
    findParts(data, "", { section: "steering" }).length,
    data.parts.filter((p) => p.section === "steering").length,
  );
  console.log(
    "Sourcing search: normalized OEM/SKU, explicit relationships, variants and unknown-preserving filters passed.",
  );
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
