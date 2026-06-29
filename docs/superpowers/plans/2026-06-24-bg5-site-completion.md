# BG5P Site Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the documented BG5P site issues: missing env docs, incomplete site indexing, missing parts extraction, broad chat links, non-persistent chat history, and lack of inline diagram/image rendering.

**Architecture:** Treat site discoverability as generated artifacts from local JSON data, not hand-maintained lists. Treat chat link routing and rendering as deterministic UI/API behavior around the model, so correctness can be tested without relying on a live MiniMax response. Treat parts completion as a data pipeline gate: fill missing categories, rebuild generated assets, and fail verification while any diagram remains empty.

**Tech Stack:** Next.js app router, React, TypeScript, Node scripts, Python data-generation scripts, local JSON assets under `site/public/data`, generated LLM assets under `site/public/llms` and `site/chatbot-knowledge`.

---

## Current Evidence

- `site/.env.example` is referenced by `site/README.md` but does not exist.
- No `site/app/sitemap.*`, `site/app/robots.*`, `site/public/sitemap.xml`, or `site/public/robots.txt` exists locally.
- Expected public HTML pages from local data: 292 total.
- `site/chatbot-knowledge/11_BG5P_Web_Deeplink_Sitemap.md` covers 291 of those 292 pages; it misses `https://bg5.caphedigital.com/about`.
- `site/public/llms.txt` mentions only 13 of the 292 public HTML paths, so it is a router, not a full site index.
- `python3 site/scripts/verify_parts_coverage.py` currently fails: 93 diagram pages across 68 category codes have no parts data.
- `site/components/Bg5ChatWidget.tsx` persists mode/intake, but message history is React state only.
- `site/components/Bg5ChatWidget.tsx` renders markdown links and tables, but not image markdown or source-link image previews.

## Files By Responsibility

- `site/.env.example`: local and production chatbot env variable template.
- `site/README.md`: human-facing status; remove or mark resolved items only after verification passes.
- `site/package.json`: add repeatable verification and generation commands.
- `site/scripts/generate-llms.py`: generate `llms.txt`, detail files, and the full site index file.
- `site/scripts/generate-site-index.mjs`: generate SEO artifacts (`sitemap.xml`, `robots.txt`) from local JSON data and public assets.
- `site/scripts/verify-site-index.mjs`: verify SEO artifacts, LLM index coverage, and chatbot deeplink coverage.
- `scripts/build_chatgpt_deeplink_sitemap.py`: add the missing About page and keep chatbot deeplinks generated.
- `site/scripts/fill_missing_parts.py`: fill missing parts categories from local CSVs or epc-data.
- `site/scripts/verify_parts_coverage.py`: completion gate for parts data.
- `site/lib/chat/knowledge.ts`: improve public-link retrieval ranking and exact URL selection.
- `site/components/Bg5ChatWidget.tsx`: persist messages and render inline images/source previews.
- `site/scripts/test-chat-workbench.mjs`: regression checks for chat persistence, link routing markers, and image rendering markers.

---

### Task 1: Add Baseline Verification Scripts

**Files:**
- Create: `site/scripts/verify-site-index.mjs`
- Modify: `site/package.json`

- [ ] **Step 1: Write the failing index coverage script**

Create `site/scripts/verify-site-index.mjs` with this behavior:

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = "https://bg5.caphedigital.com";
const readJson = (relative) =>
  JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

const sections = readJson("public/data/sections.json");
const maintenance = readJson("public/data/maintenance.json");

const expectedPaths = new Set(["/", "/about", "/manuals", "/parts", "/maintenance"]);
for (const card of maintenance) expectedPaths.add(`/maintenance/${card.id}`);
for (const section of sections) {
  expectedPaths.add(`/parts/${section.slug}`);
  for (const diagram of section.diagrams) {
    expectedPaths.add(`/parts/${section.slug}/${diagram.code.replaceAll("_", "-")}`);
  }
}

const sitemapPath = path.join(root, "public/sitemap.xml");
const robotsPath = path.join(root, "public/robots.txt");
const siteIndexPath = path.join(root, "public/llms/site-index.txt");
const llmsPath = path.join(root, "public/llms.txt");
const deeplinkPath = path.join(root, "../chatgpt-bg5-diagnostic-expert/upload_20_files/11_BG5P_Web_Deeplink_Sitemap.md");

assert.ok(fs.existsSync(sitemapPath), "Missing public/sitemap.xml");
assert.ok(fs.existsSync(robotsPath), "Missing public/robots.txt");
assert.ok(fs.existsSync(siteIndexPath), "Missing public/llms/site-index.txt");

const sitemap = fs.readFileSync(sitemapPath, "utf8");
const robots = fs.readFileSync(robotsPath, "utf8");
const siteIndex = fs.readFileSync(siteIndexPath, "utf8");
const llms = fs.readFileSync(llmsPath, "utf8");
const deeplink = fs.readFileSync(deeplinkPath, "utf8");

assert.match(robots, /Sitemap: https:\/\/bg5\.caphedigital\.com\/sitemap\.xml/);
assert.ok(llms.includes("/llms/site-index.txt"), "llms.txt must link the full site index");

const missingSitemap = [];
const missingSiteIndex = [];
const missingDeeplink = [];
for (const expectedPath of expectedPaths) {
  const url = `${baseUrl}${expectedPath === "/" ? "/" : expectedPath}`;
  if (!sitemap.includes(`<loc>${url}</loc>`)) missingSitemap.push(url);
  if (!siteIndex.includes(url)) missingSiteIndex.push(url);
  if (!deeplink.includes(url)) missingDeeplink.push(url);
}

assert.deepEqual(missingSitemap, [], `sitemap missing ${missingSitemap.length} URL(s):\n${missingSitemap.join("\n")}`);
assert.deepEqual(missingSiteIndex, [], `site-index missing ${missingSiteIndex.length} URL(s):\n${missingSiteIndex.join("\n")}`);
assert.deepEqual(missingDeeplink, [], `chat deeplink sitemap missing ${missingDeeplink.length} URL(s):\n${missingDeeplink.join("\n")}`);

console.log(`Site index coverage passed for ${expectedPaths.size} public HTML page(s)`);
```

- [ ] **Step 2: Run the script to verify the current failure**

Run:

```bash
cd site
node scripts/verify-site-index.mjs
```

Expected: FAIL with `Missing public/sitemap.xml`.

- [ ] **Step 3: Add package scripts**

Modify `site/package.json` scripts to include:

```json
"generate:llms": "python3 scripts/generate-llms.py",
"generate:index": "node scripts/generate-site-index.mjs && python3 scripts/generate-llms.py",
"verify:index": "node scripts/verify-site-index.mjs",
"verify:parts": "python3 scripts/verify_parts_coverage.py",
"test:chat-workbench": "node scripts/test-chat-workbench.mjs"
```

- [ ] **Step 4: Commit the verification harness**

```bash
git add site/scripts/verify-site-index.mjs site/package.json
git commit -m "test: add BG5P site index coverage check"
```

---

### Task 2: Generate Complete Local Site Indexes

**Files:**
- Create: `site/scripts/generate-site-index.mjs`
- Generated: `site/public/sitemap.xml`
- Generated: `site/public/robots.txt`
- Modify: `site/scripts/generate-llms.py`
- Generated: `site/public/llms/site-index.txt`
- Modify: `scripts/build_chatgpt_deeplink_sitemap.py`
- Generated: `chatgpt-bg5-diagnostic-expert/upload_20_files/11_BG5P_Web_Deeplink_Sitemap.md`
- Generated: `site/chatbot-knowledge/11_BG5P_Web_Deeplink_Sitemap.md`

- [ ] **Step 1: Create SEO index generator**

Create `site/scripts/generate-site-index.mjs` with this behavior:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = (process.env.BG5_SITE_BASE_URL || "https://bg5.caphedigital.com").replace(/\/$/, "");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

const sections = readJson("public/data/sections.json");
const maintenance = readJson("public/data/maintenance.json");

function absoluteUrl(route) {
  return `${baseUrl}${route === "/" ? "/" : route}`;
}

function htmlRoutes() {
  const routes = ["/", "/about", "/manuals", "/parts", "/maintenance"];
  for (const card of maintenance) routes.push(`/maintenance/${card.id}`);
  for (const section of sections) {
    routes.push(`/parts/${section.slug}`);
    for (const diagram of section.diagrams) {
      routes.push(`/parts/${section.slug}/${diagram.code.replaceAll("_", "-")}`);
    }
  }
  return Array.from(new Set(routes));
}

const urls = htmlRoutes().map((route) => `  <url><loc>${absoluteUrl(route)}</loc></url>`);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  '</urlset>',
  '',
].join("\n");

const robots = [
  "User-agent: *",
  "Allow: /",
  "",
  `Sitemap: ${baseUrl}/sitemap.xml`,
  "",
].join("\n");

fs.writeFileSync(path.join(root, "public/sitemap.xml"), sitemap);
fs.writeFileSync(path.join(root, "public/robots.txt"), robots);
console.log(`Wrote sitemap.xml and robots.txt for ${urls.length} HTML route(s)`);
```

- [ ] **Step 2: Extend `generate-llms.py` with a full site index**

Add a section after parts-index generation that writes `OUT_DIR / "site-index.txt"` with:

```text
# BG5P Full Site Index

## Public HTML Pages
https://bg5.caphedigital.com/
https://bg5.caphedigital.com/about
https://bg5.caphedigital.com/manuals
https://bg5.caphedigital.com/parts
https://bg5.caphedigital.com/maintenance
...

## Diagram Image Assets
https://bg5.caphedigital.com/diagrams/...

## Manual PDF Assets
https://bg5.caphedigital.com/manuals/...
```

Implementation details:
- Use the same sections and maintenance arrays already loaded in `main()`.
- Generate all 292 public HTML URLs.
- Generate all diagram image URLs from `diagram["imagePath"]`.
- Recursively list non-archive PDFs under `site/public/manuals`.
- Encode spaces with `urllib.parse.quote`.
- Add `- [Full Site Index](/llms/site-index.txt): all public pages, diagram images, and manual PDFs` to the top-level `llms.txt`.

- [ ] **Step 3: Add the About page to the chatbot deeplink generator**

Modify `scripts/build_chatgpt_deeplink_sitemap.py` in the `Top-Level Pages` table to include:

```python
{
    "name": "About",
    "url": abs_url("/about"),
    "when_to_share": "Vehicle background, market notes, and site scope.",
},
```

- [ ] **Step 4: Regenerate indexes and chatbot knowledge**

Run:

```bash
cd site
npm run generate:index
cd ..
python3 scripts/build_chatgpt_deeplink_sitemap.py
python3 scripts/build_site_chatbot_knowledge.py
```

Expected:
- `site/public/sitemap.xml` exists.
- `site/public/robots.txt` exists.
- `site/public/llms/site-index.txt` exists.
- `chatgpt-bg5-diagnostic-expert/upload_20_files/11_BG5P_Web_Deeplink_Sitemap.md` includes `/about`.
- `site/chatbot-knowledge/11_BG5P_Web_Deeplink_Sitemap.md` includes `/about`.

- [ ] **Step 5: Verify index coverage**

Run:

```bash
cd site
npm run verify:index
```

Expected: `Site index coverage passed for 292 public HTML page(s)`.

- [ ] **Step 6: Commit complete indexing**

```bash
git add site/scripts/generate-site-index.mjs site/scripts/generate-llms.py scripts/build_chatgpt_deeplink_sitemap.py site/public/sitemap.xml site/public/robots.txt site/public/llms.txt site/public/llms/site-index.txt chatgpt-bg5-diagnostic-expert/upload_20_files/11_BG5P_Web_Deeplink_Sitemap.md site/chatbot-knowledge/11_BG5P_Web_Deeplink_Sitemap.md site/chatbot-knowledge/manifest.json
git commit -m "feat: generate complete BG5P site indexes"
```

---

### Task 3: Add Environment Template

**Files:**
- Create: `site/.env.example`

- [ ] **Step 1: Create env template**

Create `site/.env.example`:

```bash
# Required for /api/chat in production and local chat testing.
MINIMAX_API_KEY=

# Optional MiniMax settings.
MINIMAX_API_BASE=https://api.minimax.io
MINIMAX_MODEL=MiniMax-M2.7-highspeed
MINIMAX_MAX_TOKENS=1800
MINIMAX_TEMPERATURE=1
MINIMAX_TOP_P=0.95

# Optional generator override for sitemap, robots, deeplinks, and LLM index URLs.
BG5_SITE_BASE_URL=https://bg5.caphedigital.com
```

- [ ] **Step 2: Verify README reference is now true**

Run:

```bash
test -f site/.env.example && rg -n "MINIMAX_API_KEY|BG5_SITE_BASE_URL" site/.env.example
```

Expected: both variables are printed.

- [ ] **Step 3: Commit env template**

```bash
git add site/.env.example site/README.md
git commit -m "docs: add BG5P site environment template"
```

---

### Task 4: Complete Parts Data Extraction

**Files:**
- Modify/generated: `site/public/data/parts.json`
- Generated: `site/public/llms/*.txt`
- Generated: `site/public/llms/maintenance/*.txt`
- Generated: `site/public/llms/parts-index.txt`
- Generated: `chatgpt-bg5-diagnostic-expert/upload_20_files/08_BG5P_Maintenance_Parts_LLM_Corpus.md`
- Generated: `site/chatbot-knowledge/08_BG5P_Maintenance_Parts_LLM_Corpus.md`
- Possibly created: `parts-catalog/{engine,body,trans,electric}/<category>/parts.csv`

- [ ] **Step 1: Confirm failing parts gate**

Run:

```bash
python3 site/scripts/verify_parts_coverage.py
```

Expected before the fix: `Missing parts data for 93 diagram page(s) across 68 category code(s).`

- [ ] **Step 2: Fill from local cached CSVs first**

Run:

```bash
python3 site/scripts/fill_missing_parts.py --local-only
```

Expected:
- If cached rows exist, `site/public/data/parts.json` gains categories.
- If some categories remain, output ends with `Still missing: ...`.

- [x] **Step 3: Fill remaining categories from epc-data**

Run:

```bash
python3 site/scripts/fill_missing_parts.py --delay 8 --retries 4
```

Expected:
- New `parts-catalog/.../parts.csv` files for missing categories.
- `site/public/data/parts.json` updated incrementally.
- Exit 0 when every diagram prefix has rows or a checked status.

- [x] **Step 4: Rebuild generated data after successful extraction**

Run:

```bash
python3 site/scripts/build_data.py
python3 site/scripts/generate-llms.py
python3 scripts/build_chatgpt_bg5_pack.py
python3 scripts/build_chatgpt_deeplink_sitemap.py
python3 scripts/build_site_chatbot_knowledge.py
```

Expected:
- `site/public/data/parts.json` contains extracted row categories and `site/public/data/parts-status.json` documents checked-empty categories.
- `site/public/llms/*.txt` contains source-aware status text instead of missing-data placeholders.
- The chatbot knowledge pack uses the rebuilt parts corpus.

- [x] **Step 5: Verify parts completion**

Run:

```bash
python3 site/scripts/verify_parts_coverage.py
rg -n "old missing-data phrases" site/public/llms site/chatbot-knowledge
```

Expected:
- `All 262 diagram page(s) are resolved`.
- The `rg` command exits 1 because it finds no missing-data phrases.

- [x] **Step 6: Commit parts data completion**

```bash
git add parts-catalog site/public/data/parts.json site/public/llms site/public/llms.txt chatgpt-bg5-diagnostic-expert site/chatbot-knowledge
git commit -m "data: complete BG5P parts extraction"
```

---

### Task 5: Make Chat Links Specific To Pages

**Files:**
- Modify: `site/lib/chat/knowledge.ts`
- Modify: `site/scripts/test-chat-workbench.mjs`

- [ ] **Step 1: Add chat routing regression markers**

Update `site/scripts/test-chat-workbench.mjs` to require these strings in `site/lib/chat/knowledge.ts`:

```js
const knowledgeRequired = [
  "exactDiagramCode",
  "exactMaintenanceId",
  "prioritizeSpecificPublicLinks",
  "11_BG5P_Web_Deeplink_Sitemap.md",
  "00_BG5P_Diagnostic_Expert_Source_Map.md",
];
```

Add a loop like the existing marker loops:

```js
for (const marker of knowledgeRequired) {
  assert.ok(route.includes(marker) || widget.includes(marker) || fs.readFileSync(path.join(root, "lib/chat/knowledge.ts"), "utf8").includes(marker), `Chat link routing missing marker: ${marker}`);
}
```

- [ ] **Step 2: Run marker test to verify failure**

Run:

```bash
cd site
npm run test:chat-workbench
```

Expected: FAIL on `Chat link routing missing marker: exactDiagramCode`.

- [ ] **Step 3: Implement exact link prioritization**

In `site/lib/chat/knowledge.ts`:
- Add `exactDiagramCode(query: string): string | null` that accepts `032_01`, `032-01`, and natural text containing a code.
- Add `exactMaintenanceId(query: string): string | null` that maps known maintenance ids and titles from `maintenance.json`.
- Add `prioritizeSpecificPublicLinks(...)` before the current broad `INTERNAL_SOURCE_LINKS` fallback.
- Exact diagram queries should prefer `/parts/{section-slug}/{diagram-code}` first and the raw `/diagrams/...gif` second.
- Exact maintenance queries should prefer `/maintenance/{id}` first and `/llms/maintenance/{id}.txt` second.
- Manual filename queries should prefer the matching `/manuals/...pdf`.
- Part-number queries should prefer the diagram page containing that part number, then the section page.

- [ ] **Step 4: Verify chat link routing markers**

Run:

```bash
cd site
npm run test:chat-workbench
```

Expected: `Chat workbench regression tests passed`.

- [ ] **Step 5: Commit specific chat linking**

```bash
git add site/lib/chat/knowledge.ts site/scripts/test-chat-workbench.mjs
git commit -m "fix: prioritize exact BG5P chat deeplinks"
```

---

### Task 6: Persist Chat Between Navigation

**Files:**
- Modify: `site/components/Bg5ChatWidget.tsx`
- Modify: `site/scripts/test-chat-workbench.mjs`

- [ ] **Step 1: Add persistence regression markers**

Update `site/scripts/test-chat-workbench.mjs` widget markers:

```js
"CHAT_MESSAGES_STORAGE_KEY",
"loadPersistedMessages",
"savePersistedMessages",
"MAX_PERSISTED_MESSAGES",
```

- [ ] **Step 2: Run marker test to verify failure**

Run:

```bash
cd site
npm run test:chat-workbench
```

Expected: FAIL on `Widget missing marker: CHAT_MESSAGES_STORAGE_KEY`.

- [ ] **Step 3: Implement message persistence**

In `site/components/Bg5ChatWidget.tsx`:
- Add `const CHAT_MESSAGES_STORAGE_KEY = "bg5-chat-messages-v1";`
- Add `const MAX_PERSISTED_MESSAGES = 24;`
- Add `loadPersistedMessages(locale)` that returns persisted messages when valid, otherwise `[createInitialMessage(locale)]`.
- Add `savePersistedMessages(messages)` that stores only `{ id, role, content, sources }` for user and assistant messages.
- Initialize `messages` from `loadPersistedMessages(locale)`.
- Add a `useEffect` that saves messages whenever they change.
- Update `startOver()` to remove `CHAT_MESSAGES_STORAGE_KEY`.
- Keep locale switching behavior: if the only message is initial, replace it with the localized initial message; do not rewrite a real persisted conversation.

- [ ] **Step 4: Verify chat persistence markers**

Run:

```bash
cd site
npm run test:chat-workbench
```

Expected: `Chat workbench regression tests passed`.

- [ ] **Step 5: Commit chat persistence**

```bash
git add site/components/Bg5ChatWidget.tsx site/scripts/test-chat-workbench.mjs
git commit -m "fix: persist BG5P chat history locally"
```

---

### Task 7: Render Diagrams And Images Inline In Chat

**Files:**
- Modify: `site/components/Bg5ChatWidget.tsx`
- Modify: `site/app/api/chat/route.ts`
- Modify: `site/scripts/test-chat-workbench.mjs`

- [ ] **Step 1: Add inline-image regression markers**

Update `site/scripts/test-chat-workbench.mjs` widget markers:

```js
"renderImageMarkdown",
"isImageHref",
"inlineSourcePreview",
"![",
```

Update API route markers:

```js
"Inline diagram images are allowed when using public bg5.caphedigital.com diagram URLs"
```

- [ ] **Step 2: Run marker test to verify failure**

Run:

```bash
cd site
npm run test:chat-workbench
```

Expected: FAIL on `Widget missing marker: renderImageMarkdown`.

- [ ] **Step 3: Implement safe inline image rendering**

In `site/components/Bg5ChatWidget.tsx`:
- Add `isImageHref(href)` for `.gif`, `.png`, `.jpg`, `.jpeg`, `.webp`.
- Add `renderImageMarkdown(line, key)` for markdown image syntax `![alt](href)`.
- Allow only `https://bg5.caphedigital.com/...` and local `/diagrams/...` image URLs.
- In `renderMarkdownBlocks`, detect a line that starts with image markdown before paragraph handling and render:

```tsx
<figure className="my-2 overflow-hidden rounded-md border border-border bg-panel">
  <img src={href} alt={alt} className="max-h-80 w-full object-contain" loading="lazy" />
  {alt && <figcaption className="border-t border-border px-2 py-1 text-[11px] text-muted">{alt}</figcaption>}
</figure>
```

- In the `message.sources` list, render `inlineSourcePreview(source)` above the link when `source.url` is an image URL.

- [ ] **Step 4: Update chatbot API instruction**

In `site/app/api/chat/route.ts`, add this website chatbot rule near the markdown rule:

```ts
"- Inline diagram images are allowed when using public bg5.caphedigital.com diagram URLs, but do not invent image URLs.",
```

- [ ] **Step 5: Verify inline image markers**

Run:

```bash
cd site
npm run test:chat-workbench
```

Expected: `Chat workbench regression tests passed`.

- [ ] **Step 6: Commit inline image support**

```bash
git add site/components/Bg5ChatWidget.tsx site/app/api/chat/route.ts site/scripts/test-chat-workbench.mjs
git commit -m "feat: render BG5P chat diagram images inline"
```

---

### Task 8: Final Documentation Cleanup And Verification

**Files:**
- Modify: `site/README.md`

- [x] **Step 1: Update resolved-work notes after fixes pass**

In `site/README.md`, remove resolved bullets only after their gates pass:
- Remove `Create site/.env.example` after `test -f site/.env.example`.
- Remove indexing-related notes after `npm run verify:index`.
- Remove parts extraction note after `python3 site/scripts/verify_parts_coverage.py`.
- Remove chat-specific link note after exact deeplink tests pass.
- Remove chat persistence note after marker tests pass and manual navigation test passes.
- Remove inline images note after marker tests pass and manual UI test shows a diagram preview.

- [ ] **Step 2: Run all local verification**

Run:

```bash
cd site
npm run check:localization
npm run test:chat-workbench
npm run verify:index
npm run verify:parts
python3 scripts/verify_manual_archive_assets.py
npm run build
```

Expected:
- Localization check passes.
- Chat workbench passes.
- Site index coverage reports 292 public HTML pages.
- Parts coverage reports all 262 diagram pages have parts data.
- Manual archive asset verification passes.
- Next build succeeds.

- [ ] **Step 3: Smoke test generated public URLs**

Run a local server:

```bash
cd site
npm run dev -- -p 3011
```

In another shell:

```bash
curl -fsS http://localhost:3011/sitemap.xml | rg "https://bg5.caphedigital.com/about"
curl -fsS http://localhost:3011/robots.txt | rg "Sitemap:"
curl -fsS http://localhost:3011/llms/site-index.txt | rg "https://bg5.caphedigital.com/parts/engine-main/032-01"
curl -fsS http://localhost:3011/parts/engine-main/032-01 | rg "Oil Pump|OIL PUMP|15208"
```

Expected: every command exits 0.

- [ ] **Step 4: Commit final cleanup**

```bash
git add site/README.md
git commit -m "docs: mark BG5P site completion gates resolved"
```

---

## Final Green Gate

Run from the repository root:

```bash
git status --short
python3 site/scripts/verify_parts_coverage.py
cd site
npm run check:localization
npm run test:chat-workbench
npm run verify:index
npm run build
```

The work is complete only when:
- no unresolved known-issue bullets remain in `site/README.md`,
- `site/public/sitemap.xml` and `site/public/robots.txt` exist,
- `/about` is present in the chat deeplink sitemap,
- `site/public/llms/site-index.txt` covers all public HTML pages,
- all 262 diagram pages have parts data,
- chat messages persist locally across navigation/remount,
- public diagram images can render inline in chat,
- the Next build passes.
