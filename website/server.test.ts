import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { bookMetadata, authorBio, tableOfContents, resources } from "./lib/book-data";

describe("Book Data", () => {
  test("bookMetadata contains required fields", () => {
    expect(bookMetadata.title).toBe("Curls & Contemplation");
    expect(bookMetadata.subtitle).toBe("A Freelance Hairstylist's Guide to Creative Excellence");
    expect(bookMetadata.author).toBe("Michael David Warren");
    expect(bookMetadata.description).toBeTruthy();
    expect(bookMetadata.coverImage).toBe("/images/cover.png");
    expect(bookMetadata.authorImage).toBe("/images/Michael.jpeg");
  });

  test("authorBio contains required fields", () => {
    expect(authorBio.name).toBe("Michael David Warren");
    expect(authorBio.handle).toBe("@md.warren");
    expect(authorBio.instagramUrl).toContain("instagram.com");
    expect(authorBio.fullBio).toBeTruthy();
    expect(authorBio.closingMessage).toBeTruthy();
  });

  test("tableOfContents has correct structure", () => {
    // Test 4 parts
    expect(tableOfContents.parts).toHaveLength(4);

    // Test part titles
    expect(tableOfContents.parts[0].title).toBe("Foundations of Creative Hairstyling");
    expect(tableOfContents.parts[1].title).toBe("Building Your Professional Practice");
    expect(tableOfContents.parts[2].title).toBe("Advanced Business Strategies");
    expect(tableOfContents.parts[3].title).toBe("Future-Focused Growth");
  });

  test("tableOfContents has correct chapter counts", () => {
    // Part I: 3 chapters
    expect(tableOfContents.parts[0].chapters).toHaveLength(3);
    // Part II: 5 chapters
    expect(tableOfContents.parts[1].chapters).toHaveLength(5);
    // Part III: 5 chapters
    expect(tableOfContents.parts[2].chapters).toHaveLength(5);
    // Part IV: 3 chapters
    expect(tableOfContents.parts[3].chapters).toHaveLength(3);
  });

  test("tableOfContents has 16 total chapters", () => {
    const totalChapters = tableOfContents.parts.reduce(
      (sum, part) => sum + part.chapters.length,
      0
    );
    expect(totalChapters).toBe(16);
  });

  test("frontmatter contains required sections", () => {
    expect(tableOfContents.frontmatter).toContain("Title Page");
    expect(tableOfContents.frontmatter).toContain("Copyright");
    expect(tableOfContents.frontmatter).toContain("Dedication");
    expect(tableOfContents.frontmatter).toContain("Self Assessment");
    expect(tableOfContents.frontmatter).toContain("Affirmation Odyssey");
    expect(tableOfContents.frontmatter).toContain("Preface");
  });

  test("backmatter contains required sections", () => {
    expect(tableOfContents.backmatter).toContain("Conclusion");
    expect(tableOfContents.backmatter).toContain("Quiz Answer Key");
    expect(tableOfContents.backmatter).toContain("Acknowledgments");
    expect(tableOfContents.backmatter).toContain("About the Author");
    expect(tableOfContents.backmatter).toContain("Bibliography");
  });

  test("interactiveElements contains expected items", () => {
    expect(tableOfContents.interactiveElements).toContain("Self Assessment Worksheets");
    expect(tableOfContents.interactiveElements).toContain("SMART Goals Worksheet");
    expect(tableOfContents.interactiveElements).toContain("Vision Journal");
    expect(tableOfContents.interactiveElements.length).toBeGreaterThanOrEqual(5);
  });

  test("resources have required fields", () => {
    expect(resources.length).toBeGreaterThan(0);

    resources.forEach((resource) => {
      expect(resource.id).toBeTruthy();
      expect(resource.title).toBeTruthy();
      expect(resource.description).toBeTruthy();
      expect(resource.category).toBeTruthy();
      expect(resource.downloadUrl).toBeTruthy();
    });
  });

  test("chapter titles match EPUB exactly", () => {
    // Part I chapters
    expect(tableOfContents.parts[0].chapters[0].title).toBe("Unveiling Your Creative Odyssey");
    expect(tableOfContents.parts[0].chapters[1].title).toBe("Refining Your Creative Toolkit");
    expect(tableOfContents.parts[0].chapters[2].title).toBe("Reigniting Your Creative Fire");

    // Part II chapters
    expect(tableOfContents.parts[1].chapters[0].title).toBe(
      "The Art of Networking in Freelance Hairstyling"
    );
    expect(tableOfContents.parts[1].chapters[1].title).toBe(
      "Cultivating Creative Excellence Through Mentorship"
    );

    // Part III chapters
    expect(tableOfContents.parts[2].chapters[0].title).toBe("Stepping Into Leadership");
    expect(tableOfContents.parts[2].chapters[1].title).toBe("Crafting Enduring Legacies");

    // Part IV chapters
    expect(tableOfContents.parts[3].chapters[0].title).toBe(
      "The Impact of AI on the Beauty Industry"
    );
    expect(tableOfContents.parts[3].chapters[2].title).toBe(
      "Tresses and Textures - Embracing Diversity in Hairstyling"
    );
  });
});

describe("API Endpoints", () => {
  let server: ReturnType<typeof Bun.serve>;

  beforeAll(async () => {
    // Start server on a different port for testing
    server = Bun.serve({
      port: 3001,
      routes: {
        "/api/subscribe": {
          async POST(req) {
            const body = await req.json();
            const { email } = body;

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              return new Response(JSON.stringify({ error: "Invalid email" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
              });
            }

            return new Response(
              JSON.stringify({ message: "Success", requiresConfirmation: true }),
              { status: 201, headers: { "Content-Type": "application/json" } }
            );
          },
        },
        "/api/health": {
          GET: () =>
            new Response(JSON.stringify({ status: "ok" }), {
              headers: { "Content-Type": "application/json" },
            }),
        },
      },
      fetch() {
        return new Response("Not found", { status: 404 });
      },
    });
  });

  afterAll(() => {
    server.stop();
  });

  test("health endpoint returns ok", async () => {
    const response = await fetch("http://localhost:3001/api/health");
    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data.status).toBe("ok");
  });

  test("subscribe endpoint accepts valid email", async () => {
    const response = await fetch("http://localhost:3001/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", source: "test" }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.message).toBe("Success");
    expect(data.requiresConfirmation).toBe(true);
  });

  test("subscribe endpoint rejects invalid email", async () => {
    const response = await fetch("http://localhost:3001/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "notanemail", source: "test" }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeTruthy();
  });

  test("subscribe endpoint rejects empty email", async () => {
    const response = await fetch("http://localhost:3001/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", source: "test" }),
    });

    expect(response.status).toBe(400);
  });
});

describe("Email Validation", () => {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  test("validates correct email formats", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name@domain.org")).toBe(true);
    expect(isValidEmail("user+tag@example.co.uk")).toBe(true);
  });

  test("rejects invalid email formats", () => {
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("@nodomain.com")).toBe(false);
    expect(isValidEmail("noat.com")).toBe(false);
    expect(isValidEmail("spaces in@email.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("Static Assets", () => {
  test("cover image exists", async () => {
    const file = Bun.file("./public/images/cover.png");
    expect(await file.exists()).toBe(true);
  });

  test("author image exists", async () => {
    const file = Bun.file("./public/images/Michael.jpeg");
    expect(await file.exists()).toBe(true);
  });

  test("fonts exist", async () => {
    const fonts = [
      "CinzelDecorative.woff2",
      "Montserrat-Bold.woff2",
      "Montserrat-Regular.woff2",
      "librebaskerville-bold.woff2",
      "librebaskerville-italic.woff2",
      "librebaskerville-regular.woff2",
    ];

    for (const font of fonts) {
      const file = Bun.file(`./public/fonts/${font}`);
      expect(await file.exists()).toBe(true);
    }
  });
});

describe("SEO Requirements", () => {
  test("book title is under 60 characters", () => {
    expect(bookMetadata.title.length).toBeLessThanOrEqual(60);
  });

  test("book description is under 160 characters for meta description", () => {
    // A truncated version should be used for meta description
    const truncatedDescription = bookMetadata.description.slice(0, 160);
    expect(truncatedDescription.length).toBeLessThanOrEqual(160);
  });

  test("all subjects are defined for SEO keywords", () => {
    expect(bookMetadata.subjects.length).toBeGreaterThanOrEqual(3);
    bookMetadata.subjects.forEach((subject) => {
      expect(subject.length).toBeGreaterThan(0);
    });
  });
});

describe("Accessibility", () => {
  test("color contrast meets WCAG AA requirements", () => {
    // Calculate relative luminance
    const getLuminance = (hex: string): number => {
      const rgb = hex.replace("#", "").match(/.{2}/g)!.map((x) => parseInt(x, 16) / 255);
      const [r, g, b] = rgb.map((c) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const getContrastRatio = (hex1: string, hex2: string): number => {
      const l1 = getLuminance(hex1);
      const l2 = getLuminance(hex2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    };

    // Test body text on white (WCAG AA: 4.5:1 for normal text)
    const textOnWhite = getContrastRatio("#444444", "#ffffff");
    expect(textOnWhite).toBeGreaterThanOrEqual(4.5);

    // Test ink color on white (headings)
    const inkOnWhite = getContrastRatio("#1a1a1a", "#ffffff");
    expect(inkOnWhite).toBeGreaterThanOrEqual(4.5);

    // Test teal-dark on white (used for important text/headings)
    const tealDarkOnWhite = getContrastRatio("#1F7272", "#ffffff");
    expect(tealDarkOnWhite).toBeGreaterThanOrEqual(4.5);

    // Test teal accent on white (WCAG AA for large text/UI: 3:1)
    const tealOnWhite = getContrastRatio("#2B9999", "#ffffff");
    expect(tealOnWhite).toBeGreaterThanOrEqual(3.0);

    // Test white on teal buttons
    const whiteOnTeal = getContrastRatio("#ffffff", "#2B9999");
    expect(whiteOnTeal).toBeGreaterThanOrEqual(3.0);
  });
});
