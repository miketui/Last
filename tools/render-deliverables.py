#!/usr/bin/env python3
"""
Synthesizes the 4-deliverable bundle from validation-reports/<stamp>/:
  1. deliverables/QA-Evidence-Report.md
  2. deliverables/pre-mortem-risk-registry.md
  3. deliverables/council-transcript.md
  4. deliverables/council-report.html
And prints the Upload Verdict block.
"""
import json, sys, os, argparse
from pathlib import Path
from datetime import datetime

def load_aciss(report_dir):
    p = Path(report_dir) / 'aciss-audit.json'
    return json.loads(p.read_text()) if p.exists() else {}

def load_summary(report_dir):
    p = Path(report_dir) / 'SUMMARY.md'
    return p.read_text() if p.exists() else ''

def all_check_items(aciss):
    items = []
    for sec in ('epub', 'pdf'):
        for k, v in aciss.get(sec, {}).get('checks', {}).items():
            items.append((sec, k, v))
    return items

# ─── QA Evidence Report ──

def render_qa_evidence(aciss, summary, out_path, epub, pdf):
    s = aciss.get('summary', {}) if aciss else {}
    md = [
        f"# QA Evidence Report — Pre-Upload Audit",
        f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"**Files:** `{epub}` · `{pdf}`",
        "",
        f"## Aggregate result",
        f"- Generic validators: see SUMMARY.md below",
        f"- ACISS house-standard: **{s.get('passes', 0)} PASS · {s.get('warns', 0)} WARN · {s.get('fails', 0)} FAIL**",
        "",
        "## Generic publishing validators",
        "",
        summary or "_(SUMMARY.md not found — run validate-publishing.sh first)_",
        "",
        "## ACISS / house-standard audit",
        "",
    ]
    for section_name, section_key in (('EPUB', 'epub'), ('PDF', 'pdf')):
        md.append(f"### {section_name}")
        for k, v in aciss.get(section_key, {}).get('checks', {}).items():
            md.append(f"- **{k}** — `{v.get('status', '?')}` — {v.get('msg', '')}")
        md.append("")
    if s.get('fail_list'):
        md.append(f"**Blockers:** {', '.join(s['fail_list'])}")
    Path(out_path).write_text('\n'.join(md))

# ─── Pre-Mortem Registry ──

BLOCKER_KEYS     = {'isbn_in_opf', 'isbn_in_pdf', 'aciss_palette', 'kdp_trim',
                    'fonts_embedded', 'placeholders', 'recto_starts', 'internal_links'}
FAST_FOLLOW_KEYS = {'nav_ncx_parity', 'image_alt_text'}
TRACK_KEYS       = {'dark_ink_census', 'playwright_render', 'bibliography'}

def classify_risks(aciss):
    tigers, paper, elephants = [], [], []
    if not aciss: return tigers, paper, elephants
    for sec, k, v in all_check_items(aciss):
        if v.get('status') == 'FAIL':
            urgency = ('Launch-Blocking' if k in BLOCKER_KEYS
                       else 'Fast-Follow' if k in FAST_FOLLOW_KEYS
                       else 'Track')
            tigers.append({'risk': k, 'urgency': urgency, 'msg': v.get('msg', '')})
        elif v.get('status') == 'WARN' and k in TRACK_KEYS:
            tigers.append({'risk': k, 'urgency': 'Track', 'msg': v.get('msg', '')})
    fail_keys = {t['risk'] for t in tigers}
    if 'isbn_in_opf' in fail_keys or 'isbn_in_pdf' in fail_keys:
        elephants.append({
            'risk': '"FINAL" filename ends scrutiny prematurely',
            'msg': 'Filename declared done while ISBN unresolved — reserve FINAL for post-gates state',
        })
    if 'aciss_palette' in fail_keys:
        elephants.append({
            'risk': 'Locked brand standards exist but pipeline does not enforce them',
            'msg': 'Add pre-build CSS token gate that fails the build on missing ACISS tokens',
        })
    return tigers, paper, elephants

def render_pre_mortem(aciss, out_path):
    tigers, paper, elephants = classify_risks(aciss)
    n_lb = sum(1 for t in tigers if t['urgency'] == 'Launch-Blocking')
    n_ff = sum(1 for t in tigers if t['urgency'] == 'Fast-Follow')
    n_tr = sum(1 for t in tigers if t['urgency'] == 'Track')
    md = [
        "# Pre-Mortem Risk Registry",
        f"**Date:** {datetime.now().strftime('%Y-%m-%d')}",
        f"**Method:** Gary Klein prospective hindsight + auto-classification from ACISS audit",
        "",
        f"**Tigers: {len(tigers)} (Launch-Blocking: {n_lb} · Fast-Follow: {n_ff} · Track: {n_tr}) · "
        f"Paper Tigers: {len(paper)} · Elephants: {len(elephants)}**",
        "",
        "## Tigers (real, evidence-backed)",
        "",
    ]
    if tigers:
        md += ["| # | Risk | Urgency | Evidence |", "|---|------|---------|----------|"]
        for i, t in enumerate(tigers, 1):
            md.append(f"| {i} | `{t['risk']}` | **{t['urgency']}** | {t['msg']} |")
    else:
        md.append("_None — all validator checks passed._")
    md += ["", "## Elephants (unspoken / pattern-derived)", ""]
    if elephants:
        for e in elephants:
            md.append(f"- **{e['risk']}** — {e['msg']}")
    else:
        md.append("_None surfaced this pass._")
    md += [
        "",
        "## Sequencing rule (the hidden dependency)",
        "",
        "Decisions → rebuild → epubcheck (0/0/0/0) → **interior freeze + final page count** → "
        "spine math → cover wrap → KDP draft → previewer → author proof → launch.",
        "",
        "Spine width is a function of final page count. Commission the cover only after the interior is frozen.",
    ]
    Path(out_path).write_text('\n'.join(md))

# ─── Council ──

def render_council(aciss, out_md, out_html):
    fails = aciss.get('summary', {}).get('fail_list', []) if aciss else []
    warns = aciss.get('summary', {}).get('warn_list', []) if aciss else []
    ready = not fails
    verdict = 'READY for upload' if ready else 'HOLD — fix blockers'

    contrarian = (
        f"The audit shows {', '.join(fails)} — each is a decision masquerading as 'done'. "
        f"Verify nothing was silently regenerated from a stylesheet template since the last validated build."
    ) if fails else (
        "No active blockers, but verify nothing was silently regenerated since the last validated build. "
        "Diff this build's stylesheets against the last known-good."
    )
    first_principles = (
        f"Two standards: KDP-acceptable (mechanical) and house-acceptable (ACISS + locked production standards). "
        f"{'Currently failing house standards: ' + ', '.join(fails) + '.' if fails else 'Both bars cleared on this run.'}"
    )
    expansionist = (
        "This pipeline now reproduces across every TAYLKOMB title. Fix gaps once at source, every future book "
        "inherits the standard for free. The audit infrastructure is the asset."
    )
    outsider = (
        "Readers do not name brand tokens or count TOC entries. They notice: cover wrap, font legibility, "
        "and e-reader night-mode behavior. Device-test before the publish button regardless of validators."
    )
    executor = (
        f"Order today: (1) clear validator FAIL list ({len(fails)} item{'s' if len(fails) != 1 else ''}). "
        f"(2) Local epubcheck 0/0/0/0. (3) KDP draft + previewer + author proof. "
        f"Do not add new structural changes this cycle."
    )

    md = [
        "# LLM Council — Upload Readiness",
        f"**Date:** {datetime.now().strftime('%Y-%m-%d')}",
        f"**Mode:** Serial (single-context; partial-blind peer review)",
        "",
        f"## Verdict: {verdict}",
        "",
        f"**Blockers:** {', '.join(fails) if fails else 'none'}",
        f"**Warnings:** {', '.join(warns) if warns else 'none'}",
        "",
        "## Five advisors",
        "",
        f"### The Contrarian\n{contrarian}",
        "",
        f"### The First Principles Thinker\n{first_principles}",
        "",
        f"### The Expansionist\n{expansionist}",
        "",
        f"### The Outsider\n{outsider}",
        "",
        f"### The Executor\n{executor}",
        "",
        "## Chairman's verdict",
        "",
        f"**{verdict}.** " +
        (f"Resolve {len(fails)} blocker(s) in priority order: {', '.join(fails)}. "
         f"Hidden dependency: freeze the interior before commissioning the cover wrap "
         f"(spine width = f(page count))."
         if fails else
         "Run KDP previewer and order author proof. Hidden dependency: device-test on real Kindle hardware "
         "in light/dark/sepia modes before publish."),
    ]
    Path(out_md).write_text('\n'.join(md))

    blockers_html = ', '.join(fails) if fails else 'None'
    blocker_cls = 'fail' if fails else 'pass'
    html = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Council — Upload Readiness</title>
<style>
:root{{--ob:#111111;--gold:#B08D57;--wg:#D8D1C5;--jade:#145B4B;--mist:#C7D9D2}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:Georgia,serif;background:var(--ob);color:var(--wg);max-width:920px;margin:0 auto;padding:40px 20px;line-height:1.6}}
h1{{color:var(--gold);letter-spacing:.04em;margin-bottom:6px}}
.sub{{color:var(--mist);font-size:.85rem;margin-bottom:24px;font-family:Helvetica,Arial,sans-serif}}
.verdict{{background:var(--jade);color:#fff;padding:22px 26px;border-left:5px solid var(--gold);margin:24px 0;border-radius:4px}}
.verdict h2{{color:var(--gold);text-transform:uppercase;letter-spacing:.12em;font-size:1rem;margin-bottom:8px;font-family:Helvetica,Arial,sans-serif}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:16px;margin:24px 0}}
.card{{background:#1b1b1b;border:1px solid #2a2a2a;border-top:3px solid var(--gold);padding:18px;border-radius:4px}}
.card h3{{color:var(--gold);font-family:Helvetica,Arial,sans-serif;font-size:.95rem;letter-spacing:.06em;margin-bottom:8px}}
.card p{{font-size:.88rem}}
.fail{{color:#e89a9a}}.pass{{color:var(--mist)}}
</style></head><body>
<h1>Council — Upload Readiness</h1>
<div class="sub">Generated {datetime.now().strftime('%Y-%m-%d %H:%M')} · ACISS-themed</div>
<div class="verdict"><h2>Verdict</h2>
<p style="font-size:1.05rem">{verdict}</p>
<p class="{blocker_cls}">Blockers: {blockers_html}</p></div>
<div class="grid">
<div class="card"><h3>The Contrarian</h3><p>{contrarian}</p></div>
<div class="card"><h3>First Principles</h3><p>{first_principles}</p></div>
<div class="card"><h3>The Expansionist</h3><p>{expansionist}</p></div>
<div class="card"><h3>The Outsider</h3><p>{outsider}</p></div>
<div class="card"><h3>The Executor</h3><p>{executor}</p></div>
</div>
</body></html>'''
    Path(out_html).write_text(html)

# ─── Verdict Block ──

def render_verdict_block(aciss, summary):
    fails = aciss.get('summary', {}).get('fail_list', []) if aciss else []
    warns = aciss.get('summary', {}).get('warn_list', []) if aciss else []
    has_generic_fails = 'FAIL' in summary
    overall_fail = bool(fails) or has_generic_fails

    lines = []
    bar = "=" * 60
    lines.append(bar)
    lines.append("Upload Verdict")
    lines.append("NOT READY" if overall_fail else "READY")
    lines.append("")
    lines.append("Blockers")
    if overall_fail:
        for f in fails: lines.append(f"  - {f}")
        if has_generic_fails: lines.append("  - See FAIL items in SUMMARY.md")
    else:
        lines.append("  (none)")
    lines.append("")
    lines.append("Warnings")
    for w in warns: lines.append(f"  - {w}")
    if not warns: lines.append("  (none)")
    lines.append("")
    lines.append("Evidence")
    lines.append("  validation-reports/latest/SUMMARY.md")
    lines.append("  validation-reports/latest/aciss-audit.json")
    lines.append("  validation-reports/latest/epubcheck.txt")
    lines.append("  validation-reports/latest/pdfinfo.txt")
    lines.append("  deliverables/QA-Evidence-Report.md")
    lines.append("")
    lines.append("Fix Plan")
    step = 1
    if 'isbn_in_opf' in fails or 'isbn_in_pdf' in fails:
        lines.append(f"  {step}. ISBN decision: Bowker 10-pack vs KDP-free. Insert into source")
        lines.append(f"     + content.opf dc:identifier + copyright page; rebuild both artifacts.")
        step += 1
    if 'aciss_palette' in fails:
        lines.append(f"  {step}. ACISS token swap in CSS sources; rebuild + jade-on-obsidian contrast check.")
        step += 1
    if 'kdp_trim' in fails:
        lines.append(f"  {step}. Re-export PDF at a KDP-supported trim size.")
        step += 1
    if 'fonts_embedded' in fails:
        lines.append(f"  {step}. Re-export PDF with all fonts embedded (check Distiller/Ghostscript settings).")
        step += 1
    if 'placeholders' in fails:
        lines.append(f"  {step}. Remove placeholder strings (TK, TODO, [INSERT...]) from source; rebuild.")
        step += 1
    if 'recto_starts' in fails:
        lines.append(f"  {step}. Insert blank verso pages so chapter/part openers fall on recto (odd) pages.")
        step += 1
    if 'internal_links' in fails:
        lines.append(f"  {step}. Fix broken internal links / fragment IDs reported in aciss-audit.json.")
        step += 1
    if 'nav_ncx_parity' in fails:
        lines.append(f"  {step}. Reconcile nav.xhtml ↔ toc.ncx entry counts in EPUB source.")
        step += 1
    if 'image_alt_text' in fails:
        lines.append(f"  {step}. Add alt attribute to every <img> in xhtml (decorative → empty alt).")
        step += 1
    if has_generic_fails:
        lines.append(f"  {step}. Address each generic-validator FAIL in SUMMARY.md.")
        step += 1
    if not overall_fail:
        lines.append("  1. Open KDP Previewer on the EPUB.")
        lines.append("  2. Upload to KDP in DRAFT; run Amazon's previewer.")
        lines.append("  3. Order author proof copy.")
        lines.append("  4. Device-test EPUB on Kindle hardware (light/dark/sepia).")
        lines.append("  5. Freeze interior, commission cover wrap (spine = f(pages)).")
    lines.append("")
    lines.append("Next Command")
    if overall_fail:
        lines.append("  # Fix blockers above in source, then re-run the full audit:")
        lines.append("  ./tools/validate-publishing.sh <epub> <pdf> && \\")
        lines.append("    python3 tools/aciss-audit.py --epub <epub> --pdf <pdf> --out validation-reports/latest && \\")
        lines.append("    python3 tools/render-deliverables.py --report-dir validation-reports/latest --epub <epub> --pdf <pdf>")
    else:
        lines.append("  open -a 'Kindle Previewer 3' <epub>   # macOS")
        lines.append("  # then upload via https://kdp.amazon.com/")
    lines.append(bar)
    return '\n'.join(lines)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--report-dir', required=True, help='validation-reports/<stamp>')
    ap.add_argument('--epub', required=True)
    ap.add_argument('--pdf', required=True)
    ap.add_argument('--out', default='deliverables')
    args = ap.parse_args()

    out = Path(args.out); out.mkdir(parents=True, exist_ok=True)
    aciss = load_aciss(args.report_dir)
    summary = load_summary(args.report_dir)

    render_qa_evidence(aciss, summary, out / 'QA-Evidence-Report.md', args.epub, args.pdf)
    render_pre_mortem(aciss, out / 'pre-mortem-risk-registry.md')
    render_council(aciss, out / 'council-transcript.md', out / 'council-report.html')

    verdict = render_verdict_block(aciss, summary)
    (out / 'VERDICT.txt').write_text(verdict)
    print(verdict)
    print(f"\nDeliverables written to: {out}/")

if __name__ == '__main__':
    main()
