# Subaru Legacy Touring Wagon GL — Vietnamese Market (BG5P)

Reference folder for the Vietnamese-market Subaru Legacy Touring Wagon GL, model code BG5P.
Approximately a few dozen of these were imported to Vietnam around 1997.

## Vehicle Specs

| Field | Value |
|-------|-------|
| Model Code | BG5P |
| Generation | 2nd-gen Legacy Touring Wagon (1993-1998) |
| Trim | GL (base) |
| Engine | EJ20E 2.0L Flat-4 NA SOHC — 120 HP / 184 Nm |
| Transmission | 5-speed manual |
| Drivetrain | Full-time AWD |
| Steering | Left-hand drive |
| Market | Vietnamese domestic — European-spec, General Market LHD export, built in Japan (Gunma) |
| Diagnostics | SSM1 protocol — NO OBD-II. Requires Subaru-specific scan tool or manual CEL code reading. |

## Folder Contents

### manuals/EJ20E-SOHC-engine/ (72 MB)
Factory service manual sections specific to the EJ20 SOHC engine without OBD-II.
These are the correct manuals for the Vietnamese-market car.

- `EJ20_SOHC_Mechanical.pdf` — Full engine teardown, assembly, torque specs, clearances
- `EJ20_SOHC_Fuel_Injection_no_OBD.pdf` — Fuel injection for non-OBD cars
- `EJ20_SOHC_Diagnostics_no_OBD.pdf` — Fault codes and diagnostics without OBD-II
- `EJ20_SOHC_Ignition_no_OBD.pdf` — Ignition system for non-OBD cars
- `EJ20_SOHC_Exhaust_no_OBD.pdf` — Exhaust system for non-OBD cars
- `EJ20_SOHC_Emission_Control_no_OBD.pdf` — Emission control for non-OBD cars
- `EJ20_SOHC_Intake.pdf` — Intake manifold, throttle body, air filter
- `EJ20_Cooling.pdf` — Radiator, thermostat, water pump
- `EJ20_Lubrication.pdf` — Oil system, oil pump, filter
- `EJ20_Starting_Charging.pdf` — Starter, alternator, battery
- `EJ20_Electrical_System.pdf` — ZIP archive mislabeled with a `.pdf` extension; contains the individual engine-electrical PDFs for starter, generator, ignition, spark plug, and diagnostics sections
- `EJ20_Speed_Control.pdf` — Cruise control

### manuals/BG-chassis/ (39 MB)
Factory service manual sections for the BG chassis. These are from the 1997 USDM FSM but cover
the shared platform — body, suspension, brakes, steering, transmission, wiring — which is the
same across all BG Legacy wagons regardless of engine or market.

- `BODY SECTION/` — Body panels, doors, windows, interior, seats, seatbelts, instrument panel
- `MECHANICAL COMPONENTS SECTION/` — Brakes, suspension, steering, wheels, A/C, heater
- `ELECTRICAL SECTION/` — Body and engine electrical systems
- `WIRING DIAGRAM SECTION/` — Full wiring diagrams
- `ENGINE - UNIVERSAL/` — Clutch, cooling, lubrication, mounts, fuel system, on-car services
- `TRANSMISSION/` — 5-speed manual transmission, differential, AWD system

## Parts Catalog (Online)

No downloadable parts catalog exists for the BG5 EJ20E. Use these free online EPC databases
for part number lookup with exploded diagrams:

- **Subaru EPC-Data** — BG5 + EJ20E variant (closest match for GL NA):
  https://subaru.epc-data.com/legacy/bg5/141-ej20e/
  Covers: engine, body, chassis, electrical. 45+ parts categories with part numbers.

- **PartSouq** — BG5 Legacy 1997 (full Subaru genuine parts catalog with exploded diagrams):
  https://partsouq.com/en/catalog/genuine/locate?c=Subaru
  Search by frame number (e.g., "BG5") or browse Subaru > Legacy. Has numbered exploded
  diagrams with part numbers, quantities, applicable engine variants, and date ranges.

Note: The EPC-Data variant 141 lists as automatic/BRIGOLD trim, and the PartSouq BG5-284344
entry is a GT B-SPEC turbo. Engine-specific part numbers will differ from the EJ20E SOHC NA,
but chassis, body, suspension, brake, interior, and electrical parts are shared across BG5
variants.

## Notes

- The USDM version of this car used the EJ22 (2.2L) engine, NOT the EJ20E. Engine-specific
  procedures from a USDM FSM will NOT match. Use the EJ20E manuals in this folder instead.
- These cars have NO OBD-II port. Diagnostics require either an SSM1 scan tool
  (e.g., EvoScan SSM1 cable) or manual code reading by bridging diagnostic connector pins
  under the dash and counting CEL flashes.
- The "BG5P" model code is undocumented in public Subaru databases. The "P" is believed to be
  a General Market revision/variant code used for export models.

## Sources

- EJ20 engine manuals: https://www.car-inform.com/subaru-engines/ej20-engine/
- BG chassis FSM: 1997 Subaru Legacy USDM Factory Service Manual
- Vehicle info confirmed by Vietnamese automotive press (Thanh Nien, CarBiz.vn)
