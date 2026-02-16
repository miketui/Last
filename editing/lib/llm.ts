// Provider-agnostic LLM abstraction layer
// Supports OpenAI, Anthropic, Mistral, and Ollama (open-source models)
// All calls include opt-out flags for training where supported

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  provider: string;
  model: string;
}

export interface LLMConfig {
  provider: "openai" | "anthropic" | "mistral" | "ollama";
  model?: string;
  temperature?: number;
  max_tokens?: number;
  // Per-user API key overrides (injected by the engine when user has configured keys)
  apiKey?: string;
  ollamaBaseUrl?: string;
}

// Default models per provider
const DEFAULT_MODELS: Record<string, string> = {
  openai: process.env.OPENAI_MODEL || "gpt-4o",
  anthropic: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
  mistral: process.env.MISTRAL_MODEL || "mistral-large-latest",
  ollama: process.env.OLLAMA_MODEL || "llama3",
};

function getDefaultProvider(): LLMConfig["provider"] {
  const p = process.env.DEFAULT_LLM_PROVIDER || "openai";
  if (["openai", "anthropic", "mistral", "ollama"].includes(p)) {
    return p as LLMConfig["provider"];
  }
  return "openai";
}

/** Call the configured LLM provider with messages. Returns structured response. */
export async function callLLM(
  messages: LLMMessage[],
  config?: Partial<LLMConfig>
): Promise<LLMResponse> {
  const provider = config?.provider || getDefaultProvider();
  const model = config?.model || DEFAULT_MODELS[provider];
  const temperature = config?.temperature ?? 0.3;
  const max_tokens = config?.max_tokens ?? 4096;

  const apiKey = config?.apiKey;
  const ollamaBaseUrl = config?.ollamaBaseUrl;

  switch (provider) {
    case "openai":
      return callOpenAI(messages, model, temperature, max_tokens, apiKey);
    case "anthropic":
      return callAnthropic(messages, model, temperature, max_tokens, apiKey);
    case "mistral":
      return callMistral(messages, model, temperature, max_tokens, apiKey);
    case "ollama":
      return callOllama(messages, model, temperature, max_tokens, ollamaBaseUrl);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

async function callOpenAI(
  messages: LLMMessage[],
  model: string,
  temperature: number,
  max_tokens: number,
  userKey?: string
): Promise<LLMResponse> {
  const key = userKey || process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OpenAI API key is not configured. Add it in Settings or set OPENAI_API_KEY.");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      // Opt out of training on this data
      store: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    provider: "openai",
    model,
  };
}

async function callAnthropic(
  messages: LLMMessage[],
  model: string,
  temperature: number,
  max_tokens: number,
  userKey?: string
): Promise<LLMResponse> {
  const key = userKey || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Anthropic API key is not configured. Add it in Settings or set ANTHROPIC_API_KEY.");

  // Anthropic uses a separate system parameter
  const systemMsg = messages.find((m) => m.role === "system");
  const nonSystemMsgs = messages.filter((m) => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemMsg?.content || "",
      messages: nonSystemMsgs.map((m) => ({ role: m.role, content: m.content })),
      temperature,
      max_tokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    content: data.content[0].text,
    usage: {
      prompt_tokens: data.usage.input_tokens,
      completion_tokens: data.usage.output_tokens,
      total_tokens: data.usage.input_tokens + data.usage.output_tokens,
    },
    provider: "anthropic",
    model,
  };
}

async function callMistral(
  messages: LLMMessage[],
  model: string,
  temperature: number,
  max_tokens: number,
  userKey?: string
): Promise<LLMResponse> {
  const key = userKey || process.env.MISTRAL_API_KEY;
  if (!key) throw new Error("Mistral API key is not configured. Add it in Settings or set MISTRAL_API_KEY.");

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    provider: "mistral",
    model,
  };
}

async function callOllama(
  messages: LLMMessage[],
  model: string,
  temperature: number,
  max_tokens: number,
  userBaseUrl?: string
): Promise<LLMResponse> {
  const baseUrl = userBaseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: { temperature, num_predict: max_tokens },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    content: data.message.content,
    usage: {
      prompt_tokens: data.prompt_eval_count || 0,
      completion_tokens: data.eval_count || 0,
      total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
    },
    provider: "ollama",
    model,
  };
}

/** Estimate token count for text (rough: 1 token ≈ 4 chars for English) */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
