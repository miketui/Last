#!/usr/bin/env python3
"""
ACISS / TAYLKOMB house-standard audit for EPUB + print-ready PDF.

Catches the failure modes that generic validators miss:
  - ACISS palette regression (token census across all CSS)
  - ISBN absence (the deletion-not-insertion blocker)
  - Recto-start violations on chapter/part openers
  - Dark-page POD ink census (Kindle night-mode + print cost signal)
  - nav ↔ NCX entry-count parity
  - Image alt-text census
  - KDP supported-trim lookup
  - Placeholder-text scan
  - Playwright headless render (reading-flow verification)

Output: <out>/aciss-audit.json
Exit:   0 if no FAILs, 1 otherwise
"""
import sys, os, json, re, zipfile, subprocess, argparse, glob, tempfile
from pathlib import Path
from datetime import datetime

# ACISS locked tokens — Michael's brand law
ACISS_REQUIRED = {
    '#111111': 'Obsidian Black',
    '#b08d57': 'Antique Gold',
    '#d8d1c5': 'White Gold',
    '#145b4b': 'Deep Jade',
    '#c7d9d2': 'Soft Jade Mist',
}
RETIRED = {'#2b9999': 'retired teal', '#c9a961': 'retired gold'}
GENERIC = {'#008080': 'default teal', '#d4af37': 'default gold',
           '#1abc9c': 'flat-ui teal', '#f1c40f': 'flat-ui gold'}

# KDP supported paperback trims (inches)
KDP_TRIMS = [
    (5.0, 8.0), (5.06, 7.81), (5.25, 8.0), (5.5, 8.5),
    (6.0, 9.0), (6.14, 9.21), (6.69, 9.61),
    (7.0, 10.0), (7.44, 9.69), (7.5, 9.25), (8.0, 10.0),
    (8.25, 11.0), (8.5, 11.0),
]

OPENER_RE = re.compile(r'^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)[A-Z]{2,}')

def hex_norm(c): return c.lower() if c else c

# ─── EPUB AUDIT ──────────────────────────────────────────────────────────────

def audit_epub(epub_path):
    r = {'file': str(epub_path), 'checks': {}}
    if not os.path.isfile(epub_path):
        r['checks']['file_exists'] = {'status': 'FAIL', 'msg': 'EPUB not found'}
        return r
    try:
        from lxml import etree
    except ImportError:
        r['checks']['lxml'] = {'status': 'FAIL', 'msg': 'lxml not installed — rerun setup script'}
        return r

    z = zipfile.ZipFile(epub_path)

    # ACISS palette census
    css_files = [n for n in z.namelist() if n.endswith('.css')]
    all_hex = []
    for cf in css_files:
        content = z.read(cf).decode('utf-8', 'replace')
        all_hex.extend(re.findall(r'#[0-9a-fA-F]{3,6}\b', content))
    all_hex_norm = [hex_norm(h) for h in all_hex]
    aciss_hits   = {k: all_hex_norm.count(k) for k in ACISS_REQUIRED}
    retired_hits = {k: all_hex_norm.count(k) for k in RETIRED}
    generic_hits = {k: all_hex_norm.count(k) for k in GENERIC}
    aciss_total   = sum(aciss_hits.values())
    retired_total = sum(retired_hits.values())
    generic_total = sum(generic_hits.values())

    if aciss_total == 0:
        r['checks']['aciss_palette'] = {
            'status': 'FAIL',
            'msg': f'Zero ACISS tokens in {len(css_files)} CSS files (generic teal/gold instead)',
            'aciss_hits': aciss_hits, 'retired_hits': retired_hits, 'generic_hits': generic_hits,
            'css_files': css_files,
        }
    elif retired_total > 0 or generic_total > 0:
        r['checks']['aciss_palette'] = {
            'status': 'WARN',
            'msg': f'ACISS present but {retired_total} retired + {generic_total} generic tokens also found',
            'aciss_hits': aciss_hits, 'retired_hits': retired_hits, 'generic_hits': generic_hits,
        }
    else:
        r['checks']['aciss_palette'] = {
            'status': 'PASS',
            'msg': f'{aciss_total} ACISS token uses; no retired or generic tokens',
            'aciss_hits': aciss_hits,
        }

    # ISBN presence in OPF
    container = etree.fromstring(z.read('META-INF/container.xml'))
    opf_path = container.find('.//{urn:oasis:names:tc:opendocument:xmlns:container}rootfile').get('full-path')
    opf = etree.fromstring(z.read(opf_path))
    NS = {'d': 'http://purl.org/dc/elements/1.1/', 'o': 'http://www.idpf.org/2007/opf'}
    identifiers = []
    for i in opf.findall('.//d:identifier', NS):
        scheme = i.get('{http://www.idpf.org/2007/opf}scheme') or i.get('scheme') or ''
        identifiers.append((i.text or '', scheme))
    isbn_present = any(re.search(r'(isbn|97[89]\d{10}|97[89][-\s]\d)', (v + ' ' + s).lower()) for v, s in identifiers)
    r['checks']['isbn_in_opf'] = {
        'status': 'PASS' if isbn_present else 'FAIL',
        'msg': 'ISBN in dc:identifier' if isbn_present else 'No ISBN — UUID-only identifier blocks KDP/IngramSpark identity',
        'identifiers': identifiers,
    }

    # nav <-> NCX parity
    try:
        base = os.path.dirname(opf_path)
        nav_path = next((m.get('href') for m in opf.findall('.//o:manifest/o:item', NS)
                         if 'nav' in (m.get('properties') or '').split()), None)
        ncx_path = next((m.get('href') for m in opf.findall('.//o:manifest/o:item', NS)
                         if m.get('media-type') == 'application/x-dtbncx+xml'), None)
        nav_count = ncx_count = 0
        if nav_path:
            nav_full = os.path.normpath(os.path.join(base, nav_path))
            nav_count = len(etree.fromstring(z.read(nav_full)).xpath('//*[local-name()="nav"][1]//*[local-name()="a"]'))
        if ncx_path:
            ncx_full = os.path.normpath(os.path.join(base, ncx_path))
            ncx_count = len(etree.fromstring(z.read(ncx_full)).xpath('//*[local-name()="navPoint"]'))
        if nav_count > 0 and nav_count == ncx_count:
            r['checks']['nav_ncx_parity'] = {'status': 'PASS', 'msg': f'{nav_count} entries each'}
        elif nav_count == 0 and ncx_count == 0:
            r['checks']['nav_ncx_parity'] = {'status': 'WARN', 'msg': 'No nav or NCX found'}
        else:
            r['checks']['nav_ncx_parity'] = {'status': 'FAIL', 'msg': f'nav={nav_count} ncx={ncx_count}'}
    except Exception as e:
        r['checks']['nav_ncx_parity'] = {'status': 'WARN', 'msg': f'check failed: {e}'}

    # Image alt-text census
    xhtml_files = [n for n in z.namelist() if n.endswith('.xhtml')]
    missing_alt, total_imgs = [], 0
    for xf in xhtml_files:
        try:
            t = etree.fromstring(z.read(xf))
            for img in t.xpath('//*[local-name()="img"]'):
                total_imgs += 1
                if img.get('alt') is None:
                    missing_alt.append(f'{xf}: src={img.get("src", "?")}')
        except Exception:
            pass
    r['checks']['image_alt_text'] = {
        'status': 'PASS' if not missing_alt else 'FAIL',
        'msg': (f'{len(missing_alt)} of {total_imgs} images missing alt' if missing_alt
                else f'all {total_imgs} images have alt attribute'),
        'missing_samples': missing_alt[:10],
    }

    # Internal link integrity
    ids_by_file = {}
    for f in xhtml_files:
        try:
            t = etree.fromstring(z.read(f))
            ids_by_file[f] = set(t.xpath('//@id'))
        except Exception:
            pass
    broken = []
    for f in xhtml_files:
        try:
            t = etree.fromstring(z.read(f)); d = os.path.dirname(f)
            for href in t.xpath('//*[local-name()="a"]/@href'):
                if href.startswith(('http', 'mailto:')): continue
                if href.startswith('#'):
                    if href[1:] not in ids_by_file.get(f, set()):
                        broken.append(f'{f}: {href}')
                    continue
                tgt, _, frag = href.partition('#')
                full = os.path.normpath(os.path.join(d, tgt))
                if full not in z.namelist(): broken.append(f'{f}: {href}')
                elif frag and full in ids_by_file and frag not in ids_by_file[full]:
                    broken.append(f'{f}: {href}')
        except Exception:
            pass
    r['checks']['internal_links'] = {
        'status': 'PASS' if not broken else 'FAIL',
        'msg': f'{len(broken)} broken internal links/fragments' if broken else 'all internal links resolve',
        'broken_samples': broken[:10],
    }

    # Bibliography external URL count
    bib_candidates = [n for n in xhtml_files if 'bibli' in n.lower() or 'references' in n.lower()]
    if bib_candidates:
        try:
            t = etree.fromstring(z.read(bib_candidates[0]))
            urls = [h for h in t.xpath('//*[local-name()="a"]/@href') if h.startswith('http')]
            r['checks']['bibliography'] = {
                'status': 'PASS',
                'msg': f'{len(urls)} external URLs in {bib_candidates[0]} (use --online to check liveness)',
                'count': len(urls),
            }
        except Exception as e:
            r['checks']['bibliography'] = {'status': 'WARN', 'msg': str(e)}

    z.close()
    return r

# ─── PDF AUDIT ───────────────────────────────────────────────────────────────

def audit_pdf(pdf_path, do_dark_census=True):
    r = {'file': str(pdf_path), 'checks': {}}
    if not os.path.isfile(pdf_path):
        r['checks']['file_exists'] = {'status': 'FAIL', 'msg': 'PDF not found'}
        return r

    # Trim size vs KDP
    pages = 0
    try:
        info = subprocess.run(['pdfinfo', pdf_path], capture_output=True, text=True, check=True).stdout
        m = re.search(r'Page size:\s+([\d.]+)\s+x\s+([\d.]+)\s+pts', info)
        pages_m = re.search(r'Pages:\s+(\d+)', info)
        if m and pages_m:
            w_pts, h_pts = float(m.group(1)), float(m.group(2))
            w_in, h_in = w_pts / 72, h_pts / 72
            pages = int(pages_m.group(1)); r['pages'] = pages
            match = next((t for t in KDP_TRIMS
                          if abs(t[0] - w_in) < 0.02 and abs(t[1] - h_in) < 0.02), None)
            r['checks']['kdp_trim'] = {
                'status': 'PASS' if match else 'FAIL',
                'msg': f'{w_in:.4f}" × {h_in:.4f}" ({pages} pages)' +
                       (' — KDP supported' if match else ' — NOT in KDP supported list'),
                'pages': pages, 'trim_in': [w_in, h_in],
            }
    except Exception as e:
        r['checks']['kdp_trim'] = {'status': 'WARN', 'msg': str(e)}

    # Font embedding
    try:
        out = subprocess.run(['pdffonts', pdf_path], capture_output=True, text=True, check=True).stdout
        lines = [l for l in out.splitlines()[2:] if l.strip()]
        not_emb = [l for l in lines if len(l.split()) >= 5 and l.split()[-5] == 'no']
        r['checks']['fonts_embedded'] = {
            'status': 'PASS' if not not_emb else 'FAIL',
            'msg': f'{len(lines)} fonts total, {len(not_emb)} not embedded',
            'not_embedded': not_emb[:10],
        }
    except Exception as e:
        r['checks']['fonts_embedded'] = {'status': 'WARN', 'msg': str(e)}

    # Full text extraction (used by ISBN, recto, placeholders)
    full_text = ''
    try:
        full_text = subprocess.run(['pdftotext', pdf_path, '-'], capture_output=True, text=True, check=True).stdout
    except Exception as e:
        r['checks']['pdf_text_extract'] = {'status': 'WARN', 'msg': str(e)}

    # ISBN in PDF text
    isbn_hits = (re.findall(r'(?i)isbn[\s:-]*\d[\d-]{9,18}[Xx\d]', full_text) +
                 re.findall(r'\b97[89][-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d\b', full_text))
    r['checks']['isbn_in_pdf'] = {
        'status': 'PASS' if isbn_hits else 'FAIL',
        'msg': f'{len(isbn_hits)} ISBN match(es) in PDF text' if isbn_hits
               else 'No ISBN in PDF text (copyright page block missing)',
        'samples': list(set(isbn_hits))[:3],
    }

    # Recto-start enforcement
    pages_text = full_text.split('\f') if full_text else []
    violations, opener_count = [], 0
    for pg_idx, t in enumerate(pages_text, 1):
        flat = re.sub(r'\s+', '', t.upper())[:80]
        is_opener = flat.startswith('PART') or bool(OPENER_RE.match(flat))
        if is_opener:
            opener_count += 1
            if pg_idx % 2 == 0:
                violations.append({'page': pg_idx, 'head': flat[:40]})
    r['checks']['recto_starts'] = {
        'status': 'PASS' if not violations else 'FAIL',
        'msg': (f'{opener_count} openers detected, {len(violations)} on even (verso) pages'
                if pages_text else 'No text extracted'),
        'violations': violations,
        'opener_count': opener_count,
    }

    # Placeholder scan
    placeholders = re.findall(r'(?i)(XXXX+|\bTK\b|TODO|FIXME|lorem ipsum|\[INSERT[^\]]*\]|PLACEHOLDER)', full_text)
    r['checks']['placeholders'] = {
        'status': 'PASS' if not placeholders else 'FAIL',
        'msg': f'{len(placeholders)} placeholder strings' if placeholders else 'No placeholders',
        'samples': list(set(placeholders))[:10],
    }

    # Dark-ink census
    if do_dark_census and pages > 0:
        try:
            from PIL import Image
            sample_every = max(1, pages // 120)  # ~120 samples max
            dark_count, checked = 0, 0
            with tempfile.TemporaryDirectory() as td:
                for pg in range(1, pages + 1, sample_every):
                    subprocess.run(['pdftoppm', '-f', str(pg), '-l', str(pg), '-r', '20',
                                    '-png', pdf_path, f'{td}/t'], capture_output=True)
                    files = glob.glob(f'{td}/t*.png')
                    if not files: continue
                    im = Image.open(files[0]).convert('L'); w, h = im.size
                    dark = sum(1 for y in range(0, h, 4) for x in range(0, w, 4) if im.getpixel((x, y)) < 80)
                    total = len(range(0, h, 4)) * len(range(0, w, 4))
                    if total and dark / total > 0.30:
                        dark_count += 1
                    checked += 1
                    os.remove(files[0])
            extrapolated = int(dark_count * sample_every)
            pct = (extrapolated / pages * 100) if pages else 0
            r['checks']['dark_ink_census'] = {
                'status': 'WARN' if pct > 15 else 'PASS',
                'msg': f'~{extrapolated} of {pages} pages dark (~{pct:.0f}%); '
                       f'sampled {checked} pages; Kindle night-mode device test recommended',
                'extrapolated_dark': extrapolated, 'sampled': checked,
            }
        except ImportError:
            r['checks']['dark_ink_census'] = {'status': 'WARN', 'msg': 'PIL not available'}
        except Exception as e:
            r['checks']['dark_ink_census'] = {'status': 'WARN', 'msg': str(e)}

    return r

# ─── PLAYWRIGHT RENDER ───────────────────────────────────────────────────────

def render_check_epub(epub_path, out_dir):
    result = {'status': 'SKIP', 'msg': 'playwright not available'}
    try:
        import asyncio
        from playwright.async_api import async_playwright
        from lxml import etree

        async def run():
            errors = []
            with tempfile.TemporaryDirectory() as td:
                with zipfile.ZipFile(epub_path) as z:
                    z.extractall(td)
                opf_files = glob.glob(f'{td}/**/*.opf', recursive=True)
                if not opf_files: return errors
                opf = etree.parse(opf_files[0])
                base = os.path.dirname(opf_files[0])
                NS = {'o': 'http://www.idpf.org/2007/opf'}
                spine_ids = [it.get('idref') for it in opf.findall('.//o:spine/o:itemref', NS)]
                manifest = {it.get('id'): it.get('href') for it in opf.findall('.//o:manifest/o:item', NS)}
                if not spine_ids: return errors
                sample = list({spine_ids[len(spine_ids)//4],
                               spine_ids[len(spine_ids)//2],
                               spine_ids[-2] if len(spine_ids) > 1 else spine_ids[0]})
                async with async_playwright() as p:
                    b = await p.chromium.launch()
                    pg = await b.new_page(viewport={'width': 800, 'height': 1100})
                    pg.on('console', lambda m: errors.append(f'CONSOLE {m.type}: {m.text}') if m.type == 'error' else None)
                    pg.on('requestfailed', lambda r: errors.append(f'REQ FAIL: {r.url}'))
                    for sid in sample:
                        if sid in manifest:
                            fp = os.path.normpath(os.path.join(base, manifest[sid]))
                            if os.path.exists(fp):
                                await pg.goto('file://' + fp)
                                await pg.wait_for_timeout(500)
                                Path(out_dir).mkdir(parents=True, exist_ok=True)
                                await pg.screenshot(path=f'{out_dir}/render-{sid}.png')
                    await b.close()
            return errors

        errs = asyncio.run(run())
        result = {
            'status': 'PASS' if not errs else 'WARN',
            'msg': f'{len(errs)} console/request errors' if errs else 'Clean render, no errors',
            'errors': errs[:10],
        }
    except ImportError:
        pass
    except Exception as e:
        result = {'status': 'WARN', 'msg': f'render failed: {e}'}
    return result

# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--epub', required=True)
    ap.add_argument('--pdf', required=True)
    ap.add_argument('--out', required=True, help='output dir (e.g. validation-reports/latest)')
    ap.add_argument('--no-render', action='store_true', help='skip Playwright render check')
    ap.add_argument('--no-dark-census', action='store_true', help='skip dark-page census')
    args = ap.parse_args()

    out = Path(args.out); out.mkdir(parents=True, exist_ok=True)

    report = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'epub': audit_epub(args.epub),
        'pdf': audit_pdf(args.pdf, do_dark_census=not args.no_dark_census),
    }
    if not args.no_render:
        report['epub']['checks']['playwright_render'] = render_check_epub(args.epub, str(out))

    all_checks = list(report['epub']['checks'].items()) + list(report['pdf']['checks'].items())
    fails = [k for k, v in all_checks if v.get('status') == 'FAIL']
    warns = [k for k, v in all_checks if v.get('status') == 'WARN']
    passes = [k for k, v in all_checks if v.get('status') == 'PASS']
    report['summary'] = {'passes': len(passes), 'warns': len(warns), 'fails': len(fails),
                         'fail_list': fails, 'warn_list': warns}

    (out / 'aciss-audit.json').write_text(json.dumps(report, indent=2))

    print(f"\nACISS audit: {len(passes)} PASS · {len(warns)} WARN · {len(fails)} FAIL")
    for k, v in all_checks:
        s = v.get('status', '?')
        if s in ('FAIL', 'WARN'):
            print(f"  {s}: {k}: {v.get('msg', '')}")
    print(f"\nReport: {out}/aciss-audit.json")
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    main()
