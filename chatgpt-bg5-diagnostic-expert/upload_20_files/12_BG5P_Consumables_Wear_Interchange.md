# BG5P Consumables And Wear Parts Interchange Guide

Date: 2026-04-29
Last validation pass: 2026-06-29

Target vehicle: Subaru Legacy Touring Wagon GL, model code BG5P, approximate
1997, EJ20E 2.0L NA SOHC, 5-speed manual, full-time AWD, LHD
Vietnam/general-market export.

This document is the purchase-facing service-parts guide. The broader raw
evidence remains in:

- `docs/bg5p-oem-parts-master.csv`
- `docs/bg5p-shared-engine-interchange-candidates.csv`
- `docs/parts-interchange-research.md`
- `site/public/data/parts.json`
- `parts-catalog/`

## Confidence Rules

Use these labels exactly when buying:

| Label | Meaning |
|---|---|
| 95%+ | Exact BG5/EJ20E or exact BG/B11 chassis evidence plus an OEM part number or documented Subaru supersession. Any option split, production split, LHD/RHD split, ABS/brake split, transmission split, or emission/catalyst split must be resolved. |
| High candidate | Strong catalog evidence, but one confirmation remains. Measure or inspect before ordering. |
| Search lead | Useful part number for searching, but not purchase-ready without confirmation. |
| Not purchase-approved | The number appears in local or external data, but the application is wrong, too broad, or incomplete for this car. |

Car-Part/Hollander is useful for availability and salvage-yard sanity checks,
but it is not enough for 95% confidence on this imported BG5P unless the yard
also confirms the stamped/OEM number, donor body, transmission, engine, side,
ABS/brake package, and connector/mounting details.

## Proof Items Still Needed

These are the remaining blockers for full 95% confidence across every wear
part. They are now specific enough to check on the car or against a frame/VIN
lookup.

| Area | What Still Needs Proof | Why It Matters | What To Record |
|---|---|---|---|
| Frame/build date | Exact frame number and build month. | Several 1997 rows overlap, especially timing guide, clutch cover, rear brake, and early/late supersessions. | Full frame/VIN, build plate, transmission code. |
| Emissions/catalyst | Whether this car has the catalyst/exhaust-converter setup shown in the BG5/EJ20E MT EPC. | Spark plug selection differs between the factory manual's catalyst and non-catalyst notes. | Photos of converter, oxygen sensor, emissions label, current plug part number. |
| Front brakes | Confirm 14 inch, 1-pot front caliper and rotor dimensions. | The exact MT EPC page confirms the 14 inch / 1-pot brake family. The earlier `S.25 + W.(25+OBK)` pad/rotor numbers are not acceptable as BG5P proof, and 2026-06-29 external rechecks did not produce BG5P/EJ20E-specific purchase proof. | Caliper casting, rotor OD/thickness, pad shape, ABS/no ABS, wheel size. |
| Rear brakes | Confirm rear disc brake with D=38 caliper. | The exact MT EPC resolves rear disc parts for W.F4W LX/TXS/BRIGLD, but the actual BG5P still needs a physical package check before stocking parts. | Rear rotor OD/thickness, caliper piston/casting, parking-brake shoe type. |
| Radiator hoses | Exact hose-kit subpage or physical hose match. | The exact MT EPC confirms radiator and hose group for MT EJ20E/EJ20D, but the individual hose numbers in the local data came from a different captured variant. | Hose photos, radiator tank layout, upper/lower hose routing, old hose markings. |
| Fuel tank / pump / strainer | Pump hanger and in-tank filter layout. | Local rows mix 2WD, A/S, AT, and EJ25D notes; enough for leads, not enough for bulk buying. | Pump hanger photos, connector, strainer shape, fuel line routing, tank access layout. |
| Hubs/CV/axles | ABS tone ring and axle/boot dimensions. | Chassis rows are broad `S + W` or `W.F4W`; ABS and axle style still affect used assemblies and boot kits. | ABS sensor/tone ring photos, spline count if disassembled, boot diameters. |
| Accessory belts/wipers/cabin filter | On-car measurements. | The manuals give service procedure/tension, but not current buyable belt or wiper lengths in the local evidence. | Belt markings, pulley layout with/without A/C, blade lengths, HVAC box photo. |

## High-Confidence Consumables

| Item | OEM / Historic / Supersession Numbers | Evidence And Interchange | Quality Alternatives | Confidence / Notes |
|---|---|---|---|---|
| Engine air filter element | `16546AA050` -> `16546AA020` | Exact BG5/EJ20E EPC page lists `16546AA050` for 1997-1998 EJ20#/EJ25D and shows `16546AA020` as replacement. Local catalog also lists `16546AA020` for `*EJ20E +EJ25D`, `L/J`. | Subaru OEM first. WIX `46116` is a strong aftermarket option: WIX lists Legacy II 2.0i 4WD EJ20 and dimensions 281.2 x 167.9 x 35.1 mm. K&N `33-2031-2` is a reusable search lead; verify dimensions before using. Secondary cross-reference leads include MAHLE/Knecht `LX307`, MANN `C2964`, Nitto `4NC-1011W`, Denso `143-3200`. | 95%+ for OEM numbers. WIX `46116` is high candidate to 95% after physical dimension check against the airbox. Other alternatives are search leads unless confirmed in the maker catalog. |
| Engine oil filter | `15208AA024` -> `15208AA080`; current Subaru catalog supersession lead `15208AA09A` for older `15208AA020/021/022/023/024/060/080/100/12A` | Exact BG5/EJ20E EPC page lists `15208AA024` for EJ18E/EJ20#/EJ25D and shows `15208AA080` as replacement. EJ20E lubrication manual specifies full-flow filter, M20 x 1.5 thread, 80 x 70 mm, 157 kPa bypass valve, and 4.0 L engine oil fill at replacement. | Subaru OEM is preferred. WIX `57055` is the strongest current aftermarket lead found: WIX lists M20 x 1.5, anti-drain valve, 15 micron nominal rating, and a 1.861 bar bypass opening pressure, which is closer to the period manual's 157 kPa spec than low-bypass alternatives. Avoid treating WIX `51365` as a preferred Subaru cross-reference because published catalog data lists an 8-11 psi bypass setting. MANN `W 67/1` is a catalog lead, but its published bypass is 1.0 bar, below the period manual's 157 kPa spec. | 95%+ for `15208AA024/15208AA080` and documented Subaru supersession. Aftermarket filters need bypass/anti-drainback acceptance; do not buy only because the thread fits. |
| Engine oil | No Subaru part number required | EJ20E lubrication manual and local maintenance data specify 5W-30 preferred, API SJ/SH/SG era spec or better, 4.0 L to upper mark, 3.0 L to lower mark. Hot climate alternatives: 10W-30, 10W-40, 20W-40, 20W-50. | Use a reputable full-synthetic or high-quality mineral oil that meets the viscosity/API target for climate and engine condition. | 95%+ for spec, not brand. |
| Oil drain plug gasket | `11126AA000` | Local catalog row applies to EJ18E + EJ20E + EJ25D. | Subaru OEM, NOK/OEM-quality crush washer only if dimensions match. | 95%+. Replace at each oil change. |
| Oil drain plug | `807020010`, spec `20X14` | Local catalog row applies to EJ18E + EJ20E + EJ25D. Manual drain plug torque is 44 Nm / 33 ft-lb. | Subaru OEM. | 95%+ if oil pan threads are original. |
| Spark plugs, exact BG5/EJ20E MT EPC | `22401AA370`, NGK `PFR6B-11` | Exact `134-ej20e` BG5/EJ20E/F4WD/MT/TXS EPC page lists `22401AA370` / NGK `PFR6B-11` for `W.MT.EJ20E`, 01.06.1997-30.11.1998. The same page also lists general EJ20E `22401AA310` / NGK `BKR6E-11` and Champion `RC8YC4` / `22401AA540`. | NGK preferred. Do not mix plug types or heat ranges across cylinders. | 95%+ for the exact MT EPC row if the car maps to the 1997 W.MT.EJ20E/catalyst setup. Inspect current plugs/emissions hardware before downgrading to copper alternatives. |
| Spark plugs, manual fallback | Non-catalyst: NGK `BKR6E`, gap 0.7-0.8 mm. Catalyst: Champion `RC10YC4` or NGK `BKR5E-11`, gap 1.0-1.1 mm. | EJ20E no-OBD ignition manual. Spark plug torque is 21 Nm / 15 ft-lb. | NGK or Champion from reputable supply chain. | Fallback only if the physical car's emissions configuration contradicts the exact MT EPC plug row. |
| Brake fluid | DOT 3 or DOT 4 | Local maintenance data and BG chassis brake service data specify DOT 3 or DOT 4. | Use sealed-name-brand DOT 4 if doing full service; never mix unknown old fluid. | 95%+ for spec. |
| Manual transmission/front differential oil | GL-5 75W-90 gear oil, approx. 3.5 L | Local maintenance data lists 5-speed manual/front diff shared fill, GL-5 75W-90, 3.5 L. | Motul, Castrol, Mobil, Red Line, Liqui Moly, Idemitsu, or Subaru gear oil meeting GL-5 75W-90. | 95%+ for spec; confirm gearbox drain/fill plug condition first. |
| Rear differential oil | GL-5 75W-90 gear oil, approx. 0.8 L | Local maintenance data lists rear hypoid diff GL-5 75W-90. | Same as above. | 95%+ for fluid spec; rear diff ratio/type still matters for hard parts, not the oil type. |
| Coolant | Subaru Genuine Long-Life Coolant spec; 30-50% concentration | EJ20E cooling maintenance data lists MT system capacity 6.3 L, thermostat opening 76-80 C, radiator cap pressure 108 +/- 15 kPa. | Subaru coolant preferred. Use only phosphate-compatible Japanese-vehicle coolant if substituting. | 95%+ for spec, not brand. |
| Battery | `82110AA010`, size `55D23L-MF`; smaller `82110AA021`, size `34B19L-MF` appears for other option notes | Local catalog lists `55D23L-MF` for `*S.2W + S.MT + W.2W + W.MT`, L/J notes. | Yuasa, Panasonic, GS, Bosch, Varta, or equivalent JIS `55D23L` with correct terminal orientation and tray fit. | 95%+ for the catalog battery size if the tray is original. Physical tray/terminal check is still cheap and should be done before purchase. |

## Timing Belt Service Wear Parts

The exact BG5/EJ20E local EPC capture for category `013` lists the following
EJ18E + EJ20E parts. These are the current 95%+ starting points for an EJ20E
timing-belt job, subject to confirming the actual engine production split.

| Item | OEM / Supersession | Applies In Local EPC | Confidence / Notes |
|---|---|---|---|
| Timing belt and label set | `13160AA040` | Exact BG5/EJ20E/F4WD/MT EPC page and local catalog: EJ18E + EJ20E, 01.06.1997-30.11.1998 | 95%+ for the captured BG5/EJ20E MT period. |
| Belt tensioner adjuster assembly | `13033AA001` -> `13033AA002` | EJ18E + EJ20E, 01.06.1997-30.11.1998 | 95%+ for OEM/supersession. Replace during belt service. |
| Idler complete, belt No. 2 | `13085AA010` -> `13085AA070` | EJ18E + EJ20E, 01.06.1997-30.11.1998 | 95%+ for OEM/supersession. |
| Camshaft oil seal | `806732050` -> `806732150`, qty 2 | EJ18E + EJ20E, 01.06.1997-30.11.1998 | 95%+. Replace while belt is off if leaking or age-unknown. |
| Crank pulley | `12305AA121` -> `12305AA242` | EJ18E + EJ20E, 01.06.1997-30.11.1998 | Not normally a consumable, but useful for damage/interchange searches. |
| Timing belt guide, MT only | `13145AA000` -> `13145AA001` -> `13145AA020` | Exact BG5/EJ20E/F4WD/MT EPC page lists `13145AA000` for 01.01.1997-31.07.1997 and `13145AA001` for 01.06.1997-30.11.1998, both under `MT.(EJ18E+EJ20E)`, with later replacement `13145AA020`. | Upgraded from no-buy to 95%+ once build month is known. Manual clearance is 1.0 +/- 0.5 mm. |
| EJ25D timing belt | `13028AA072` | Local row is EJ25D only | Not purchase-approved for BG5P EJ20E unless a separate EJ20E source proves it. |

Recommended quality brands for timing service, once the exact kit contents are
matched to the OEM numbers: Subaru OEM, Mitsuboshi, Bando, NTN, NSK, Koyo,
Aisin, Gates, or Dayco. Do not buy an EJ25D kit for the EJ20E just because it
is a BG Legacy kit.

## Cooling And Fuel Wear Parts

| Item | OEM Numbers | Evidence And Interchange | Confidence / Notes |
|---|---|---|---|
| Radiator assembly, MT | `45199AC041` | Exact BG5/EJ20E/F4WD/MT EPC page lists radiator assembly for `MT.(EJ18E+EJ20E+EJ20D)`, including 01.06.1997-30.11.1998. | 95%+ for OEM radiator assembly if the car has original MT cooling layout. |
| Radiator hose kit / upper-lower hoses | Exact MT page uses `45162K*A` and `45162K*B` hose-kit groups; local captured variant lists `45167AA020` inlet and `45167AA030` outlet. | Exact MT EPC confirms the radiator/hose group. Local rows list `45167AA020/030`, but 2026-06-29 external spot checks only found broad Legacy/Impreza/Outback fitment for `45167AA020`, not BG5P/EJ20E-specific proof. | Search lead. Photograph or measure the actual hoses before buying. |
| Fuel tank filter / strainer | `42072AA011`; alternate tank-filter row `42072AA120` | `42072AA011` applies to EJ18E + 2W.EJ20E + EJ20E.A/S + EJ25D. `42072AA120` appears in fuel-tank rows for EJ20E.A/S + LX.AT.EJ20E + EJ25D. | High candidate. Treat as in-tank/tank filter, not a universal inline fuel filter. Confirm pump hanger/tank style. |
| Fuel pump assembly / pump | `42021AC013`, `42021AA320` | Local fuel-tank category rows mention EJ20E.A/S + EJ25D. | Search lead for fuel-pump work. Confirm connector, hanger, and pressure requirement before ordering. |
| Fuel pump packing | `42060AA070` | Local fuel-tank category row mentions EJ20E.A/S + EJ25D. | Search lead; buy with pump service only after hanger confirmation. |

## Brake Wear Parts

The first pass used several `S.25 + W.(25+OBK)` brake rows. Those are not
purchase proof for this BG5P. The exact BG5/EJ20E/F4WD/MT/TXS EPC page shows
the front brake family as 14 inch / 1-pot and resolves the rear disc brake
family for W.F4W LX/TXS/BRIGLD. On 2026-06-29, direct PartSouq rechecks for
`26296`, `26300`, `45162G`, and `45162H` were blocked by Cloudflare challenge
pages, so this guide falls back to local EPC-derived rows and public dealer
catalog spot checks. For 95% confidence, still measure the car's
rotor diameter/thickness, match caliper casting, confirm ABS, and compare pad
shape before ordering.

| Item | OEM Numbers | Local Evidence | Confidence / Notes |
|---|---|---|---|
| Front brake family | 14 inch front brake, 1-pot caliper; seal kit `26297AC000` | Exact BG5/EJ20E/F4WD/MT page for `26297` lists 1-pot front caliper seal kit for S/W LX/TXS/BRI# and brake-size 14 inch family. Service data gives front pad dimensions 112.4 x 44.3 x 11.0 mm and front disc 24 x 260 mm for the common 2200/AWD brake spec. | 95%+ for the 14 inch / 1-pot family if the car matches. Do not treat `26296AC040/050` or `26310AA092` as BG5P proof. |
| Front brake pad kit | No purchase-approved OEM pad number from current evidence. | Local rows `26296AC040/050` apply to `S.25 + W.(25+OBK)`. A 2026-06-29 public dealer spot check for `26296AC040` also listed 1997-1999 2.5L Legacy/Outback-type fitments, not BG5P/EJ20E proof. | Record old pad backing number or match the exact BG5P/EJ20E EPC `26296` page before buying. |
| Front brake rotor | No purchase-approved OEM rotor number from current evidence. | Local `26310AA092` applies to `S.25 + W.(25+OBK)`. A 2026-06-29 public dealer spot check did not establish BG5P/EJ20E fitment. | Measure rotor OD/thickness and match the exact BG5P/EJ20E EPC `26300` page before buying. |
| Rear brake pad kit | `26296AA062` | Exact BG5/EJ20E/F4WD/MT `26696A` page lists `26296AA062` for W.F4W.TXS.MT and for 01.06.1997-30.11.1998 S.F4W/W.F4W LX/TXS/BRIGLD. Service data gives rear disc pad dimensions 92.4 x 33.7 x 10.0 mm and backing-inclusive new/min thickness 15.0/6.5 mm. | Upgraded to 95%+ if the car has rear D=38 disc brakes. |
| Rear brake rotor | `26310AA040` -> `26310AA050` | Exact BG5/EJ20E/F4WD/MT `26700` page lists `26310AA040` with replacement `26310AA050`; 01.06.1997-30.11.1998 row applies to S.F4W/W.F4W LX/TXS/BRIGLD. | 95%+ if rear disc package is physically confirmed. |
| Rear caliper seal kit | `26697AA040`, D=38 | Exact BG5/EJ20E/F4WD/MT `26697` page lists D=38 seal kit for W.F4W LX/TXS and 01.06.1997-30.11.1998 S.F4W/W.F4W LX/TXS/BRIGLD/GT#/25T#/LAN#. | 95%+ after confirming D=38 rear caliper. |
| Rear parking-brake shoe kit | `26698AC000` -> `26698AC010` | Exact BG5/EJ20E/F4WD/MT `26694` page lists W.F4W LX/TXS/BRIGLD application for 01.06.1997-30.11.1998. | 95%+ if rear disc/drum-in-hat parking brake is present. |
| Rear pad clips/shims | `26232AA020`, `26233AA020`, `26233AA030` | Same rear disc package in local data. | High candidate; buy hardware by confirmed rear pad/caliper package. |
| Master-cylinder reservoir/filter parts | `26451AC000`, `26456AC000`, `26448AC110` | Local row explicitly includes `S.2W.GL.EJ20E` and other BG chassis notes. | High candidate; not common wear unless damaged/contaminated. |

Quality brake brands once fitment is confirmed: Subaru OEM, Akebono, Advics,
Nissin, Brembo, Bosch, Project Mu street compounds, or EBC street compounds.
Avoid unknown pads on a rare import where pad shape returns may be difficult.

## Axle, Hub, Steering, And Suspension Wear Parts

These are generally chassis-common, but still require body/drivetrain and ABS
checks. For used assemblies, ask for the donor frame, ABS tone ring, side, and
photos of the hub/knuckle/caliper mount.

| Item | OEM Numbers | Local Evidence | Confidence / Notes |
|---|---|---|---|
| Front wheel bearing | `28016AA011`, qty 2 | Local row applies to `S + W`, 02.1997-11.1998. | 95%+ for BG sedan/wagon bearing row, subject to ABS/hub confirmation. |
| Front axle oil seals | Inner `28015AA080`, outer `28015AA070` | Local rows apply to `S + W`, 02.1997-11.1998. | 95%+ with matching hub/axle setup. |
| Front axle nut | `28044AA000` | Local row applies to `S + W`. | 95%+ for same axle/hub setup. |
| Front CV boots | `28023AC060`, `28023AA011` | Local rows apply to `S + W`. | High candidate. Confirm inner/outer boot dimensions and axle type. |
| Front boot/shaft kits | `28091AC090`; `28091AC100/101` appear for 25.MT rows | `28091AC090` applies to `S + W`; `28091AC100/101` are 25.MT-related rows. | Use `28091AC090` as the stronger search lead; confirm axle style. |
| Rear wheel bearing | `28016AA020`, qty 2 | Local row applies to `S.F4W.(GL+25) + W.F4W`, 02.1997-11.1998. | 95%+ for AWD wagon/sedan row, subject to ABS/hub confirmation. |
| Rear axle oil seals | `28015AA100`, `28015AA090`, `28015AA110` | Local rows apply to `S.F4W.(GL+25) + W.F4W`, 02.1997-11.1998. | 95%+ with matching AWD rear hub. |
| Rear CV boots | `28023AA120`, `28023AA130` | Local rows apply to `S.F4W.(GL+25) + W.F4W`, note `OBK:EXC.EUROPE`. | High candidate. Confirm axle type and boot dimensions. |
| Rear DOJ/BJ boot kits | `28091AC030` right, `28091AC040` left | Local rows apply to F4W GL MT / wagon F4W MT / 25/OBK mix. | Search lead; confirm side and axle assembly. |
| Front lower ball joint | `21067GA050` | Local row appears in front suspension section across `S.2W + S.25 + W.2W + W.LX.A/S + W.(25+OBK)`. | High candidate; confirm control arm/knuckle fit. |
| Front control arm inner bushing | `20201AA000` | Local row appears across broad BG chassis notes. | High candidate; press-in dimensions must match. |
| Front stabilizer link | `20420AA003` -> `20420AA004` after 05.1998 | Local row appears across broad BG chassis notes. | High candidate; production-month split matters. |
| Front stabilizer bushing | `20401AC011`, for 20 mm bar | Local row says front stabilizer D=20. | 95%+ only after measuring bar diameter. |
| Rear stabilizer link | `20481AA001` | Local rear suspension row. | High candidate; confirm rear bar exists and layout matches. |
| Rear stabilizer bushing | `21047GA811`, for 16 mm bar | Local row says rear stabilizer D=16. | 95%+ only after measuring bar diameter. |
| Steering tie-rod end | `34141AA041` | Local steering rack row applies across broad BG chassis notes. | High candidate; confirm LHD rack/outer taper. |
| Steering rack boot | `34135FC000` | Local row applies across broad BG chassis notes. | High candidate; confirm LHD rack and clamp style. |

Quality brands once dimensions are confirmed: Subaru OEM, NTN, NSK, Koyo,
Nachi, NOK, Sankei 555, CTR, Lemforder where available, KYB/Kayaba for strut
components, and OEM-grade rubber for bushings.

## Clutch And Manual-Transmission Wear Parts

The current local catalog data is not strong enough to publish a full 95%+
clutch kit for the BG5P EJ20E manual car. Several rows in the local data are
explicitly `MT.EJ25D`, so they must not be used as EJ20E purchase numbers.

| Item | OEM Numbers | Confidence / Notes |
|---|---|---|
| Clutch disc | `30100AA510` -> `30100AA690` | Exact BG5/EJ20E/F4WD/MT page lists `30100AA510` for `MT.(EJ20E+EJ20D)` through 1997 and 01.06.1997-30.11.1998 with replacement `30100AA690`. | Upgraded from no-buy to 95%+ for exact MT EPC, pending build-month/frame check. |
| Clutch cover | `30210AA300` -> `30210AA301` -> `30210AA302` | Exact BG5/EJ20E/F4WD/MT page lists `30210AA300` through 02.1997, `30210AA301` from 03.1997, and 01.06.1997-30.11.1998 row with replacement `30210AA302` under `MT.(EJ20E+EJ20D)`. | Upgraded from no-buy to 95%+ after build-month/frame check. |
| Release bearing | `30502AA051` | Exact BG5/EJ20E/F4WD/MT page lists `30502AA051`, with 01.06.1997-30.11.1998 row under `MT.(EJ20E+EJ20D+EJ25D)`. | 95%+ for exact MT EPC. |
| Clutch operating cylinder | `30620AA041` -> `30620AA042`, D=19.05 | Exact BG5/EJ20E/F4WD/MT page lists `30620AA041`, D=19.05, with replacement `30620AA042`; 01.06.1997-30.11.1998 row applies to `MT.(EJ20E+EJ20D+EJ25D)`. | 95%+ for exact MT EPC if hydraulic clutch setup is original. |
| Clutch sleeve clip | `30539AA000` | Local row says `MT`; exact MT clutch group includes this group. | High candidate; exact subpage still worth checking before stocking small hardware. |
| Release lever retainer spring | `30534AA001` | Local row says `MT`; exact MT clutch group includes this group. | High candidate. |
| Release lever pivot | `30537AA030` | Local row says `MT`; exact MT clutch group includes this group. | High candidate. |

Preferred clutch brands after exact dimensions are confirmed: Subaru OEM,
Exedy/Daikin, Aisin, or Sachs. Required checks: disc diameter, spline count,
release bearing style, flywheel step, cable vs hydraulic actuation, and
transmission code.

## Body-Service Consumables And Measured Items

| Item | Current Status | Buy Rule |
|---|---|---|
| Wiper blades | No exact blade length found in current local evidence. | Measure the blades on the car. Buy NWB, Denso, Bosch, PIAA, or Valeo by length and hook/connector style. |
| Cabin filter | No confirmed BG5P cabin-filter row. Many 1990s BG cars did not have an easy drop-in cabin filter. | Inspect HVAC box before buying. Do not assume BE/BH or later Legacy cabin filters fit. |
| Accessory belts | No exact alternator/A/C/PS belt part numbers confirmed in the current local catalog evidence. | Read belt markings on the car or measure length/profile. Use Mitsuboshi, Bando, Gates, or Dayco after profile confirmation. |
| Tires | Wheel data includes 15x6J steel and several 15/16 inch wheel options, but tire size is not established here. | Use door placard/current wheel size; match load/speed rating and AWD rolling diameter. |

## Search And Sourcing Strategy

Use this priority order:

1. Exact OEM number from this document or the generated CSV.
2. Subaru supersession chain.
3. Same OEM number on another BG/B11 donor, preferably 1996-1998.
4. Current maker catalog for aftermarket number.
5. Car-Part/Hollander search for availability.
6. Yard photos and stamped part confirmation.

Best donor pools:

- BG/B11 Legacy wagon, 1993-1998, same side/body/trim where relevant.
- BG5 EJ20E cars, especially 1996-1998 facelift-era cars.
- Chassis-common BG wagon/sedan parts where body, AWD, ABS, brake package,
  LHD/RHD, and production-month splits match.

Avoid without deeper proof:

- EJ20D/EJ20H/EJ20R turbo/DOHC engine parts.
- USDM EJ22 engine-specific parts.
- Automatic-transmission parts for this manual car.
- EJ25D timing belt or clutch numbers unless the exact OEM number is proven to
  apply to EJ20E.
- RHD dash, steering, HVAC, wiper, cable, and pedal parts.
- Brake parts without rotor and caliper confirmation.

## Source Log

Local sources:

- `README.md`
- `docs/parts-interchange-research.md`
- `docs/bg5p-oem-parts-master.csv`
- `docs/bg5p-shared-engine-interchange-candidates.csv`
- `site/public/data/parts.json`
- `site/public/data/maintenance.json`
- `parts-catalog/engine/013_CAMSHAFT___TIMING_BELT/parts.csv`
- `manuals/EJ20E-SOHC-engine/EJ20_Lubrication.pdf`
- `manuals/EJ20E-SOHC-engine/EJ20_SOHC_Ignition_no_OBD.pdf`
- `manuals/EJ20E-SOHC-engine/EJ20_SOHC_Intake.pdf`
- `manuals/EJ20E-SOHC-engine/EJ20_Cooling.pdf`

External sources checked:

- Subaru EPC-Data BG5 EJ20E: `https://subaru.epc-data.com/legacy/bg5/141-ej20e/`
- Subaru EPC-Data BG5 EJ20E F4WD MT TXS variant: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/`
- BG5/EJ20E MT timing belt guide group 13145: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/engine/013/13145/`
- BG5/EJ20E MT clutch group 100: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/trans/100/`
- BG5/EJ20E MT clutch disc group 30100: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/trans/100/30100/`
- BG5/EJ20E MT clutch cover group 30210: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/trans/100/30210/`
- BG5/EJ20E MT release bearing group 30502: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/trans/100/30502/`
- BG5/EJ20E MT clutch operating cylinder group 30620: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/trans/100/30620/`
- BG5/EJ20E MT spark plug group 22401: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/electric/090/22401/`
- BG5/EJ20E MT front brake seal group 26297: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/trans/262/26297/`
- BG5/EJ20E MT rear brake pad group 26696A: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/trans/263/26696A/`
- BG5/EJ20E MT rear brake rotor group 26700: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/trans/263/26700/`
- BG5/EJ20E MT rear brake seal group 26697: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/trans/263/26697/`
- BG5/EJ20E MT cooling group 450: `https://subaru.epc-data.com/legacy/bg5/134-ej20e/trans/450/`
- BG5/EJ20E air filter group 16546: `https://subaru.epc-data.com/legacy/bg5/141-ej20e/engine/070/16546/`
- BG5/EJ20E oil filter group 15208: `https://subaru.epc-data.com/legacy/bg5/141-ej20e/engine/032/15208/`
- BG5/EJ20E spark plug group 22401: `https://subaru.epc-data.com/legacy/bg5/141-ej20e/electric/090/22401/`
- Subaru OEM oil filter supersession page: `https://parts.subaru.com/p/Subaru__/Oil-Filter-Complete-Oil-Filter-65MM/49227635/15208AA09A.html`
- Subaru OEM air filter page: `https://www.subarupartsdeal.com/parts/subaru-element-air-cleaner~16546aa020.html`
- WIX 57055 oil filter page: `https://www.wixfilters.com/en-nz/catalog/results/product.html/57055_wix.html`
- WIX 46116 air filter page: `https://www.wixfilters.com/en-sg/catalog/results/product.html/46116_wix.html`
- MANN-FILTER W 67/1 page: `https://www.mann-filter.com/en/catalog/international/search-results/product.html/w67/1_mann-filter.html`
- K&N 33-2031-2 page: `https://www.knfilters.com/us/33-2031-2-replacement-air-filter`
- Car-Part public non-interchange search entry: `https://www.car-part.com/noninterchange.htm`
