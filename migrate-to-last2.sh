#!/bin/bash
# Build the organized Last2 repository tree from this repo's contents and
# push it to https://github.com/miketui/Last2.git.
#
# Run this LOCALLY (or in a Claude Code session scoped to Last2):
#   git clone https://github.com/miketui/Last.git && cd Last
#   git checkout claude/curls-contemplation-final-build-qbhl74
#   bash migrate-to-last2.sh /tmp/Last2
#   cd /tmp/Last2 && git push -u origin main
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
FE="$SRC/Final edits"
DST="${1:-/tmp/Last2}"

rm -rf "$DST"
mkdir -p "$DST"/{book,release,build/fonts,audit,marketing,archive}

# book/ — canonical post-audit EPUB source
cp "$FE/mimetype" "$DST/book/"
cp -r "$FE/META-INF" "$FE/OEBPS" "$DST/book/"

# release/ — final verified artifacts (EPUB epubcheck 0/0/0/0; POD PDF 480pp)
cp "$SRC/release/"* "$DST/release/"

# build/ — pipeline scripts, print guide, folio font
cp "$SRC/build-pod-final.py" "$SRC/build-epub-final.sh" \
   "$SRC/inject-toc-folios.py" "$SRC/scan-widows.py" "$DST/build/"
cp "$FE/validate_outputs.py" "$FE/PDF-POD-BUILD-GUIDE.md" "$DST/build/"
cp "$SRC/pdf/latex/fonts/Montserrat-Regular.ttf" "$DST/build/fonts/"

# Path-adapt the scripts to the Last2 layout (source lives in book/).
python3 - "$DST/build" <<'EOF'
import sys, os
b = sys.argv[1]
edits = [
 ("build-pod-final.py",
  'OEBPS = Path(__file__).resolve().parent / "Final edits" / "OEBPS"',
  'OEBPS = Path(__file__).resolve().parent.parent / "book" / "OEBPS"'),
 ("build-pod-final.py",
  '_FONT_PATH = Path(__file__).resolve().parent / "pdf" / "latex" / "fonts" / "Montserrat-Regular.ttf"',
  '_FONT_PATH = Path(__file__).resolve().parent / "fonts" / "Montserrat-Regular.ttf"'),
 ("inject-toc-folios.py",
  'TOC = HERE / "Final edits" / "OEBPS" / "xhtml" / "3-TableOfContents.xhtml"',
  'TOC = HERE.parent / "book" / "OEBPS" / "xhtml" / "3-TableOfContents.xhtml"'),
 ("build-epub-final.sh",
  'SRC="/home/user/Last/Final edits"',
  'SRC="$(cd "$(dirname "$0")/../book" && pwd)"'),
]
for f, old, new in edits:
    p = os.path.join(b, f)
    s = open(p, encoding="utf-8").read()
    assert old in s, (f, old)
    open(p, "w", encoding="utf-8").write(s.replace(old, new))
    print("adapted", f)
EOF

# audit/ — three-phase forensic audit + earlier audit set
cp "$FE/CC-V7-Phase1-Forensic-Audit-Report.md" "$FE/CC-V7-Phase2-Premortem.md" \
   "$FE/CC-V7-Phase3-LLM-Council.md" "$FE/VALIDATION-REPORT.md" "$DST/audit/"
cp -r "$FE/audit-reports" "$DST/audit/audit-reports"

# marketing/ — funnel + website raw material
cp -r "$FE/Money" "$DST/marketing/Money"
cp -r "$FE/website" "$DST/marketing/website"

# archive/ — superseded builds and miscellany, verbatim
cp -r "$FE/final"   "$DST/archive/final"
cp -r "$FE/output"  "$DST/archive/output"
cp -r "$FE/outputs" "$DST/archive/outputs"
cp -r "$FE/pdf"     "$DST/archive/pdf"
cp -r "$FE/Claude-code" "$DST/archive/Claude-code"
cp "$FE/files 33.zip"   "$DST/archive/"

# README
cp "$SRC/LAST2-README.md" "$DST/README.md"

cd "$DST"
git init -b main
git add -A
git commit -m "Curls & Contemplation production repo: organized migration from miketui/Last

- book/      canonical post-audit EPUB source
- release/   final verified artifacts (EPUB epubcheck 0/0/0/0; POD PDF 480pp
             Royal, fonts embedded) + BUILD-MANIFEST.md + page-map.json
- build/     path-adapted build pipeline + print guide + folio font
- audit/     three-phase forensic audit reports + earlier audit set
- marketing/ Money/ funnel program + website/
- archive/   superseded builds and miscellany, verbatim"
git remote add origin https://github.com/miketui/Last2.git
echo
echo "Tree ready at $DST — now run:  cd $DST && git push -u origin main"
