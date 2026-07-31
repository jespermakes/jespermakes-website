#!/usr/bin/env python3
"""Generate a product hero image showing fanned-out PDF pages."""

import fitz
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

PDF_PATH = os.path.join(os.path.dirname(__file__), "..", "website", "public", "downloads", "workshop-wall-charts.pdf")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "website", "public", "images", "products")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Render select pages from PDF
doc = fitz.open(PDF_PATH)

def render_page(page_num, scale=2.5):
    page = doc[page_num]
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale))
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    return img

# Create hero image with dark wood background and overlapping pages
HERO_W, HERO_H = 1920, 1080
BG_COLOR = (44, 24, 16)  # WOOD_DARK

hero = Image.new("RGB", (HERO_W, HERO_H), BG_COLOR)
draw = ImageDraw.Draw(hero)

# Add subtle wood-grain texture (diagonal lines)
for i in range(0, HERO_W + HERO_H, 4):
    color = (44 + (i % 7), 24 + (i % 5), 16 + (i % 3))
    draw.line([(i, 0), (i - HERO_H, HERO_H)], fill=color, width=1)

# Render pages and place them in a fan arrangement
pages_to_show = [0, 1, 2, 5, 7]  # Wood species, sandpaper, joinery, conversions, safety
page_imgs = [render_page(p, scale=2.0) for p in pages_to_show]

# Scale pages down for the composition
page_h = 620
for i, img in enumerate(page_imgs):
    ratio = page_h / img.height
    new_w = int(img.width * ratio)
    page_imgs[i] = img.resize((new_w, page_h), Image.LANCZOS)

# Place pages overlapping from left to right
pw = page_imgs[0].width
positions = [
    (80, 320),
    (280, 280),
    (480, 260),
    (680, 280),
    (880, 300),
]

# Add slight shadow and rotation
for i, (px, py) in enumerate(positions):
    img = page_imgs[i]
    
    # Create shadow
    shadow = Image.new("RGBA", (img.width + 20, img.height + 20), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rectangle([10, 10, img.width + 10, img.height + 10], fill=(0, 0, 0, 80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=8))
    
    # Paste shadow then image
    hero.paste(Image.new("RGB", (img.width + 20, img.height + 20), BG_COLOR), 
               (px - 5, py - 5), 
               shadow)
    
    # Add white border around page
    bordered = Image.new("RGB", (img.width + 6, img.height + 6), (255, 255, 255))
    bordered.paste(img, (3, 3))
    
    hero.paste(bordered, (px, py))

# Add title text area (top portion)
# Just save the composition, Next.js will overlay text

hero_path = os.path.join(OUTPUT_DIR, "wall-charts-hero.jpg")
hero.save(hero_path, "JPEG", quality=90)
print(f"Hero image: {hero_path}")
print(f"Size: {os.path.getsize(hero_path) / 1024:.0f} KB")

# Also create a square thumbnail
thumb = hero.crop((300, 150, 1300, 1050))
thumb = thumb.resize((800, 800), Image.LANCZOS)
thumb_path = os.path.join(OUTPUT_DIR, "wall-charts-thumb.jpg")
thumb.save(thumb_path, "JPEG", quality=85)
print(f"Thumbnail: {thumb_path}")

# Create individual page preview images
for i in range(min(4, len(doc))):
    img = render_page(i, scale=2.0)
    preview_path = os.path.join(OUTPUT_DIR, f"wall-charts-page-{i+1}.jpg")
    # Add white background with subtle shadow effect
    canvas = Image.new("RGB", (img.width + 40, img.height + 40), BG_COLOR)
    canvas.paste(img, (20, 20))
    canvas.save(preview_path, "JPEG", quality=85)
    print(f"Page preview {i+1}: {preview_path}")

doc.close()
