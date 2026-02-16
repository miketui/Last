import { test, expect, describe, beforeAll } from "bun:test";

const BASE = "http://localhost:3100";

describe("Manuscript Editor API", () => {
  let sessionCookie = "";

  test("GET /api/modules returns all 10 modules", async () => {
    const res = await fetch(`${BASE}/api/modules`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.modules).toHaveLength(10);
    expect(data.modules[0]).toHaveProperty("id");
    expect(data.modules[0]).toHaveProperty("name");
    expect(data.modules[0]).toHaveProperty("description");
  });

  test("GET /api/billing/plans returns plan tiers", async () => {
    const res = await fetch(`${BASE}/api/billing/plans`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.plans).toHaveProperty("free");
    expect(data.plans).toHaveProperty("starter");
    expect(data.plans).toHaveProperty("professional");
    expect(data.plans).toHaveProperty("enterprise");
  });

  test("GET /api/auth/me returns 401 without session", async () => {
    const res = await fetch(`${BASE}/api/auth/me`);
    expect(res.status).toBe(401);
  });

  test("POST /api/auth/register creates account", async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `test-${Date.now()}@test.com`, password: "testpassword123", name: "Test Author" }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.user).toHaveProperty("id");
    expect(data.user.plan).toBe("free");

    // Extract session cookie
    const setCookie = res.headers.get("set-cookie") || "";
    const match = setCookie.match(/session=([^;]+)/);
    if (match) sessionCookie = `session=${match[1]}`;
  });

  test("GET /api/auth/me returns user with session", async () => {
    const res = await fetch(`${BASE}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.user).toHaveProperty("email");
  });

  test("GET /api/settings/llm returns default config", async () => {
    const res = await fetch(`${BASE}/api/settings/llm`, {
      headers: { Cookie: sessionCookie },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.config).toHaveProperty("default_provider");
    expect(data.config).toHaveProperty("openai_model");
    expect(data.config).toHaveProperty("anthropic_model");
  });

  test("POST /api/settings/llm saves provider config", async () => {
    const res = await fetch(`${BASE}/api/settings/llm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: sessionCookie },
      body: JSON.stringify({ default_provider: "anthropic", anthropic_model: "claude-sonnet-4-20250514" }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.config.default_provider).toBe("anthropic");
  });

  test("GET /api/manuscripts returns empty list", async () => {
    const res = await fetch(`${BASE}/api/manuscripts`, {
      headers: { Cookie: sessionCookie },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.manuscripts).toEqual([]);
  });

  test("POST /api/manuscripts/upload accepts .txt file", async () => {
    const form = new FormData();
    const content = "Chapter 1: The Beginning\n\nOnce upon a time, there was a story that needed editing.\n\nChapter 2: The Middle\n\nThe story continued with more content that needed review.";
    form.append("file", new Blob([content], { type: "text/plain" }), "test-manuscript.txt");

    const res = await fetch(`${BASE}/api/manuscripts/upload`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
      body: form,
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.manuscript).toHaveProperty("id");
    expect(data.manuscript.word_count).toBeGreaterThan(0);
  });

  test("Module list includes all 10 required modules", async () => {
    const res = await fetch(`${BASE}/api/modules`);
    const data = await res.json();
    const moduleIds = data.modules.map((m: any) => m.id);
    expect(moduleIds).toContain("grammar");
    expect(moduleIds).toContain("style_guide");
    expect(moduleIds).toContain("tone_voice");
    expect(moduleIds).toContain("fact_check");
    expect(moduleIds).toContain("readability");
    expect(moduleIds).toContain("dialogue");
    expect(moduleIds).toContain("continuity");
    expect(moduleIds).toContain("sensitivity");
    expect(moduleIds).toContain("structure");
    expect(moduleIds).toContain("final_polish");
  });
});
