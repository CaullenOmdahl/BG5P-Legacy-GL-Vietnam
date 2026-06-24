import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const widget = fs.readFileSync(path.join(root, "components/Bg5ChatWidget.tsx"), "utf8");
const route = fs.readFileSync(path.join(root, "app/api/chat/route.ts"), "utf8");
const page = fs.readFileSync(path.join(root, "app/page.tsx"), "utf8");
const knowledge = fs.readFileSync(path.join(root, "lib/chat/knowledge.ts"), "utf8");

const widgetRequired = [
  "Locale",
  "vi",
  "diagnose",
  "decode-code",
  "find-part",
  "find-manual",
  "diagnosticSession",
  "pageContext",
  "CHAT_MESSAGES_STORAGE_KEY",
  "loadPersistedMessages",
  "savePersistedMessages",
  "MAX_PERSISTED_MESSAGES",
  "getEffectiveLocale",
  "SITE_LOCALE_EVENT",
  "aria-live=\"polite\"",
  "autoComplete=\"off\"",
  "Useful Links",
  "Copy Checklist",
  "Start Over",
  "setMode",
  "renderImageMarkdown",
  "isImageHref",
  "inlineSourcePreview",
  "![",
];

for (const marker of widgetRequired) {
  assert.ok(widget.includes(marker), `Widget missing marker: ${marker}`);
}

const routeRequired = [
  "locale",
  "pageContext",
  "diagnosticMode",
  "intake",
  "Vietnamese",
  "Mode-specific behavior",
  "Structured user context",
  "Inline diagram images are allowed when using public bg5.caphedigital.com diagram URLs",
];

for (const marker of routeRequired) {
  assert.ok(route.includes(marker), `API route missing marker: ${marker}`);
}

const knowledgeRequired = [
  "exactDiagramCode",
  "exactMaintenanceId",
  "prioritizeSpecificPublicLinks",
  "11_BG5P_Web_Deeplink_Sitemap.md",
  "00_BG5P_Diagnostic_Expert_Source_Map.md",
];

for (const marker of knowledgeRequired) {
  assert.ok(knowledge.includes(marker), `Knowledge routing missing marker: ${marker}`);
}

const exactDiagramPatternMatch = knowledge.match(/exactDiagramCode[\s\S]*?query\.match\((\/[^\n]+\/[a-z]*)\)/);
assert.ok(exactDiagramPatternMatch, "Knowledge routing missing exact diagram pattern");
const exactDiagramPattern = Function(`return ${exactDiagramPatternMatch[1]}`)();
const extractDiagramCode = (query) => {
  const match = query.match(exactDiagramPattern);
  return match ? `${match[1]}_${match[2]}` : null;
};
assert.equal(extractDiagramCode("032_01"), "032_01");
assert.equal(extractDiagramCode("032-01"), "032_01");
assert.equal(extractDiagramCode("B11_032_01_LH_2_LR.gif"), "032_01");
assert.equal(
  extractDiagramCode("https://bg5.caphedigital.com/diagrams/engine/B11_032_01_LH_2_LR.gif"),
  "032_01"
);
assert.equal(extractDiagramCode("1032_01"), null);
assert.equal(extractDiagramCode("032_011"), null);

const imageHrefPatternMatch = widget.match(/isImageHref[\s\S]*?test\(([^)]+)\);/);
assert.ok(imageHrefPatternMatch, "Widget missing image extension pattern");
const imageHrefPattern = /\.(gif|png|jpe?g|webp)$/i;
const isImageHref = (href) => {
  const [withoutHash] = href.split("#", 1);
  const [pathname] = withoutHash.split("?", 1);
  return imageHrefPattern.test(pathname);
};
const isSafeLocalDiagramImageHref = (href) => {
  if (!href.startsWith("/diagrams/")) return false;
  try {
    const url = new URL(href, "https://bg5.caphedigital.com");
    if (url.origin !== "https://bg5.caphedigital.com") return false;
    const decodedPath = decodeURIComponent(url.pathname);
    if (decodedPath.split("/").includes("..")) return false;
    return decodedPath.startsWith("/diagrams/");
  } catch {
    return false;
  }
};
const isAllowedImageHref = (href) => {
  if (!isImageHref(href)) return false;
  if (isSafeLocalDiagramImageHref(href)) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && url.hostname === "bg5.caphedigital.com";
  } catch {
    return false;
  }
};
assert.equal(isAllowedImageHref("/diagrams/foo.GIF"), true);
assert.equal(
  isAllowedImageHref("https://bg5.caphedigital.com/diagrams/foo.webp?x=1#y"),
  true
);
assert.equal(isAllowedImageHref("/diagrams/../foo.png"), false);
assert.equal(isAllowedImageHref("/diagrams/%2e%2e/foo.png"), false);
assert.equal(isAllowedImageHref("http://bg5.caphedigital.com/foo.gif"), false);
assert.equal(isAllowedImageHref("https://bg5.caphedigital.com.evil/foo.gif"), false);
assert.equal(isAllowedImageHref("https://bg5.caphedigital.com/foo.txt"), false);

assert.ok(page.includes("Bg5HomeAssistant"), "Homepage should expose the AI-first ask bar");
assert.ok(!widget.includes("Retrieved Sources"), "Widget must not expose internal source wording");
assert.ok(!route.includes("sources: retrieval.sources"), "API must not return hidden RAG sources");
assert.ok(!widget.includes("id=\"bg5-locale\""), "Chat should not ask for a separate AI language");

console.log("Chat workbench regression tests passed");
