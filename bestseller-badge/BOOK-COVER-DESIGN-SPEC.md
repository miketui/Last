# BOOK COVER DESIGN SPECIFICATION

## "CURLS & CONTEMPLATION" — Complete Production Guide

**Author:** MICHAEL DAVID
**Designer Handoff Document — Version 1.0**

---

## TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Design Concept](#design-concept)
3. [The Gold Logo Element](#the-gold-logo-element)
4. [Positioning & Elevation](#positioning--elevation)
5. [3D Metallic Gold Effect Technique](#3d-metallic-gold-effect-technique)
6. [Faux-Lenticular Bestseller Badge](#faux-lenticular-bestseller-badge)
7. [Color Palette](#color-palette)
8. [Typography](#typography)
9. [Cover Dimensions & Specifications](#cover-dimensions--specifications)
10. [Layer Structure](#layer-structure)
11. [Production Files](#production-files)
12. [Print Specifications](#print-specifications)

---

## PROJECT OVERVIEW

This specification details the design of a premium book cover featuring a **3D metallic gold embossed logo** as the central visual element. The design aesthetic emulates **luxury hardcover books with gold foil stamping**, achieved digitally through careful gradient work, emboss filters, and strategic lighting simulation.

### Key Design Goals
- Premium, high-end aesthetic (luxury lifestyle/self-improvement genre)
- 3D metallic gold logo that appears "raised" from the cover surface
- Faux-lenticular depth illusion (simulates viewing angle changes)
- Knife-sharp beveled edges on all gold elements
- Professional, print-ready output for both digital (eBook) and physical (POD) formats

---

## DESIGN CONCEPT

The cover features a **teal gradient background** with a **centered gold metallic logo** that depicts flowing hair/curls rising into a city skyline silhouette. The logo should appear to be **physically embossed** onto the cover—like a premium foil stamp on a leather-bound book.

### Visual Hierarchy (Top to Bottom)
1. **Bestseller Badge** (top-left corner)
2. **Title Text** (upper area, gold with emboss effect)
3. **Subtitle** (below title, italic gold)
4. **CENTERED GOLD LOGO** (the hero element — positioned in upper-middle area)
5. **Author Name** (lower area, gold with emboss effect)

---

## THE GOLD LOGO ELEMENT

### Description
The logo is an artistic illustration combining:
- **Flowing hair strands/curls** — sweeping, organic curves
- **City skyline** — geometric building silhouettes at the top
- **Integrated design** — the hair flows upward INTO the skyline

### Source File
`/tmp/images/image-Gc4I10Xx17tmA_ycpoeVM.png` — Transparent PNG with gold metallic effect already applied

### Logo Characteristics
| Property | Value |
|----------|-------|
| Style | Organic curves with geometric accents |
| Color | Metallic gold (gradient-based) |
| Background | Transparent (PNG with alpha channel) |
| Orientation | Vertical (taller than wide) |
| Visual Weight | Heavy — this is the hero element |

---

## POSITIONING & ELEVATION

### What "Elevate" Means
"Elevating" the gold logo means **moving it higher on the page** — positioning it closer to the top of the cover. This creates better visual balance and ensures the logo is the dominant element without competing with the author name at the bottom.

### Coordinate System
In digital images and design software:
- **Y = 0** is at the **TOP** of the canvas
- **Y increases** going **DOWN**
- To move an element **UP/HIGHER**, **DECREASE** its Y value
- To move an element **DOWN/LOWER**, **INCREASE** its Y value

### Current Logo Position

#### eBook Cover (1600 × 2560 px)
| Parameter | Value | Notes |
|-----------|-------|-------|
| Logo Width | 700 px | Resized to fit |
| Logo Height | 700 px | Maintains aspect ratio |
| Horizontal Position | Centered | `(1600 - 700) / 2 = 450` px from left |
| Vertical Position (top) | **1050 px** | Top edge of logo starts here |
| Vertical Position (bottom) | 1750 px | `1050 + 700 = 1750` |

#### Print Cover Front (1800 × 2700 px trim)
| Parameter | Value | Notes |
|-----------|-------|-------|
| Logo Width | 580 px | Slightly smaller for print proportions |
| Logo Height | 580 px | Maintains aspect ratio |
| Horizontal Position | Centered on front cover | Calculated from spine + trim |
| Vertical Position (top) | **988 px** | `bleed(38) + 950 = 988` from canvas top |

### How to Adjust Elevation

**To raise the logo HIGHER:**
```
Decrease the Y/top value
Example: top: 1050 → top: 950 (moves logo UP 100 pixels)
```

**To lower the logo:**
```
Increase the Y/top value
Example: top: 1050 → top: 1150 (moves logo DOWN 100 pixels)
```

### Spacing Guidelines
| Element | Approximate Y Position | Notes |
|---------|----------------------|-------|
| Subtitle bottom | ~1020 px | Don't overlap logo with subtitle |
| Logo top | 1050 px | Current position |
| Logo bottom | 1750 px | 700px tall logo |
| Decorative line | 2250 px | Above author name |
| Author name | 2350 px | Leave breathing room |

**Safe zone for logo:** Y position between **1050–1200** (top edge) to avoid overlapping title/subtitle while maintaining distance from author name.

---

## 3D METALLIC GOLD EFFECT TECHNIQUE

This is the core technique for achieving the premium embossed look. The goal is to simulate **physical gold foil stamping** using digital gradients and filters.

### The Metallic Emboss Method (Canva/Photoshop)

Referenced from mockup screenshot — this is the "How-To: Metallic Emboss" technique:

#### Step 1: Place Base Layer
- Import the gold logo SVG/PNG (gradient only, no filters)
- This becomes your base metallic layer

#### Step 2: Duplicate Layer
- Create an exact duplicate (`Ctrl/Cmd + D`)
- You now have two identical layers stacked

#### Step 3: Configure Top Layer
- Set opacity to **85%**
- This allows the bottom layer's effects to show through

#### Step 4: Configure Bottom Layer
- Apply **Gaussian Blur: 3–5px**
- Add offset: **+5px right, +5px down**
- Set blend mode to **Multiply**
- This creates the shadow/depth illusion

#### Step 5: Optional Enhancements
- Add **drop shadow** to bottom layer
- Add subtle **outer glow** (warm gold, low opacity)
- Apply **slight offset** between layers (1-2px)

### SVG/CSS Filter Approach

For programmatic generation, use these SVG filter definitions:

```xml
<!-- Gold Emboss Filter -->
<filter id="goldEmboss" x="-5%" y="-5%" width="110%" height="110%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
  <feOffset in="blur" dx="-1" dy="-1" result="light"/>
  <feOffset in="blur" dx="1" dy="1" result="dark"/>
  <feFlood flood-color="#F5E6A8" flood-opacity="0.6" result="lightC"/>
  <feFlood flood-color="#6B5A2F" flood-opacity="0.8" result="darkC"/>
  <feComposite in="lightC" in2="light" operator="in" result="ls"/>
  <feComposite in="darkC" in2="dark" operator="in" result="ds"/>
  <feMerge>
    <feMergeNode in="ds"/>      <!-- Dark shadow (bottom-right) -->
    <feMergeNode in="ls"/>      <!-- Light highlight (top-left) -->
    <feMergeNode in="SourceGraphic"/>  <!-- Original on top -->
  </feMerge>
</filter>
```

### Key Principles for 3D Gold Effect

1. **Light source direction** — Consistent top-left (standard emboss convention)
2. **Highlight color** — Bright gold/cream `#F5E6A8` or `#FFFEF5`
3. **Shadow color** — Deep brown-gold `#6B5A2F` or `#5C4A1F`
4. **Blur radius** — Keep tight (1-3px) for sharp bevels
5. **No color bleeding** — Edges must remain knife-sharp

---

## FAUX-LENTICULAR BESTSELLER BADGE

The bestseller badge uses advanced gradient techniques to simulate **lenticular printing** — the effect where an image appears to shift/change when viewed from different angles.

### Badge Design Specifications

| Property | Value |
|----------|-------|
| Shape | 24-point starburst seal |
| Size | 2000 × 2000 px master |
| Text | "BESTSELLER" (top arc), "#1" (center), "AWARD WINNER" (bottom arc) |
| Style | Faux-lenticular 3D metallic gold |

### Faux-Lenticular Technique

The depth illusion is created through **multiple gradient layers**:

#### Primary Gold Gradient (diagonal sweep)
```
Direction: Top-left to bottom-right (0% → 100%)
Stops:
  0%   → #FFFEF5 (bright highlight)
  12%  → #F5E6A8 (light gold)
  28%  → #E6CC7A (medium light)
  45%  → #C9A961 (base gold)
  60%  → #B8923D (medium dark)
  75%  → #9A7830 (dark gold)
  88%  → #8A6F2F (deep shadow)
  100% → #5C4A1F (darkest)
```

#### Center Dome Radial Gradient
```
Type: Radial
Center: 35%, 35% (offset toward light source)
Stops:
  0%   → #FFFEF5 (hotspot)
  25%  → #F5E6A8
  50%  → #D4B060
  75%  → #B8923D
  100% → #8A6F2F
```

#### Specular Highlight
```
Type: Radial
Center: 30%, 25%
Radius: 40%
Color: White to transparent
Opacity: 90% → 0%
```

### Badge Layer Stack (bottom to top)
1. Drop shadow (offset 8px right, 12px down, blur 15px)
2. Dark base layer (offset +4px, creates bottom bevel)
3. Shadow gradient edge
4. Main gold body (faux-lenticular gradient)
5. Highlight edge stroke (top-left bevel)
6. Inner rings (multiple, with emboss filters)
7. Center medallion
8. Specular highlight overlay
9. Text layers (with text emboss filter)

---

## COLOR PALETTE

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Teal Dark | `#173D4A` | 23, 61, 74 | Background gradient dark |
| Teal Base | `#1E4D5C` | 30, 77, 92 | Primary background |
| Teal Light | `#2A5A68` | 42, 90, 104 | Background gradient light |

### Gold Palette

| Name | Hex | RGB | Pantone | Usage |
|------|-----|-----|---------|-------|
| Gold Highlight | `#FFFEF5` | 255, 254, 245 | — | Brightest specular |
| Gold Light | `#F5E6A8` | 245, 230, 168 | PMS 7401 C | Highlights |
| Gold Medium Light | `#E6CC7A` | 230, 204, 122 | — | Upper gradients |
| Gold Base | `#C9A961` | 201, 169, 97 | PMS 7555 C | Primary gold |
| Gold Medium Dark | `#B8923D` | 184, 146, 61 | — | Lower gradients |
| Gold Dark | `#9A7830` | 154, 120, 48 | — | Shadows |
| Gold Deep | `#8A6F2F` | 138, 111, 47 | PMS 7557 C | Deep shadows |
| Gold Darkest | `#5C4A1F` | 92, 74, 31 | — | Darkest shadow |
| Shadow Brown | `#3D2F12` | 61, 47, 18 | — | Cast shadows |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| Cream | `#F5F0E1` | Back cover body text |

---

## TYPOGRAPHY

### Title Font
- **Font Family:** Playfair Display, Georgia, Times New Roman, serif
- **Weight:** 400 (Regular)
- **Style:** Normal
- **Letter Spacing:** 8–12px
- **Effect:** Gold gradient fill + emboss filter

### Subtitle Font
- **Font Family:** Cormorant Garamond, Georgia, serif
- **Weight:** 300 (Light)
- **Style:** Italic
- **Letter Spacing:** 2–3px
- **Effect:** Gold gradient fill only (no emboss)

### Author Name Font
- **Font Family:** Playfair Display, Georgia, Times New Roman, serif
- **Weight:** 400 (Regular)
- **Letter Spacing:** 14–16px
- **Effect:** Gold gradient fill + emboss filter

### Back Cover Body Text
- **Font Family:** Georgia, serif
- **Weight:** 400 (Regular)
- **Color:** Cream `#F5F0E1` at 95% opacity
- **Size:** 30–32px

---

## COVER DIMENSIONS & SPECIFICATIONS

### eBook Cover (Amazon KDP)

| Property | Value |
|----------|-------|
| Width | 1600 px |
| Height | 2560 px |
| Aspect Ratio | 1:1.6 |
| Resolution | 72 DPI (digital) |
| Color Mode | sRGB |
| Format | PNG or JPEG |

### Print Cover (POD — 6" × 9" Trim)

| Property | Value |
|----------|-------|
| Trim Size | 6" × 9" |
| DPI | 300 |
| Front Cover | 1800 × 2700 px |
| Spine Width | 150 px (~0.5" for ~200 pages) |
| Back Cover | 1800 × 2700 px |
| Bleed | 0.125" = 38 px (all sides) |
| **Total Canvas** | **3826 × 2776 px** |

### Print Cover Layout

```
←——————————— 3826 px ———————————→
┌────────────────────────────────────────────────────────┐ ↑
│ BLEED │ BACK COVER │SPINE│ FRONT COVER │ BLEED │      │ │
│ 38px  │  1800 px   │150px│   1800 px   │ 38px  │      │ │
│       │            │     │             │       │      │ 2776 px
│       │            │     │   [LOGO]    │       │      │ │
│       │            │     │             │       │      │ │
└────────────────────────────────────────────────────────┘ ↓
```

---

## LAYER STRUCTURE

### Recommended Layer Organization (Photoshop/Illustrator)

```
📁 BOOK COVER
├── 📁 FRONT COVER
│   ├── 🎨 Bestseller Badge
│   ├── 📝 Title - "CURLS &"
│   ├── 📝 Title - "CONTEMPLATION"
│   ├── 📝 Subtitle
│   ├── 📁 GOLD LOGO (Hero Element)
│   │   ├── 🎨 Logo - Top Layer (85% opacity)
│   │   ├── 🎨 Logo - Shadow Layer (multiply, blur)
│   │   └── 🎨 Logo - Glow (optional)
│   ├── ✨ Decorative Star
│   ├── ─── Decorative Line
│   └── 📝 Author Name
├── 📁 SPINE
│   ├── 📝 Title (rotated -90°)
│   └── 📝 Author (rotated -90°)
├── 📁 BACK COVER
│   ├── 📝 Headline
│   ├── 📝 Body Copy
│   ├── 📝 Bullet Points
│   ├── 📝 Author Bio
│   └── ▢ Barcode Placeholder
└── 📁 BACKGROUND
    └── 🎨 Teal Gradient
```

---

## PRODUCTION FILES

### Files to Deliver

| File | Purpose | Format |
|------|---------|--------|
| `ebook-cover-curls-contemplation.png` | eBook distribution | PNG, 1600×2560 |
| `ebook-cover-no-badge.png` | eBook without badge | PNG, 1600×2560 |
| `print-cover-full-wrap.png` | POD printer upload | PNG, 3826×2776 |
| `print-cover-front-only.png` | Preview/marketing | PNG, 1800×2700 |
| `bestseller-faux-lenticular.png` | Badge asset | PNG, 2000×2000 |
| `bestseller-faux-lenticular.svg` | Scalable badge | SVG |

### Source Assets

| File | Description |
|------|-------------|
| `/tmp/images/image-Gc4I10Xx17tmA_ycpoeVM.png` | Gold logo with transparency |
| `/tmp/images/bestseller-faux-lenticular.png` | Faux-lenticular badge |

---

## PRINT SPECIFICATIONS

### For Foil Stamping (Physical Premium Edition)

If producing a physical premium edition with actual gold foil stamping, use these specifications:

| Property | Specification |
|----------|---------------|
| **Foil Material** | Satin metallic gold foil (non-holographic) |
| **Recommended Foil** | Kurz Luxor® 385 or API Foils 426 Gold |
| **Process** | Blind emboss + foil stamp (single pass) |
| **Emboss Depth** | 0.3–0.5 mm |
| **Die Type** | CNC-engraved brass, dual-depth |
| **Edge Quality** | Knife-sharp, no feathering |
| **Artwork** | Vector (AI/EPS/SVG), single spot color, NO gradients |

### Substrate Recommendations

**✓ Recommended:**
- Linen cover stock
- Soft-touch laminate
- Uncoated premium cover stock
- Matte laminate

**✗ Avoid:**
- High-gloss lamination (kills depth illusion)
- UV coating over foil area

---

## QUICK REFERENCE CARD

### To Elevate the Gold Logo:
1. Open the design file
2. Select the gold logo layer/group
3. **Decrease the Y position value** (move UP on canvas)
4. Recommended range: Y = 950–1100 for eBook cover
5. Ensure logo doesn't overlap subtitle (ends ~Y=1020)
6. Ensure adequate space above author name (Y=2250+)

### Gold Emboss Effect Checklist:
- [ ] Light source: top-left
- [ ] Highlight color: `#F5E6A8`
- [ ] Shadow color: `#6B5A2F`
- [ ] Blur radius: 1–3px (sharp bevels)
- [ ] Two layers: top at 85% opacity, bottom with multiply blend
- [ ] Bottom layer offset: +3-5px right/down

### Color Quick Reference:
- **Teal Background:** `#1E4D5C`
- **Gold Base:** `#C9A961`
- **Gold Highlight:** `#F5E6A8`
- **Gold Shadow:** `#8A6F2F`

---

*Document Version 1.0 — Production Ready*
*Generated for: CURLS & CONTEMPLATION by Michael David*
