#!/usr/bin/env python3
"""Widow/orphan candidate scan: flag pages whose extracted text is 1-2 short
lines (a stranded fragment). Pages with zero text are imposition blanks or
image pages and are reported separately for the record."""
import subprocess, sys, re

pdf = sys.argv[1]
pages = int(re.search(r"Pages:\s+(\d+)", subprocess.run(
    ["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
candidates, blanks = [], []
for p in range(1, pages + 1):
    txt = subprocess.run(["pdftotext", "-f", str(p), "-l", str(p), pdf, "-"],
                         capture_output=True, text=True).stdout
    lines = [l.strip() for l in txt.splitlines() if l.strip()]
    # drop a bare folio number line
    lines = [l for l in lines if not re.fullmatch(r"\d{1,3}", l)]
    if not lines:
        blanks.append(p)
    elif len(lines) <= 2 and sum(len(l) for l in lines) < 120:
        candidates.append((p, lines))
print(f"{pages} pages scanned")
print(f"text-empty pages (imposition blanks / image-quote pages): {len(blanks)}")
print(f"widow/orphan candidates: {len(candidates)}")
for p, lines in candidates:
    print(f"  p.{p}: {lines}")
