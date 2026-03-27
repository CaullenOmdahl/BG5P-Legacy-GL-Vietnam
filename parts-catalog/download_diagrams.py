#!/usr/bin/env python3
"""
Download exploded parts diagrams for BG5 Legacy EJ20E SOHC NA from PartSouq CDN.

Vehicle: Subaru Legacy Touring Wagon GL (BG5P) — EJ20E 2.0L SOHC NA
Source: PartSouq Subaru EPC (VIN: JF1BG5LJ4VG072437)
Variant: B11 (BG5DL3J) — Europe/General, 2000CC EMPI SOHC NA

Diagram filenames use suffix _LH_2_LR.gif (SOHC NA variant).
Turbo DOHC diagrams use _A_2_SF.gif — these are NOT downloaded.
"""

import os
import sys
import time
import requests
from pathlib import Path
from collections import OrderedDict

BASE_URL = "https://partsouq.com/assets/tesseract/assets/global/SUBARU201802/source"

# Section name -> list of diagram codes (XXX_YY format)
# All diagrams are for B11 model code (BG5 Legacy) with _LH_2_LR suffix (SOHC NA)
SECTIONS = OrderedDict([
    ("01_ENGINE_MAIN", [
        "001_01", "002_01", "003_01", "004_01", "004_02", "005_01", "006_01",
        "010_01", "011_01", "012_02", "013_01", "013_02", "020_01", "022_01",
        "030_01", "031_02", "032_01", "035_01", "036_01",
    ]),
    ("02_ENGINE_AUXILIARIES", [
        "050_02", "050_03", "061_02", "061_03", "062_01", "063_01",
        "070_01", "071_01", "073_02", "082_01",
    ]),
    ("03_ENGINE_ELECTRICAL", [
        "090_01", "091_02", "093_01", "093_02", "094_01", "094_02", "096_01",
    ]),
    ("04_MANUAL_TRANSMISSION", [
        "100_01", "110_01", "111_01", "113_01", "113_02", "114_01", "114_02",
        "115_06", "116_01", "116_02", "116_03", "117_01", "119_01",
        "121_01", "121_02", "130_03", "130_04",
    ]),
    ("05_DIFFERENTIAL_PROPELLER", [
        "190_01", "195_02", "199_01",
    ]),
    ("06_SUSPENSION_AXLE_BRAKE", [
        "200_01", "201_02", "210_02", "211_02", "220_01", "220_02",
        "260_01", "261_01", "261_02", "262_02", "262_04",
        "263_01", "263_02", "263_03", "263_04",
        "265_01", "265_02", "265_03", "265_04",
        "267_05", "267_06", "268_01",
        "280_01", "280_02", "280_03", "280_39",
        "281_01", "281_02", "281_39",
        "290_01", "291_01", "292_01",
    ]),
    ("07_STEERING", [
        "341_01", "342_01", "342_02", "343_01", "343_02", "343_03", "343_04",
        "346_01", "347_01", "348_01", "348_04",
        "350_04", "350_05", "350_06",
        "360_01", "360_02", "371_01", "372_01", "373_01",
    ]),
    ("08_ENGINE_MOUNTING_COOLING", [
        "410_03", "411_01", "415_01", "420_01", "420_02",
        "421_03", "421_04", "440_01", "440_02", "440_03", "440_04",
        "450_03", "450_04",
    ]),
    ("09_BODY_KEY_BUMPER", [
        "510_01", "511_01", "512_01", "512_02", "512_03", "512_04", "513_01",
        "520_02", "521_02", "530_02", "540_01", "541_02", "541_03",
        "550_01", "565_01", "565_02", "570_01", "575_01",
        "580_01", "580_03", "590_02", "590_06", "590_07", "590_08",
        "591_03", "591_07", "591_08", "591_09",
    ]),
    ("10_DOOR_PARTS", [
        "600_01", "600_02", "601_01", "602_01",
        "610_01", "610_02", "611_01", "612_01",
        "620_01", "621_01", "622_01",
    ]),
    ("11_SEAT_INSTRUMENT_PANEL", [
        "640_01", "640_03", "641_04", "645_01", "646_02",
        "650_01", "652_02", "654_04", "654_05", "654_06", "654_07", "654_08",
        "657_01", "660_01", "660_02", "660_03", "660_04",
    ]),
    ("12_HEATER_AC", [
        "720_01", "721_01", "722_01", "723_01",
        "730_01", "730_02", "731_01", "732_01",
    ]),
    ("13_BODY_ELECTRICAL_1", [
        "810_02", "810_03", "810_04", "812_01", "813_01", "814_01",
        "815_02", "816_01", "818_01", "820_01", "822_01", "822_02",
        "830_01", "830_02", "832_01", "832_02", "833_01", "835_01", "835_02",
    ]),
    ("14_BODY_ELECTRICAL_2", [
        "840_01", "841_01", "841_02", "842_03", "842_04", "843_01",
        "845_01", "845_03", "846_01", "846_02", "846_03", "847_02",
        "850_01", "850_02", "860_01", "862_01",
        "863_01", "863_03", "863_04",
        "870_01", "871_01", "875_01", "876_01", "877_01", "880_01",
    ]),
    ("15_OUTER_ACCESSORIES", [
        "900_02", "900_03", "901_01", "911_01", "912_01",
        "913_01", "913_02", "913_03", "915_01", "916_01", "918_01",
        "919_01", "919_02", "920_01", "921_01", "921_03", "921_04", "922_01",
    ]),
    ("16_INNER_ACCESSORIES", [
        "930_01", "930_02", "931_01", "931_02", "935_02",
        "940_03", "940_04", "941_01", "941_02", "942_02",
        "950_01", "950_03", "953_01", "955_02", "956_01", "970_01",
    ]),
])

# Subcategory names for each code (from epc-data.com section index pages)
SUBCATEGORY_NAMES = {
    # 01_ENGINE_MAIN
    "001_01": "ENGINE ASSEMBLY",
    "002_01": "ENGINE GASKET & SEAL KIT",
    "003_01": "SHORT BLOCK ENGINE",
    "004_01": "CYLINDER BLOCK",
    "004_02": "CYLINDER BLOCK",
    "005_01": "TIMING HOLE PLUG & TRANSMISSION BOLT",
    "006_01": "CYLINDER HEAD",
    "010_01": "PISTON & CRANKSHAFT",
    "011_01": "FLYWHEEL",
    "012_02": "VALVE MECHANISM",
    "013_01": "CAMSHAFT & TIMING BELT",
    "013_02": "CAMSHAFT & TIMING BELT",
    "020_01": "ROCKER COVER",
    "022_01": "TIMING BELT COVER",
    "030_01": "OIL FILLER DUCT",
    "031_02": "OIL PAN",
    "032_01": "OIL PUMP & FILTER",
    "035_01": "WATER PUMP",
    "036_01": "WATER PIPE (1)",
    # 02_ENGINE_AUXILIARIES
    "050_02": "INTAKE MANIFOLD",
    "050_03": "INTAKE MANIFOLD",
    "061_02": "FUEL PIPE",
    "061_03": "FUEL PIPE",
    "062_01": "FUEL INJECTOR",
    "063_01": "THROTTLE CHAMBER",
    "070_01": "AIR CLEANER & ELEMENT",
    "071_01": "AIR INTAKE",
    "073_02": "AIR DUCT",
    "082_01": "EMISSION CONTROL (PCV)",
    # 03_ENGINE_ELECTRICAL
    "090_01": "SPARK PLUG & HIGH TENSION CORD",
    "091_02": "ENGINE WIRING HARNESS",
    "093_01": "STARTER",
    "093_02": "STARTER",
    "094_01": "ALTERNATOR",
    "094_02": "ALTERNATOR",
    "096_01": "RELAY & SENSOR (ENGINE)",
    # 04_MANUAL_TRANSMISSION
    "100_01": "MT, CLUTCH",
    "110_01": "MT, TRANSMISSION ASSEMBLY",
    "111_01": "MT, GASKET & SEAL KIT",
    "113_01": "MT, TRANSMISSION CASE",
    "113_02": "MT, TRANSMISSION CASE",
    "114_01": "MT, MAIN SHAFT",
    "114_02": "MT, MAIN SHAFT",
    "115_06": "MT, DRIVE PINION SHAFT",
    "116_01": "MT, AUXILIARY GEAR",
    "116_02": "MT, AUXILIARY GEAR",
    "116_03": "MT, AUXILIARY GEAR",
    "117_01": "MT, SPEEDOMETER GEAR",
    "119_01": "MT, TRANSMISSION HARNESS",
    "121_01": "MT, TRANSFER & EXTENSION",
    "121_02": "MT, TRANSFER & EXTENSION",
    "130_03": "MT, SHIFTER FORK & SHIFTER RAIL",
    "130_04": "MT, SHIFTER FORK & SHIFTER RAIL",
    # 05_DIFFERENTIAL_PROPELLER
    "190_01": "DIFFERENTIAL (TRANSMISSION)",
    "195_02": "DIFFERENTIAL (INDIVIDUAL)",
    "199_01": "PROPELLER SHAFT",
    # 06_SUSPENSION_AXLE_BRAKE
    "200_01": "FRONT SUSPENSION",
    "201_02": "REAR SUSPENSION",
    "210_02": "FRONT SHOCK ABSORBER",
    "211_02": "REAR SHOCK ABSORBER",
    "220_01": "AIR SUSPENSION SYSTEM",
    "220_02": "AIR SUSPENSION SYSTEM",
    "260_01": "PARKING BRAKE SYSTEM",
    "261_01": "BRAKE SYSTEM (MASTER CYLINDER)",
    "261_02": "BRAKE SYSTEM (MASTER CYLINDER)",
    "262_02": "FRONT BRAKE",
    "262_04": "FRONT BRAKE",
    "263_01": "REAR BRAKE",
    "263_02": "REAR BRAKE",
    "263_03": "REAR BRAKE",
    "263_04": "REAR BRAKE",
    "265_01": "BRAKE PIPING",
    "265_02": "BRAKE PIPING",
    "265_03": "BRAKE PIPING",
    "265_04": "BRAKE PIPING",
    "267_05": "ANTILOCK BRAKE SYSTEM",
    "267_06": "ANTILOCK BRAKE SYSTEM",
    "268_01": "HILL HOLDER",
    "280_01": "FRONT AXLE",
    "280_02": "FRONT AXLE",
    "280_03": "FRONT AXLE",
    "280_39": "FRONT AXLE",
    "281_01": "REAR AXLE",
    "281_02": "REAR AXLE",
    "281_39": "REAR AXLE",
    "290_01": "DISK WHEEL",
    "291_01": "WHEEL CAP",
    "292_01": "TIRE",
    # 07_STEERING
    "341_01": "STEERING COLUMN",
    "342_01": "STEERING WHEEL",
    "342_02": "STEERING WHEEL",
    "343_01": "AIR BAG",
    "343_02": "AIR BAG",
    "343_03": "AIR BAG",
    "343_04": "AIR BAG",
    "346_01": "POWER STEERING SYSTEM",
    "347_01": "POWER STEERING GEAR BOX",
    "348_01": "OIL PUMP",
    "348_04": "OIL PUMP",
    "350_04": "MANUAL GEAR SHIFT SYSTEM",
    "350_05": "MANUAL GEAR SHIFT SYSTEM",
    "350_06": "MANUAL GEAR SHIFT SYSTEM",
    "360_01": "PEDAL SYSTEM (MT)",
    "360_02": "PEDAL SYSTEM (MT)",
    "371_01": "ACCEL CABLE",
    "372_01": "SPEEDOMETER CABLE",
    "373_01": "CLUTCH CABLE",
    # 08_ENGINE_MOUNTING_COOLING
    "410_03": "ENGINE MOUNTING",
    "411_01": "ENGINE SUPPORT",
    "415_01": "DIFFERENTIAL MOUNTING",
    "420_01": "FUEL PIPING",
    "420_02": "FUEL PIPING",
    "421_03": "FUEL TANK",
    "421_04": "FUEL TANK",
    "440_01": "EXHAUST",
    "440_02": "EXHAUST",
    "440_03": "EXHAUST",
    "440_04": "EXHAUST",
    "450_03": "ENGINE COOLING",
    "450_04": "ENGINE COOLING",
    # 09_BODY_KEY_BUMPER
    "510_01": "RADIATOR PANEL",
    "511_01": "WHEEL APRON",
    "512_01": "FLOOR PANEL",
    "512_02": "FLOOR PANEL",
    "512_03": "FLOOR PANEL",
    "512_04": "FLOOR PANEL",
    "513_01": "TOE BOARD & FRONT PANEL & STEERING BEAM",
    "520_02": "SIDE BODY OUTER",
    "521_02": "SIDE BODY INNER",
    "530_02": "ROOF PANEL",
    "540_01": "FENDER",
    "541_02": "MUDGUARD",
    "541_03": "MUDGUARD",
    "550_01": "FRONT HOOD & FRONT HOOD LOCK",
    "565_01": "FUEL FLAP & OPENER",
    "565_02": "FUEL FLAP & OPENER",
    "570_01": "UNDER GUARD",
    "575_01": "EXHAUST & MUFFLER COVER",
    "580_01": "KEY KIT & KEY LOCK",
    "580_03": "KEY KIT & KEY LOCK",
    "590_02": "FRONT BUMPER",
    "590_06": "FRONT BUMPER",
    "590_07": "FRONT BUMPER",
    "590_08": "FRONT BUMPER",
    "591_03": "REAR BUMPER",
    "591_07": "REAR BUMPER",
    "591_08": "REAR BUMPER",
    "591_09": "REAR BUMPER",
    # 10_DOOR_PARTS
    "600_01": "FRONT DOOR PANEL",
    "600_02": "FRONT DOOR PANEL",
    "601_01": "FRONT DOOR PARTS (GLASS & REGULATOR)",
    "602_01": "FRONT DOOR PARTS (LATCH & HANDLE)",
    "610_01": "REAR DOOR PANEL",
    "610_02": "REAR DOOR PANEL",
    "611_01": "REAR DOOR PARTS (GLASS & REGULATOR)",
    "612_01": "REAR DOOR PARTS (LATCH & HANDLE)",
    "620_01": "BACK DOOR PANEL",
    "621_01": "BACK DOOR GLASS",
    "622_01": "BACK DOOR PARTS",
    # 11_SEAT_INSTRUMENT_PANEL
    "640_01": "FRONT SEAT",
    "640_03": "FRONT SEAT",
    "641_04": "REAR SEAT",
    "645_01": "FRONT SEAT BELT",
    "646_02": "REAR SEAT BELT",
    "650_01": "WINDSHIELD GLASS",
    "652_02": "REAR QUARTER",
    "654_04": "SUN ROOF",
    "654_05": "SUN ROOF",
    "654_06": "SUN ROOF",
    "654_07": "SUN ROOF",
    "654_08": "SUN ROOF",
    "657_01": "TONNEAU COVER",
    "660_01": "INSTRUMENT PANEL",
    "660_02": "INSTRUMENT PANEL",
    "660_03": "INSTRUMENT PANEL",
    "660_04": "INSTRUMENT PANEL",
    # 12_HEATER_AC
    "720_01": "HEATER SYSTEM",
    "721_01": "HEATER UNIT",
    "722_01": "HEATER BLOWER",
    "723_01": "HEATER CONTROL",
    "730_01": "AIR CONDITIONER SYSTEM",
    "730_02": "AIR CONDITIONER SYSTEM",
    "731_01": "COOLING UNIT",
    "732_01": "COMPRESSOR",
    # 13_BODY_ELECTRICAL_1
    "810_02": "WIRING HARNESS (MAIN)",
    "810_03": "WIRING HARNESS (MAIN)",
    "810_04": "WIRING HARNESS (MAIN)",
    "812_01": "WIRING HARNESS (INSTRUMENT PANEL)",
    "813_01": "CORD (ROOF)",
    "814_01": "CORD (DOOR)",
    "815_02": "CORD (REAR)",
    "816_01": "POWER WINDOW EQUIPMENT",
    "818_01": "CORD (ANOTHER)",
    "820_01": "BATTERY EQUIPMENT",
    "822_01": "FUSE BOX",
    "822_02": "FUSE BOX",
    "830_01": "SWITCH (INSTRUMENT PANEL)",
    "830_02": "SWITCH (INSTRUMENT PANEL)",
    "832_01": "SWITCH (COMBINATION)",
    "832_02": "SWITCH (COMBINATION)",
    "833_01": "SWITCH (POWER WINDOW)",
    "835_01": "ELECTRICAL PARTS (BODY)",
    "835_02": "ELECTRICAL PARTS (BODY)",
    # 14_BODY_ELECTRICAL_2
    "840_01": "HEAD LAMP",
    "841_01": "LAMP (FRONT)",
    "841_02": "LAMP (FRONT)",
    "842_03": "LAMP (REAR)",
    "842_04": "LAMP (REAR)",
    "843_01": "LAMP (LICENSE)",
    "845_01": "LAMP (FOG)",
    "845_03": "LAMP (FOG)",
    "846_01": "LAMP (ROOM)",
    "846_02": "LAMP (ROOM)",
    "846_03": "LAMP (ROOM)",
    "847_02": "LAMP (HIGH MOUNT STOP LAMP)",
    "850_01": "METER",
    "850_02": "METER",
    "860_01": "AUDIO PARTS (RADIO)",
    "862_01": "ANTENNA",
    "863_01": "CLOCK",
    "863_03": "CLOCK",
    "863_04": "CLOCK",
    "870_01": "WIPER (WINDSHIELD)",
    "871_01": "WIPER (REAR)",
    "875_01": "WINDSHIELD WASHER",
    "876_01": "REAR WASHER",
    "877_01": "HORN",
    "880_01": "CRUISE CONTROL EQUIPMENT",
    # 15_OUTER_ACCESSORIES
    "900_02": "PLUG",
    "900_03": "PLUG",
    "901_01": "WEATHER STRIP",
    "911_01": "FRONT GRILLE",
    "912_01": "REAR VIEW MIRROR",
    "913_01": "PROTECTOR",
    "913_02": "PROTECTOR",
    "913_03": "PROTECTOR",
    "915_01": "MOLDING",
    "916_01": "STRIPE",
    "918_01": "LABEL (CAUTION)",
    "919_01": "LETTER MARK",
    "919_02": "LETTER MARK",
    "920_01": "COWL PANEL",
    "921_01": "SPOILER",
    "921_03": "SPOILER",
    "921_04": "SPOILER",
    "922_01": "ROOF RAIL",
    # 16_INNER_ACCESSORIES
    "930_01": "CONSOLE BOX",
    "930_02": "CONSOLE BOX",
    "931_01": "ROOM INNER PARTS",
    "931_02": "ROOM INNER PARTS",
    "935_02": "COVER",
    "940_03": "INNER TRIM",
    "940_04": "INNER TRIM",
    "941_01": "DOOR TRIM",
    "941_02": "DOOR TRIM",
    "942_02": "ROOF TRIM",
    "950_01": "MAT",
    "950_03": "MAT",
    "953_01": "SILENCER",
    "955_02": "FLOOR INSULATOR",
    "956_01": "HOOD INSULATOR",
    "970_01": "TOOL KIT & JACK",
}


def make_filename(code):
    """Build full GIF filename from a diagram code."""
    return f"B11_{code}_LH_2_LR.gif"


def make_url(code):
    """Build full download URL from a diagram code."""
    return f"{BASE_URL}/{make_filename(code)}"


def download_diagram(session, code, dest_path, retries=3):
    """Download a single diagram GIF. Returns True on success."""
    url = make_url(code)
    for attempt in range(retries):
        try:
            resp = session.get(url, timeout=30)
            if resp.status_code == 200:
                content_type = resp.headers.get("Content-Type", "")
                if "image" in content_type or len(resp.content) > 1000:
                    dest_path.write_bytes(resp.content)
                    return True
                else:
                    print(f"  WARNING: {code} returned non-image ({content_type}, {len(resp.content)} bytes)")
                    return False
            elif resp.status_code == 404:
                print(f"  SKIP: {code} — 404 not found")
                return False
            elif resp.status_code == 429:
                wait = 10 * (attempt + 1)
                print(f"  Rate limited on {code}, waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"  ERROR: {code} — HTTP {resp.status_code}")
                if attempt < retries - 1:
                    time.sleep(3)
        except requests.RequestException as e:
            print(f"  ERROR: {code} — {e}")
            if attempt < retries - 1:
                time.sleep(3)
    return False


def main():
    output_dir = Path(__file__).parent / "diagrams"
    output_dir.mkdir(exist_ok=True)

    total_codes = sum(len(codes) for codes in SECTIONS.values())
    print(f"Subaru BG5 EJ20E SOHC NA — Parts Diagram Downloader")
    print(f"Source: PartSouq CDN (SUBARU201802)")
    print(f"Sections: {len(SECTIONS)}, Diagrams: {total_codes}")
    print(f"Output: {output_dir}")
    print()

    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
        "Referer": "https://partsouq.com/",
    })

    downloaded = 0
    skipped = 0
    failed = 0
    already = 0

    for section_name, codes in SECTIONS.items():
        section_dir = output_dir / section_name
        section_dir.mkdir(exist_ok=True)
        print(f"[{section_name}] ({len(codes)} diagrams)")

        for code in codes:
            filename = make_filename(code)
            dest = section_dir / filename
            subcat = SUBCATEGORY_NAMES.get(code, "")
            label = f"{code} ({subcat})" if subcat else code

            if dest.exists() and dest.stat().st_size > 1000:
                print(f"  EXISTS: {label}")
                already += 1
                continue

            print(f"  Downloading: {label}...", end=" ", flush=True)
            if download_diagram(session, code, dest):
                size_kb = dest.stat().st_size / 1024
                print(f"OK ({size_kb:.0f} KB)")
                downloaded += 1
            else:
                failed += 1

            # Be polite — 0.5s between requests
            time.sleep(0.5)

        print()

    print(f"Done! Downloaded: {downloaded}, Already had: {already}, "
          f"Skipped/Failed: {skipped + failed}")
    print(f"Total diagrams on disk: {downloaded + already}")


if __name__ == "__main__":
    main()
