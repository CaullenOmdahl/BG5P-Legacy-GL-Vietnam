#!/usr/bin/env python3
"""Shared labels for EPC categories used by generated catalog artifacts."""

from __future__ import annotations


# Categories present in the EPC part rows but absent from the curated wagon
# diagram image set. Keep these explicit so generated lookup artifacts do not
# expose "Unknown" labels for known adjacent body/interior groups.
CATEGORY_OVERRIDES: dict[str, tuple[str, str]] = {
    "560": ("Body Key Bumper", "TRUNK LID"),
    "651": ("Seat Instrument Panel", "REAR WINDOW GLASS"),
    "656": ("Seat Instrument Panel", "REAR SHELF"),
}


def diagram_index(sections: list[dict]) -> dict[str, tuple[str, str]]:
    index: dict[str, tuple[str, str]] = dict(CATEGORY_OVERRIDES)
    for section in sections:
        for diagram in section["diagrams"]:
            category_code = diagram["code"].split("_", 1)[0]
            index[category_code] = (section["name"], diagram["name"])
    return index
