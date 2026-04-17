#!/usr/bin/env python3
"""
build-pod-pdf-chromium.py
  Render print-interior-royal.html to PDF using Chromium headless + Paged.js polyfill.
  Paged.js is what makes Chromium honor @page margin boxes (headers/folios).
  Without it, Chromium silently drops @top-*/@bottom-* rules.
"""
import sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
HTML = HERE / "print-interior-royal.html"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parent / "output" / "CurlsAndContemplation-KDP-ROYAL-FINAL.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

print(f"HTML : {HTML}")
print(f"PDF  : {OUT}")
assert HTML.exists(), f"HTML not found: {HTML}"

with sync_playwright() as p:
    browser = p.chromium.launch(args=["--disable-web-security"])
    context = browser.new_context()
    page = context.new_page()

    print("Loading HTML (Paged.js will paginate on load)...")
    page.goto(HTML.as_uri(), wait_until="networkidle", timeout=180_000)

    # Paged.js emits "class=pagedjs_pages" on <div> wrappers and a final
    # "data-pagedjs-status=ready" on body, OR sets window.PagedPolyfill.state === "done"
    # We wait for pagination to complete.
    print("Waiting for Paged.js to finish paginating...")
    # Wait up to 3 minutes. Big docs (500+ pages) can take 60-90s to paginate.
    try:
        page.wait_for_function(
            "() => document.querySelector('.pagedjs_pages') && "
            "document.querySelectorAll('.pagedjs_page').length > 0 && "
            "!document.querySelector('.pagedjs_page[data-page-number] + script[src*=pagedjs]')",
            timeout=180_000
        )
    except Exception as e:
        print(f"  [warn] strict wait timeout; proceeding anyway: {e}")

    # Extra settling time — Paged.js's final resize/repaint pass
    time.sleep(5)

    # Count pages Paged.js produced (sanity)
    paged_count = page.evaluate("() => document.querySelectorAll('.pagedjs_page').length")
    print(f"Paged.js generated {paged_count} virtual pages")

    print("Rendering PDF...")
    page.pdf(
        path=str(OUT),
        # IMPORTANT: preferCSSPageSize makes Chromium honor @page size from CSS (6.69x9.61in)
        prefer_css_page_size=True,
        print_background=False,  # no backgrounds for B&W paperback interior
        display_header_footer=False,  # Paged.js handles headers/footers via margin boxes
        margin={"top":"0","right":"0","bottom":"0","left":"0"},  # ALL margins come from CSS @page
    )

    size = OUT.stat().st_size / (1024*1024)
    print(f"PDF written: {OUT}  ({size:.1f} MB)")
    browser.close()
