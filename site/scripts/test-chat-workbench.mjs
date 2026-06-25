import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const widget = fs.readFileSync(path.join(root, "components/Bg5ChatWidget.tsx"), "utf8");
const route = fs.readFileSync(path.join(root, "app/api/chat/route.ts"), "utf8");
const page = fs.readFileSync(path.join(root, "app/page.tsx"), "utf8");
const knowledge = fs.readFileSync(path.join(root, "lib/chat/knowledge.ts"), "utf8");
const history = fs.readFileSync(path.join(root, "lib/chat/history.ts"), "utf8");
const manualsClient = fs.readFileSync(path.join(root, "components/ManualsClient.tsx"), "utf8");

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
  "trimUserFirstHistory",
  "setPageContext(getPageContext())",
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
  "BG5_TRUSTED_PROXY_SECRET",
  "x-bg5-trusted-proxy",
  "trimUserFirstHistory",
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
  "isZipBackedArchive",
];

for (const marker of knowledgeRequired) {
  assert.ok(knowledge.includes(marker), `Knowledge routing missing marker: ${marker}`);
}

const historyRequired = [
  "MAX_CHAT_HISTORY_MESSAGES = 8",
  "trimUserFirstHistory",
  "trimmed[0]?.role === \"assistant\"",
];

for (const marker of historyRequired) {
  assert.ok(history.includes(marker), `Chat history helper missing marker: ${marker}`);
}

const trimUserFirstHistory = (messages, maxMessages = 8) => {
  let trimmed = messages.slice(-maxMessages);
  while (trimmed[0]?.role === "assistant") {
    trimmed = trimmed.slice(1);
  }
  return trimmed;
};
const fiveTurnInFlight = [
  "user",
  "assistant",
  "user",
  "assistant",
  "user",
  "assistant",
  "user",
  "assistant",
  "user",
].map((role, index) => ({ role, content: `m${index}` }));
const trimmedHistory = trimUserFirstHistory(fiveTurnInFlight);
assert.equal(trimmedHistory.length, 7);
assert.equal(trimmedHistory[0].role, "user");
assert.equal(trimmedHistory.at(-1).role, "user");
assert.ok(!widget.includes(".slice(-8)"), "Widget must not trim chat history directly");
assert.ok(
  widget.includes("function openPanel()") &&
    widget.indexOf("setPageContext(getPageContext())", widget.indexOf("function openPanel()")) >
      widget.indexOf("function openPanel()"),
  "Floating chat open path should refresh page context"
);
assert.ok(
  !route.includes("if (forwarded) return forwarded.split(\",\")[0].trim();"),
  "API route must not trust unverified X-Forwarded-For for rate limits"
);
assert.ok(
  route.includes("BG5_TRUSTED_PROXY_SECRET") && route.includes("x-bg5-trusted-proxy"),
  "API route should require a trusted proxy marker before forwarded IP rate-limit keys"
);
assert.ok(
  knowledge.includes("isZipBackedArchive") &&
    knowledge.includes("!isZipBackedArchive(filePath)"),
  "Chat manual routes should exclude ZIP-backed PDF archives"
);
assert.ok(
  widget.includes("href.startsWith(\"/\")") && widget.includes("!href.startsWith(\"//\")"),
  "Markdown links should reject protocol-relative external URLs"
);
assert.ok(
  manualsClient.includes("window.location.hash.slice(1)") &&
    manualsClient.includes("setOpenSections") &&
    manualsClient.includes("setOpenSubs") &&
    manualsClient.includes("scrollIntoView"),
  "Manuals hash deeplinks should open their containing section and subsection"
);

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
