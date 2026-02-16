// Per-user LLM API key configuration
// Users can configure their own OpenAI, Anthropic, Mistral, or Ollama keys
// Keys are encrypted at rest using the same AES-256-GCM as manuscript content

import db from "./database";
import { encrypt, decrypt } from "./encryption";
import { randomUUID } from "node:crypto";

export interface UserLLMConfig {
  default_provider: string;
  openai_api_key: string; // masked for display
  anthropic_api_key: string; // masked for display
  mistral_api_key: string; // masked for display
  ollama_base_url: string;
  openai_model: string;
  anthropic_model: string;
  mistral_model: string;
  ollama_model: string;
}

/** Get user's LLM config (with masked keys for display) */
export function getUserLLMConfig(userId: string): UserLLMConfig {
  const row = db.query("SELECT * FROM user_llm_config WHERE user_id = ?").get(userId) as any;

  if (!row) {
    return {
      default_provider: "openai",
      openai_api_key: "",
      anthropic_api_key: "",
      mistral_api_key: "",
      ollama_base_url: "",
      openai_model: "gpt-4o",
      anthropic_model: "claude-sonnet-4-20250514",
      mistral_model: "mistral-large-latest",
      ollama_model: "llama3",
    };
  }

  return {
    default_provider: row.default_provider,
    openai_api_key: row.openai_api_key_encrypted ? maskKey(decrypt(row.openai_api_key_encrypted)) : "",
    anthropic_api_key: row.anthropic_api_key_encrypted ? maskKey(decrypt(row.anthropic_api_key_encrypted)) : "",
    mistral_api_key: row.mistral_api_key_encrypted ? maskKey(decrypt(row.mistral_api_key_encrypted)) : "",
    ollama_base_url: row.ollama_base_url || "",
    openai_model: row.openai_model,
    anthropic_model: row.anthropic_model,
    mistral_model: row.mistral_model,
    ollama_model: row.ollama_model,
  };
}

/** Get the actual (decrypted) API key for a provider — used internally by the editing engine */
export function getDecryptedKey(userId: string, provider: string): string | null {
  const row = db.query("SELECT * FROM user_llm_config WHERE user_id = ?").get(userId) as any;
  if (!row) return null;

  switch (provider) {
    case "openai":
      return row.openai_api_key_encrypted ? decrypt(row.openai_api_key_encrypted) : null;
    case "anthropic":
      return row.anthropic_api_key_encrypted ? decrypt(row.anthropic_api_key_encrypted) : null;
    case "mistral":
      return row.mistral_api_key_encrypted ? decrypt(row.mistral_api_key_encrypted) : null;
    default:
      return null;
  }
}

/** Get user's configured model for a provider */
export function getUserModel(userId: string, provider: string): string | null {
  const row = db.query("SELECT * FROM user_llm_config WHERE user_id = ?").get(userId) as any;
  if (!row) return null;

  switch (provider) {
    case "openai": return row.openai_model;
    case "anthropic": return row.anthropic_model;
    case "mistral": return row.mistral_model;
    case "ollama": return row.ollama_model;
    default: return null;
  }
}

/** Get user's default provider */
export function getUserDefaultProvider(userId: string): string {
  const row = db.query("SELECT default_provider FROM user_llm_config WHERE user_id = ?").get(userId) as any;
  return row?.default_provider || "openai";
}

/** Save user's LLM config. Keys passed as empty string are not updated (preserves existing). */
export function saveUserLLMConfig(userId: string, config: {
  default_provider?: string;
  openai_api_key?: string;
  anthropic_api_key?: string;
  mistral_api_key?: string;
  ollama_base_url?: string;
  openai_model?: string;
  anthropic_model?: string;
  mistral_model?: string;
  ollama_model?: string;
}): void {
  const existing = db.query("SELECT * FROM user_llm_config WHERE user_id = ?").get(userId) as any;

  if (!existing) {
    db.run(
      `INSERT INTO user_llm_config (id, user_id, default_provider, openai_api_key_encrypted, anthropic_api_key_encrypted, mistral_api_key_encrypted, ollama_base_url, openai_model, anthropic_model, mistral_model, ollama_model)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(), userId,
        config.default_provider || "openai",
        config.openai_api_key ? encrypt(config.openai_api_key) : null,
        config.anthropic_api_key ? encrypt(config.anthropic_api_key) : null,
        config.mistral_api_key ? encrypt(config.mistral_api_key) : null,
        config.ollama_base_url || null,
        config.openai_model || "gpt-4o",
        config.anthropic_model || "claude-sonnet-4-20250514",
        config.mistral_model || "mistral-large-latest",
        config.ollama_model || "llama3",
      ]
    );
    return;
  }

  // Update only provided fields
  const updates: string[] = [];
  const values: any[] = [];

  if (config.default_provider !== undefined) { updates.push("default_provider = ?"); values.push(config.default_provider); }
  if (config.openai_api_key) { updates.push("openai_api_key_encrypted = ?"); values.push(encrypt(config.openai_api_key)); }
  if (config.anthropic_api_key) { updates.push("anthropic_api_key_encrypted = ?"); values.push(encrypt(config.anthropic_api_key)); }
  if (config.mistral_api_key) { updates.push("mistral_api_key_encrypted = ?"); values.push(encrypt(config.mistral_api_key)); }
  if (config.ollama_base_url !== undefined) { updates.push("ollama_base_url = ?"); values.push(config.ollama_base_url); }
  if (config.openai_model) { updates.push("openai_model = ?"); values.push(config.openai_model); }
  if (config.anthropic_model) { updates.push("anthropic_model = ?"); values.push(config.anthropic_model); }
  if (config.mistral_model) { updates.push("mistral_model = ?"); values.push(config.mistral_model); }
  if (config.ollama_model) { updates.push("ollama_model = ?"); values.push(config.ollama_model); }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(userId);
    db.run(`UPDATE user_llm_config SET ${updates.join(", ")} WHERE user_id = ?`, values);
  }
}

/** Delete a specific API key */
export function deleteUserAPIKey(userId: string, provider: string): void {
  const colMap: Record<string, string> = {
    openai: "openai_api_key_encrypted",
    anthropic: "anthropic_api_key_encrypted",
    mistral: "mistral_api_key_encrypted",
  };
  const col = colMap[provider];
  if (!col) return;
  db.run(`UPDATE user_llm_config SET ${col} = NULL, updated_at = datetime('now') WHERE user_id = ?`, [userId]);
}

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}
