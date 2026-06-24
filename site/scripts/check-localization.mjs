import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "lib/i18n.ts",
  "components/LocaleProvider.tsx",
];

const uiFiles = [
  "app/page.tsx",
  "app/about/page.tsx",
  "app/maintenance/page.tsx",
  "app/maintenance/[id]/page.tsx",
  "app/manuals/page.tsx",
  "app/parts/page.tsx",
  "app/parts/[section]/page.tsx",
  "app/parts/[section]/[diagram]/page.tsx",
  "components/AppShell.tsx",
  "components/DiagramViewer.tsx",
  "components/MaintenanceCard.tsx",
  "components/ManualsClient.tsx",
  "components/PartsTable.tsx",
  "components/SearchBar.tsx",
];

const forbiddenUiFragments = [
  "Legacy GL diagnostic reference.",
  "Factory manuals, exploded parts diagrams",
  "Parts Catalog",
  "Maintenance Guides",
  "Service Manuals",
  "Vehicle profile",
  "About the BG5P Legacy GL",
  "Vehicle Summary",
  "Decoded Chassis Plate",
  "Engine Details",
  "Subaru in Vietnam",
  "Important Notes",
  "Factory PDF library",
  "EJ20E Engine Manuals",
  "BG Chassis Manuals",
  "Filter ${totalCount} documents",
  "No documents matching",
  "Search manuals, OEM parts, diagrams, flash codes",
  "Search diagrams and parts",
  "No results",
  "Reset zoom",
  "Scroll to zoom",
  "Parts data is not listed",
  "OEM Part Number",
  "Production Period",
  "All maintenance guides",
  "Specs",
  "Steps",
  "Parts Diagrams",
  "OEM exploded views",
  "Service procedures",
  "Parts List",
  "Previous",
  "Back to",
  "Switch to English",
  "Open navigation",
  "Close navigation",
  "Help me pick the right BG5P diagnostic path.",
];

const technicalTokensAllowedInVi = [
  "BG5P",
  "EJ20E",
  "SOHC",
  "OBD",
  "SSM1",
  "PDF",
  "OEM",
  "AWD",
  "GL",
  "LHD",
  "MT",
];

const errors = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    errors.push(`Missing required localization file: ${file}`);
  }
}

for (const file of uiFiles) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) {
    errors.push(`Missing expected UI file: ${file}`);
    continue;
  }

  const source = fs.readFileSync(abs, "utf8");
  for (const fragment of forbiddenUiFragments) {
    if (source.includes(fragment)) {
      errors.push(`${file} still embeds localizable English: ${fragment}`);
    }
  }
}

const layoutPath = path.join(root, "app/layout.tsx");
if (fs.existsSync(layoutPath)) {
  const layout = fs.readFileSync(layoutPath, "utf8");
  if (layout.includes('lang="en"')) {
    errors.push("app/layout.tsx still hardcodes html lang=\"en\"");
  }
}

const localePath = path.join(root, "lib/locale.ts");
if (fs.existsSync(localePath)) {
  const locale = fs.readFileSync(localePath, "utf8");
  if (locale.includes("readStoredLocale() ?? readDocumentLocale() ?? detectBrowserLocale()")) {
    errors.push("lib/locale.ts still prefers document lang before browser language");
  }
}

const i18nPath = path.join(root, "lib/i18n.ts");
if (fs.existsSync(i18nPath)) {
  const i18n = fs.readFileSync(i18nPath, "utf8");
  for (const required of ["en:", "vi:", "home:", "parts:", "maintenance:", "manuals:", "about:"]) {
    if (!i18n.includes(required)) {
      errors.push(`lib/i18n.ts is missing required dictionary key: ${required}`);
    }
  }

  const maintenance = JSON.parse(
    fs.readFileSync(path.join(root, "public/data/maintenance.json"), "utf8")
  );
  for (const card of maintenance) {
    if (!i18n.includes(`"${card.id}"`) && !i18n.includes(`${card.id}:`)) {
      errors.push(`lib/i18n.ts does not reference maintenance card id: ${card.id}`);
    }
  }

  const viStart = i18n.indexOf("  vi:");
  const viBlocks = viStart >= 0 ? i18n.slice(viStart) : "";
  if (!viBlocks) {
    errors.push("lib/i18n.ts does not include a Vietnamese dictionary block");
  } else {
    for (const token of technicalTokensAllowedInVi) {
      if (!viBlocks.includes(token)) {
        errors.push(`Vietnamese dictionary lost expected technical token: ${token}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Localization check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Localization check passed.");
