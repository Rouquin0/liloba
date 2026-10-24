#!/usr/bin/env python3
"""Génère les splash screens iOS LILOBA sur fond #0a0a0f."""
from PIL import Image, ImageDraw
import os

BG = (10, 10, 15)  # #0a0a0f
GOLD = (212, 175, 55)
BASE_DIR = os.path.join(os.path.dirname(__file__), "..")
LOGO = os.path.join(BASE_DIR, "..", "liloba", "frontend", "public", "logo.png")
OUT = os.path.join(BASE_DIR, "frontend", "public", "splash")

SIZES = [
    (750, 1334), (828, 1792), (1125, 2436), (1170, 2532),
    (1179, 2556), (1284, 2778), (1290, 2796),
    (1536, 2048), (1668, 2420), (2048, 2732),
]

os.makedirs(OUT, exist_ok=True)
logo = Image.open(LOGO).convert("RGB")
# rend le logo circulaire / arrondi simple : on le garde carré, réduit
for w, h in SIZES:
    img = Image.new("RGB", (w, h), BG)
    # logo = ~28% de la largeur, centré à ~42% hauteur
    lw = int(w * 0.30)
    ratio = logo.height / logo.width
    lh = int(lw * ratio)
    r = logo.resize((lw, lh), Image.LANCZOS)
    # masque arrondi pour adoucir
    mask = Image.new("L", (lw, lh), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, lw, lh], radius=int(lw*0.22), fill=255)
    img.paste(r, ((w-lw)//2, int(h*0.38)), mask)
    # texte LILOBA sous le logo (barre or + texte simplifié en rectangles ? on dessine avec fonte par défaut)
    draw = ImageDraw.Draw(img)
    txt = "LILOBA"
    # taille police approximative : 6% largeur
    try:
        from PIL import ImageFont
        # fonte par défaut, agrandie via scaling manuel : on dessine grand via bitmap scaling
        font_size = max(40, w // 12)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()
        bbox = draw.textbbox((0,0), txt, font=font)
        tw = bbox[2]-bbox[0]
        draw.text(((w-tw)//2, int(h*0.38)+lh+30), txt, fill=GOLD, font=font)
        # petite baseline
        sub = "La Parole, eclairee"
        try:
            font2 = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", max(20, w//30))
        except:
            font2 = font
        bbox2 = draw.textbbox((0,0), sub, font=font2)
        tw2 = bbox2[2]-bbox2[0]
        draw.text(((w-tw2)//2, int(h*0.38)+lh+30+font_size+16), sub, fill=(160,160,170), font=font2)
    except Exception as e:
        print("txt skip", e)
    out = os.path.join(OUT, f"splash-{w}x{h}.png")
    img.save(out, "PNG", optimize=True)
    print(f"OK {out} ({os.path.getsize(out)//1024} Ko)")
