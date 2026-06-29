import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const widget = fs.readFileSync(path.join(root, "components/Bg5ChatWidget.tsx"), "utf8");
const route = fs.readFileSync(path.join(root, "app/api/chat/route.ts"), "utf8");
const page = fs.readFileSync(path.join(root, "app/page.tsx"), "utf8");
const knowledge = fs.readFileSync(path.join(root, "lib/chat/knowledge.ts"), "utf8");
const history = fs.readFileSync(path.join(root, "lib/chat/history.ts"), "utf8");
const manualsClient = fs.readFileSync(path.join(root, "components/ManualsClient.tsx"), "utf8");
const bgChassisPublicIndexPath = path.join(root, "public/manuals/BG-chassis/index.html");
const bgChassisSourceIndexPath = path.join(root, "../manuals/BG-chassis/index.html");
const deprecatedManualIndexAttributes = /\s(?:align|bgcolor|border|cellspacing|width)=/i;

function collectIndexFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectIndexFiles(fullPath);
    return entry.isFile() && entry.name === "index.html" ? [fullPath] : [];
  });
}

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
  "BG5_RATE_LIMIT_SECRET",
  "bg5_chat_session",
  "trimUserFirstHistory",
  "value.replace(/\\s+/g, \" \")",
  "API_ERRORS[locale].providerFailed",
  "createHash",
  "createHmac",
  "timingSafeEqual",
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
  "isTemplatePublicUrl",
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
  widget.includes("messagesHydrated") &&
    widget.includes("setMessages(loadPersistedMessages") &&
    !widget.includes("useState<ChatMessage[]>(() => [\n    ...loadPersistedMessages"),
  "Persisted chat history should load after mount to avoid hydration mismatch"
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
  route.includes("bg5_chat_session") &&
    route.includes("signRateLimitSession") &&
    route.includes("httpOnly: true") &&
    route.includes("sameSite: \"lax\"") &&
    route.includes("session:${signedSessionId}") &&
    route.includes("untrusted:${stableHash") &&
    !route.includes("x-bg5-client-session") &&
    !route.includes("return \"untrusted-proxy-or-local\""),
  "API route should use server-signed session cookies instead of caller-controlled rate keys"
);
assert.ok(
  route.includes("value.replace(/\\s+/g, \" \")") &&
    route.includes("console.error(\"MiniMax chat provider failed\"") &&
    !route.includes("locale === \"vi\" ? API_ERRORS.vi.providerFailed : error.message"),
  "API route should sanitize structured context lines and hide provider details"
);
assert.ok(
  knowledge.includes("isZipBackedArchive") &&
    knowledge.includes("!isZipBackedArchive(filePath)"),
  "Chat manual routes should exclude ZIP-backed PDF archives"
);
assert.ok(
  knowledge.includes("isTemplatePublicUrl") &&
    knowledge.includes(".filter((url) => !isTemplatePublicUrl(url))"),
  "Chat public links should reject sitemap/template URLs"
);
assert.ok(
  widget.includes("href.startsWith(\"/\")") && widget.includes("!href.startsWith(\"//\")"),
  "Markdown links should reject protocol-relative external URLs"
);
assert.ok(
  !widget.includes("X-BG5-Client-Session") &&
    !widget.includes("getClientSessionId()") &&
    !widget.includes("replace(/[`*_>#-]/g"),
  "Widget should rely on server-issued rate-limit cookies and preserve hyphenated copied text"
);

const stripMarkdown = (content) =>
  content
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
assert.equal(
  stripMarkdown("- Check no-OBD mode with 22690-AA310 and https://bg5.caphedigital.com/foo-bar"),
  "Check no-OBD mode with 22690-AA310 and https://bg5.caphedigital.com/foo-bar"
);
assert.equal(
  stripMarkdown("- Open B11_032_01_LH_2_LR.gif for the pressure-sensor hose routing"),
  "Open B11_032_01_LH_2_LR.gif for the pressure-sensor hose routing"
);
assert.ok(
  widget.includes("url.hostname === \"bg5.caphedigital.com\"") &&
    widget.includes("token.startsWith(\"http\") && isSafeHref(token)"),
  "Assistant markdown links should stay on local paths or the trusted BG5 host"
);
assert.ok(
  manualsClient.includes("window.location.hash.slice(1)") &&
    manualsClient.includes("setOpenSections") &&
    manualsClient.includes("setOpenSubs") &&
    manualsClient.includes("scrollIntoView"),
  "Manuals hash deeplinks should open their containing section and subsection"
);
assert.ok(
  fs.existsSync(bgChassisPublicIndexPath) &&
    fs.existsSync(bgChassisSourceIndexPath) &&
    fs.readFileSync(bgChassisPublicIndexPath, "utf8").includes("BODY%20SECTION/index.html") &&
    fs.readFileSync(bgChassisSourceIndexPath, "utf8").includes("BODY%20SECTION/index.html"),
  "BG-chassis static manual section indexes should have an existing parent index"
);
for (const indexPath of [
  ...collectIndexFiles(path.dirname(bgChassisPublicIndexPath)),
  ...collectIndexFiles(path.dirname(bgChassisSourceIndexPath)),
]) {
  assert.ok(
    !deprecatedManualIndexAttributes.test(fs.readFileSync(indexPath, "utf8")),
    `BG-chassis manual index should use CSS instead of deprecated table attributes: ${indexPath}`
  );
}
assert.ok(
  fs.readFileSync(path.join(root, "components/LocaleProvider.tsx"), "utf8").includes(
    "effective !== initialLocale"
  ),
  "Stored locale mismatch should refresh server-rendered route content"
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
