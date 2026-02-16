// SQLite database with bun:sqlite — schema and access layer
// All manuscript content columns store encrypted data

import { Database } from "bun:sqlite";
import { join } from "node:path";

const DB_PATH = join(import.meta.dir, "..", "data", "editor.db");

// Ensure data directory exists
await Bun.write(join(import.meta.dir, "..", "data", ".gitkeep"), "");

const db = new Database(DB_PATH, { create: true });

// Enable WAL mode for better concurrent read performance
db.run("PRAGMA journal_mode = WAL");
db.run("PRAGMA foreign_keys = ON");

export function migrate() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      plan TEXT NOT NULL DEFAULT 'free' CHECK(plan IN ('free', 'starter', 'professional', 'enterprise')),
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      manuscripts_this_month INTEGER NOT NULL DEFAULT 0,
      monthly_reset_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS manuscripts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_format TEXT NOT NULL,
      word_count INTEGER NOT NULL DEFAULT 0,
      encrypted_content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'uploaded' CHECK(status IN ('uploaded','consulting','editing','review','completed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_manuscripts_user ON manuscripts(user_id)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      manuscript_id TEXT NOT NULL UNIQUE REFERENCES manuscripts(id) ON DELETE CASCADE,
      genre TEXT NOT NULL DEFAULT '',
      subgenre TEXT NOT NULL DEFAULT '',
      target_audience TEXT NOT NULL DEFAULT '',
      tone_profile TEXT NOT NULL DEFAULT '',
      style_guide TEXT NOT NULL DEFAULT 'chicago',
      sensitivity_flags TEXT NOT NULL DEFAULT '[]',
      fiction_characters TEXT NOT NULL DEFAULT '[]',
      fiction_timeline TEXT NOT NULL DEFAULT '',
      fiction_worldbuilding TEXT NOT NULL DEFAULT '',
      nonfiction_claim_priority TEXT NOT NULL DEFAULT 'medium',
      nonfiction_citation_style TEXT NOT NULL DEFAULT '',
      priority_modules TEXT NOT NULL DEFAULT '[]',
      custom_instructions TEXT NOT NULL DEFAULT '',
      is_fiction INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      manuscript_id TEXT NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
      chapter_number INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      encrypted_content TEXT NOT NULL,
      word_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(manuscript_id, chapter_number)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_chapters_manuscript ON chapters(manuscript_id)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
      chunk_index INTEGER NOT NULL,
      encrypted_content TEXT NOT NULL,
      token_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(chapter_id, chunk_index)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_chunks_chapter ON chunks(chapter_id)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS editing_runs (
      id TEXT PRIMARY KEY,
      manuscript_id TEXT NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
      module_id TEXT NOT NULL,
      module_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','running','completed','failed')),
      progress_pct INTEGER NOT NULL DEFAULT 0,
      total_suggestions INTEGER NOT NULL DEFAULT 0,
      accepted INTEGER NOT NULL DEFAULT 0,
      rejected INTEGER NOT NULL DEFAULT 0,
      edited INTEGER NOT NULL DEFAULT 0,
      llm_provider TEXT NOT NULL DEFAULT '',
      llm_model TEXT NOT NULL DEFAULT '',
      error_message TEXT,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_runs_manuscript ON editing_runs(manuscript_id)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id TEXT PRIMARY KEY,
      editing_run_id TEXT NOT NULL REFERENCES editing_runs(id) ON DELETE CASCADE,
      manuscript_id TEXT NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
      chapter_id TEXT REFERENCES chapters(id) ON DELETE SET NULL,
      chunk_id TEXT REFERENCES chunks(id) ON DELETE SET NULL,
      module_id TEXT NOT NULL,
      chapter_number INTEGER,
      paragraph_number INTEGER,
      sentence_number INTEGER,
      original_text TEXT NOT NULL,
      suggested_edit TEXT NOT NULL,
      rationale TEXT NOT NULL,
      rule_or_source TEXT NOT NULL DEFAULT '',
      confidence_score REAL NOT NULL DEFAULT 0.0,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected','edited')),
      author_edit TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_run ON suggestions(editing_run_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_manuscript ON suggestions(manuscript_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(manuscript_id, status)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS manuscript_versions (
      id TEXT PRIMARY KEY,
      manuscript_id TEXT NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      encrypted_content TEXT NOT NULL,
      change_summary TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(manuscript_id, version_number)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_versions_manuscript ON manuscript_versions(manuscript_id)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`);

  // Per-user LLM API key configuration (encrypted at rest)
  db.run(`
    CREATE TABLE IF NOT EXISTS user_llm_config (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      default_provider TEXT NOT NULL DEFAULT 'openai',
      openai_api_key_encrypted TEXT,
      anthropic_api_key_encrypted TEXT,
      mistral_api_key_encrypted TEXT,
      ollama_base_url TEXT,
      openai_model TEXT NOT NULL DEFAULT 'gpt-4o',
      anthropic_model TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
      mistral_model TEXT NOT NULL DEFAULT 'mistral-large-latest',
      ollama_model TEXT NOT NULL DEFAULT 'llama3',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

// Run migration on import
migrate();

export default db;
