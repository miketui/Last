#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
import posixpath
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "output"
EPUB_PATH = OUTPUT_DIR / "CurlsAndContemplation.epub"
PDF_PATH = OUTPUT_DIR / "CurlsAndContemplation-ROYAL-BW-FINALv4.pdf"
REPORT_PATH = OUTPUT_DIR / "final-qa-report.txt"


@dataclass
class Finding:
    severity: str  # PASS, WARN, FAIL
    message: str


class LinkCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs):
        if tag.lower() != "a":
            return
        for k, v in attrs:
            if k.lower() == "href" and v:
                self.hrefs.append(v)


def parse_xml_from_zip(zf: zipfile.ZipFile, path: str) -> ET.Element:
    with zf.open(path) as fh:
        return ET.fromstring(fh.read())


def check_epub() -> list[Finding]:
    findings: list[Finding] = []
    if not EPUB_PATH.exists():
        return [Finding("FAIL", f"EPUB not found: {EPUB_PATH}")]

    with zipfile.ZipFile(EPUB_PATH) as zf:
        names = zf.namelist()
        if not names:
            return [Finding("FAIL", "EPUB archive is empty")]

        first = zf.infolist()[0]
        if first.filename != "mimetype":
            findings.append(Finding("FAIL", "EPUB first entry is not mimetype"))
        elif first.compress_type != zipfile.ZIP_STORED:
            findings.append(Finding("FAIL", "mimetype entry must be uncompressed (ZIP_STORED)"))
        else:
            mt = zf.read("mimetype").decode("utf-8", errors="replace").strip()
            if mt != "application/epub+zip":
                findings.append(Finding("FAIL", f"mimetype content invalid: {mt}"))
            else:
                findings.append(Finding("PASS", "EPUB mimetype placement/content is valid"))

        if "META-INF/container.xml" not in names:
            findings.append(Finding("FAIL", "META-INF/container.xml missing"))
            return findings

        container = parse_xml_from_zip(zf, "META-INF/container.xml")
        ns_c = {"c": "urn:oasis:names:tc:opendocument:xmlns:container"}
        rootfile = container.find(".//c:rootfile", ns_c)
        if rootfile is None:
            findings.append(Finding("FAIL", "No rootfile entry in container.xml"))
            return findings

        opf_path = rootfile.attrib.get("full-path", "")
        if not opf_path or opf_path not in names:
            findings.append(Finding("FAIL", f"OPF path missing from archive: {opf_path}"))
            return findings
        findings.append(Finding("PASS", f"Container rootfile found: {opf_path}"))

        opf = parse_xml_from_zip(zf, opf_path)
        ns_o = {"o": "http://www.idpf.org/2007/opf"}
        manifest_items = opf.findall(".//o:manifest/o:item", ns_o)
        opf_dir = PurePosixPath(opf_path).parent
        missing_manifest_files: list[str] = []
        for item in manifest_items:
            href = item.attrib.get("href", "")
            if not href:
                continue
            rel = (opf_dir / PurePosixPath(href)).as_posix()
            if rel not in names:
                missing_manifest_files.append(rel)

        if missing_manifest_files:
            findings.append(Finding("FAIL", f"Missing manifest files: {len(missing_manifest_files)}"))
            findings.extend(Finding("FAIL", f"  - {m}") for m in missing_manifest_files[:15])
        else:
            findings.append(Finding("PASS", "All manifest-referenced files exist in EPUB"))

        manifest_set = {
            (opf_dir / PurePosixPath(item.attrib.get("href", ""))).as_posix()
            for item in manifest_items
            if item.attrib.get("href")
        }
        ignore_extras = {opf_path, "OEBPS/MASTER_ERROR_REPORT.md"}
        extras = sorted(n for n in names if n.startswith("OEBPS/") and n not in manifest_set and n not in ignore_extras and not n.endswith("/"))
        if extras:
            findings.append(Finding("WARN", f"Files under OEBPS not declared in manifest: {len(extras)}"))
            findings.extend(Finding("WARN", f"  - {e}") for e in extras[:10])
        else:
            findings.append(Finding("PASS", "No undeclared OEBPS files detected"))

        # XHTML local href checks
        broken: list[tuple[str, str, str]] = []
        xhtml_files = [n for n in names if n.startswith("OEBPS/xhtml/") and n.endswith(".xhtml")]
        for page in xhtml_files:
            parser = LinkCollector()
            parser.feed(zf.read(page).decode("utf-8", errors="replace"))
            page_dir = PurePosixPath(page).parent
            for href in parser.hrefs:
                if href.startswith(("http://", "https://", "mailto:", "tel:", "#", "javascript:")):
                    continue
                target = href.split("#", 1)[0]
                if not target:
                    continue
                resolved = (page_dir / PurePosixPath(target)).as_posix()
                normalized = posixpath.normpath(resolved)
                if normalized not in names:
                    broken.append((page, href, normalized))

        if broken:
            findings.append(Finding("FAIL", f"Broken local XHTML links: {len(broken)}"))
            findings.extend(Finding("FAIL", f"  - {src} -> {href} (missing {resolved})") for src, href, resolved in broken[:20])
        else:
            findings.append(Finding("PASS", "No broken local XHTML links found"))

        # Worksheet CTA checks
        worksheet_pages = [
            "OEBPS/xhtml/5-SelfAssessment.xhtml",
            "OEBPS/xhtml/30-SelfAssessment.xhtml",
            "OEBPS/xhtml/35-JournalingStart.xhtml",
            "OEBPS/xhtml/36-ManifestingJournal.xhtml",
            "OEBPS/xhtml/37-journal-page.xhtml",
            "OEBPS/xhtml/38-professional-development.xhtml",
            "OEBPS/xhtml/39-SMARTGoals.xhtml",
            "OEBPS/xhtml/40-self-care-journal.xhtml",
            "OEBPS/xhtml/41-VisionJournal.xhtml",
            "OEBPS/xhtml/42-DoodlePage.xhtml",
        ]
        cta_missing = []
        for page in worksheet_pages:
            if page not in names:
                cta_missing.append(f"{page} missing from EPUB")
                continue
            body = zf.read(page).decode("utf-8", errors="replace")
            if "download the printable worksheet PDF" not in body or "../assets/printable-worksheet-pack.pdf" not in body:
                cta_missing.append(page)

        if cta_missing:
            findings.append(Finding("FAIL", f"Worksheet CTA link validation failed for {len(cta_missing)} page(s)"))
            findings.extend(Finding("FAIL", f"  - {m}") for m in cta_missing)
        else:
            findings.append(Finding("PASS", "Worksheet CTA links are present in all worksheet pages"))

    return findings


def check_pdf() -> list[Finding]:
    findings: list[Finding] = []
    if not PDF_PATH.exists():
        return [Finding("FAIL", f"PDF not found: {PDF_PATH}")]

    raw = PDF_PATH.read_bytes()
    if len(raw) < 10_000:
        findings.append(Finding("WARN", f"PDF is unexpectedly small ({len(raw)} bytes)"))
    else:
        findings.append(Finding("PASS", f"PDF size looks plausible ({len(raw)} bytes)"))

    if not raw.startswith(b"%PDF-"):
        findings.append(Finding("FAIL", "PDF header missing (%PDF-)"))
    else:
        findings.append(Finding("PASS", "PDF header is valid"))

    tail = raw[-4096:]
    if b"%%EOF" not in tail:
        findings.append(Finding("FAIL", "PDF EOF marker (%%EOF) not found near file end"))
    else:
        findings.append(Finding("PASS", "PDF EOF marker found near end"))

    return findings


def main() -> int:
    all_findings = [*check_epub(), *check_pdf()]
    fail_count = sum(1 for f in all_findings if f.severity == "FAIL")
    warn_count = sum(1 for f in all_findings if f.severity == "WARN")
    pass_count = sum(1 for f in all_findings if f.severity == "PASS")

    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")
    lines = [
        "Final Output QA Report",
        f"Generated: {stamp}",
        "",
        f"PASS: {pass_count}",
        f"WARN: {warn_count}",
        f"FAIL: {fail_count}",
        "",
    ]
    for finding in all_findings:
        lines.append(f"[{finding.severity}] {finding.message}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines))
    print(f"\nReport written to: {REPORT_PATH}")

    return 1 if fail_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
