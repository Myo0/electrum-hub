#!/usr/bin/env python3
"""
Slice the pokemonicons-sheet.png spritesheet into individual 40x30 party icons.
Uses the CSS background-position mappings to extract each Pokemon's icon.
"""
import re
import os
from PIL import Image

SPRITESHEET = "/home/hgengine/electrum-hub/assets/pokemonicons-sheet.png"
CSS_FILE = "/home/hgengine/electrum-hub/styling/sprites.css"
OUTPUT_DIR = "/home/hgengine/electrum-hub/assets/party-icons"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Parse CSS to get name -> (x, y) mappings
# background-position: -40px 0  means image starts at x=40, y=0
with open(CSS_FILE, 'r', encoding='utf-8') as f:
    css = f.read()

# Find all .pokemon-sprite.NAME { background-position: Xpx Ypx; }
# Handles both "0" and "0px" and "-40px"
pattern = r'\.pokemon-sprite\.([^\s{]+)\s*\{[^}]*background-position:\s*(-?\d+)(?:px)?\s+(-?\d+)(?:px)?[^}]*\}'
matches = re.findall(pattern, css, re.DOTALL)

print(f"Found {len(matches)} CSS mappings")

sheet = Image.open(SPRITESHEET)
print(f"Spritesheet size: {sheet.size}")

ICON_W, ICON_H = 40, 30
saved = 0
skipped = 0

for name, x_str, y_str in matches:
    # CSS background-position is negative offset into the image
    # -40px means the image is shifted left by 40px, so we see x=40 of the image
    x = -int(x_str)  # convert negative CSS offset to positive image coordinate
    y = -int(y_str)

    # Crop the icon from the spritesheet
    left = x
    top = y
    right = left + ICON_W
    bottom = top + ICON_H

    if right > sheet.width or bottom > sheet.height:
        print(f"  SKIP {name}: crop ({left},{top},{right},{bottom}) out of bounds")
        skipped += 1
        continue

    icon = sheet.crop((left, top, right, bottom))

    # Save with the CSS class name as filename
    out_path = os.path.join(OUTPUT_DIR, f"{name}.png")
    icon.save(out_path)
    saved += 1
    print(f"  Saved: {name}.png  (sheet pos {x},{y})")

print(f"\nDone! Saved {saved} icons, skipped {skipped}")
print(f"Output directory: {OUTPUT_DIR}")
