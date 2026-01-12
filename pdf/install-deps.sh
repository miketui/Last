#!/bin/bash
# Install all dependencies needed for LaTeX PDF compilation
# Run with sudo if not root

set -e

echo "=========================================="
echo "Installing PDF Build Dependencies"
echo "=========================================="
echo ""

# Detect package manager
if command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt-get"
    PKG_UPDATE="apt-get update"
    PKG_INSTALL="apt-get install -y"
elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
    PKG_UPDATE="dnf check-update || true"
    PKG_INSTALL="dnf install -y"
elif command -v yum &> /dev/null; then
    PKG_MANAGER="yum"
    PKG_UPDATE="yum check-update || true"
    PKG_INSTALL="yum install -y"
elif command -v pacman &> /dev/null; then
    PKG_MANAGER="pacman"
    PKG_UPDATE="pacman -Sy"
    PKG_INSTALL="pacman -S --noconfirm"
else
    echo "Error: No supported package manager found (apt, dnf, yum, pacman)"
    exit 1
fi

echo "Using package manager: $PKG_MANAGER"
echo ""

# Update package list
echo "Updating package list..."
$PKG_UPDATE
echo ""

# Install dependencies based on package manager
echo "Installing dependencies..."
if [ "$PKG_MANAGER" = "apt-get" ]; then
    $PKG_INSTALL \
        texlive-xetex \
        texlive-latex-extra \
        texlive-fonts-extra \
        texlive-fonts-recommended \
        texlive-pictures \
        pandoc \
        librsvg2-bin \
        woff2 \
        fontconfig \
        python3 \
        python3-lxml

elif [ "$PKG_MANAGER" = "dnf" ] || [ "$PKG_MANAGER" = "yum" ]; then
    $PKG_INSTALL \
        texlive-xetex \
        texlive-collection-latexextra \
        texlive-collection-fontsextra \
        pandoc \
        librsvg2-tools \
        woff2 \
        fontconfig \
        python3 \
        python3-lxml

elif [ "$PKG_MANAGER" = "pacman" ]; then
    $PKG_INSTALL \
        texlive-xetex \
        texlive-latexextra \
        texlive-fontsextra \
        pandoc \
        librsvg \
        woff2 \
        fontconfig \
        python \
        python-lxml
fi

echo ""
echo "=========================================="
echo "Dependencies installed successfully!"
echo "=========================================="
echo ""
echo "Installed packages:"
echo "  - XeLaTeX (texlive-xetex)"
echo "  - LaTeX extra packages (tcolorbox, titlesec, fancyhdr, etc.)"
echo "  - Extra fonts"
echo "  - Pandoc (XHTML to LaTeX conversion)"
echo "  - librsvg (SVG to PDF conversion)"
echo "  - woff2 tools (font conversion)"
echo "  - Python 3 with lxml"
echo ""
echo "You can now run: ./compile.sh"
