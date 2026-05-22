# Push to Repo — `miketui/Last` · `/Final edits/website/`

Three paths, pick one. **Reason I can't push for you directly:** the GitHub MCP requires you to OAuth from your machine — I can't authenticate on your behalf without that interactive flow, and pushing to a public repo without verified identity would forge commits.

---

## Path A — Run the bash script (recommended, fastest)

Open a terminal on your machine. Paste this block. It clones if needed, copies the bundle into `Final edits/website/`, commits with a real message, and pushes a feature branch you can PR from.

```bash
#!/usr/bin/env bash
# push-bundle.sh — Curls handoff v2 → miketui/Last @ Final edits/website/
set -euo pipefail

# CONFIG — adjust if your local path differs
REPO_URL="https://github.com/miketui/Last.git"
LOCAL="$HOME/code/miketui-Last"            # where to clone / find the repo
BUNDLE_SRC="$(pwd)/curls-handoff-bundle-v2" # where you unzipped the bundle (current dir by default)
BRANCH="feat/curls-handoff-v2"
TARGET="Final edits/website"

# 1. Clone or pull
if [ ! -d "$LOCAL/.git" ]; then
  echo "→ cloning $REPO_URL → $LOCAL"
  git clone "$REPO_URL" "$LOCAL"
fi
cd "$LOCAL"
git fetch origin
git checkout main
git pull --ff-only origin main

# 2. Create feature branch (fresh)
git checkout -B "$BRANCH" origin/main

# 3. Mkdir + copy
mkdir -p "$TARGET"
cp -R "$BUNDLE_SRC"/. "$TARGET/"

# 4. Sanity check — fail loud if files missing
for f in 00_README.md 01_WEBSITE_PRD_FINAL.md 08_MASTER_AI_BUILDER_PROMPT.md \
         15_FUNNEL_GENERATOR_PROMPT.md 16_SEO_AND_DISCOVERY.md PUSH_TO_REPO.md; do
  test -f "$TARGET/$f" || { echo "✗ missing $TARGET/$f"; exit 1; }
done
echo "✓ all expected files present in $TARGET"

# 5. Stage + commit (skip if no changes)
git add "$TARGET"
if git diff --cached --quiet; then
  echo "→ no changes to commit"
else
  git commit -m "feat(website): land Curls handoff v2 bundle in Final edits/website/

- FINAL Website PRD (v2.0) — supersedes 2026-02-16 v1.0
- ACISS Obsidian/Gold/Jade locked; V4 EPUB; \$17.99 launch / \$19.99 regular
- Stripe + Supabase signed-URL delivery; MailerLite primary
- 7 email sequences (Resend transactional + MailerLite marketing)
- 4 high-conversion funnels (F1–F4)
- 22-phase studio-site-orchestrator pipeline with 9 scoped human-approval gates
- Per-route SEO + JSON-LD; full L1–L7 discoverability prompt
- Pre-mortem (10 launch-blocking Tigers, 6 fast-follow, 3 track)
- Motion (motion/react) + Tier-2 hero spec with reduced-motion gate
- Foundation files: robots, sitemap generator, seo.ts, jsonld.ts, vercel.json (CSP+headers+crons), substack-sync, consent banner, verify-build.sh

Refs: studio-site-build-os v1.0.0, brief @ Final edits/website/01_WEBSITE_PRD_FINAL.md
"
fi

# 6. Push
git push -u origin "$BRANCH"

# 7. Open PR (requires gh CLI; skips silently if not installed)
if command -v gh &>/dev/null; then
  gh pr create \
    --base main \
    --head "$BRANCH" \
    --title "Curls handoff v2 — Final edits/website/" \
    --body "Lands the 17-file Curls handoff bundle. Review entry point: Final edits/website/00_README.md → 01_WEBSITE_PRD_FINAL.md → 08_MASTER_AI_BUILDER_PROMPT.md.

Per studio-site-build-os, brief-before-code: this PR is the brief lock. Phase 6 (scaffold) does NOT begin until this is approved.

Pre-mortem: BUNDLE_PRE_MORTEM.md attached in the bundle."
else
  echo "→ install \`gh\` CLI then run: gh pr create --base main --head $BRANCH"
fi

echo ""
echo "✓ done. PR: https://github.com/miketui/Last/compare/main...$BRANCH"
```

Save as `push-bundle.sh`, then:

```bash
chmod +x push-bundle.sh
./push-bundle.sh
```

---

## Path B — PowerShell (Windows native)

Same flow for `pwsh` / Windows PowerShell:

```powershell
# push-bundle.ps1 — Curls handoff v2 → miketui/Last @ Final edits/website/
$ErrorActionPreference = "Stop"

$RepoUrl   = "https://github.com/miketui/Last.git"
$Local     = "$env:USERPROFILE\code\miketui-Last"
$BundleSrc = "$PSScriptRoot\curls-handoff-bundle-v2"  # adjust to where you unzipped
$Branch    = "feat/curls-handoff-v2"
$Target    = "Final edits/website"

# 1. Clone or pull
if (-not (Test-Path "$Local\.git")) {
  Write-Host "→ cloning $RepoUrl → $Local"
  git clone $RepoUrl $Local
}
Set-Location $Local
git fetch origin
git checkout main
git pull --ff-only origin main

# 2. Branch
git checkout -B $Branch origin/main

# 3. Copy
New-Item -ItemType Directory -Force -Path "$Local\$Target" | Out-Null
Copy-Item -Path "$BundleSrc\*" -Destination "$Local\$Target" -Recurse -Force

# 4. Sanity
$required = @(
  "00_README.md", "01_WEBSITE_PRD_FINAL.md", "08_MASTER_AI_BUILDER_PROMPT.md",
  "15_FUNNEL_GENERATOR_PROMPT.md", "16_SEO_AND_DISCOVERY.md", "PUSH_TO_REPO.md"
)
foreach ($f in $required) {
  if (-not (Test-Path "$Local\$Target\$f")) { throw "✗ missing $Target\$f" }
}
Write-Host "✓ all expected files present"

# 5. Stage + commit
git add $Target
$staged = git diff --cached --name-only
if ($staged.Count -eq 0) {
  Write-Host "→ no changes to commit"
} else {
  git commit -m "feat(website): land Curls handoff v2 bundle in Final edits/website/"
}

# 6. Push
git push -u origin $Branch

# 7. PR
if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh pr create --base main --head $Branch `
    --title "Curls handoff v2 — Final edits/website/" `
    --body "Lands the 17-file Curls handoff bundle. Entry point: Final edits/website/00_README.md."
} else {
  Write-Host "→ install gh CLI then run: gh pr create --base main --head $Branch"
}

Write-Host "✓ done. PR: https://github.com/miketui/Last/compare/main...$Branch"
```

Save as `push-bundle.ps1`, then:

```powershell
.\push-bundle.ps1
```

---

## Path C — GitHub MCP (no terminal, but requires OAuth)

If you'd rather I push from this chat:

1. Run the OAuth handshake by saying:
   > "Authenticate GitHub MCP"
2. I'll trigger `mcp__plugin_engineering_github__authenticate`, you approve in browser.
3. Once green, I commit each file via the GitHub API and open the PR. (Slower than the script — Git is built for this; the API is not — but it works.)

---

## Path D — Manual drag-and-drop (no terminal, no OAuth)

1. Unzip `curls-handoff-bundle-v2.zip` on your computer.
2. Open https://github.com/miketui/Last in your browser.
3. Switch to a new branch via the branch dropdown: `feat/curls-handoff-v2`.
4. Navigate to `Final edits/` → "Add file" → "Upload files".
5. Drag the unzipped folder in. GitHub auto-creates the `website/` subfolder.
6. Commit message: paste the message from Path A § 5.
7. Open a PR via the "Compare & pull request" banner.

Slowest path. Use it if Path A–C don't fit.

---

## Branch convention

- **`feat/curls-handoff-v2`** — this bundle, this turn.
- Future iterations: `feat/curls-handoff-v3`, `feat/curls-handoff-v4`, etc.
- Hot-fix to a landed bundle: `fix/curls-handoff-{descriptor}`.
- Never push directly to `main` — the bundle wants a PR review per `13_HUMAN_APPROVAL_GATES.md` § Gate 4 (Architecture Lock).

---

## Verification after push

Once on `main` via the PR, verify:

```bash
cd ~/code/miketui-Last
git checkout main
git pull
ls "Final edits/website/" | sort
```

Expected output (17 + this push file = 18):

```
00_README.md
01_WEBSITE_PRD_FINAL.md
02_SITEMAP.md
03_ACISS_TOKENS_SPEC.md
04_BOOK_DATA_PATCH.md
05_EMAIL_SEQUENCES.md
06_PRE_MORTEM.md
07_LAUNCH_TIMELINE.md
08_MASTER_AI_BUILDER_PROMPT.md
09_PROMPT_LIBRARY.md
10_FOUNDATION_FILES.md
11_INTEGRATION_PLAYBOOK.md
12_3D_AND_MOTION_SPEC.md
13_HUMAN_APPROVAL_GATES.md
14_SECURITY_LEGAL_QA.md
15_FUNNEL_GENERATOR_PROMPT.md
16_SEO_AND_DISCOVERY.md
BUNDLE_PRE_MORTEM.md
PUSH_TO_REPO.md
```

---

## After landing — the orchestrator entry point

Open Claude Code in the `Last/` repo. Paste:

```
Use the studio-site-orchestrator skill in .claude/skills/.

Read Final edits/website/01_WEBSITE_PRD_FINAL.md as the brief.
Read Final edits/website/BUNDLE_PRE_MORTEM.md before Phase 19.

Run Phase 0 through Phase 21. Stop at every [GATE] for my explicit approval per
Final edits/website/13_HUMAN_APPROVAL_GATES.md. Hardcode the skill / MCP / connector
inventory from Final edits/website/08_MASTER_AI_BUILDER_PROMPT.md.

Brief is locked. ACISS palette is locked. Stack is locked. Stripe prices: $17.99 launch /
$19.99 regular. Release date: [I'll confirm at Strategy Lock].
```

That's the entry point. The orchestrator handles every phase from there.

---

*Pushing the bundle is the cheapest part of this launch. Everything below depends on it landing cleanly.*
