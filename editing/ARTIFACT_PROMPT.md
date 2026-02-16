# Claude Artifact Prompt — AI Book Editor App

Paste everything below the line into Claude.ai to generate a working artifact.

---

Create a fully functional React artifact for an **AI-powered book editing application** for self-published authors. This is a complete interactive prototype with simulated AI editing.

## Technical Requirements for Artifact

- Single React component using `useState`, `useEffect`, `useCallback`
- All state management in-component (no external stores)
- Use inline styles only (no CSS imports)
- Simulate all AI/backend operations with realistic mock data and `setTimeout` delays
- Must be immediately interactive — no setup required

## App Structure — Build ALL of these screens:

### 1. Login / Register Screen
- Toggle between Sign In and Sign Up
- Email + password fields
- On submit, simulate auth and go to dashboard
- Store user in state: `{ name, email, plan: "professional" }`

### 2. Dashboard — Manuscript List
- Show list of manuscripts (start with 1 demo manuscript pre-loaded)
- Each card shows: title, word count, chapter count, status badge, date
- "Upload New" button opens upload screen
- Click manuscript to open editing view

### 3. Upload Screen
- Drag-and-drop zone with dashed border
- Accepts click to "upload" (simulate with a button that creates a mock manuscript)
- Shows supported formats: .docx, .txt, .md, .html, .epub
- On upload, generate a mock manuscript with 5 chapters, ~2000 words, and navigate to consultation

### 4. Consultation Wizard (5 steps with progress bar)

**Step 1 — Basics:**
- Genre dropdown: Literary Fiction, Mystery/Thriller, Science Fiction, Fantasy, Romance, Memoir, Self-Help, Business, History, Science, Biography
- Subgenre text input
- Target audience text input
- Fiction / Nonfiction radio toggle

**Step 2 — Tone & Style:**
- Tone dropdown: Formal & Academic, Professional but Warm, Conversational, Literary & Lyrical, Direct & Punchy, Humorous, Inspirational
- Style guide dropdown: Chicago Manual of Style, AP Stylebook, MLA, APA
- Sensitivity checkboxes: Cultural representation, Religious content, Political themes, Racial identity, Gender & sexuality, Mental health, Violence & trauma, Disability representation

**Step 3 — Genre Details:**
- If fiction: Character list (add/remove chips), Timeline notes textarea, World-building notes textarea
- If nonfiction: Claim verification priority (Low/Medium/High dropdown), Citation style text input

**Step 4 — Priorities:**
- Checkboxes for all 10 modules (select which to prioritize)
- Custom instructions textarea

**Step 5 — Review:**
- Summary table of all selections
- "Start Editing" button

### 5. Editing Dashboard (THE MAIN SCREEN — make this detailed)

**Left panel — Module list (all 10 modules):**
1. Grammar, Spelling & Punctuation
2. Style Guide Compliance
3. Tone & Voice Consistency
4. Fact-Checking & Claim Verification
5. Readability & Pacing Analysis
6. Dialogue Quality
7. Continuity & Consistency
8. Sensitivity & Inclusivity Review
9. Chapter/Section Structure Analysis
10. Final Polish & Publication Readiness

Each module shows:
- Number badge (colored by status: gray=pending, amber=running, green=completed)
- Name and suggestion count when completed
- "Run" button if pending
- Progress bar if running (animate from 0-100% over 3-4 seconds)
- Click completed module to load its suggestions

**Right panel — Suggestions view:**

When a module is selected, show its suggestions. Generate **5-8 realistic suggestions per module** with:

Each suggestion card contains:
- **Location badge**: "Ch.3 P12 S3" (chapter, paragraph, sentence) in monospace
- **Confidence score**: colored badge (green ≥80%, amber 60-79%, red <60%)
- **Diff view**:
  - Red background box with original text (with left red border)
  - Green background box with suggested edit (with left green border)
- **Rationale**: 1-2 sentence explanation
- **Rule/Source**: style guide rule or source citation in italic
- **Action buttons**: Accept (green), Reject (red), text input for custom edit + "Apply Edit" button
- After action: card gets a colored left border and fades slightly, buttons disappear

**Batch controls** at the top:
- Count badges: "X pending", "Y accepted", "Z rejected"
- "Accept All Pending" button (green)
- "Reject All Pending" button (red)

**Top area:**
- Manuscript title and stats (word count, chapter count)
- "Readiness Score" button that shows a score card with per-module scores

### 6. AI Settings Page
- Default Provider dropdown: OpenAI (ChatGPT), Anthropic (Claude), Mistral, Ollama
- For each provider, show:
  - API Key input (password type) with placeholder showing masked key if set
  - Model dropdown (OpenAI: gpt-4o, gpt-4o-mini, gpt-4-turbo | Anthropic: claude-sonnet-4-20250514, claude-opus-4-20250514 | Mistral: mistral-large-latest, mistral-medium)
  - "Remove" button for key
- Ollama section has Base URL input instead of API key
- "Save Settings" button

### 7. Version History Page
- List of version snapshots with version number, change summary, timestamp
- "Rollback" button on each version
- Pre-populate with 2-3 versions

### 8. Export Page
- Grid of format cards: DOCX, EPUB, HTML, Markdown, Plain Text
- Each card has a large letter icon and label
- Click shows an alert "Downloading [format]..."

### 9. Plans & Billing Page
- 4 plan cards in a grid: Free ($0), Starter ($19), Professional ($49), Enterprise ($149)
- Current plan highlighted with blue border
- Feature list per plan with checkmarks
- "Upgrade" buttons on non-current plans

## Sidebar Navigation
- Logo: "Manuscript Editor" in serif font
- Nav links: Manuscripts, Upload New, (when manuscript selected: Editing Dashboard, Version History, Export), Plans & Billing, AI Settings
- Active link highlighted in blue
- Bottom: user name, plan badge, Sign Out button

## Mock Data — Generate Realistic Content

For the demo manuscript, use this theme: **"Curls & Contemplation" — a nonfiction book about natural hair care history** targeting general adult readers with a "professional but warm" tone using Chicago Manual of Style.

**Generate realistic suggestions like these:**

For Grammar module:
```
Original: "The practice of hair straightening have been documented since ancient Egypt."
Suggested: "The practice of hair straightening has been documented since ancient Egypt."
Rationale: "Subject-verb agreement error. 'Practice' is singular and requires 'has' not 'have'."
Rule: "Chicago 5.138: Subject-verb agreement"
Confidence: 0.95
```

For Fact-Checking module:
```
Original: "Madam C.J. Walker invented the hot comb in 1905."
Suggested: "Madam C.J. Walker popularized the hot comb in the early 1900s, though similar tools existed earlier."
Rationale: "Walker did not invent the hot comb. Historical records show heated combs were used in France as early as the 1870s. Walker improved and marketed them."
Rule: "Source: Smithsonian National Museum of African American History — UNVERIFIED, verify with primary source"
Confidence: 0.72
```

For Tone module:
```
Original: "This is, quite frankly, a disaster of historical proportions."
Suggested: "This represents one of the most significant oversights in the documented history of hair care."
Rationale: "The phrase 'quite frankly, a disaster' shifts to an informal, editorial tone that breaks from the professional-but-warm register."
Confidence: 0.87
```

Generate 5-8 suggestions per module following these patterns. Make them specific to the book's topic. Each module should have suggestions relevant to its purpose.

## Visual Design

- Clean, editorial aesthetic with warm off-white background (#faf9f7)
- Serif font for headings and literary text, system sans-serif for UI
- Cards with subtle borders (#e5e2dc) and light shadows
- Primary blue (#2563eb), success green (#059669), danger red (#dc2626), warning amber (#d97706)
- Confidence badges: green for ≥0.8, amber for 0.6-0.79, red for <0.6
- Diff view: red-tinted background for original, green-tinted for suggestion, with colored left borders
- Responsive sidebar (260px fixed width)
- Smooth transitions on hover states and progress bars

## Critical Behavior Rules

1. **NEVER auto-apply edits** — every suggestion requires the user to click Accept, Reject, or provide a custom edit
2. Suggestions stay visible after action but become visually muted (lower opacity, colored left border)
3. Module progress should animate smoothly (use setInterval to increment from 0 to 100)
4. Running a module should take 3-4 seconds of simulated progress before showing results
5. The consultation wizard must complete before editing modules become available
6. Batch accept/reject should update all pending suggestions at once
7. The readiness score should calculate from module completion: modules with all suggestions resolved score higher

Build the complete artifact now. Every screen, every interaction, every module with its mock suggestions. This should feel like a real, polished application.
