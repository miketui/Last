#!/bin/bash
# Compile LaTeX to POD-ready PDF
# Usage: ./compile.sh [--rebuild]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "Curls & Contemplation - PDF Build"
echo "=========================================="
echo ""

# Check for rebuild flag
if [ "$1" == "--rebuild" ]; then
    echo "Rebuilding LaTeX from XHTML sources..."
    python3 build_latex.py
    echo ""
fi

# Convert fonts if needed
echo "Step 1: Checking fonts..."
cd latex/fonts
for f in *.woff2; do
    if [ -f "$f" ]; then
        ttf_file="${f%.woff2}.ttf"
        if [ ! -f "$ttf_file" ]; then
            echo "  Converting $f to TTF..."
            woff2_decompress "$f" 2>/dev/null || true
        fi
    fi
done
cd "$SCRIPT_DIR"
echo "  Fonts ready."
echo ""

# Convert SVG to PDF if needed
echo "Step 2: Checking images..."
if [ -f "latex/images/brushstroke.svg" ] && [ ! -f "latex/images/brushstroke.pdf" ]; then
    echo "  Converting brushstroke.svg to PDF..."
    rsvg-convert -f pdf -o latex/images/brushstroke.pdf latex/images/brushstroke.svg
fi
echo "  Images ready."
echo ""

# Compile LaTeX (3 passes for proper TOC and references)
echo "Step 3: Compiling LaTeX..."
echo ""

echo "  Pass 1 of 3..."
xelatex -interaction=nonstopmode CurlsAndContemplation-master.tex > /dev/null 2>&1 || true

echo "  Pass 2 of 3..."
xelatex -interaction=nonstopmode CurlsAndContemplation-master.tex > /dev/null 2>&1 || true

echo "  Pass 3 of 3..."
xelatex -interaction=nonstopmode CurlsAndContemplation-master.tex

echo ""
echo "=========================================="
echo "BUILD COMPLETE"
echo "=========================================="
echo ""

# Display PDF info
if command -v pdfinfo &> /dev/null; then
    echo "PDF Information:"
    pdfinfo CurlsAndContemplation-master.pdf | grep -E "^(Title|Author|Pages|Page size|File size)"
else
    ls -lh CurlsAndContemplation-master.pdf
fi

echo ""
echo "Output: $SCRIPT_DIR/CurlsAndContemplation-master.pdf"
echo ""
echo "POD specifications:"
echo "  - Trim size: 6\" x 9\""
echo "  - Margins: Inner 0.875\", Outer 0.625\", Top/Bottom 0.75\""
echo "  - Format: Two-sided (recto/verso)"
