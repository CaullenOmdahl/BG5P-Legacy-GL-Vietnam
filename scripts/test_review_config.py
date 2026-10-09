"""Exercise the actual trusted workflow controller with adversarial API inputs."""

import json
import re
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
workflow = (root / ".github/workflows/claude-pr-review.yml").read_text()
blocks = re.findall(r"          script: \|\n((?:            .*\n|\n)+)", workflow)
controller = "\n".join(line[12:] for line in blocks[0].splitlines())
# Secret-bearing jobs must never adopt the fork-target event or checkout/execute PR code.
assert "pull_request_target" not in workflow.split("jobs:", 1)[0]
assert "actions/checkout@" not in workflow
assert "contents: write" not in workflow and "pull-requests: write" not in workflow
assert "vars.BG5_CLAUDE_AUTO_REVIEW_ENABLED == 'true'" in workflow
assert "head.repo.full_name == github.repository" in workflow
assert '--tools ""' in workflow and '--disallowedTools "mcp__*"' in workflow
harness = r"""
const assert = require('node:assert/strict');
const source = JSON.parse(require('node:fs').readFileSync(0, 'utf8'));
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
const controller = new AsyncFunction('github', 'core', 'context', 'require', source);
const diff = 'diff --git a/a b/a\n--- a/a\n+++ b/a\n+safe\n';
async function test(change = {}) {
  const outputs = {};
  const pr = {head:{sha:'a'.repeat(40)},base:{sha:'b'.repeat(40)},state:'open',draft:false,changed_files:1,additions:1,deletions:0,...change.pr};
  const body = change.diff ?? diff;
  const github = {rest:{pulls:{get: async arg => ({data:arg.mediaType ? body : pr}), listReviews:'reviews', listFiles:'files'},actions:{listArtifactsForRepo:'artifacts'}},
    paginate: async method => method === 'reviews' ? change.reviews ?? [] : method === 'artifacts' ? change.artifacts ?? [] : change.files ?? [{}]};
  const summary = {addRaw(){return this},async write(){}};
  const core = {setOutput:(key,value)=>outputs[key]=value,summary};
  const context = {repo:{owner:'CaullenOmdahl',repo:'BG5P-Legacy-GL-Vietnam'},payload:{pull_request:{number:2,head:{sha:'a'.repeat(40)}}}};
  await controller(github,core,context,require);
  return outputs;
}
(async () => {
  assert.equal((await test()).ready, 'true');
  for (const input of [
    {pr:{head:{sha:'c'.repeat(40)}}}, {pr:{draft:true}}, {pr:{state:'closed'}},
    {reviews:[{commit_id:'a'.repeat(40),user:{login:'claude[bot]'},body:'completed'}]},
    {artifacts:[{name:'claude-review-pr-2-'+ 'a'.repeat(40),expired:false}]},
    {diff:diff+'x'.repeat(120001)}, {diff:diff+'Binary files differ\n'},
    {pr:{additions:2}}, {pr:{changed_files:2}},
  ]) assert.equal((await test(input)).ready, undefined, JSON.stringify(input).slice(0,100));
  globalThis.untrustedExecuted = false;
  const attack = diff.replace('+safe', '+${globalThis.untrustedExecuted=true}; `$(env)`');
  const result = await test({diff:attack});
  assert.equal(result.ready, 'true');
  assert.equal(globalThis.untrustedExecuted, false);
  assert.ok(result.prompt.includes(attack));
  console.log('Review controller: frozen heads, drafts/closed, duplicates, size/binary/completeness and inert untrusted payload checks passed. No API/model calls.');
})();
"""
subprocess.run(
    ["node", "-e", harness],
    input=json.dumps(controller),
    text=True,
    check=True,
    cwd=root,
)
