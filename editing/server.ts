// Main server — Bun.serve() with all API routes
// No manuscript content is logged. All user data encrypted at rest.

import index from "./index.html";
import db from "./lib/database";
import { encrypt, decrypt } from "./lib/encryption";
import { parseFile } from "./lib/parser";
import { MODULES, getModulesInOrder } from "./lib/modules";
import {
  startEditingRun, getRunStatus, getManuscriptRuns, getRunSuggestions,
  getManuscriptSuggestions, acceptSuggestion, rejectSuggestion, editSuggestion,
  batchResolveSuggestions, createVersion, getVersionHistory, rollbackToVersion,
  calculateReadinessScore, loadConsultation,
} from "./lib/engine";
import { exportManuscript, type ExportFormat } from "./lib/export";
import { getUserLLMConfig, saveUserLLMConfig, deleteUserAPIKey } from "./lib/user-llm-config";
import { registerUser, loginUser, logout, getUserFromRequest, checkPlanLimits, type User } from "./lib/auth";
import { createCheckoutSession, handleWebhook, PLANS } from "./lib/billing";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT) || 3100;
const MAX_UPLOAD_BYTES = (Number(process.env.MAX_UPLOAD_SIZE_MB) || 50) * 1024 * 1024;

// Helper: JSON response
function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Helper: error response
function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

// Helper: require auth
function requireAuth(req: Request): User {
  const user = getUserFromRequest(req);
  if (!user) throw new AuthError("Not authenticated");
  return user;
}

class AuthError extends Error {}

// Helper: set session cookie
function withSessionCookie(res: Response, token: string): Response {
  const newRes = new Response(res.body, res);
  newRes.headers.set(
    "Set-Cookie",
    `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${72 * 3600}`
  );
  return newRes;
}

Bun.serve({
  port: PORT,
  routes: {
    // Serve the frontend SPA
    "/": index,

    // === Auth Routes ===
    "/api/auth/register": {
      POST: async (req) => {
        try {
          const { email, password, name } = await req.json();
          if (!email || !password) return error("Email and password required");
          if (password.length < 8) return error("Password must be at least 8 characters");

          const user = await registerUser(email, password, name || "");
          const { token } = await loginUser(email, password);
          return withSessionCookie(json({ user }), token);
        } catch (e: any) {
          return error(e.message, e.message.includes("already") ? 409 : 400);
        }
      },
    },

    "/api/auth/login": {
      POST: async (req) => {
        try {
          const { email, password } = await req.json();
          const { token, user } = await loginUser(email, password);
          return withSessionCookie(json({ user }), token);
        } catch (e: any) {
          return error(e.message, 401);
        }
      },
    },

    "/api/auth/logout": {
      POST: (req) => {
        const cookie = req.headers.get("cookie") || "";
        const match = cookie.match(/session=([^;]+)/);
        if (match) logout(match[1]);
        const res = json({ ok: true });
        res.headers.set("Set-Cookie", "session=; Path=/; Max-Age=0");
        return res;
      },
    },

    "/api/auth/me": {
      GET: (req) => {
        const user = getUserFromRequest(req);
        if (!user) return error("Not authenticated", 401);
        return json({ user });
      },
    },

    // === LLM Settings ===
    "/api/settings/llm": {
      GET: (req) => {
        try {
          const user = requireAuth(req);
          const config = getUserLLMConfig(user.id);
          return json({ config });
        } catch (e: any) {
          if (e instanceof AuthError) return error(e.message, 401);
          return error(e.message);
        }
      },
      POST: async (req) => {
        try {
          const user = requireAuth(req);
          const config = await req.json();
          saveUserLLMConfig(user.id, config);
          return json({ ok: true, config: getUserLLMConfig(user.id) });
        } catch (e: any) {
          if (e instanceof AuthError) return error(e.message, 401);
          return error(e.message);
        }
      },
    },

    "/api/settings/llm/delete-key": {
      POST: async (req) => {
        try {
          const user = requireAuth(req);
          const { provider } = await req.json();
          deleteUserAPIKey(user.id, provider);
          return json({ ok: true });
        } catch (e: any) {
          if (e instanceof AuthError) return error(e.message, 401);
          return error(e.message);
        }
      },
    },

    // === Manuscript Upload ===
    "/api/manuscripts/upload": {
      POST: async (req) => {
        try {
          const user = requireAuth(req);
          const limits = checkPlanLimits(user);
          if (!limits.canUpload) return error("Upload limit reached for your plan", 403);

          const formData = await req.formData();
          const file = formData.get("file") as File | null;
          if (!file) return error("No file provided");
          if (file.size > MAX_UPLOAD_BYTES) return error(`File too large. Max: ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`);

          const buffer = await file.arrayBuffer();
          const parsed = await parseFile(buffer, file.name);

          if (parsed.wordCount > limits.maxWordCount) {
            return error(`Manuscript exceeds word limit for your plan (${limits.maxWordCount} words max)`);
          }

          const manuscriptId = randomUUID();

          // Store manuscript with encrypted content
          db.run(
            `INSERT INTO manuscripts (id, user_id, title, original_filename, file_format, word_count, encrypted_content)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [manuscriptId, user.id, parsed.title, file.name, parsed.format, parsed.wordCount, encrypt(parsed.fullText)]
          );

          // Store chapters with encrypted content
          for (const ch of parsed.chapters) {
            db.run(
              `INSERT INTO chapters (id, manuscript_id, chapter_number, title, encrypted_content, word_count)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [randomUUID(), manuscriptId, ch.number, ch.title, encrypt(ch.content), ch.wordCount]
            );
          }

          // Increment monthly count
          db.run("UPDATE users SET manuscripts_this_month = manuscripts_this_month + 1 WHERE id = ?", [user.id]);

          // Create initial version
          createVersion(manuscriptId, "Original upload");

          return json({
            manuscript: {
              id: manuscriptId,
              title: parsed.title,
              word_count: parsed.wordCount,
              chapters: parsed.chapters.length,
              format: parsed.format,
            },
          });
        } catch (e: any) {
          if (e instanceof AuthError) return error(e.message, 401);
          return error(e.message);
        }
      },
    },

    // === Manuscripts List ===
    "/api/manuscripts": {
      GET: (req) => {
        try {
          const user = requireAuth(req);
          const manuscripts = db.query(
            "SELECT id, title, original_filename, file_format, word_count, status, created_at, updated_at FROM manuscripts WHERE user_id = ? ORDER BY created_at DESC"
          ).all(user.id);
          return json({ manuscripts });
        } catch (e: any) {
          if (e instanceof AuthError) return error(e.message, 401);
          return error(e.message);
        }
      },
    },

    // === Billing ===
    "/api/billing/plans": {
      GET: () => json({ plans: PLANS }),
    },

    "/api/billing/checkout": {
      POST: async (req) => {
        try {
          const user = requireAuth(req);
          const { plan } = await req.json();
          if (!["starter", "professional", "enterprise"].includes(plan)) {
            return error("Invalid plan");
          }
          const url = await createCheckoutSession(
            user.id, user.email, plan,
            new URL(req.url).origin + "/billing"
          );
          return json({ url });
        } catch (e: any) {
          if (e instanceof AuthError) return error(e.message, 401);
          return error(e.message);
        }
      },
    },

    "/api/billing/webhook": {
      POST: async (req) => {
        try {
          const body = await req.text();
          const sig = req.headers.get("stripe-signature") || "";
          await handleWebhook(body, sig);
          return json({ received: true });
        } catch (e: any) {
          return error(e.message, 400);
        }
      },
    },

    // === Modules Info ===
    "/api/modules": {
      GET: () => {
        const modules = getModulesInOrder().map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          order: m.order,
        }));
        return json({ modules });
      },
    },
  },

  // Dynamic routes using fetch handler for parameterized paths
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    try {
      // --- Manuscript detail ---
      const msMatch = path.match(/^\/api\/manuscripts\/([^/]+)$/);
      if (msMatch && method === "GET") {
        const user = requireAuth(req);
        const ms = db.query(
          "SELECT id, title, original_filename, file_format, word_count, status, created_at, updated_at FROM manuscripts WHERE id = ? AND user_id = ?"
        ).get(msMatch[1], user.id) as any;
        if (!ms) return error("Manuscript not found", 404);

        const chapters = db.query(
          "SELECT id, chapter_number, title, word_count FROM chapters WHERE manuscript_id = ? ORDER BY chapter_number"
        ).all(ms.id);

        return json({ manuscript: ms, chapters });
      }

      // --- Delete manuscript ---
      if (msMatch && method === "DELETE") {
        const user = requireAuth(req);
        const ms = db.query("SELECT id FROM manuscripts WHERE id = ? AND user_id = ?").get(msMatch[1], user.id);
        if (!ms) return error("Manuscript not found", 404);
        db.run("DELETE FROM manuscripts WHERE id = ?", [msMatch[1]]);
        return json({ ok: true });
      }

      // --- Consultation ---
      const consultMatch = path.match(/^\/api\/manuscripts\/([^/]+)\/consultation$/);
      if (consultMatch && method === "POST") {
        const user = requireAuth(req);
        const msId = consultMatch[1];

        const ms = db.query("SELECT id FROM manuscripts WHERE id = ? AND user_id = ?").get(msId, user.id);
        if (!ms) return error("Manuscript not found", 404);

        const data = await req.json();
        const id = randomUUID();

        db.run(
          `INSERT OR REPLACE INTO consultations (id, manuscript_id, genre, subgenre, target_audience, tone_profile,
            style_guide, sensitivity_flags, fiction_characters, fiction_timeline, fiction_worldbuilding,
            nonfiction_claim_priority, nonfiction_citation_style, priority_modules, custom_instructions, is_fiction, completed)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            id, msId,
            data.genre || "", data.subgenre || "", data.target_audience || "", data.tone_profile || "",
            data.style_guide || "chicago",
            JSON.stringify(data.sensitivity_flags || []),
            JSON.stringify(data.fiction_characters || []),
            data.fiction_timeline || "", data.fiction_worldbuilding || "",
            data.nonfiction_claim_priority || "medium", data.nonfiction_citation_style || "",
            JSON.stringify(data.priority_modules || []),
            data.custom_instructions || "",
            data.is_fiction ? 1 : 0,
          ]
        );

        db.run("UPDATE manuscripts SET status = 'consulting', updated_at = datetime('now') WHERE id = ?", [msId]);
        return json({ consultation_id: id });
      }

      if (consultMatch && method === "GET") {
        const user = requireAuth(req);
        const msId = consultMatch[1];
        const ms = db.query("SELECT id FROM manuscripts WHERE id = ? AND user_id = ?").get(msId, user.id);
        if (!ms) return error("Manuscript not found", 404);
        const consultation = loadConsultation(msId);
        return json({ consultation });
      }

      // --- Run editing module ---
      const runMatch = path.match(/^\/api\/manuscripts\/([^/]+)\/run$/);
      if (runMatch && method === "POST") {
        const user = requireAuth(req);
        const msId = runMatch[1];

        const ms = db.query("SELECT id FROM manuscripts WHERE id = ? AND user_id = ?").get(msId, user.id);
        if (!ms) return error("Manuscript not found", 404);

        const limits = checkPlanLimits(user);
        const { module_id, provider, model } = await req.json();

        if (!module_id) return error("module_id required");

        const moduleObj = MODULES.find((m) => m.id === module_id);
        if (!moduleObj) return error("Unknown module");
        if (moduleObj.order > limits.maxModules) {
          return error(`Module "${moduleObj.name}" requires a higher plan`, 403);
        }

        // Create version before editing
        createVersion(msId, `Before ${moduleObj.name} module`);

        const runId = await startEditingRun(msId, module_id, {
          provider: provider || undefined,
          model: model || undefined,
        }, user.id);

        return json({ run_id: runId });
      }

      // --- Get runs for manuscript ---
      const runsMatch = path.match(/^\/api\/manuscripts\/([^/]+)\/runs$/);
      if (runsMatch && method === "GET") {
        const user = requireAuth(req);
        const msId = runsMatch[1];
        const ms = db.query("SELECT id FROM manuscripts WHERE id = ? AND user_id = ?").get(msId, user.id);
        if (!ms) return error("Manuscript not found", 404);
        const runs = getManuscriptRuns(msId);
        return json({ runs });
      }

      // --- Get run status ---
      const runStatusMatch = path.match(/^\/api\/runs\/([^/]+)$/);
      if (runStatusMatch && method === "GET") {
        const run = getRunStatus(runStatusMatch[1]);
        if (!run) return error("Run not found", 404);
        return json({ run });
      }

      // --- Get suggestions for a run ---
      const runSuggestionsMatch = path.match(/^\/api\/runs\/([^/]+)\/suggestions$/);
      if (runSuggestionsMatch && method === "GET") {
        const status = url.searchParams.get("status") || undefined;
        const suggestions = getRunSuggestions(runSuggestionsMatch[1], status);
        return json({ suggestions });
      }

      // --- Get all suggestions for a manuscript ---
      const msSuggestionsMatch = path.match(/^\/api\/manuscripts\/([^/]+)\/suggestions$/);
      if (msSuggestionsMatch && method === "GET") {
        const user = requireAuth(req);
        const msId = msSuggestionsMatch[1];
        const ms = db.query("SELECT id FROM manuscripts WHERE id = ? AND user_id = ?").get(msId, user.id);
        if (!ms) return error("Manuscript not found", 404);
        const status = url.searchParams.get("status") || undefined;
        const suggestions = getManuscriptSuggestions(msId, status);
        return json({ suggestions });
      }

      // --- Resolve suggestion ---
      const suggestMatch = path.match(/^\/api\/suggestions\/([^/]+)\/(accept|reject|edit)$/);
      if (suggestMatch && method === "POST") {
        requireAuth(req);
        const [, suggestionId, action] = suggestMatch;

        if (action === "accept") {
          acceptSuggestion(suggestionId);
        } else if (action === "reject") {
          rejectSuggestion(suggestionId);
        } else if (action === "edit") {
          const { text } = await req.json();
          if (!text) return error("text required for edit action");
          editSuggestion(suggestionId, text);
        }

        return json({ ok: true });
      }

      // --- Batch resolve ---
      const batchMatch = path.match(/^\/api\/suggestions\/batch\/(accept|reject)$/);
      if (batchMatch && method === "POST") {
        requireAuth(req);
        const { suggestion_ids } = await req.json();
        if (!Array.isArray(suggestion_ids)) return error("suggestion_ids must be an array");
        const result = batchResolveSuggestions(suggestion_ids, batchMatch[1] as "accept" | "reject");
        return json(result);
      }

      // --- Version history ---
      const versionsMatch = path.match(/^\/api\/manuscripts\/([^/]+)\/versions$/);
      if (versionsMatch && method === "GET") {
        const user = requireAuth(req);
        const msId = versionsMatch[1];
        const ms = db.query("SELECT id FROM manuscripts WHERE id = ? AND user_id = ?").get(msId, user.id);
        if (!ms) return error("Manuscript not found", 404);
        const versions = getVersionHistory(msId);
        return json({ versions });
      }

      // --- Rollback ---
      const rollbackMatch = path.match(/^\/api\/manuscripts\/([^/]+)\/rollback$/);
      if (rollbackMatch && method === "POST") {
        const user = requireAuth(req);
        const msId = rollbackMatch[1];
        const ms = db.query("SELECT id FROM manuscripts WHERE id = ? AND user_id = ?").get(msId, user.id);
        if (!ms) return error("Manuscript not found", 404);
        const { version_id } = await req.json();
        rollbackToVersion(msId, version_id);
        return json({ ok: true });
      }

      // --- Readiness score ---
      const scoreMatch = path.match(/^\/api\/manuscripts\/([^/]+)\/score$/);
      if (scoreMatch && method === "GET") {
        const user = requireAuth(req);
        const msId = scoreMatch[1];
        const ms = db.query("SELECT id FROM manuscripts WHERE id = ? AND user_id = ?").get(msId, user.id);
        if (!ms) return error("Manuscript not found", 404);
        const score = calculateReadinessScore(msId);
        return json(score);
      }

      // --- Export ---
      const exportMatch = path.match(/^\/api\/manuscripts\/([^/]+)\/export\/(\w+)$/);
      if (exportMatch && method === "GET") {
        const user = requireAuth(req);
        const msId = exportMatch[1];
        const format = exportMatch[2] as ExportFormat;

        const ms = db.query("SELECT id FROM manuscripts WHERE id = ? AND user_id = ?").get(msId, user.id);
        if (!ms) return error("Manuscript not found", 404);

        const result = await exportManuscript(msId, format);
        return new Response(result.data, {
          headers: {
            "Content-Type": result.contentType,
            "Content-Disposition": `attachment; filename="${result.filename}"`,
          },
        });
      }

      // Fallback: serve SPA for client-side routing
      if (!path.startsWith("/api/")) {
        return new Response(Bun.file(new URL("./index.html", import.meta.url).pathname));
      }

      return error("Not found", 404);
    } catch (e: any) {
      if (e instanceof AuthError) return error(e.message, 401);
      console.error("API error:", e.message);
      return error("Internal server error", 500);
    }
  },

  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Manuscript Editor running on http://localhost:${PORT}`);
