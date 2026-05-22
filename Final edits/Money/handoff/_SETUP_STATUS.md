# Handoff Bundle — Setup Status

**Date:** 2026-05-22
**Scope of this pass:** `Final edits/Money/` only (per instruction).
**Decision applied:** Stack = **React 19 + Bun bundler** (keep existing `web/`
stack; no Vite). This matches repo `CLAUDE.md`, the existing `web/package.json`,
and `handoff/01_WEBSITE_PRD_FINAL.md § Architecture` — it resolves the bundle's
internal contradiction.

---

## Done in this pass

- Landed all 20 bundle files into `Final edits/Money/handoff/`.
- Amended the stack contradiction in 3 files (was "React 18.2 + Vite"):
  - `handoff/00_README.md` — Stack table → React 19 + Bun bundler.
  - `handoff/07_LAUNCH_TIMELINE.md` — Day 8 row → audit existing `web/`, no Vite scaffold.
  - `handoff/08_MASTER_AI_BUILDER_PROMPT.md` — negative constraint #2 → React 19 / Bun bundler.
- Created `Final edits/Money/GATE_LEDGER.md` — closes pre-mortem **B10**
  (ledger now exists; backup-approver field present, marked TBD for Michael).

## Verified

- **B1 baseline:** `web/` boots clean — `cd web && bun install && bun server.ts`
  serves `GET / -> 200` on port 3000, all SITEMAP routes registered.
- MCP servers from `08_MASTER_AI_BUILDER_PROMPT.md` reachable in this environment:
  Stripe, Supabase, MailerLite, Vercel, Figma, Adobe, Higgsfield, Gamma.

## Still open — needs Michael (not auto-completable)

- **B8** — run `epubcheck CurlsAndContemplationV4.epub`; output to
  `EPUBCHECK_REPORT.md`. epubcheck is not installed in this environment.
- **B9** — fill `handoff/claims-evidence.md` with dated, sourced evidence for
  every public claim (Rihanna, IPPY, Guido Palau, Jimmy Paul). Template is landed;
  real evidence cannot be fabricated.
- **B10** — name the backup approver in `GATE_LEDGER.md` (field is TBD).
- Strategy Lock inputs — confirm `RELEASE_DATE` and domain.

## Deferred — outside `Final edits/Money/` scope

These are real bundle setup items but live elsewhere in the repo; not touched
in this pass because work was scoped to `Final edits/Money/`:

- ACISS palette codemod across `web/`, `OEBPS/`, `pdf/`, `canvas/` (B2/C8).
  Legacy teal `#2B9999` / champagne `#C9A961` / Cinzel / Libre Baskerville
  still present in `web/styles/main.css`, `web/server.ts`, `web/lib/email.ts`,
  `web/server.test.ts`, `web/frontend.tsx`.
- `packages/aciss-tokens/` workspace scaffold.
- `web/.env.example`.
- Installing the `studio-site-build-os` skills into `.claude/skills/`
  (not present; the build can run manually via `handoff/09_PROMPT_LIBRARY.md`).

## Environment note

This is Claude Code on the web — an ephemeral remote container. Only committed
and pushed work survives. The bundle's "How to use" assumes local Claude Code
or Cowork; adjust expectations accordingly.
