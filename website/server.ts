import index from "./index.html";

// In-memory subscriber store (would be replaced by actual email service)
const subscribers: Map<string, { email: string; source: string; createdAt: Date }> = new Map();

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// API handler for email subscription
const handleSubscribe = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { email, source } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if already subscribed
    if (subscribers.has(email.toLowerCase())) {
      return new Response(JSON.stringify({ message: "Already subscribed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Store subscriber
    subscribers.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      source: source || "unknown",
      createdAt: new Date(),
    });

    console.log(`New subscriber: ${email} from ${source}`);

    // In production, integrate with email marketing platform here
    // Example: await mailchimp.lists.addMember(...)

    return new Response(
      JSON.stringify({
        message: "Subscription successful",
        requiresConfirmation: true,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Serve static files from public directory
const serveStaticFile = async (path: string): Promise<Response | null> => {
  const publicPath = `./public${path}`;
  const file = Bun.file(publicPath);

  if (await file.exists()) {
    const contentType = getContentType(path);
    return new Response(file, {
      headers: { "Content-Type": contentType },
    });
  }
  return null;
};

const getContentType = (path: string): string => {
  const ext = path.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    woff2: "font/woff2",
    woff: "font/woff",
    ttf: "font/ttf",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    pdf: "application/pdf",
    xml: "application/xml",
    txt: "text/plain",
  };
  return types[ext || ""] || "application/octet-stream";
};

// Start the server
const server = Bun.serve({
  port: 3000,
  routes: {
    // Homepage
    "/": index,

    // API routes
    "/api/subscribe": {
      POST: handleSubscribe,
    },

    // Health check
    "/api/health": {
      GET: () =>
        new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
          headers: { "Content-Type": "application/json" },
        }),
    },

    // Robots.txt
    "/robots.txt": new Response(
      `User-agent: *
Allow: /

Sitemap: https://curlsandcontemplation.com/sitemap.xml`,
      { headers: { "Content-Type": "text/plain" } }
    ),

    // Sitemap
    "/sitemap.xml": new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://curlsandcontemplation.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://curlsandcontemplation.com/#book-preview</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://curlsandcontemplation.com/#about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://curlsandcontemplation.com/#resources</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://curlsandcontemplation.com/#newsletter</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`,
      { headers: { "Content-Type": "application/xml" } }
    ),

    // Privacy policy placeholder
    "/privacy": new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Curls & Contemplation</title>
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <div class="container" style="padding-top: 120px; max-width: 800px;">
    <h1 class="display-title">Privacy Policy</h1>
    <p>Last updated: ${new Date().toISOString().split("T")[0]}</p>
    <h2>Information We Collect</h2>
    <p>We collect your email address when you subscribe to our newsletter. This information is used solely to send you updates about the book launch and related content.</p>
    <h2>How We Use Your Information</h2>
    <ul>
      <li>Send book launch updates and exclusive content</li>
      <li>Notify you about pre-order availability</li>
      <li>Share free resources and downloads</li>
    </ul>
    <h2>Your Rights</h2>
    <p>You can unsubscribe from our email list at any time by clicking the unsubscribe link in any email.</p>
    <h2>Contact</h2>
    <p>For privacy-related questions, please contact us through the website.</p>
    <p><a href="/">← Back to Home</a></p>
  </div>
</body>
</html>`,
      { headers: { "Content-Type": "text/html" } }
    ),
  },

  // Fallback for static files and SPA routing
  fetch(req) {
    const url = new URL(req.url);

    // Try to serve static file
    return serveStaticFile(url.pathname).then((response) => {
      if (response) return response;

      // SPA fallback - serve index.html for all other routes
      return new Response(Bun.file("./index.html"), {
        headers: { "Content-Type": "text/html" },
      });
    });
  },

  development: {
    hmr: true,
    console: true,
  },
});

console.log(`
🌟 Curls & Contemplation Author Website
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Server running at: http://localhost:${server.port}

Available routes:
  - /              Homepage
  - /book-preview  Table of Contents
  - /about         About the Author
  - /resources     Free Resources
  - /newsletter    Newsletter Signup
  - /privacy       Privacy Policy

API endpoints:
  - POST /api/subscribe   Email subscription
  - GET  /api/health      Health check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
