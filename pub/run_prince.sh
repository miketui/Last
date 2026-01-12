#!/usr/bin/env bash
set -euo pipefail

# PrinceXML PDF Build Script for "Curls & Contemplation"
# Generates a 6x9" POD-ready PDF from EPUB XHTML sources

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

OUT_DIR="build"
mkdir -p "$OUT_DIR"

echo "=========================================="
echo "Curls & Contemplation - PrinceXML Build"
echo "=========================================="
echo ""

# Check if Prince is installed
if ! command -v prince &> /dev/null; then
    echo "Error: PrinceXML is not installed."
    echo "Please install it from: https://www.princexml.com/download/"
    exit 1
fi

echo "Using PrinceXML: $(prince --version | head -1)"
echo ""

echo "Building PDF from XHTML sources..."
echo ""

prince \
  --style=OEBPS/style/print.css \
  OEBPS/xhtml/1-TitlePage.xhtml \
  OEBPS/xhtml/2-Copyright.xhtml \
  OEBPS/xhtml/3-TableOfContents.xhtml \
  OEBPS/xhtml/4-Dedication.xhtml \
  OEBPS/xhtml/5-SelfAssessment.xhtml \
  OEBPS/xhtml/6-AffirmationOdyssey.xhtml \
  OEBPS/xhtml/7-Preface.xhtml \
  OEBPS/xhtml/7a-preface-quote.xhtml \
  OEBPS/xhtml/8-Part-I-Foundations-of-Creative-Hairstyling.xhtml \
  OEBPS/xhtml/9-chapter-i-unveiling-your-creative-odyssey.xhtml \
  OEBPS/xhtml/10-chapter-ii-refining-your-creative-toolkit.xhtml \
  OEBPS/xhtml/11-chapter-iii-reigniting-your-creative-fire.xhtml \
  OEBPS/xhtml/12-Part-II-Building-Your-Professional-Practice.xhtml \
  OEBPS/xhtml/13-chapter-iv-the-art-of-networking-in-freelance-hairstyling.xhtml \
  OEBPS/xhtml/14-chapter-v-cultivating-creative-excellence-through-mentorship.xhtml \
  OEBPS/xhtml/15-chapter-vi-mastering-the-business-of-hairstyling.xhtml \
  OEBPS/xhtml/16-chapter-vii-embracing-wellness-and-self-care.xhtml \
  OEBPS/xhtml/17-chapter-viii-advancing-skills-through-continuous-education.xhtml \
  OEBPS/xhtml/18-Part-III-Advanced-Business-Strategies.xhtml \
  OEBPS/xhtml/19-chapter-ix-stepping-into-leadership.xhtml \
  OEBPS/xhtml/20-chapter-x-crafting-enduring-legacies.xhtml \
  OEBPS/xhtml/21-chapter-xi-advanced-digital-strategies-for-freelance-hairstylists.xhtml \
  OEBPS/xhtml/22-chapter-xii-financial-wisdom-building-sustainable-ventures.xhtml \
  OEBPS/xhtml/23-chapter-xiii-embracing-ethics-and-sustainability-in-hairstyling.xhtml \
  OEBPS/xhtml/24-Part-IV-Future-Focused-Growth.xhtml \
  OEBPS/xhtml/25-chapter-xiv-the-impact-of-ai-on-the-beauty-industry.xhtml \
  OEBPS/xhtml/26-chapter-xv-cultivating-resilience-and-well-being-in-hairstyling.xhtml \
  OEBPS/xhtml/27-chapter-xvi-tresses-and-textures-embracing-diversity-in-hairstyling.xhtml \
  OEBPS/xhtml/28-Conclusion.xhtml \
  OEBPS/xhtml/28a-conclusion-quote.xhtml \
  OEBPS/xhtml/29-QuizKey.xhtml \
  OEBPS/xhtml/30-SelfAssessment.xhtml \
  OEBPS/xhtml/31-affirmations-close.xhtml \
  OEBPS/xhtml/32-continued-learning-commitment.xhtml \
  OEBPS/xhtml/33-Acknowledgments.xhtml \
  OEBPS/xhtml/34-AbouttheAuthor.xhtml \
  OEBPS/xhtml/35-CurlsContempCollective.xhtml \
  OEBPS/xhtml/36-JournalingStart.xhtml \
  OEBPS/xhtml/37-ManifestingJournal.xhtml \
  OEBPS/xhtml/38-journal-page.xhtml \
  OEBPS/xhtml/39-professional-development.xhtml \
  OEBPS/xhtml/40-SMARTGoals.xhtml \
  OEBPS/xhtml/41-self-care-journal.xhtml \
  OEBPS/xhtml/42-VisionJournal.xhtml \
  OEBPS/xhtml/43-DoodlePage.xhtml \
  OEBPS/xhtml/44-bibliography.xhtml \
  -o "$OUT_DIR/CurlsAndContemplation-6x9-print.pdf"

echo ""
echo "=========================================="
echo "BUILD COMPLETE"
echo "=========================================="
echo ""

# Display PDF info if pdfinfo is available
if command -v pdfinfo &> /dev/null; then
    echo "PDF Information:"
    pdfinfo "$OUT_DIR/CurlsAndContemplation-6x9-print.pdf" | grep -E "^(Title|Author|Pages|Page size|File size)" || true
    echo ""
else
    ls -lh "$OUT_DIR/CurlsAndContemplation-6x9-print.pdf"
    echo ""
fi

echo "✓ PDF generated at: $OUT_DIR/CurlsAndContemplation-6x9-print.pdf"
echo ""
echo "POD specifications:"
echo "  - Trim size: 6\" x 9\""
echo "  - Margins: Gutter 0.95\", Outside 0.70\", Top/Bottom 0.75\""
echo "  - Format: Two-sided (recto/verso)"
echo ""
