# BG5P Diagnostic Quick Reference

## Identity

| Field | Value |
|---|---|
| Model | Subaru Legacy Touring Wagon GL |
| Model code | BG5P |
| Market | Vietnam / general-market LHD export |
| Approximate year | 1997 |
| Engine | EJ20E 2.0L NA SOHC flat-four |
| Transmission | 5-speed manual |
| Drivetrain | Full-time AWD |
| Diagnostics | SSM1 / Subaru Select Monitor era; no OBD-II assumption |

## Diagnostic Rules

1. For engine diagnosis, start with `01_BG5P_EJ20E_No_OBD_Diagnostics_Searchable.pdf`.
2. Do not translate Subaru two-digit flash codes into generic OBD-II P-codes unless a source explicitly supports it.
3. For wiring questions, use `04_BG5P_BG_Chassis_Wiring_Electrical_Searchable.pdf` first, then ask for the exact connector/diagram if visual tracing is needed.
4. For mechanical service and torque specs, prefer the EJ20E PDF set over USDM EJ22/EJ25 engine procedures.
5. For chassis, brakes, steering, HVAC, manual transmission, AWD, and body electrical, BG chassis sources are acceptable shared-platform references.

## Manual CEL / MIL Code Reading

- Turn ignition OFF.
- Connect the read memory connector under the dash / lower instrument-panel area.
- Turn ignition ON.
- Read CHECK ENGINE / MIL flashes.
- Long ON segment, about 1.3 seconds, means tens digit.
- Short ON segment, about 0.2 seconds, means ones digit.
- Middle ON segment, about 0.5 seconds, means OK code.
- Record the DTC before clearing memory or disconnecting connectors.

## Inspection Mode Without Subaru Select Monitor

- Warm the engine first.
- Turn ignition OFF.
- Set manual transmission to neutral.
- Connect the green test mode connector.
- Turn ignition ON and confirm MIL comes on.
- Start the engine.
- Drive above 11 km/h / 7 mph for at least 1 minute.
- Warm above 2,000 rpm.
- Read and record any MIL DTCs.

## Clear Memory Without Subaru Select Monitor

- Turn ignition OFF.
- Set manual transmission to neutral.
- Connect both test mode connector and read memory connector.
- Turn ignition ON.
- Start engine and drive above 11 km/h / 7 mph for at least 1 minute.
- Warm above 2,000 rpm.
- If DTC remains, repair before treating memory clear as complete.
- After memory clear with Subaru Select Monitor, initialize ISC by turning ignition ON and waiting 3 seconds before starting.

## EJ20E No-OBD DTC List

| DTC | Item | Diagnostic meaning |
|---|---|---|
| 11 | Crankshaft position sensor | No signal from crankshaft position sensor when ignition is ON; ECM-to-sensor harness short/open. |
| 21 | Engine coolant temperature sensor | Engine coolant temperature sensor signal abnormal; ECM-to-sensor harness short/open. |
| 22 | Knock sensor | Knock sensor signal abnormal; ECM-to-sensor harness short/open. |
| 23 | Mass Air Flow (MAF) sensor | Mass Air Flow sensor signal abnormal; ECM-to-MAF-sensor harness short/open. |
| 24 | Idle air control solenoid valve | IAC solenoid valve not functioning; ECM-to-IAC harness short/open. |
| 26 | Intake air temperature sensor | Intake air temperature signal abnormal; ECM-to-IAT harness short/open. |
| 31 | Throttle position sensor | TPS signal abnormal, TPS installed abnormally, or ECM-to-TPS harness short/open. |
| 32 | Oxygen sensor (with catalyst vehicles) | Oxygen sensor not functioning; ECM-to-O2-sensor harness short/open. |
| 33 | Vehicle speed signal | Vehicle speed signal abnormal; ECM-to-combination-meter harness short/open. |
| 35 | Purge control solenoid valve | Purge control solenoid valve not functioning; ECM-to-purge-solenoid harness short/open. |
| 38 | Torque control signal | Abnormal signal from TCM; ECM-to-TCM harness short. |
| 45 | Pressure sensor | Pressure sensor signal abnormal; ECM-to-pressure-sensor harness short/open. |
| 46 | CO resistor (general spec vehicles) | CO resistor signal abnormal, ECM-to-CO-resistor harness short/open, or CO value not adjusted to spec. |
| 51 | Neutral position switch | Neutral position switch signal abnormal; ECM-to-neutral-switch harness short/open. |
| 53 | Immobiliser system | Faulty immobiliser system. |
| 54 | Air intake system | Loose or damaged intake ducts/hoses causing abnormal pressure sensor signal. |
| 85 | Charge system | Charge system abnormal. |

## Maintenance and Service Specs

### Oil Change

- Difficulty: Easy
- Interval: Every 5,000 km or 6 months
- Specs:
  - Oil Type: 5W-30 preferred (API SJ/SH or SG)
  - Capacity (to upper level): 4.0 L (4.2 US qt)
  - Capacity (to lower level): 3.0 L (3.2 US qt)
  - Drain Plug Torque: 44 Nm (4.5 kgf-m, 33 ft-lb)
  - Oil Filter Thread: M20 x 1.5
  - Oil Filter Type: Full-flow, 80 x 70 mm
  - Oil Filter Wrench (ST): 498547000
  - Alt. Viscosity (hot climate): 10W-30, 10W-40, 20W-40, 20W-50
- Steps:
  1. Warm engine for 5 minutes, then shut off
  2. Place drain pan under oil pan and remove drain plug
  3. Allow oil to drain completely (5-10 minutes)
  4. Replace drain plug gasket with new one
  5. Tighten drain plug to 44 Nm (33 ft-lb)
  6. Remove old oil filter using ST 498547000 or filter wrench
  7. Apply thin coat of new oil to new filter gasket
  8. Install new filter hand-tight, then turn 3/4 additional turn
  9. Fill engine oil through filler cap to upper level mark (4.0 L)
  10. Start engine, run for 1 minute, shut off and recheck level
  11. Top up if necessary between L and F marks on dipstick
- Related PDFs:
  - /manuals/EJ20E-SOHC-engine/EJ20_Lubrication.pdf
- Related diagrams: 032_01

### Timing Belt Replacement

- Difficulty: Advanced
- Interval: Every 100,000 km or 60 months
- Specs:
  - Belt Tooth Length Z1: 44 teeth
  - Belt Tooth Length Z2: 40.5 teeth
  - Tensioner Adjuster Torque: 25 Nm (2.5 kgf-m, 18.4 ft-lb)
  - Belt Idler No. 1 Torque: 39 Nm (4.0 kgf-m, 28.9 ft-lb)
  - Belt Idler No. 2 Torque: 39 Nm (4.0 kgf-m, 28.9 ft-lb)
  - Camshaft Sprocket Torque: 78 Nm (8.0 kgf-m, 57.9 ft-lb)
  - Crank Pulley Bolt Torque: 127 Nm (13.0 kgf-m, 94 ft-lb)
  - Belt Cover Torque: 5 Nm (0.5 kgf-m, 3.6 ft-lb)
  - Belt-to-Guide Clearance: 1.0 +/- 0.5 mm
  - Tensioner Rod Extension: 5.7 +/- 0.5 mm
  - Tensioner Press Pressure: 294 N (30 kgf, 66 lb)
  - Crank Pulley Wrench (ST): 499977300
  - Cam Sprocket Wrench (ST1): 499207100
  - Cam Sprocket Wrench (ST2): 499207400
- Steps:
  1. Disconnect battery ground cable
  2. Remove V-belts (alternator, A/C, power steering)
  3. Remove crankshaft pulley using ST 499977300
  4. Remove belt covers (RH and LH)
  5. Remove timing belt guide (MT vehicles only)
  6. Mark timing belt rotation direction if reusing
  7. Align crank sprocket mark (a) with cylinder block notch (b)
  8. Verify cam sprocket alignment marks match cylinder head surfaces
  9. Remove belt idler No. 2, then belt idler No. 1
  10. Remove timing belt
  11. Remove automatic belt tension adjuster assembly
  12. Using a vertical press, press adjuster rod down with 294 N pressure gradually for more than 3 minutes, then insert 2mm stopper pin
  13. Install new tensioner adjuster assembly - torque to 25 Nm
  14. Install belt idler No. 1 - torque to 39 Nm
  15. Align camshaft sprockets using ST1 and ST2
  16. Install new timing belt matching alignment marks, ensure correct rotation
  17. Install belt idler No. 2 - torque to 39 Nm
  18. Remove stopper pin from tensioner adjuster
  19. Install timing belt guide (MT only), check 1.0mm clearance
  20. Install belt covers, crankshaft pulley, and V-belts
  21. Rotate engine 2 full turns and verify all alignment marks
- Related PDFs:
  - /manuals/EJ20E-SOHC-engine/EJ20_SOHC_Mechanical.pdf
- Related diagrams: 013_01, 013_02

### Coolant Flush

- Difficulty: Easy
- Interval: Every 30,000 km or 24 months
- Specs:
  - Coolant Type: Subaru Genuine Long-Life Coolant
  - Capacity (MT, to FULL): 6.3 L (6.7 US qt)
  - Capacity (AT, to FULL): 6.4 L (6.8 US qt)
  - Reservoir Tank Capacity: 0.45 L (0.5 US qt)
  - Thermostat Opens: 76-80 C (169-176 F)
  - Thermostat Fully Open: 91 C (196 F)
  - Thermostat Valve Lift: 9.0 mm (0.354 in) or more
  - Thermostat Cover Torque: 6.4 Nm (0.65 kgf-m, 4.7 ft-lb)
  - Coolant Concentration: 30-50% (adjust for climate)
  - Radiator Cap Pressure: 108 +/- 15 kPa (16 +/- 2 psi)
  - Water Pump Bolt Torque: 12 Nm (1.2 kgf-m, 8.7 ft-lb) in 2 stages
- Steps:
  1. Allow engine to cool completely - radiator is pressurized when hot
  2. Lift vehicle, remove under cover
  3. Place drain pan under radiator, remove drain cock
  4. Remove radiator cap to speed draining
  5. Drain coolant completely from radiator and engine block
  6. Close drain cock, fill radiator with clean water
  7. Run engine at 2,000-3,000 rpm for 5 minutes to flush
  8. Drain flush water and repeat if still discolored
  9. Close drain cock, fill with Subaru Genuine Coolant mix to filler neck
  10. Fill reservoir tank to FULL level
  11. Warm engine at 2,000-3,000 rpm for 5+ minutes
  12. Check radiator level as thermostat opens, top up as needed
  13. Check reservoir level, add coolant to upper level mark
  14. Install radiator cap and reservoir cap securely
- Related PDFs:
  - /manuals/EJ20E-SOHC-engine/EJ20_Cooling.pdf
- Related diagrams: 035_01, 036_01

### Brake Pads (Front & Rear)

- Difficulty: Moderate
- Interval: Every 20,000 km or as needed
- Specs:
  - Front Type: Disc (Floating type, ventilated)
  - Front Pad Dimensions (friction material): 112.4 x 44.3 x 11.0 mm
  - Front Pad Standard Thickness (factory service check, including back metal): 17 mm (0.67 in)
  - Front Pad Wear Limit (factory service check, including back metal): 7.5 mm (0.295 in)
  - Front Disc Thickness (new): 24 mm (0.94 in)
  - Front Disc Min Thickness: 22 mm (0.87 in)
  - Front Disc Max Runout: 0.075 mm (0.003 in)
  - Front Caliper Guide Pin Torque: 37 Nm (3.8 kgf-m, 27.5 ft-lb)
  - Front Support Bolt Torque: 78 Nm (8.0 kgf-m, 58 ft-lb)
  - Rear Type: Disc (Floating type)
  - Rear Pad Dimensions (friction material): 92.4 x 33.7 x 10.0 mm
  - Rear Pad Standard Thickness (factory service check, including back metal): 15 mm (0.59 in)
  - Rear Pad Wear Limit (factory service check, including back metal): 6.5 mm (0.256 in)
  - Rear Disc Thickness (new): 10 mm (0.39 in)
  - Rear Disc Min Thickness: 8.5 mm (0.335 in)
  - Rear Disc Max Runout: 0.10 mm (0.004 in)
  - Brake Fluid: DOT 3 or DOT 4
  - Air Bleeder Screw Torque: 8 Nm (0.8 kgf-m, 5.8 ft-lb)
- Steps:
  1. Loosen wheel lug nuts, raise vehicle and support on jack stands
  2. Remove wheel
  3. Inspect pad thickness through caliper inspection hole
  4. Remove caliper guide pin bolts (lower bolt first)
  5. Swing caliper up and support with wire - do not hang by brake hose
  6. Remove old pads, outer shim, inner shim, and pad clips
  7. Clean caliper bracket/support with brake cleaner
  8. Inspect disc rotor thickness and runout against service limits
  9. Push caliper piston back using C-clamp (check fluid reservoir level first)
  10. Install new pad clips on support bracket
  11. Install new inner shim, pad (inside), pad (outside), and outer shim
  12. Lower caliper over new pads and install guide pin bolts
  13. Torque guide pin bolts to 37 Nm (front) or per spec (rear)
  14. Reinstall wheel, torque lug nuts
  15. Pump brake pedal several times before driving to seat pads
  16. Check and top up brake fluid reservoir
- Related PDFs:
  - /manuals/BG-chassis/MECHANICAL COMPONENTS SECTION/BRAKES/MSA5TCD97L3677.pdf
  - /manuals/BG-chassis/MECHANICAL COMPONENTS SECTION/BRAKES/MSA5TCD97L3678.pdf
- Related diagrams: 265_01, 265_02, 265_03, 265_04

### Spark Plugs

- Difficulty: Moderate
- Interval: Every 20,000 km or 12 months
- Specs:
  - Plug (without catalytic converter): NGK BKR6E
  - Plug (with catalytic converter): Champion RC10YC4 or NGK BKR5E-11
  - Thread Size: M14, P = 1.25
  - Gap (without catalyst): 0.7-0.8 mm (0.028-0.031 in)
  - Gap (with catalyst): 1.0-1.1 mm (0.039-0.043 in)
  - Spark Plug Torque: 21 Nm (2.1 kgf-m, 15 ft-lb)
  - Ignition Coil Bolt Torque: 6.4 Nm (0.65 kgf-m, 4.7 ft-lb)
  - Spark Plug Cord Resistance: 5.24-12.23 k-ohm
  - Firing Order: 1-3-2-4
  - Ignition Coil: Hitachi CM12-100B
- Steps:
  1. Disconnect battery ground cable
  2. RH side: Remove air intake duct and resonator chamber
  3. LH side: Disconnect washer motor, remove washer tank bolts
  4. Remove spark plug cords by pulling on the boot, not the cord
  5. Remove spark plugs with spark plug socket (16mm deep)
  6. Inspect old plugs for fouling, damage, and wear
  7. Check new plug gap with feeler gauge, adjust if needed
  8. Install new spark plugs hand-tight first to prevent cross-threading
  9. Torque spark plugs to 21 Nm (15 ft-lb) - dry threads only
  10. If threads are oiled, reduce torque by approximately 1/3
  11. Reconnect spark plug cords to correct positions (firing order 1-3-2-4)
  12. Reinstall resonator chamber (torque to 32 Nm), air intake duct
  13. Reinstall washer tank (LH side), reconnect battery
- Related PDFs:
  - /manuals/EJ20E-SOHC-engine/EJ20_SOHC_Ignition_no_OBD.pdf
- Related diagrams: 090_01

### Air Filter Replacement

- Difficulty: Easy
- Interval: Every 20,000 km or 12 months (inspect every 10,000 km)
- Specs:
  - Filter Type: Panel filter element
  - OEM Part Number: 16546-AA020 (verify for model year)
  - Case Bolt Torque: 6.5 Nm (0.66 kgf-m, 4.8 ft-lb)
  - Case Stay Bolt Torque: 16 Nm (1.6 kgf-m, 11.6 ft-lb)
  - Resonator Chamber Torque: 33 Nm (3.4 kgf-m, 24.4 ft-lb)
- Steps:
  1. Open hood and locate air cleaner case on top of engine
  2. Release clips (B) above the air cleaner case
  3. Remove bolts (A) securing air cleaner case to stays
  4. Separate upper air cleaner case (case B) from lower (case A)
  5. Remove air cleaner element from case
  6. Inspect element - replace if excessively damaged or dirty
  7. Clean inside of both air cleaner case halves
  8. Install new air cleaner element into lower case
  9. Reassemble upper case, fasten with clips after inserting lower tab
  10. Reinstall securing bolts
- Related PDFs:
  - /manuals/EJ20E-SOHC-engine/EJ20_SOHC_Intake.pdf
- Related diagrams: 070_01

### Manual Transmission Fluid Change

- Difficulty: Moderate
- Interval: Every 50,000 km or 30 months
- Specs:
  - Fluid Type: GL-5 (75W-90 gear oil)
  - Capacity: 3.5 L (3.7 US qt)
  - Transmission Type: 5-speed synchromesh with reverse
  - Transfer Gear Ratio: 1.000
  - Final Drive Ratio (BG5P EJ20E): 3.900
  - 1st Gear Ratio: 3.545
  - 2nd Gear Ratio: 2.111
  - 3rd Gear Ratio: 1.448
  - 4th Gear Ratio: 1.088
  - 5th Gear Ratio: 0.780
  - Reverse Gear Ratio: 3.416
  - Transmission Drain Plug Torque: 70 Nm (7.1 kgf-m, 51.6 ft-lb) for gasket-type plug, or 44 Nm (4.5 kgf-m, 32.5 ft-lb) for tapered-thread plug
  - Transmission Fill Plug Torque: 44 Nm (4.5 kgf-m, 32.5 ft-lb)
- Steps:
  1. Raise vehicle and support on jack stands, remove under cover
  2. Place drain pan under transmission
  3. Clean area around drain and fill plugs
  4. Remove fill plug first (to ensure it can be removed before draining)
  5. Remove drain plug and allow fluid to drain completely
  6. Inspect drain plug magnet for metal particles
  7. Install drain plug with new washer, torque to spec
  8. Fill transmission through fill plug hole with GL-5 gear oil
  9. Fill until fluid begins to seep from fill hole (3.5 L total)
  10. Install fill plug with new washer, torque to spec
  11. Lower vehicle and test-drive, checking all gears engage smoothly
- Related PDFs:
  - /manuals/BG-chassis/TRANSMISSION/MANUAL TRANSMISSION AND DIFFERENTIAL/MSA5TCD97L3564.pdf
- Related diagrams: 100_01, 110_01

### Clutch Replacement

- Difficulty: Advanced
- Interval: As needed (typically 100,000-150,000 km)
- Specs:
  - Clutch Disc Facing O.D. x I.D. x Thickness: 225 x 150 x 3.5 mm
  - Clutch Disc Facing: Woven type
  - Clutch Disc Spline O.D. (24 teeth): 25.2 mm
  - Diaphragm Set Load (BG5P EJ20E): 450 kg (992 lb)
  - Release Bearing Type: Grease-packed self-aligning
  - Release Lever Ratio: 3.0
  - Clutch Pedal Full Stroke: 140-150 mm (5.51-5.91 in)
  - Release Lever Stroke: 24-26 mm (0.94-1.02 in)
  - Release Lever Play (at center): 3-4 mm (0.12-0.16 in)
  - Disc Rivet Depth (standard): 1.3-1.9 mm
  - Disc Rivet Depth (wear limit): 0.3 mm
  - Disc Runout Limit: 1.0 mm at R=107 mm
  - Cover Bolt Torque: 15.7 Nm (1.6 kgf-m, 11.6 ft-lb)
- Steps:
  1. Disconnect battery ground cable
  2. Remove air intake duct and air cleaner assembly
  3. Disconnect clutch cable or hydraulic line
  4. Support engine with lifting device and wire ropes
  5. Raise vehicle, remove front wheels and under cover
  6. Drain transmission fluid
  7. Remove front exhaust pipe
  8. Remove propeller shaft (AWD models)
  9. Disconnect all electrical connectors from transmission
  10. Support transmission with jack, remove mounting bolts
  11. Carefully lower and remove transmission
  12. Mark clutch cover position relative to flywheel
  13. Gradually loosen cover bolts in star pattern, remove clutch cover and disc
  14. Inspect flywheel surface for scoring, heat damage, and runout
  15. Inspect release bearing for noise and smooth rotation, replace if worn
  16. Install new clutch disc using alignment tool (spline side toward transmission)
  17. Install new clutch cover, align marks, torque bolts gradually to 15.7 Nm
  18. Apply small amount of grease to input shaft splines
  19. Install release bearing on release lever
  20. Reinstall transmission, torque mounting bolts to spec
  21. Reconnect all components in reverse order of removal
  22. Fill transmission with GL-5 fluid (3.5 L)
  23. Adjust clutch pedal free play, bleed hydraulic system if equipped
- Related PDFs:
  - /manuals/BG-chassis/ENGINE - UNIVERSAL/CLUTCH/MSA5TCD97L3544.pdf
  - /manuals/BG-chassis/ENGINE - UNIVERSAL/CLUTCH/MSA5TCD97L3545.pdf
- Related diagrams: 130_03, 130_04

### Differential Fluid Change

- Difficulty: Moderate
- Interval: Every 50,000 km or 30 months
- Specs:
  - Front Diff Type: Straight bevel gear (integrated in transmission)
  - Front Diff Gear Type: Hypoid
  - Front Final Ratio (BG5P EJ20E): 3.900
  - Front Diff Fluid: GL-5 (shared with transmission, 3.5 L total)
  - Rear Diff Type: Hypoid gear
  - Rear Final Ratio (BG5P EJ20E): 3.900
  - Rear Diff Fluid Type: GL-5 (75W-90 gear oil)
  - Rear Diff Capacity: 0.8 L (0.85 US qt) *
  - Rear Diff Bevel Gear Backlash: 0.13-0.18 mm
  - Center Diff Type: Viscous coupling with bevel gears (AWD)
  - Rear Diff Drain/Fill Plug Torque: 35 Nm (3.6 kgf-m, 25 ft-lb) *
  - * Note: Rear diff capacity and plug torque are community-standard values
- Steps:
  1. Raise vehicle and support securely on jack stands
  2. Place drain pan under rear differential
  3. Clean area around drain and fill plugs on rear diff housing
  4. Remove fill plug first (17mm hex) to ensure it can be removed
  5. Remove drain plug and drain old fluid completely
  6. Inspect drain plug magnet for excessive metal particles
  7. Clean and reinstall drain plug with new crush washer
  8. Fill rear differential through fill hole with GL-5 75W-90 gear oil
  9. Fill until fluid seeps from fill hole (approximately 0.8 L)
  10. Install fill plug with new crush washer
  11. Note: Front differential shares fluid with manual transmission
  12. For front diff service, perform transmission fluid change procedure
  13. Lower vehicle and test-drive, listening for whine or noise
- Related PDFs:
  - /manuals/BG-chassis/TRANSMISSION/MANUAL TRANSMISSION AND DIFFERENTIAL/MSA5TCD97L3564.pdf
- Related diagrams: 190_01, 195_02
