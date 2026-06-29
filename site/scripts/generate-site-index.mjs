import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = (process.env.BG5_SITE_BASE_URL || "https://bg5.caphedigital.com").replace(/\/$/, "");

const readJson = (relative) =>
  JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));

const sections = readJson("public/data/sections.json");
const maintenance = readJson("public/data/maintenance.json");

function encodeRoutePath(route) {
  if (route === "/") return "/";
  return route
    .split("/")
    .map((segment, index) => (index === 0 ? "" : encodeURIComponent(segment)))
    .join("/");
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function absoluteUrl(route) {
  return `${baseUrl}${encodeRoutePath(route)}`;
}

function htmlRoutes() {
  const routes = ["/", "/about", "/manuals", "/parts", "/maintenance"];

  for (const card of maintenance) {
    routes.push(`/maintenance/${card.id}`);
  }

  for (const section of sections) {
    routes.push(`/parts/${section.slug}`);
    for (const diagram of section.diagrams) {
      routes.push(`/parts/${section.slug}/${diagram.code.replaceAll("_", "-")}`);
    }
  }

  return Array.from(new Set(routes));
}

const urls = htmlRoutes().map((route) => `  <url><loc>${xmlEscape(absoluteUrl(route))}</loc></url>`);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  "</urlset>",
  "",
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
