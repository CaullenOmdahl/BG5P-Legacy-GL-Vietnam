# Whole-site sourcing implementation

The owner vehicle is a 1997 BG5P GL, General Market LHD, EJ20E 2.0 SOHC NA, 5MT AWD, factory front calipers/OEM-spec discs and rear drums. Build month, applied-model and transmission codes, ABS, catalyst, power rating and modifications remain unknown. No owner VIN is stored. Source coverage years and catalog variants remain separate from owner facts.

## Observable contract

A person sourcing a part can search OEM numbers with punctuation removed, manufacturer SKUs, English/Vietnamese terms and direct relationship endpoints; select system, position, configuration and fitment status; open a stable record; inspect its evidence, constraints, quantities and unresolved checks; and copy a supplier brief. Unknown rows remain visible. OEM supersession is directed and distinct from an aftermarket cross-reference. Relationships do not confer transitive equivalence or transfer dimensions between records. A supplier listing does not establish compatibility.

Legacy catalog and guide URLs remain available. Catalog inclusion never produces a confirmed-fit badge. All exports and AI sourcing context identify the same content version. The AI receives bounded canonical records ahead of historical material, including the rear-drum configuration and inherited-procedure qualifications.

## Decision ADR-0001: preserve imported source rows

Use validated structured files and explicit claims rather than replacing the existing catalog or adding a database. Preserve imported rows and relationships as evidence, while treating source application and installed-car fit as separate facts. This keeps existing URLs and generation workflows usable and permits later reviews without silently changing historical catalog text.

## Source and generation map

- Authored owner facts, manufacturer applications, evidence, relationships, representative candidates and dated leads: `site/sourcing/claims.json`.
- Authored nine guide records and per-specification review/conditions: `site/sourcing/procedures.json`. This preserves inherited values, with explicit unknown page/configuration fields rather than fabricated verification.
- Original catalog rows: `site/public/data/parts.json`, retained byte-for-byte. Each imported row is preserved in its record's `catalog`; original quantity, options, dates, replacement text and callouts are available.
- Canonical migration: `site/scripts/build-sourcing.py` creates `sourcing.json`, matching `maintenance.json`, compact `sourcing-search.json`, `coverage.json` and `docs/bg5p-sourcing-records.csv`. It validates unique IDs, status/evidence references, units and directed relationship types, and guards confirmed claims.
- `npm run generate:index` in `site/` rebuilds the canonical snapshot, sitemap, all 16 section/nine guide/manual/index LLM exports, legacy evidence CSVs and the bundled AI text/CSV copies. The content version is derived from input records, not a timestamp.
- `python3 scripts/build_parts_interchange_evidence.py` then `python3 scripts/refresh_sourcing_pack.py` from the repository root refreshes the older evidence CSVs and bundled AI text/CSV copies. Existing PDF packs are not regenerated or redistributed.

The UI uses the snapshot or generated derivatives; the global search index carries the same fitment records/version. `/find-part` shows section coverage and `/data/coverage.json` supports automation. Manual metadata distinguishes publication identity, market/year, original heading, equipment conditions, reviewed pages and unknown revision/rights. “Universal” remains a source heading, never universal applicability. Existing repository maintainers remain the editors; new OEM evidence, changed installed equipment, contradicting dimensions or dated offers trigger review.

## Reconciled inventory and review coverage

| Measure | Count |
|---|---:|
| Catalog sections / diagram references | 16 / 262 |
| Preserved catalog rows | 3,608 |
| Distinct raw OEM numbers | 2,937 |
| OEM/system index entries | 3,041 |
| Additional curated sourcing/reference records | 17 |
| Total sourcing records | 3,625 |
| Unreviewed catalog fitment claims | 3,608 |
| Candidate / rejected / confirmed owner fits | 15 / 2 / 0 |
| Inherited maintenance guides | 9 |
| Openable PDFs / ZIP-backed legacy `.pdf` archive | 373 / 1 |

The earlier published 2,429-entry index was stale relative to the current catalog. Index entries deduplicate OEM/system; raw rows and unique OEM numbers are distinct measures. Manuals reconcile as EJ20E 22, Body 84, Electrical 42, Engine Universal 58, Mechanical 130, Transmission 28 and Wiring 9. Selected printed brake-spec pages 3/5/7 (PDF pages 1/3/5) were checked; the other manuals have not received page-by-page applicability review.

## Reviewed examples and remaining limits

Brembo's BG5 2.0 AWD application was reread on 2026-10-09. It supports the 260 × 24 mm front rotor 09.5673.11, height 57 mm, center 58 mm and the P 78 009 / D722 7590 pad application from May 1996. P 78 004 remains the earlier application through April 1996. These are manufacturer-application candidates, conditional on the unknown build date and installed interfaces; no exact owner fit is claimed.

The checked factory PDF MSA5TCD97L3677 distinguishes standard US 2200 front brakes (260 × 24 mm, single 57.2 mm piston) from GT/LSi/Outback 2500 fronts (277 × 24 mm, twin 42.8 mm pistons). Standard US 2.2 labels are a valid shared-family lead. The larger family is rejected as a direct replacement for the standard setup. Rear disc pads are rejected for the owner rear drums. Brembo 14.A686.10 is a discontinued drum dimensional reference; 228 mm nominal manufacturer diameter is retained separately from the US manual's 228.6 mm effective drum diameter. The manufacturer 85 kW / 116 CV application rating is not silently merged with historical site 120 HP claims.

OEM 26310AC060 → 26310AC06A, pad AC010/011 and AC020/021 directions/cross-references are searchable research leads. Direct OEM revalidation remains outstanding, so they are never published as verified supersessions; P78009N is not collapsed into P 78 009. Representative air-filter, gearbox spring, steering bushing, ignition-coil and right-fender records preserve local catalog excerpts and source constraints, with explicit dimensional/interface and supplier checks still open. These examples are source-backed briefs, not confirmed purchase recommendations.

The Brembo Store rotor page listed USD 78.29 and in-stock status on 2026-10-09. Units per sale and destination-specific shipping/tax are unknown; no normalized per-unit price is claimed. Its 30-day unused/original-packaging return condition is recorded. The discontinued drum is not presented as buyable. Offers for the other examples remain unverified.

All nine procedures expose unreviewed status at each inherited specification. Source candidates are linked, but exact pages/fastener context, dry-versus-refill capacities, scheduled intervals, belt tooth specification, clutch application, transmission/differential ratios and catalyst-dependent plugs require further validation. Rear-disc defaults were removed, front brake links now use existing 262-02/04 front-brake diagrams, and clutch links use 100-01/373-01 instead of shift-fork diagrams. Rear-drum inspection is included with replacement specifications left unreviewed. SSM1/no-OBD behavior is retained; exact diagnostic pins must not be inferred.

Full migration and full fitment/procedure validation are separate milestones. Continue the visible backlog in braking/steering/suspension/timing/fuel/cooling risk order, followed by drivetrain, electrical/HVAC and body/accessories. No safety-critical owner-fit approvals or existing ownership rules were replaced.

## Verification and audit handoff

The completion manifest `.agent/strict-gate.json` runs uncached sourcing integrity/search/AI-context tests, localization, catalog quality, all-diagram parts coverage, index coverage, chat regressions, manual archive assets, TypeScript and production build. It contains no Dart/Flutter analyzer invocation. Browser verification is a separate artifact check against the built local preview (`site/scripts/test-sourcing-browser.py`), using an already installed Playwright/browser and no live model call.

The parent owns one independent audit of the final draft PR head. No formal reviewer was triggered by the implementation writer. Do not merge or deploy this branch. Library materialization failed HTTP 403 through the supported retry; Library's full text read supplied all eight pages of the approved plan, so no binary copy is claimed.

### Recorded checks

Passed: uncached nine-command completion matrix, 310 HTTP legacy/search/reference routes, rendered desktop (1440 px) and mobile (390 px) English/Vietnamese flows, keyboard activation, actual clipboard completion, evidence links and horizontal-overflow checks. Screenshots were inspected. Data tests check lossless source rows, stable unique IDs, source/unit references, variant splits, directed relationships, manual/guide counts, diagram links, compact search and export consistency. AI retrieval tests exercised actual canonical context/public-link functions without a model call.

Earlier failures: missing canonical migration before implementation; bounded AI context exceeding its budget (fixed by selecting the actual brake references); browser assertions that did not wait for client navigation/clipboard and a duplicate-heading locator (corrected); Google Fonts fetch denied under restricted network (production build passed with network access). The absent gate manifest was supplied with inspected site-only commands.

Not run: live hosted model/API conversation, exhaustive claim/page-level fitment and procedure verification, OEM supersession source revalidation, destination-specific supplier checkout/delivery, additional PDF rights certification, independent audit, merge or deployment. The implementation writer did not run Dart/Flutter analysis, directly or indirectly. The independent audit remains parent-owned on the final PR head. Existing npm dependency audit findings are outside this content migration; no dependencies were upgraded.
