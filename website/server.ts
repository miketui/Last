import index from "./index.html";
import {
  addSubscriber,
  createOrder,
  createPortalToken,
  createDownloadToken,
  getOrderByPaymentIntent,
  getOrderByPortalToken,
  getDownloadToken,
  getDownloadTokensByOrder,
  incrementDownloadCount,
  isDownloadValid,
  recordWebhookEvent,
  wasWebhookProcessed,
  upsertCustomer,
  getOrdersWithoutDownloadTokens,
  getAllOrders,
  updateOrderStatus,
  revokeDownloadTokens,
  extendDownloadToken,
  updateSubscriberTags,
} from "./lib/database";
import {
  createPaymentIntent,
  verifyWebhookSignature,
  validateCoupon,
  getCheckoutConfig,
  isPostLaunch,
  RELEASE_DATE,
  EBOOK_PRICE_CENTS,
} from "./lib/stripe";
import {
  sendPreOrderConfirmation,
  sendEbookReady,
  sendFreeResourceDelivery,
  addToMailchimp,
  MAILCHIMP_TAGS,
} from "./lib/email";

const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Turnstile verification (Cloudflare)
const verifyTurnstile = async (token: string): Promise<boolean> => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true; // Skip in development

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${token}`,
    });
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
};

// API handler for email subscription
const handleSubscribe = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { email, name, source, turnstile_token } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Verify Turnstile if token provided
    if (turnstile_token && !(await verifyTurnstile(turnstile_token))) {
      return Response.json({ error: "Bot verification failed" }, { status: 400 });
    }

    // Store subscriber
    const subscriber = addSubscriber(email, source || "website", name);

    // Add to Mailchimp
    await addToMailchimp({
      email,
      name,
      tags: [MAILCHIMP_TAGS.LEAD_FREEBIE],
    });

    console.log(`[Subscribe] New subscriber: ${email} from ${source}`);

    return Response.json(
      { message: "Subscription successful", requiresConfirmation: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Subscribe] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};

// API handler for free resource request (lead magnet)
const handleFreeResource = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { email, name, resource, turnstile_token } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Verify Turnstile
    if (turnstile_token && !(await verifyTurnstile(turnstile_token))) {
      return Response.json({ error: "Bot verification failed" }, { status: 400 });
    }

    // Store subscriber with freebie tag
    addSubscriber(email, `freebie_${resource || "pricing_kit"}`, name, [MAILCHIMP_TAGS.LEAD_FREEBIE]);

    // Add to Mailchimp
    await addToMailchimp({
      email,
      name,
      tags: [MAILCHIMP_TAGS.LEAD_FREEBIE],
    });

    // Send free resource email
    await sendFreeResourceDelivery({
      email,
      name,
      resourceName: "Stylist's 10-Minute Pricing Confidence Kit",
      downloadUrl: `${SITE_URL}/downloads/pricing-confidence-kit.pdf`,
    });

    console.log(`[FreeResource] Delivered to: ${email}`);

    return Response.json({ message: "Resource sent", downloadUrl: "/downloads/pricing-confidence-kit.pdf" });
  } catch (error) {
    console.error("[FreeResource] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};

// API handler for checkout (create payment intent)
const handleCheckout = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { email, name, turnstile_token, quantity = 1, coupon } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Verify Turnstile
    if (turnstile_token && !(await verifyTurnstile(turnstile_token))) {
      return Response.json({ error: "Bot verification failed" }, { status: 400 });
    }

    // Parse UTM params from referrer or body
    const utm = body.utm || {};

    // Create payment intent
    const result = await createPaymentIntent({
      email,
      amount: EBOOK_PRICE_CENTS * quantity,
      coupon,
      metadata: {
        customer_name: name || "",
        quantity: String(quantity),
        ...utm,
      },
    });

    if (!result) {
      return Response.json({ error: "Failed to create payment" }, { status: 500 });
    }

    console.log(`[Checkout] Payment intent created for: ${email}`);

    return Response.json({
      clientSecret: result.clientSecret,
      amount: result.amount,
      isPreOrder: !isPostLaunch(),
    });
  } catch (error) {
    console.error("[Checkout] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};

// API handler for coupon validation
const handleValidateCoupon = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { coupon } = body;

    if (!coupon) {
      return Response.json({ valid: false });
    }

    const result = await validateCoupon(coupon);
    return Response.json(result);
  } catch (error) {
    console.error("[ValidateCoupon] Error:", error);
    return Response.json({ valid: false });
  }
};

// Stripe webhook handler
const handleStripeWebhook = async (req: Request): Promise<Response> => {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return Response.json({ error: "Missing signature" }, { status: 400 });
    }

    const payload = await req.text();
    const event = verifyWebhookSignature(payload, signature);

    if (!event) {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Check idempotency
    if (wasWebhookProcessed(event.id)) {
      console.log(`[Webhook] Already processed: ${event.id}`);
      return Response.json({ received: true });
    }

    // Record the event
    recordWebhookEvent(event.id, event.type, event.data);

    console.log(`[Webhook] Processing: ${event.type}`);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as any;
        const email = paymentIntent.metadata?.email;
        const name = paymentIntent.metadata?.customer_name;

        if (!email) {
          console.error("[Webhook] No email in payment intent metadata");
          break;
        }

        // Upsert customer
        const customer = upsertCustomer(email, name);

        // Create order
        const order = createOrder({
          stripePaymentIntentId: paymentIntent.id,
          customerId: customer.id,
          amountTotal: paymentIntent.amount,
          amountTax: paymentIntent.metadata?.tax_amount ? parseInt(paymentIntent.metadata.tax_amount) : 0,
          currency: paymentIntent.currency.toUpperCase(),
          coupon: paymentIntent.metadata?.coupon || null,
          utm: paymentIntent.metadata?.utm_source
            ? {
                source: paymentIntent.metadata.utm_source,
                medium: paymentIntent.metadata.utm_medium,
                campaign: paymentIntent.metadata.utm_campaign,
              }
            : undefined,
        });

        // Update order status
        updateOrderStatus(order.id, "succeeded");

        // Create portal token
        const portalToken = createPortalToken(order.id);
        const portalUrl = `${SITE_URL}/portal/${portalToken.token}`;

        // Determine tag based on launch state
        const tag = isPostLaunch() ? MAILCHIMP_TAGS.CUSTOMER_POSTLAUNCH : MAILCHIMP_TAGS.CUSTOMER_PREORDER;

        // Update Mailchimp
        await addToMailchimp({ email, name, tags: [tag] });

        // If post-launch, create download tokens immediately
        if (isPostLaunch()) {
          const epubToken = createDownloadToken(order.id, "epub", 7);
          const pdfToken = createDownloadToken(order.id, "pdf", 7);

          // Send eBook ready email
          await sendEbookReady({
            email,
            name,
            portalUrl,
            epubDownloadUrl: `${SITE_URL}/download/${epubToken.token}`,
            pdfDownloadUrl: `${SITE_URL}/download/${pdfToken.token}`,
          });

          console.log(`[Webhook] Post-launch order fulfilled: ${order.id}`);
        } else {
          // Send pre-order confirmation
          await sendPreOrderConfirmation({
            email,
            name,
            orderId: order.id,
            amount: paymentIntent.amount,
            portalUrl,
            releaseDate: RELEASE_DATE.toISOString(),
          });

          console.log(`[Webhook] Pre-order confirmed: ${order.id}`);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent;

        if (!paymentIntentId) break;

        const order = getOrderByPaymentIntent(paymentIntentId);
        if (order) {
          // Update order status
          updateOrderStatus(order.id, "refunded");

          // Revoke download tokens
          revokeDownloadTokens(order.id);

          // Update Mailchimp tag
          const customerEmail = (await getOrderByPaymentIntent(paymentIntentId))?.customer_id;
          // Note: Would need to fetch customer email here

          console.log(`[Webhook] Refund processed for order: ${order.id}`);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return Response.json({ error: "Webhook error" }, { status: 500 });
  }
};

// API handler for release-day cron job
const handleReleaseCron = async (req: Request): Promise<Response> => {
  // Verify cron secret (Vercel cron authentication)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPostLaunch()) {
    return Response.json({ message: "Not yet launch time", releaseDate: RELEASE_DATE.toISOString() });
  }

  try {
    // Find all orders without download tokens
    const ordersToFulfill = getOrdersWithoutDownloadTokens();

    console.log(`[ReleaseCron] Found ${ordersToFulfill.length} orders to fulfill`);

    let fulfilled = 0;
    for (const order of ordersToFulfill) {
      // Create download tokens
      const epubToken = createDownloadToken(order.id, "epub", 7);
      const pdfToken = createDownloadToken(order.id, "pdf", 7);

      // Get portal token
      const portalUrl = `${SITE_URL}/portal/${order.id}`; // We'd need to look up the actual portal token

      // Send email
      await sendEbookReady({
        email: order.customer_email,
        name: order.customer_name,
        portalUrl,
        epubDownloadUrl: `${SITE_URL}/download/${epubToken.token}`,
        pdfDownloadUrl: `${SITE_URL}/download/${pdfToken.token}`,
      });

      fulfilled++;
      console.log(`[ReleaseCron] Fulfilled order: ${order.id}`);
    }

    return Response.json({
      message: "Release cron completed",
      fulfilled,
      total: ordersToFulfill.length,
    });
  } catch (error) {
    console.error("[ReleaseCron] Error:", error);
    return Response.json({ error: "Cron error" }, { status: 500 });
  }
};

// API handler for portal token extension
const handleExtendToken = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { portalToken, downloadTokenId } = body;

    // Verify portal token ownership
    const order = getOrderByPortalToken(portalToken);
    if (!order) {
      return Response.json({ error: "Invalid portal token" }, { status: 404 });
    }

    // Extend the download token
    const extended = extendDownloadToken(downloadTokenId, 7);
    if (!extended) {
      return Response.json({ error: "Failed to extend token" }, { status: 500 });
    }

    return Response.json({
      message: "Token extended",
      expiresAt: extended.expires_at,
      downloadsRemaining: extended.max_downloads - extended.downloads_used,
    });
  } catch (error) {
    console.error("[ExtendToken] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};

// API handler for checkout config (frontend)
const handleCheckoutConfig = async (): Promise<Response> => {
  return Response.json(getCheckoutConfig());
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

// Serve download files (EPUB/PDF) from private storage
const serveDownload = async (token: string): Promise<Response> => {
  const downloadToken = getDownloadToken(token);

  if (!downloadToken) {
    return new Response(renderDownloadError("Download link not found", "This download link doesn't exist or may have been removed."), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  const validity = isDownloadValid(downloadToken);
  if (!validity.valid) {
    return new Response(
      renderDownloadError(validity.reason || "Download unavailable", "You can request a new download link from your order portal."),
      { status: 410, headers: { "Content-Type": "text/html" } }
    );
  }

  // Determine file path
  const fileExtension = downloadToken.format;
  const filePath = `./private/CurlsAndContemplation.${fileExtension}`;
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    // Try alternate path
    const altPath = `../CurlsAndContemplation-v4.${fileExtension}`;
    const altFile = Bun.file(altPath);
    if (!(await altFile.exists())) {
      return new Response(renderDownloadError("File not found", "The eBook file could not be located."), {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    }
  }

  // Increment download count
  incrementDownloadCount(downloadToken.id);

  // Stream the file
  const contentType = fileExtension === "epub" ? "application/epub+zip" : "application/pdf";
  const fileName = `CurlsAndContemplation.${fileExtension}`;

  return new Response(file, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
};

// Render download error page
const renderDownloadError = (title: string, message: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Curls & Contemplation</title>
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <div class="container" style="padding-top: 120px; max-width: 600px; text-align: center;">
    <h1 class="display-title" style="color: var(--color-teal-dark);">${title}</h1>
    <p style="margin-bottom: var(--space-md);">${message}</p>
    <a href="/" class="btn btn-primary">Return to Homepage</a>
  </div>
</body>
</html>
`;

const getContentType = (path: string): string => {
  const ext = path.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
    woff2: "font/woff2",
    woff: "font/woff",
    ttf: "font/ttf",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    pdf: "application/pdf",
    epub: "application/epub+zip",
    xml: "application/xml",
    txt: "text/plain",
  };
  return types[ext || ""] || "application/octet-stream";
};

// Generate sitemap with all pages
const generateSitemap = (): string => {
  const pages = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/book", changefreq: "weekly", priority: "0.9" },
    { loc: "/chapters", changefreq: "monthly", priority: "0.8" },
    { loc: "/about", changefreq: "monthly", priority: "0.7" },
    { loc: "/resources", changefreq: "weekly", priority: "0.8" },
    { loc: "/blog", changefreq: "weekly", priority: "0.7" },
    { loc: "/press", changefreq: "monthly", priority: "0.5" },
    { loc: "/newsletter", changefreq: "monthly", priority: "0.6" },
    { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
    { loc: "/terms", changefreq: "yearly", priority: "0.3" },
  ];

  // Add chapter pages
  const chapters = [
    "unveiling-your-creative-odyssey",
    "refining-your-creative-toolkit",
    "reigniting-your-creative-fire",
    "the-art-of-networking-in-freelance-hairstyling",
    "cultivating-creative-excellence-through-mentorship",
    "mastering-the-business-of-hairstyling",
    "embracing-wellness-and-self-care",
    "advancing-skills-through-continuous-education",
    "stepping-into-leadership",
    "crafting-enduring-legacies",
    "advanced-digital-strategies-for-freelance-hairstylists",
    "financial-wisdom-building-sustainable-ventures",
    "embracing-ethics-and-sustainability-in-hairstyling",
    "the-impact-of-ai-on-the-beauty-industry",
    "cultivating-resilience-and-well-being-in-hairstyling",
    "tresses-and-textures-embracing-diversity-in-hairstyling",
  ];

  chapters.forEach((slug) => {
    pages.push({ loc: `/chapter/${slug}`, changefreq: "monthly", priority: "0.6" });
  });

  const urls = pages
    .map(
      (p) => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
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

    "/api/free-resource": {
      POST: handleFreeResource,
    },

    "/api/checkout": {
      POST: handleCheckout,
    },

    "/api/checkout/config": {
      GET: handleCheckoutConfig,
    },

    "/api/validate-coupon": {
      POST: handleValidateCoupon,
    },

    "/api/stripe/webhooks": {
      POST: handleStripeWebhook,
    },

    "/api/cron/release-ebook": {
      POST: handleReleaseCron,
    },

    "/api/portal/extend": {
      POST: handleExtendToken,
    },

    // Admin routes
    "/api/admin/orders": {
      GET: async (req) => {
        // Simple auth check
        const authHeader = req.headers.get("authorization");
        const adminKey = process.env.ADMIN_API_KEY;
        if (adminKey && authHeader !== `Bearer ${adminKey}`) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        return Response.json({ orders: getAllOrders() });
      },
    },

    // Health check
    "/api/health": {
      GET: () =>
        Response.json({
          status: "ok",
          timestamp: new Date().toISOString(),
          isPostLaunch: isPostLaunch(),
          releaseDate: RELEASE_DATE.toISOString(),
        }),
    },

    // Robots.txt
    "/robots.txt": new Response(
      `User-agent: *
Allow: /
Disallow: /portal/
Disallow: /download/
Disallow: /api/
Disallow: /checkout

Sitemap: ${SITE_URL}/sitemap.xml`,
      { headers: { "Content-Type": "text/plain" } }
    ),

    // Sitemap
    "/sitemap.xml": new Response(generateSitemap(), { headers: { "Content-Type": "application/xml" } }),
  },

  // Fallback for static files and SPA routing
  fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Handle download routes
    if (pathname.startsWith("/download/")) {
      const token = pathname.replace("/download/", "");
      return serveDownload(token);
    }

    // Try to serve static file
    return serveStaticFile(pathname).then((response) => {
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Curls & Contemplation - eBook Sales Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Server running at: http://localhost:${server.port}
Launch State: ${isPostLaunch() ? "POST-LAUNCH" : "PRE-ORDER"}
Release Date: ${RELEASE_DATE.toISOString()}

Pages:
  /              Homepage
  /book          Sales Page
  /chapters      Chapter Index
  /chapter/:slug Chapter Preview
  /about         About the Author
  /resources     Free Resources
  /checkout      Checkout
  /thank-you     Order Confirmation
  /portal/:token Order Portal

API Endpoints:
  POST /api/subscribe       Email subscription
  POST /api/free-resource   Free lead magnet
  POST /api/checkout        Create payment intent
  POST /api/stripe/webhooks Stripe webhooks
  POST /api/cron/release    Launch day automation
  GET  /api/health          Health check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
