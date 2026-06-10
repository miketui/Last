#!/usr/bin/env bash
set -Eeuo pipefail

EPUB="${1:-}"
PDF="${2:-}"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="validation-reports/$STAMP"
SUMMARY="$OUT/SUMMARY.md"
FAILS=0; WARNS=0

mkdir -p "$OUT"
ln -sfn "$STAMP" "validation-reports/latest"

need_cmd() { command -v "$1" >/dev/null 2>&1; }

find_newest() {
  find . -type f -iname "$1" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/validation-reports/*" \
    -not -path "*/deliverables/*" \
    -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -n 1
}

[[ -z "$EPUB" ]] && EPUB="$(find_newest '*.epub' || true)"
[[ -z "$PDF" ]]  && PDF="$(find_newest '*.pdf' || true)"

{
  echo "# Publishing Validation Summary"
  echo
  echo "- Date: $(date)"
  echo "- EPUB: ${EPUB:-NOT FOUND}"
  echo "- PDF: ${PDF:-NOT FOUND}"
  echo
} > "$SUMMARY"

pass()      { echo "PASS: $1"; echo "- PASS: $1" >> "$SUMMARY"; }
warn_step() { echo "WARN: $1"; echo "- WARN: $1" >> "$SUMMARY"; WARNS=$((WARNS+1)); }
fail_step() { echo "FAIL: $1"; echo "- FAIL: $1" >> "$SUMMARY"; FAILS=$((FAILS+1)); }

run_check() {
  local label="$1" report="$2"; shift 2
  echo; echo "==> $label"
  if "$@" >"$report" 2>&1; then pass "$label"; else fail_step "$label — see $report"; fi
}
run_advisory() {
  local label="$1" report="$2"; shift 2
  echo; echo "==> $label"
  if "$@" >"$report" 2>&1; then pass "$label"; else warn_step "$label — see $report"; fi
}

TMP_ROOT="$(mktemp -d)"; trap "rm -rf $TMP_ROOT" EXIT
echo; echo "Reports → $OUT"

# ── EPUB checks ──
if [[ -n "$EPUB" && -f "$EPUB" ]]; then
  run_check "EPUB ZIP integrity" "$OUT/epub-unzip-test.txt" unzip -t "$EPUB"

  if need_cmd epubcheck; then
    run_check "EPUBCheck conformance (0/0/0/0 required)" "$OUT/epubcheck.txt" epubcheck "$EPUB"
  else
    fail_step "epubcheck missing"
  fi

  if need_cmd ace; then
    mkdir -p "$OUT/ace"
    run_advisory "Ace by DAISY accessibility" "$OUT/ace.txt" ace "$EPUB" --outdir "$OUT/ace"
  else
    warn_step "Ace not installed"
  fi

  EPUB_DIR="$TMP_ROOT/epub"; mkdir -p "$EPUB_DIR"
  unzip -q "$EPUB" -d "$EPUB_DIR" || true

  xml_files=()
  while IFS= read -r -d '' f; do xml_files+=("$f"); done \
    < <(find "$EPUB_DIR" -type f \( -iname "*.opf" -o -iname "*.ncx" -o -iname "*.xhtml" -o -iname "*.xml" \) -print0)
  html_files=()
  while IFS= read -r -d '' f; do html_files+=("$f"); done \
    < <(find "$EPUB_DIR" -type f \( -iname "*.xhtml" -o -iname "*.html" -o -iname "*.svg" -o -iname "*.css" \) -print0)

  if need_cmd xmllint && [[ ${#xml_files[@]} -gt 0 ]]; then
    run_check "XML/XHTML well-formedness" "$OUT/xml-wellformedness.txt" \
      bash -lc 'for f in "$@"; do xmllint --noout "$f" || exit 1; done' _ "${xml_files[@]}"
  else
    warn_step "xmllint missing or no XML files"
  fi

  if need_cmd vnu && [[ ${#html_files[@]} -gt 0 ]]; then
    run_advisory "W3C v.Nu HTML/SVG/CSS" "$OUT/vnu.txt" vnu --format text "${html_files[@]}"
  fi

  if need_cmd lychee && [[ ${#html_files[@]} -gt 0 ]]; then
    run_advisory "Local link/anchor check (offline)" "$OUT/lychee.txt" lychee --no-progress --offline "${html_files[@]}"
  fi
else
  warn_step "No EPUB found or path invalid"
fi

# ── PDF checks ──
if [[ -n "$PDF" && -f "$PDF" ]]; then
  need_cmd qpdf      && run_check    "qpdf structural check" "$OUT/qpdf.txt" qpdf --check "$PDF"
  need_cmd pdfinfo   && run_check    "PDF metadata"          "$OUT/pdfinfo.txt" pdfinfo "$PDF"
  need_cmd pdffonts  && run_advisory "PDF font embedding"    "$OUT/pdffonts.txt" pdffonts "$PDF"
  need_cmd pdftotext && run_check    "PDF text extraction"   "$OUT/pdftotext.txt" pdftotext -layout "$PDF" "$OUT/pdf-text.txt"
  need_cmd gs        && run_check    "Ghostscript render"    "$OUT/ghostscript.txt" gs -q -dNOPAUSE -dBATCH -sDEVICE=nullpage "$PDF"
  need_cmd verapdf   && run_advisory "veraPDF/A advisory"    "$OUT/verapdf.txt" verapdf "$PDF"
else
  warn_step "No PDF found or path invalid"
fi

{
  echo
  echo "## Result"
  echo "- Failures: $FAILS"
  echo "- Warnings: $WARNS"
  echo "- Report folder: $OUT"
} >> "$SUMMARY"

echo; cat "$SUMMARY"

if [[ "$FAILS" -gt 0 ]]; then
  echo; echo "VERDICT: Generic validators FAILED. Fix before running aciss-audit."
  exit 1
fi
echo; echo "VERDICT: Generic validators PASSED. Run aciss-audit.py next."
exit 0
