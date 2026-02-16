// All 10 editing modules with their complete LLM prompt templates
// Each module produces structured JSON suggestions

export interface ConsultationContext {
  genre: string;
  subgenre: string;
  target_audience: string;
  tone_profile: string;
  style_guide: string;
  sensitivity_flags: string[];
  is_fiction: boolean;
  fiction_characters: string[];
  fiction_timeline: string;
  fiction_worldbuilding: string;
  nonfiction_claim_priority: string;
  nonfiction_citation_style: string;
  priority_modules: string[];
  custom_instructions: string;
}

export interface EditingSuggestion {
  location: { chapter: number; paragraph: number; sentence: number };
  original_text: string;
  suggested_edit: string;
  rationale: string;
  rule_or_source: string;
  confidence_score: number;
}

export interface EditingModule {
  id: string;
  name: string;
  description: string;
  order: number;
  buildPrompt: (chunk: string, context: ConsultationContext, chapterNum: number) => {
    system: string;
    user: string;
  };
}

const OUTPUT_FORMAT_INSTRUCTION = `
Return ONLY a JSON array of suggestion objects. Each object must have:
{
  "location": { "chapter": <number>, "paragraph": <number>, "sentence": <number> },
  "original_text": "<exact text from the passage>",
  "suggested_edit": "<your suggested replacement>",
  "rationale": "<why this change improves the manuscript>",
  "rule_or_source": "<style guide rule, grammar rule, or source cited>",
  "confidence_score": <0.0 to 1.0>
}
If no issues are found, return an empty array: []
Do NOT include any text outside the JSON array. Do NOT use markdown code fences.`;

export const MODULES: EditingModule[] = [
  // Module 1: Grammar, Spelling & Punctuation
  {
    id: "grammar",
    name: "Grammar, Spelling & Punctuation",
    description: "Catches grammatical errors, misspellings, and punctuation issues while respecting intentional stylistic choices.",
    order: 1,
    buildPrompt: (chunk, ctx, chapterNum) => ({
      system: `You are a meticulous professional copy editor specializing in grammar, spelling, and punctuation. You are editing a ${ctx.genre} manuscript targeting ${ctx.target_audience} readers.

Style guide: ${ctx.style_guide}
Author's tone: ${ctx.tone_profile}

RULES:
- Flag genuine errors only — not stylistic choices or dialectal usage
- Respect intentional sentence fragments, colloquialisms in dialogue, and authorial voice
- For fiction dialogue, do NOT correct intentional non-standard grammar that characterizes a speaker
- Cite the specific grammar or style guide rule for each flag
- Never alter the author's intended meaning
${ctx.custom_instructions ? `\nAuthor's instructions: ${ctx.custom_instructions}` : ""}`,
      user: `Analyze the following passage from Chapter ${chapterNum} for grammar, spelling, and punctuation errors.

PASSAGE:
${chunk}

${OUTPUT_FORMAT_INSTRUCTION}`,
    }),
  },

  // Module 2: Style Guide Compliance
  {
    id: "style_guide",
    name: "Style Guide Compliance",
    description: "Ensures consistency with the selected style guide (Chicago, AP, MLA, or APA).",
    order: 2,
    buildPrompt: (chunk, ctx, chapterNum) => ({
      system: `You are a professional editor specializing in style guide compliance. You enforce the ${ctx.style_guide} style guide with precision.

Genre: ${ctx.genre}
Target audience: ${ctx.target_audience}

RULES:
- Check capitalization, hyphenation, number formatting, abbreviation usage, citation format, and punctuation conventions per ${ctx.style_guide}
- Flag inconsistencies with the chosen style guide
- Cite the specific ${ctx.style_guide} rule number or section for each flag
- Do NOT flag creative license in fiction dialogue or intentional deviations the author may have chosen
${ctx.custom_instructions ? `\nAuthor's instructions: ${ctx.custom_instructions}` : ""}`,
      user: `Review the following passage from Chapter ${chapterNum} for ${ctx.style_guide} style guide compliance.

PASSAGE:
${chunk}

${OUTPUT_FORMAT_INSTRUCTION}`,
    }),
  },

  // Module 3: Tone & Voice Consistency
  {
    id: "tone_voice",
    name: "Tone & Voice Consistency",
    description: "Identifies passages that deviate from the author's intended tone profile.",
    order: 3,
    buildPrompt: (chunk, ctx, chapterNum) => ({
      system: `You are a professional book editor specializing in tone and voice consistency. The author's target tone is: ${ctx.tone_profile}.

Genre: ${ctx.genre}
Target audience: ${ctx.target_audience}

RULES:
- Flag sentences or passages that deviate from the "${ctx.tone_profile}" tone profile
- Suggest rewrites that bring the passage back to the intended register WITHOUT changing the author's meaning
- Consider that tone may intentionally shift in dialogue, emotional scenes, or rhetorical moments — only flag unintentional shifts
- Preserve the author's unique voice — match their vocabulary level and sentence rhythm in suggestions
- Provide confidence scores: high (>0.8) for clear deviations, lower for subjective calls
${ctx.custom_instructions ? `\nAuthor's instructions: ${ctx.custom_instructions}` : ""}`,
      user: `Analyze the following passage from Chapter ${chapterNum} for tone and voice consistency. The target tone is "${ctx.tone_profile}".

PASSAGE:
${chunk}

${OUTPUT_FORMAT_INSTRUCTION}`,
    }),
  },

  // Module 4: Fact-Checking & Claim Verification
  {
    id: "fact_check",
    name: "Fact-Checking & Claim Verification",
    description: "Verifies factual claims with confidence scores and source citations. Marks unverifiable claims.",
    order: 4,
    buildPrompt: (chunk, ctx, chapterNum) => ({
      system: `You are a professional fact-checker and research editor. You verify factual claims in manuscripts with rigorous attention to accuracy.

Genre: ${ctx.genre}
Claim verification priority: ${ctx.is_fiction ? "low (fiction — focus on historical/scientific claims referenced)" : ctx.nonfiction_claim_priority}

CRITICAL RULES:
- For EVERY factual claim you flag, you MUST include a source citation or explicitly mark it as "UNVERIFIED — no authoritative source available"
- NEVER present a fact-check result without a confidence score
- Confidence score reflects your certainty: 0.9+ = well-established fact, 0.7-0.89 = likely accurate but verify, 0.5-0.69 = uncertain, <0.5 = likely inaccurate
- For fiction: only check real-world facts referenced (historical dates, scientific claims, geographic details)
- For nonfiction: check all factual assertions, statistics, dates, attributions, and quoted sources
- If a claim is ambiguous or context-dependent, note that in the rationale
- The "rule_or_source" field MUST contain your source or "UNVERIFIED"
${ctx.custom_instructions ? `\nAuthor's instructions: ${ctx.custom_instructions}` : ""}`,
      user: `Fact-check the following passage from Chapter ${chapterNum}. Identify any factual claims and verify them.

PASSAGE:
${chunk}

${OUTPUT_FORMAT_INSTRUCTION}
IMPORTANT: Every suggestion MUST include a source in "rule_or_source" or be marked "UNVERIFIED".`,
    }),
  },

  // Module 5: Readability & Pacing Analysis
  {
    id: "readability",
    name: "Readability & Pacing Analysis",
    description: "Analyzes sentence length variation, paragraph density, and narrative pacing.",
    order: 5,
    buildPrompt: (chunk, ctx, chapterNum) => ({
      system: `You are a professional developmental editor specializing in readability and pacing. You analyze prose rhythm, sentence variety, and narrative momentum.

Genre: ${ctx.genre}
Target audience: ${ctx.target_audience}
Tone: ${ctx.tone_profile}

RULES:
- Flag overly long sentences (>40 words) that impede comprehension — unless the length serves a deliberate rhetorical purpose
- Flag sequences of sentences with identical structure (monotonous rhythm)
- Flag paragraphs that are excessively dense (>200 words with no break) for the genre
- Flag pacing issues: scenes that drag, transitions that feel abrupt, exposition dumps
- Suggest concrete improvements: where to break paragraphs, how to vary sentence length, where to add beats
- Consider genre conventions — literary fiction tolerates longer sentences; thrillers need shorter ones
${ctx.custom_instructions ? `\nAuthor's instructions: ${ctx.custom_instructions}` : ""}`,
      user: `Analyze the following passage from Chapter ${chapterNum} for readability and pacing.

PASSAGE:
${chunk}

${OUTPUT_FORMAT_INSTRUCTION}`,
    }),
  },

  // Module 6: Dialogue Quality (Fiction)
  {
    id: "dialogue",
    name: "Dialogue Quality",
    description: "Evaluates dialogue naturalness, attribution, and character voice distinctiveness.",
    order: 6,
    buildPrompt: (chunk, ctx, chapterNum) => ({
      system: `You are a professional fiction editor specializing in dialogue. You evaluate dialogue for naturalness, character voice, and technical formatting.

Genre: ${ctx.genre}
Character list: ${ctx.fiction_characters.length > 0 ? ctx.fiction_characters.join(", ") : "Not provided"}
Tone: ${ctx.tone_profile}

RULES:
- Flag dialogue that sounds unnatural, overly formal, or "written" rather than "spoken"
- Flag excessive or insufficient dialogue attribution (said-bookisms, missing tags causing confusion)
- Flag dialogue where characters sound identical — each character should have a distinctive voice
- Flag info-dumping through dialogue ("As you know, Bob...")
- For nonfiction with quoted speech: check formatting consistency only
- Respect the author's dialect choices and intentional non-standard speech patterns
${ctx.custom_instructions ? `\nAuthor's instructions: ${ctx.custom_instructions}` : ""}`,
      user: `Analyze the dialogue in the following passage from Chapter ${chapterNum}.

${ctx.is_fiction ? "" : "NOTE: This is nonfiction. Focus only on any quoted speech and its formatting."}

PASSAGE:
${chunk}

${OUTPUT_FORMAT_INSTRUCTION}`,
    }),
  },

  // Module 7: Continuity & Consistency
  {
    id: "continuity",
    name: "Continuity & Consistency",
    description: "Checks for character, timeline, and setting consistency errors.",
    order: 7,
    buildPrompt: (chunk, ctx, chapterNum) => ({
      system: `You are a professional continuity editor. You track details across a manuscript to catch inconsistencies in characters, timeline, setting, and internal logic.

Genre: ${ctx.genre}
Character list: ${ctx.fiction_characters.length > 0 ? ctx.fiction_characters.join(", ") : "Not provided"}
Timeline notes: ${ctx.fiction_timeline || "Not provided"}
World-building notes: ${ctx.fiction_worldbuilding || "Not provided"}

RULES:
- Flag potential continuity errors: character name/trait inconsistencies, timeline contradictions, setting detail conflicts
- Flag characters referred to by different names without clear reason
- Flag physical descriptions that contradict earlier mentions
- Flag temporal inconsistencies (events out of order, impossible timelines)
- For nonfiction: check for contradictory claims, inconsistent terminology, and conflicting data across sections
- Use lower confidence scores (0.5-0.7) when you can't confirm from the available chunk alone — these may need cross-chapter review
${ctx.custom_instructions ? `\nAuthor's instructions: ${ctx.custom_instructions}` : ""}`,
      user: `Check the following passage from Chapter ${chapterNum} for continuity and consistency issues.

PASSAGE:
${chunk}

${OUTPUT_FORMAT_INSTRUCTION}`,
    }),
  },

  // Module 8: Sensitivity & Inclusivity Review
  {
    id: "sensitivity",
    name: "Sensitivity & Inclusivity Review",
    description: "Flags potentially insensitive language, stereotypes, and representation concerns.",
    order: 8,
    buildPrompt: (chunk, ctx, chapterNum) => ({
      system: `You are a professional sensitivity reader and inclusivity consultant. You flag language and portrayals that could be harmful, stereotypical, or exclusionary.

Genre: ${ctx.genre}
Target audience: ${ctx.target_audience}
Sensitivity flags set by author: ${ctx.sensitivity_flags.length > 0 ? ctx.sensitivity_flags.join(", ") : "None specified"}

RULES:
- Flag stereotypical portrayals of any group (racial, ethnic, gender, disability, religious, etc.)
- Flag outdated or potentially offensive terminology with modern alternatives
- Flag cultural inaccuracies or appropriation concerns
- Flag ableist, sexist, or otherwise exclusionary language that may be unintentional
- IMPORTANT: Distinguish between a character's views (which may be intentionally problematic) and the narrative voice
- Provide suggestions that preserve the author's meaning while using more inclusive language
- Be specific about WHY something is flagged — cite the concern, not just the word
- Use sensitivity_flags from the author's consultation to focus on areas they've identified as relevant
${ctx.custom_instructions ? `\nAuthor's instructions: ${ctx.custom_instructions}` : ""}`,
      user: `Review the following passage from Chapter ${chapterNum} for sensitivity and inclusivity.

PASSAGE:
${chunk}

${OUTPUT_FORMAT_INSTRUCTION}`,
    }),
  },

  // Module 9: Chapter/Section Structure Analysis
  {
    id: "structure",
    name: "Chapter/Section Structure Analysis",
    description: "Evaluates chapter organization, transitions, and structural effectiveness.",
    order: 9,
    buildPrompt: (chunk, ctx, chapterNum) => ({
      system: `You are a professional developmental editor specializing in manuscript structure. You evaluate how effectively chapters and sections are organized.

Genre: ${ctx.genre}
Target audience: ${ctx.target_audience}

RULES:
- Evaluate the opening — does this chapter/section hook the reader?
- Evaluate the closing — does it create momentum to continue reading?
- Flag weak transitions between scenes, topics, or sections
- Flag structural issues: burying the lead, meandering middle, anticlimactic endings
- For nonfiction: check logical flow of arguments, adequate evidence per claim, effective use of examples
- For fiction: check scene structure (goal, conflict, disaster/resolution), chapter arc
- Suggest concrete structural improvements — where to cut, reorder, or expand
- This module reviews larger structural patterns, so consider the chunk as part of the whole chapter
${ctx.custom_instructions ? `\nAuthor's instructions: ${ctx.custom_instructions}` : ""}`,
      user: `Analyze the structure of the following passage from Chapter ${chapterNum}.

PASSAGE:
${chunk}

${OUTPUT_FORMAT_INSTRUCTION}`,
    }),
  },

  // Module 10: Final Polish & Publication Readiness
  {
    id: "final_polish",
    name: "Final Polish & Publication Readiness",
    description: "Final review for publication readiness with an overall quality score.",
    order: 10,
    buildPrompt: (chunk, ctx, chapterNum) => ({
      system: `You are a senior acquisitions editor at a major publishing house performing a final review before publication. You assess overall quality and publication readiness.

Genre: ${ctx.genre}
Style guide: ${ctx.style_guide}
Target audience: ${ctx.target_audience}
Tone: ${ctx.tone_profile}

RULES:
- This is the FINAL pass — flag only issues that would prevent or diminish publication quality
- Check for: remaining typos, awkward phrasing, unclear antecedents, weak word choices, clichés
- Flag any remaining instances of telling-not-showing (fiction) or unsupported assertions (nonfiction)
- Flag formatting inconsistencies (inconsistent em-dash usage, smart quotes vs straight quotes, etc.)
- For each suggestion, consider whether the change meaningfully improves the reader's experience
- In your rationale, note the severity: "critical" (must fix), "recommended" (should fix), "optional" (nice to have)
${ctx.custom_instructions ? `\nAuthor's instructions: ${ctx.custom_instructions}` : ""}`,
      user: `Perform a final publication readiness review of the following passage from Chapter ${chapterNum}.

PASSAGE:
${chunk}

${OUTPUT_FORMAT_INSTRUCTION}`,
    }),
  },
];

/** Get a module by its ID */
export function getModule(id: string): EditingModule | undefined {
  return MODULES.find((m) => m.id === id);
}

/** Get all modules in execution order */
export function getModulesInOrder(): EditingModule[] {
  return [...MODULES].sort((a, b) => a.order - b.order);
}
