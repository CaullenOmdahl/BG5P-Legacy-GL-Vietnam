# ESP32 SSM1 Interface + Carputer — Staged Plan and Parts List

Modernization project for the BG5P Legacy GL (EJ20E, LHD, Vietnam market): an
ESP32-S3 piggybacked onto the factory diagnostic link, exposing SSM1 live data
and trouble codes over BLE to the existing **Ride Dat** phone app, and later to
an in-dash carputer running Android Auto.

Everything under "Verified from the factory manuals" is taken from the service
manual text in this repo and is citable. Everything under "Unverified" is a
community figure or an assumption that has to be confirmed on the car before
parts are committed.

---

## Verified from the factory manuals in this repo

Source: `site/chatbot-knowledge/pdf-text/01_BG5P_EJ20E_No_OBD_Diagnostics_Searchable.txt`
(EN(SOHCw/oOBD) sections 4-6) and
`site/chatbot-knowledge/pdf-text/04_BG5P_BG_Chassis_Wiring_Electrical_Searchable.txt`
(connector list).

### There are three diagnostic connectors under the dash, not two

`EN(SOHCw/oOBD)-10` "Electrical Components Location" lists them separately:

| # | Connector | Purpose |
|---|---|---|
| (3) | **Read memory connector** | Jumper. Shorted = ECM flashes stored DTCs on the MIL. |
| (4) | **Test mode connector** | Jumper. Shorted = ECM enters D-check / inspection mode. |
| (5) | **Data link connector** | The actual Subaru Select Monitor serial link. |

The chassis wiring connector index gives the hardware:

| Designator | Pins | Colour | Description |
|---|---|---|---|
| **B78** | **9** | **Yellow** | Data link connector (for S.S.M.) |
| B82 | 6 | Black | Diagnosis connector |

Location: "Data link connector located in the lower portion of the instrument
panel (on the driver's side)" — `EN(SOHCw/oOBD)-24`.

> **This changes which plug to buy.** The connector with *fewer* pins is a mode
> jumper, not the serial link. The ESP32 has to land on the **9-pin yellow B78
> data link connector**. The read memory and test mode connectors are still
> worth wiring to (see Stage 2), but they carry no data — they are inputs the
> ECM reads as "shorted to ground or not".

### ECM side of the link (connector B84)

From the ECM I/O signal table, `EN(SOHCw/oOBD)-21/22`:

| Signal | ECM conn. | Pin | Sub-conn. | Sub-pin | Notes |
|---|---|---|---|---|---|
| Select monitor signal | B84 | 24 | C | 45 | Two separate lines — so Tx and Rx, not a single K-line |
| Select monitor signal | B84 | 32 | D | 54 | |
| Test mode connector | B84 | 28 | D | 58 | 10-13 V open, **0 V when connected**. (Pin 19 / D-50 on RHD cars — ours is LHD, so pin 28.) |
| Read memory connector | B84 | 20 | D | 49 | 10-13 V open, **0 V when connected** |
| Back-up power supply | B84 | 34 | D | 52 | 10-13 V with ignition OFF |
| Control unit power supply | B84 | 9, 17 | B, C | 27, 36 | |
| Immobilizer serial line | B84 | 23, 31 | D | 46, 55 | Separate from SSM — do not tap |
| GND (ignition system) | E22 | 10 | A | 11 | |
| GND (power supply) | E22 | 11, 12 | A | 10, 9 | |
| GND (control systems) | E22 | 21 | B | 25 | |

Two select-monitor pins plus an active-low mode input means a plain 3.3 V UART
cannot be wired straight across: the lines idle at 5 V logic and the mode inputs
sit at battery voltage.

### What SSM1 actually exposes on this ECM

`EN(SOHCw/oOBD)-24/25`, "Current Data Display" — this is the Ride Dat dashboard
list, and it is a good one for an NA EJ20E:

**Analogue / numeric:** battery voltage (V), vehicle speed (km/h), engine speed
(rpm), coolant temperature (°C), ignition timing (deg), throttle position
(% and V), injection pulse width (ms), idle air control signal (%), engine load
(%), front O2 sensor output (V), A/F correction coefficient (%), knock sensor
signal (deg), CO resistor (V), intake manifold pressure (mmHg/kPa), intake air
temperature (°C), canister purge duty (%), IAC solenoid current (mA).

**Boolean:** ignition switch, test mode connector, neutral position switch, A/C
switch, A/C relay, radiator main fan relay, fuel pump relay, knocking, radiator
sub fan relay, engine torque control, front O2 rich, crankshaft position sensor,
electrical load, read memory connector, AT vehicle ID, idle switch, canister
purge solenoid, torque permission.

**Modes beyond live data:** read DTC, clear memory, inspection mode, compulsory
valve operation check (`EN(SOHCw/oOBD)-27` through `-32`). Clear-memory needs an
ISC re-initialization afterwards — ignition ON, wait 3 s, then start
(`07_BG5P_Diagnostic_Quick_Reference.md`).

The 17-code DTC table for this ECM is already transcribed in
`site/chatbot-knowledge/07_BG5P_Diagnostic_Quick_Reference.md` — reuse it as the
firmware's code→description lookup instead of writing a new one.

### Factory tooling, for reference

- Subaru Select Monitor kit: **22771AA030** (English, without printer).
- ECM pin-check jig: **ST 498307600 CHECK BOARD KIT**, connected between the ECM
  and its connector.

Neither is realistically sourceable in Vietnam, which is the reason for building
the interface.

### What the manuals do NOT state

The service manuals in this repo document *how to use* the Select Monitor, never
the wire protocol. They give **no** baud rate, framing, pin-to-function mapping
for B78, or request/response byte format. Those have to come from a scope
capture or community sources, and must be verified before any board is laid out.

---

## Unverified — confirm before ordering

1. **B78 pin functions.** Which of the 9 pins are Tx, Rx, +12 V, ignition-switched
   +12 V and ground. Not in the manual text; the wiring diagram page
   (section 2-7 [T2A1]) is an un-OCR'd image in the PDF set.
2. **Baud rate and framing.** Community sources for SSM1 commonly cite
   1953 baud 8N1. Treat as a hypothesis to confirm by capture, not a spec.
3. **Logic levels and idle polarity.** Whether the lines are 5 V TTL non-inverted
   or inverted, and whether the ECM Rx needs a pull-up.
4. **Mating connector identity.** The B78 shell is **not** a serviceable part in
   the parts catalog (`site/public/llms/parts-index.txt` lists no data link
   connector; it is supplied only as part of the main harness, diagrams
   `810_02`-`810_04`). So there is no OEM part number to chase — the plug has to
   be identified by physical measurement and matched to a generic housing, or
   the link tapped another way (see Stage 1, option B).

**Measurements needed at the car** (10 minutes with the glovebox-side trim off):
pin count and colour of each connector found; pin pitch in mm; whether pins are
male or female in the vehicle-side shell; wire colours per cavity; and with
ignition ON, DC voltage of every B78 pin to chassis ground.

---

## Stages

### Stage 0 — Characterize the link (no parts bought yet)

Goal: turn the four unknowns above into facts.

Steps: photograph and measure all three connectors; log B78 pin voltages with
ignition ON, engine off; hook a scope or logic analyzer to the two candidate
signal pins and capture the idle level; if nothing moves, probe ECM B84 pins 24
and 32 directly at the ECM connector to find which vehicle-side wires carry the
link; decode a capture to recover baud rate and framing.

Exit criteria: a pin map for B78, a confirmed baud rate, and a confirmed logic
level. Only then does the Stage 1 BOM lock.

### Stage 1 — Bench-and-car diagnostics link

Goal: ESP32-S3 reads live data and DTCs from the ECM, printing to USB serial.
No BLE, no app, no permanent install.

### Stage 2 — Ride Dat integration

Goal: the car appears in Ride Dat alongside the Dat Bike Quantum.

Work: reuse the existing Ride Dat BLE GATT service and characteristic layout
from the Quantum's ESP32-S3 so the app's transport layer is unchanged; add a
vehicle-type discriminator so one app handles both; expose the numeric
parameters as a periodic notify stream and DTC read/clear as commands; port the
DTC table from `07_BG5P_Diagnostic_Quick_Reference.md`.

Optional on the car side: drive the read memory and test mode connectors from
the ESP32 through two automotive relays or low-side MOSFETs, so inspection mode
and the manual flash-code path become app buttons rather than a jumper wire.
Both are active-low inputs per the ECM table, so a low-side switch to ground is
all that is needed — but gate them behind a confirmation in the app, because
clear-memory requires the ISC re-initialization afterwards.

Then: permanent install, fused, behind the lower dash trim.

### Stage 3 — Carputer with Android Auto

Goal: in-dash screen showing Android Auto plus a native BG5P diagnostics view
fed by the same ESP32.

Decision to make first: a commodity Android head unit (cheap and plentiful in
Vietnam, Android Auto built in, but closed and hard to extend) versus an
SBC-based build (Raspberry Pi / Orange Pi with an OpenAuto-style stack: fully
controllable, more work, needs a proper 12 V shutdown story). The ESP32 link is
identical either way — BLE to the head unit, or swap to UART/USB if the carputer
sits next to it — so this choice does not block Stages 0-2.

---

## Stage 1 parts list

Quantities are for one working interface plus enough spares that a single
mistake does not stall the project for a week. "Source" reflects what is
realistically obtainable in Vietnam: Shopee/Lazada VN for modules, Nhật Tảo
market (HCMC) or Chợ Trời / Hai Bà Trưng electronics shops (Hanoi) for discretes
and connectors, LCSC/Taobao for anything else.

### Core

| # | Item | Qty | Why | Source |
|---|---|---|---|---|
| 1 | ESP32-S3 dev board (ESP32-S3-DevKitC-1, or S3 Mini / S3 Zero for the final install) | 2 | Same silicon family as the Dat Bike Quantum, so the Ride Dat BLE stack ports directly. Two boards: one stays on the bench. | Shopee/Lazada VN |
| 2 | 3.3 V ↔ 5 V bidirectional level shifter module (TXS0108E 8-ch, or 74LVC245) | 2 | The select monitor lines are 5 V; the S3 is 3.3 V. An 8-channel part leaves room for the Stage 2 relay drives. | Shopee/Lazada VN |
| 3 | Automotive 12 V → 5 V buck converter, 3 A, wide input (MP1584EN module, or a regulated 12-to-5 automotive brick) | 2 | Vehicle rail is 10-14 V and dips hard on crank. | Shopee/Lazada VN |
| 4 | Inline blade fuse holder + 2 A fuses | 2 holders, 5 fuses | Nothing taps a 12 V rail unfused. | Any auto electrical shop |
| 5 | TVS diode, bidirectional, ~24 V standoff (SMBJ24CA or 1.5KE24CA) | 5 | Load-dump and inductive spike protection on the 12 V input. | LCSC / Nhật Tảo |
| 6 | Reverse-polarity / input protection: Schottky diode 3 A 60 V (SS34) or P-MOSFET ideal diode | 5 | Cheap insurance against a reversed supply tap. | LCSC / Nhật Tảo |
| 7 | Electrolytic caps 100 µF 50 V + ceramic 100 nF 50 V | 5 each | Bulk and decoupling on the vehicle-side rail. | Nhật Tảo |

### Connector — two routes, pick after Stage 0

**Option A (preferred): mate properly with B78.** Measure the pin pitch and
cavity count, then match a generic housing. The common pitches in this era of
Japanese harness are 2.3 mm (Sumitomo HM/090-series) and 2.8 mm; a 9-way shell
in the right series plus loose terminals and seals is the target. Order 3 shells
and 20 terminals so crimping practice is free.

**Option B (fallback): no mating plug.** If the correct 9-way shell cannot be
found, do not bodge the factory connector. Instead build a splice harness:
individual gold-plated 2.3 mm female terminals into the existing cavities, or a
T-tap on the harness side 100 mm back from the connector, with heatshrink and
loom tape. Less elegant, fully reversible, and does not risk damage to a
30-year-old irreplaceable connector.

| # | Item | Qty | Why | Source |
|---|---|---|---|---|
| 8 | 9-way connector housing matching B78 pitch (identity TBD from Stage 0) | 3 | Option A | Taobao / LCSC / local harness shop |
| 9 | Loose female terminals for the above | 20 | Option A, and crimping practice | same |
| 10 | Assorted automotive female terminals, 2.3 mm and 2.8 mm | 20 each | Option B | Nhật Tảo |
| 11 | Ratcheting crimp tool for open-barrel automotive terminals | 1 | Hand-crimped automotive terminals fail by vibration. Buy the tool. | Shopee VN |
| 12 | Automotive wire, 0.5 mm² and 0.75 mm², 5 colours | 5 m each | Harness-grade, not hookup wire. | Auto electrical shop |
| 13 | Adhesive-lined heatshrink assortment + wire loom / fabric tape | 1 set | Under-dash wiring gets vibrated and heat-cycled. | Nhật Tảo |

### Enclosure and install

| # | Item | Qty | Why | Source |
|---|---|---|---|---|
| 14 | Small ABS enclosure, ~80 × 50 × 25 mm | 2 | Cabin-side, so no IP rating needed, but it must not rattle. | Shopee VN |
| 15 | Prototyping board / perf board, 5 × 7 cm | 5 | Stage 1 is hand-built; a PCB waits until the protocol is proven. | Nhật Tảo |
| 16 | Dupont jumpers, pin headers, JST-XH 2/3/4-pin pairs | 1 set | Keeps the bench build re-configurable. | Shopee VN |
| 17 | 3M VHB tape or zip-tie mounts | 1 set | Mounting behind the lower dash. | Any hardware shop |

### Test equipment (Stage 0 — borrow if possible)

| # | Item | Qty | Why | Source |
|---|---|---|---|---|
| 18 | Multimeter with DC volts and continuity | 1 | The B78 pin voltage map. Non-negotiable. | Shopee VN |
| 19 | USB logic analyzer, 8-ch (Saleae clone) **or** a cheap 2-ch USB scope | 1 | This is the one item that decides whether Stage 0 succeeds. A logic analyzer alone is enough to recover baud rate and framing; a scope also shows levels and noise. | Shopee VN |
| 20 | USB-TTL adapter with selectable 3.3/5 V (CP2102 or FT232RL) | 2 | Lets you sniff the link from a laptop before the ESP32 firmware exists. | Shopee VN |
| 21 | Backprobe pins / fine test leads | 1 set | Probing a live connector without spreading its terminals. | Shopee VN |

### Explicitly deferred to later stages

K-line transceiver ICs (L9637D, MC33290, SI9241): **do not order yet.** Those
are for the single-wire ISO 9141 K-line used on later Subarus. The ECM table
above shows two separate select-monitor pins, which points to split Tx/Rx, where
a plain level shifter or a pair of transistors is correct and a K-line
transceiver is wrong. Confirm in Stage 0 before spending on either.

Also deferred: CAN transceivers (this car has no CAN bus), relays/MOSFETs for
the mode connectors (Stage 2), screen, SBC or head unit, GPS, and the 12 V
shutdown supervisor (Stage 3).

---

## Open questions

1. Pin count, colour and pitch of each of the three connectors as actually
   fitted to this car — the manual covers several market variants.
2. Does this LHD General Market car have the immobilizer? DTC 53 exists in the
   code table and the ECM has immobilizer serial pins (B84 23/31). If fitted,
   keep well clear of those pins.
3. Does Ride Dat's current GATT layout have room for ~18 numeric channels plus
   ~18 booleans plus DTC commands, or does the car need its own service UUID?
4. Carputer route: commodity Android head unit or SBC build (Stage 3 above).
