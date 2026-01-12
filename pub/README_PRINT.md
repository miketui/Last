# PrinceXML Print Build (6x9)

## What this is
This folder contains your EPUB's `OEBPS/` content plus an updated `OEBPS/style/print.css` tuned for **PrinceXML** and **POD**.

Key changes made to `print.css`:
- Removed crop/cross marks (not recommended for non-bleed POD)
- Explicit **:left/:right** gutter margins for duplex printing
- Added folios (page numbers) and suppressed them on openers/standalone pages
- Forced chapter and part divider openers to start on **right-hand (recto)** pages

## Requirements
- PrinceXML installed and licensed (otherwise Prince outputs a watermark).

## Build the PDF
From this directory:

```bash
./run_prince.sh
```

Output:
- `build/CurlsAndContemplation-6x9-print.pdf`

## If gutter needs tuning
Edit `OEBPS/style/print.css` and adjust:
- `@page :left` / `@page :right` inside margin values (`0.95in` currently)
