// Editing engine — orchestrates running editing modules against manuscript chunks
// Manages editing runs, processes chunks through LLM, stores suggestions

import db from "./database";
import { decrypt, encrypt } from "./encryption";
import { callLLM, type LLMConfig } from "./llm";
import { chunkChapter } from "./chunker";
import { MODULES, getModule, type ConsultationContext, type EditingSuggestion } from "./modules";
import { getDecryptedKey, getUserDefaultProvider, getUserModel } from "./user-llm-config";
import { randomUUID } from "node:crypto";

/** Load consultation context for a manuscript */
export function loadConsultation(manuscriptId: string): ConsultationContext | null {
  const row = db.query("SELECT * FROM consultations WHERE manuscript_id = ?").get(manuscriptId) as any;
  if (!row) return null;

  return {
    genre: row.genre,
    subgenre: row.subgenre,
    target_audience: row.target_audience,
    tone_profile: row.tone_profile,
    style_guide: row.style_guide,
    sensitivity_flags: JSON.parse(row.sensitivity_flags || "[]"),
    is_fiction: !!row.is_fiction,
    fiction_characters: JSON.parse(row.fiction_characters || "[]"),
    fiction_timeline: row.fiction_timeline,
    fiction_worldbuilding: row.fiction_worldbuilding,
    nonfiction_claim_priority: row.nonfiction_claim_priority,
    nonfiction_citation_style: row.nonfiction_citation_style,
    priority_modules: JSON.parse(row.priority_modules || "[]"),
    custom_instructions: row.custom_instructions,
  };
}

/** Start an editing run for a specific module */
export async function startEditingRun(
  manuscriptId: string,
  moduleId: string,
  llmConfig?: Partial<LLMConfig>,
  userId?: string
): Promise<string> {
  const module = getModule(moduleId);
  if (!module) throw new Error(`Unknown module: ${moduleId}`);

  const ctx = loadConsultation(manuscriptId);
  if (!ctx) throw new Error("Consultation not completed for this manuscript");

  // Resolve provider config: user settings > explicit config > env defaults
  let provider = llmConfig?.provider || (userId ? getUserDefaultProvider(userId) : undefined) || process.env.DEFAULT_LLM_PROVIDER || "openai";
  let model = llmConfig?.model || (userId ? getUserModel(userId, provider) : undefined) || "";

  // Inject per-user API key if available
  if (userId) {
    const userKey = getDecryptedKey(userId, provider);
    if (userKey) {
      llmConfig = { ...llmConfig, provider: provider as any, model, apiKey: userKey };
    }
  }

  const runId = randomUUID();

  db.run(
    `INSERT INTO editing_runs (id, manuscript_id, module_id, module_name, status, llm_provider, llm_model, started_at)
     VALUES (?, ?, ?, ?, 'running', ?, ?, datetime('now'))`,
    [runId, manuscriptId, moduleId, module.name, provider, model]
  );

  // Update manuscript status
  db.run("UPDATE manuscripts SET status = 'editing', updated_at = datetime('now') WHERE id = ?", [manuscriptId]);

  // Process asynchronously
  processEditingRun(runId, manuscriptId, module, ctx, llmConfig).catch((err) => {
    console.error(`Editing run ${runId} failed:`, err.message);
    db.run(
      "UPDATE editing_runs SET status = 'failed', error_message = ?, completed_at = datetime('now') WHERE id = ?",
      [err.message, runId]
    );
  });

  return runId;
}

/** Process all chunks through the module */
async function processEditingRun(
  runId: string,
  manuscriptId: string,
  module: ReturnType<typeof getModule> & {},
  ctx: ConsultationContext,
  llmConfig?: Partial<LLMConfig>
) {
  // Load chapters
  const chapters = db.query(
    "SELECT id, chapter_number, encrypted_content, word_count FROM chapters WHERE manuscript_id = ? ORDER BY chapter_number"
  ).all(manuscriptId) as any[];

  if (chapters.length === 0) throw new Error("No chapters found");

  let totalChunks = 0;
  let processedChunks = 0;

  // Prepare all chunks first to get total count
  const allWork: { chapterId: string; chapterNum: number; chunkContent: string; chunkIdx: number }[] = [];

  for (const ch of chapters) {
    const content = decrypt(ch.encrypted_content);
    const chunks = chunkChapter(content, ch.chapter_number);
    for (const chunk of chunks) {
      allWork.push({
        chapterId: ch.id,
        chapterNum: ch.chapter_number,
        chunkContent: chunk.content,
        chunkIdx: chunk.index,
      });
    }
  }

  totalChunks = allWork.length;

  for (const work of allWork) {
    try {
      const { system, user } = module.buildPrompt(work.chunkContent, ctx, work.chapterNum);

      const response = await callLLM(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        llmConfig
      );

      // Parse suggestions from LLM response
      const suggestions = parseSuggestions(response.content, work.chapterNum);

      // Store suggestions
      for (const s of suggestions) {
        db.run(
          `INSERT INTO suggestions (id, editing_run_id, manuscript_id, chapter_id, module_id,
            chapter_number, paragraph_number, sentence_number, original_text, suggested_edit,
            rationale, rule_or_source, confidence_score)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(), runId, manuscriptId, work.chapterId, module.id,
            s.location.chapter, s.location.paragraph, s.location.sentence,
            s.original_text, s.suggested_edit, s.rationale, s.rule_or_source, s.confidence_score,
          ]
        );
      }

      processedChunks++;
      const progressPct = Math.round((processedChunks / totalChunks) * 100);

      db.run(
        "UPDATE editing_runs SET progress_pct = ?, total_suggestions = total_suggestions + ? WHERE id = ?",
        [progressPct, suggestions.length, runId]
      );
    } catch (err: any) {
      console.error(`Chunk processing error (run ${runId}, chapter ${work.chapterNum}):`, err.message);
      // Continue with next chunk — don't fail entire run on one chunk
    }
  }

  // Mark run as completed
  db.run(
    "UPDATE editing_runs SET status = 'completed', progress_pct = 100, completed_at = datetime('now') WHERE id = ?",
    [runId]
  );
}

/** Parse LLM response into structured suggestions */
function parseSuggestions(responseText: string, fallbackChapter: number): EditingSuggestion[] {
  try {
    // Strip any markdown code fences
    let cleaned = responseText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: any) => ({
      location: {
        chapter: item.location?.chapter ?? fallbackChapter,
        paragraph: item.location?.paragraph ?? 0,
        sentence: item.location?.sentence ?? 0,
      },
      original_text: String(item.original_text || ""),
      suggested_edit: String(item.suggested_edit || ""),
      rationale: String(item.rationale || ""),
      rule_or_source: String(item.rule_or_source || ""),
      confidence_score: Math.max(0, Math.min(1, Number(item.confidence_score) || 0)),
    }));
  } catch {
    // If parsing fails, return empty — don't crash the run
    return [];
  }
}

/** Get editing run status and summary */
export function getRunStatus(runId: string) {
  return db.query("SELECT * FROM editing_runs WHERE id = ?").get(runId);
}

/** Get all runs for a manuscript */
export function getManuscriptRuns(manuscriptId: string) {
  return db.query(
    "SELECT * FROM editing_runs WHERE manuscript_id = ? ORDER BY created_at"
  ).all(manuscriptId);
}

/** Get suggestions for a run with optional status filter */
export function getRunSuggestions(runId: string, status?: string) {
  if (status) {
    return db.query(
      "SELECT * FROM suggestions WHERE editing_run_id = ? AND status = ? ORDER BY chapter_number, paragraph_number, sentence_number"
    ).all(runId, status);
  }
  return db.query(
    "SELECT * FROM suggestions WHERE editing_run_id = ? ORDER BY chapter_number, paragraph_number, sentence_number"
  ).all(runId);
}

/** Get all suggestions for a manuscript */
export function getManuscriptSuggestions(manuscriptId: string, status?: string) {
  if (status) {
    return db.query(
      "SELECT * FROM suggestions WHERE manuscript_id = ? AND status = ? ORDER BY chapter_number, paragraph_number, sentence_number"
    ).all(manuscriptId, status);
  }
  return db.query(
    "SELECT * FROM suggestions WHERE manuscript_id = ? ORDER BY module_id, chapter_number, paragraph_number, sentence_number"
  ).all(manuscriptId);
}

/** Accept a suggestion — applies the edit to the manuscript */
export function acceptSuggestion(suggestionId: string): void {
  const suggestion = db.query("SELECT * FROM suggestions WHERE id = ?").get(suggestionId) as any;
  if (!suggestion) throw new Error("Suggestion not found");

  db.run(
    "UPDATE suggestions SET status = 'accepted', resolved_at = datetime('now') WHERE id = ?",
    [suggestionId]
  );

  // Apply edit to the chapter content
  applyEdit(suggestion.chapter_id, suggestion.original_text, suggestion.suggested_edit);

  // Update run counters
  db.run("UPDATE editing_runs SET accepted = accepted + 1 WHERE id = ?", [suggestion.editing_run_id]);
}

/** Reject a suggestion */
export function rejectSuggestion(suggestionId: string): void {
  db.run(
    "UPDATE suggestions SET status = 'rejected', resolved_at = datetime('now') WHERE id = ?",
    [suggestionId]
  );
  const suggestion = db.query("SELECT editing_run_id FROM suggestions WHERE id = ?").get(suggestionId) as any;
  if (suggestion) {
    db.run("UPDATE editing_runs SET rejected = rejected + 1 WHERE id = ?", [suggestion.editing_run_id]);
  }
}

/** Edit a suggestion — author provides their own rewrite */
export function editSuggestion(suggestionId: string, authorEdit: string): void {
  const suggestion = db.query("SELECT * FROM suggestions WHERE id = ?").get(suggestionId) as any;
  if (!suggestion) throw new Error("Suggestion not found");

  db.run(
    "UPDATE suggestions SET status = 'edited', author_edit = ?, resolved_at = datetime('now') WHERE id = ?",
    [authorEdit, suggestionId]
  );

  // Apply the author's edit (not the AI suggestion)
  applyEdit(suggestion.chapter_id, suggestion.original_text, authorEdit);

  db.run("UPDATE editing_runs SET edited = edited + 1 WHERE id = ?", [suggestion.editing_run_id]);
}

/** Batch accept/reject suggestions */
export function batchResolveSuggestions(
  suggestionIds: string[],
  action: "accept" | "reject"
): { processed: number } {
  let processed = 0;
  for (const id of suggestionIds) {
    try {
      if (action === "accept") acceptSuggestion(id);
      else rejectSuggestion(id);
      processed++;
    } catch {
      // Skip failed individual operations
    }
  }
  return { processed };
}

/** Apply a text edit to encrypted chapter content */
function applyEdit(chapterId: string, originalText: string, newText: string): void {
  if (!chapterId) return;

  const chapter = db.query("SELECT encrypted_content FROM chapters WHERE id = ?").get(chapterId) as any;
  if (!chapter) return;

  const content = decrypt(chapter.encrypted_content);
  const updated = content.replace(originalText, newText);

  if (updated !== content) {
    db.run(
      "UPDATE chapters SET encrypted_content = ?, word_count = ? WHERE id = ?",
      [encrypt(updated), updated.split(/\s+/).length, chapterId]
    );
  }
}

/** Create a version snapshot of the current manuscript state */
export function createVersion(manuscriptId: string, changeSummary: string): string {
  // Get current version number
  const latest = db.query(
    "SELECT MAX(version_number) as max_v FROM manuscript_versions WHERE manuscript_id = ?"
  ).get(manuscriptId) as any;

  const versionNum = (latest?.max_v || 0) + 1;

  // Collect all chapter content
  const chapters = db.query(
    "SELECT chapter_number, encrypted_content FROM chapters WHERE manuscript_id = ? ORDER BY chapter_number"
  ).all(manuscriptId) as any[];

  const fullContent = chapters.map((c: any) => decrypt(c.encrypted_content)).join("\n\n---\n\n");

  const id = randomUUID();
  db.run(
    "INSERT INTO manuscript_versions (id, manuscript_id, version_number, encrypted_content, change_summary) VALUES (?, ?, ?, ?, ?)",
    [id, manuscriptId, versionNum, encrypt(fullContent), changeSummary]
  );

  return id;
}

/** Get version history for a manuscript */
export function getVersionHistory(manuscriptId: string) {
  return db.query(
    "SELECT id, version_number, change_summary, created_at FROM manuscript_versions WHERE manuscript_id = ? ORDER BY version_number DESC"
  ).all(manuscriptId);
}

/** Rollback to a specific version */
export function rollbackToVersion(manuscriptId: string, versionId: string): void {
  const version = db.query(
    "SELECT encrypted_content FROM manuscript_versions WHERE id = ? AND manuscript_id = ?"
  ).get(versionId, manuscriptId) as any;

  if (!version) throw new Error("Version not found");

  // Update the main manuscript content
  db.run(
    "UPDATE manuscripts SET encrypted_content = ?, updated_at = datetime('now') WHERE id = ?",
    [version.encrypted_content, manuscriptId]
  );

  // Create a new version marking the rollback
  createVersion(manuscriptId, `Rolled back to version ${versionId}`);
}

/** Calculate publication readiness score based on all module results */
export function calculateReadinessScore(manuscriptId: string): {
  overall: number;
  byModule: { module: string; score: number; total: number; accepted: number; rejected: number }[];
} {
  const runs = db.query(
    "SELECT * FROM editing_runs WHERE manuscript_id = ? AND status = 'completed'"
  ).all(manuscriptId) as any[];

  const byModule = runs.map((run: any) => {
    const total = run.total_suggestions || 0;
    const resolved = run.accepted + run.rejected + run.edited;
    const acceptanceRate = total > 0 ? (run.accepted + run.edited) / total : 1;
    // Score: fewer suggestions = cleaner manuscript, higher acceptance = issues addressed
    const score = total === 0 ? 100 : Math.round(Math.min(100, (resolved / total) * 100 * (0.5 + 0.5 * acceptanceRate)));

    return {
      module: run.module_name,
      score,
      total,
      accepted: run.accepted,
      rejected: run.rejected,
    };
  });

  const overall = byModule.length > 0
    ? Math.round(byModule.reduce((sum, m) => sum + m.score, 0) / byModule.length)
    : 0;

  return { overall, byModule };
}
