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
assert "buildReviewOptions" in workflow
assert "anthropics/claude-code-action@" not in workflow
harness = r"""
const assert = require('node:assert/strict');
const source = JSON.parse(require('node:fs').readFileSync(0, 'utf8'));
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
const controller = new AsyncFunction('github', 'core', 'context', 'require', source);
const A = 'a'.repeat(40), BASE = 'b'.repeat(40), MERGE_BASE = 'c'.repeat(40), B = 'd'.repeat(40);
const diff = 'diff --git a/a b/a\n--- a/a\n+++ b/a\n+safe\n';
async function test(change = {}) {
  const outputs = {}, requests = [];
  const pr = {head:{sha:A,repo:{full_name:'CaullenOmdahl/BG5P-Legacy-GL-Vietnam'}},base:{sha:BASE},
    author_association:'OWNER',state:'open',draft:false,changed_files:1,additions:1,deletions:0,...change.pr};
  let current = pr, reads = 0;
  const body = change.diff ?? diff;
  const github = {rest:{pulls:{
    get: async arg => {
      assert.equal(arg.mediaType, undefined, 'Mutable PR diff acquisition is forbidden');
      reads++;
      return {data: reads === 1 ? pr : current};
    }, listReviews:'reviews', listFiles: () => {throw new Error('Mutable PR files acquisition is forbidden');}
  },repos:{compareCommitsWithBasehead:async arg => {
    requests.push(arg);
    assert.equal(arg.owner,'CaullenOmdahl');
    assert.equal(arg.repo,'BG5P-Legacy-GL-Vietnam');
    if (!arg.mediaType) {
      assert.equal(arg.basehead,`${BASE}...${A}`, 'Metadata must use frozen full commit IDs');
      if (change.race) current = {...pr,head:{...pr.head,sha:B}};
      if (change.after) current = {...pr,...change.after};
      return {data:{base_commit:{sha:change.compareBase ?? BASE},merge_base_commit:{sha:change.mergeBase ?? MERGE_BASE},
        files:change.files ?? [{additions:1,deletions:0}]}};
    }
    assert.equal(arg.basehead,`${MERGE_BASE}...${A}`, 'Diff must use frozen merge-base/head IDs');
    assert.equal(arg.mediaType.format, 'diff');
    // The mutable PR would now return B content with identical file/line counts.
    // Immutable comparison still returns A, even if the PR briefly moves A→B→A.
    if (change.race === 'transient') current = pr;
    return {data:body};
  }},actions:{listArtifactsForRepo:'artifacts'}},
    paginate: async method => method === 'reviews' ? change.reviews ?? [] : change.artifacts ?? []};
  const summary = {addRaw(){return this},async write(){}};
  const core = {setOutput:(key,value)=>outputs[key]=value,summary};
  const context = {repo:{owner:'CaullenOmdahl',repo:'BG5P-Legacy-GL-Vietnam'},payload:{pull_request:{number:2,head:{sha:A}}}};
  await controller(github,core,context,require);
  return outputs;
}
(async () => {
  const stable = await test();
  assert.equal(stable.ready, 'true');
  assert.equal(stable.head, A);
  assert.equal(stable.base, BASE);
  assert.equal(stable.merge_base, MERGE_BASE);
  for (const input of [
    {pr:{head:{sha:B}}}, {pr:{draft:true}}, {pr:{state:'closed'}},
    {reviews:[{commit_id:A,user:{login:'claude[bot]'},body:'completed'}]},
    {artifacts:[{name:'claude-review-pr-2-'+A,expired:false}]},
    {diff:diff+'x'.repeat(120001)}, {diff:diff+'Binary files differ\n'},
    {files:[{additions:2,deletions:0}]}, {files:[{additions:1,deletions:0}, {additions:0,deletions:0}]},
    {files:Array.from({length:300},()=>({additions:0,deletions:0}))}, {files:[]},
    {race:'persistent'}, {after:{base:{sha:B}}}, {after:{draft:true}}, {after:{state:'closed'}},
    {after:{author_association:'NONE'}}, {after:{head:{sha:A,repo:{full_name:'untrusted/fork'}}}},
  ]) assert.equal((await test(input)).ready, undefined, JSON.stringify(input).slice(0,100));
  await assert.rejects(test({compareBase:B}), /frozen base/);
  await assert.rejects(test({mergeBase:'main'}), /frozen base/);
  const transient = await test({race:'transient'});
  assert.equal(transient.ready, 'true');
  assert.equal(transient.head, A);
  assert.ok(transient.prompt.includes('+safe'));
  assert.ok(!transient.prompt.includes('NEW_HEAD_B_CONTENT'));
  console.log('Same-count A→B race skipped; transient A→B→A still reads immutable A, with frozen base/merge-base/head bindings.');
  globalThis.untrustedExecuted = false;
  const attack = diff.replace('+safe', '+${globalThis.untrustedExecuted=true}; `$(env)`');
  const result = await test({diff:attack});
  assert.equal(result.ready, 'true');
  assert.equal(globalThis.untrustedExecuted, false);
  assert.ok(result.prompt.includes(attack));
  console.log('Review controller: immutable comparisons, eligibility, duplicates, API caps, size/binary/completeness and inert untrusted payload checks passed. No API/model calls.');
})();
"""
subprocess.run(
    ["node", "-e", harness],
    input=json.dumps(controller),
    text=True,
    check=True,
    cwd=root,
)
