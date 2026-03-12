#!/bin/bash
# Analysis script for pub/OEBPS/xhtml EPUB 3 content files
# Provides structure analysis, word counts, and XHTML syntax counts

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

FILE_COUNT=$(ls *.xhtml 2>/dev/null | wc -l)

echo "=== STRUCTURE & CONSISTENCY ANALYSIS ==="
echo ""
echo "1. CHARSET CONSISTENCY:"
echo "   UTF-8 (uppercase): $(grep -h 'charset="UTF-8"' *.xhtml | wc -l)"
echo "   utf-8 (lowercase): $(grep -h 'charset="utf-8"' *.xhtml | wc -l)"
echo ""
echo "2. SEMANTIC HTML5 ELEMENTS:"
echo "   Files with <main>: $(grep -l '<main' *.xhtml | wc -l)/$FILE_COUNT"
echo "   Files with <section>: $(grep -l '<section' *.xhtml | wc -l)/$FILE_COUNT"
echo "   Files with <nav>: $(grep -l '<nav' *.xhtml | wc -l)/$FILE_COUNT"
echo ""
echo "3. ACCESSIBILITY:"
echo "   Files with ARIA attributes: $(grep -l 'aria-' *.xhtml | wc -l)/$FILE_COUNT"
echo "   Files with role attributes: $(grep -l 'role=' *.xhtml | wc -l)/$FILE_COUNT"
echo ""
echo "4. EPUB3 FEATURES:"
echo "   Files with epub:type: $(grep -l 'epub:type' *.xhtml | wc -l)/$FILE_COUNT"
echo "   Files with epub namespace: $(grep -l 'xmlns:epub' *.xhtml | wc -l)/$FILE_COUNT"
echo ""
echo "5. CONTENT FEATURES:"
echo "   Chapter files: $(ls *chapter*.xhtml 2>/dev/null | wc -l)"
echo "   Part dividers: $(ls *Part*.xhtml 2>/dev/null | wc -l)"
echo "   Interactive worksheets: $(grep -l 'worksheet' *.xhtml | wc -l)"
echo "   Quizzes: $(grep -l 'quiz' *.xhtml | wc -l)"
echo "   Journal pages: $(grep -l 'journal\|Journal' *.xhtml | wc -l)"
echo ""
echo "6. MEDIA REFERENCES:"
echo "   Files with images: $(grep -l '<img' *.xhtml | wc -l)"
echo "   Total image references: $(grep -oh 'src="../images/[^"]*' *.xhtml | wc -l)"
echo ""
echo "7. CSS REFERENCES:"
echo "   Files linking to fonts.css: $(grep -l 'fonts.css' *.xhtml | wc -l)"
echo "   Files linking to style.css: $(grep -l 'style.css' *.xhtml | wc -l)"
echo "   Files linking to print.css: $(grep -l 'print.css' *.xhtml | wc -l)"
echo ""
echo "========================================"
echo "=== WORD COUNT (text content only) ==="
echo "========================================"
echo ""
total_words=0
for f in *.xhtml; do
  # Strip all XML/HTML tags to get text content, then count words
  words=$(sed 's/<[^>]*>//g' "$f" | wc -w | tr -d ' ')
  total_words=$((total_words + words))
  printf "   %-65s %6d words\n" "$f" "$words"
done
echo "   ---"
printf "   %-65s %6d words\n" "TOTAL" "$total_words"
echo ""
echo "========================================"
echo "=== XHTML SYNTAX COUNT ==="
echo "========================================"
echo ""
echo "  Overall Tag Statistics:"
echo "   Total XHTML files:              $FILE_COUNT"
echo "   Total opening tags:             $(grep -oh '<[a-zA-Z][a-zA-Z0-9]*' *.xhtml | wc -l)"
echo "   Total closing tags:             $(grep -oh '</[a-zA-Z][a-zA-Z0-9]*>' *.xhtml | wc -l)"
echo "   Total self-closing tags:        $(grep -oh '<[a-zA-Z][^>]*/>' *.xhtml | wc -l)"
echo "   Total attributes:               $(grep -oh '[[:space:]][a-zA-Z][a-zA-Z0-9:-]*="[^"]*"' *.xhtml | wc -l)"
echo "   Total class attributes:         $(grep -oh 'class="[^"]*"' *.xhtml | wc -l)"
echo "   Total id attributes:            $(grep -oh 'id="[^"]*"' *.xhtml | wc -l)"
echo ""
echo "  Tag Frequency (top 20 most used):"
grep -oh '<[a-zA-Z][a-zA-Z0-9]*' *.xhtml | sed 's/<//' | sort | uniq -c | sort -rn | head -20 | while read count tag; do
  printf "   %-30s %6d\n" "<$tag>" "$count"
done
echo ""
echo "  Per-File Syntax Counts:"
for f in *.xhtml; do
  open_tags=$(grep -oh '<[a-zA-Z][a-zA-Z0-9]*' "$f" | wc -l)
  close_tags=$(grep -oh '</[a-zA-Z][a-zA-Z0-9]*>' "$f" | wc -l)
  self_close=$(grep -oh '<[a-zA-Z][^>]*/>' "$f" | wc -l)
  total_tags=$((open_tags + close_tags + self_close))
  printf "   %-65s %4d tags (%d open, %d close, %d self-closing)\n" "$f" "$total_tags" "$open_tags" "$close_tags" "$self_close"
done
