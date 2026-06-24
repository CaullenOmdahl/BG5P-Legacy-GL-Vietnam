import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = (process.env.BG5_SITE_BASE_URL || "https://bg5.caphedigital.com").replace(/\/$/, "");
const readJson = (relative) =>
  JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const encodeRoutePath = (route) => {
  if (route === "/") return "/";
  return route
    .split("/")
    .map((segment, index) => (index === 0 ? "" : encodeURIComponent(segment)))
    .join("/");
};
const xmlEscape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
const absoluteUrl = (route) => `${baseUrl}${encodeRoutePath(route)}`;
const urlBoundaryChars = String.raw`A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-`;
const hasExactUrlEntry = (content, url) =>
  new RegExp(`(^|[^${urlBoundaryChars}])${escapeRegExp(url)}(?=$|[^${urlBoundaryChars}])`).test(content);

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
assert.ok(fs.existsSync(llmsPath), "Missing public/llms.txt");
assert.ok(fs.existsSync(deeplinkPath), "Missing ../chatgpt-bg5-diagnostic-expert/upload_20_files/11_BG5P_Web_Deeplink_Sitemap.md");

const sitemap = fs.readFileSync(sitemapPath, "utf8");
const robots = fs.readFileSync(robotsPath, "utf8");
const siteIndex = fs.readFileSync(siteIndexPath, "utf8");
const llms = fs.readFileSync(llmsPath, "utf8");
const deeplink = fs.readFileSync(deeplinkPath, "utf8");

assert.match(robots, new RegExp(`Sitemap: ${escapeRegExp(`${baseUrl}/sitemap.xml`)}`));
assert.ok(llms.includes("/llms/site-index.txt"), "llms.txt must link the full site index");

const missingSitemap = [];
const missingSiteIndex = [];
const missingDeeplink = [];
for (const expectedPath of expectedPaths) {
  const url = absoluteUrl(expectedPath);
  if (!sitemap.includes(`<loc>${xmlEscape(url)}</loc>`)) missingSitemap.push(url);
  if (!hasExactUrlEntry(siteIndex, url)) missingSiteIndex.push(url);
  if (!hasExactUrlEntry(deeplink, url)) missingDeeplink.push(url);
}

assert.deepEqual(missingSitemap, [], `sitemap missing ${missingSitemap.length} URL(s):\n${missingSitemap.join("\n")}`);
assert.deepEqual(missingSiteIndex, [], `site-index missing ${missingSiteIndex.length} URL(s):\n${missingSiteIndex.join("\n")}`);
assert.deepEqual(missingDeeplink, [], `chat deeplink sitemap missing ${missingDeeplink.length} URL(s):\n${missingDeeplink.join("\n")}`);

console.log(`Site index coverage passed for ${expectedPaths.size} public HTML page(s)`);
