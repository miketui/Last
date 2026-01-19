import index from "./index.html";
import {
  addSubscriber,
  getSubscriber,
  getOrCreateCustomer,
  createOrder,
  updateOrderStatus,
  getCompletedOrdersByEmail,
  createDownloadToken,
  validateAndIncrementDownload,
  getTokensByOrderId,
  getOrderById,
} from "./lib/database";
import {
  createCheckoutSession,
  getCheckoutSession,
  verifyWebhookSignature,
  parseWebhookEvent,
  PRODUCTS,
  POD_LINKS,
} from "./lib/stripe";

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

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existing = getSubscriber(email);
    if (existing) {
      return new Response(JSON.stringify({ message: "Already subscribed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const subscriber = addSubscriber(email, source || "unknown");
    if (!subscriber) {
      throw new Error("Failed to add subscriber");
    }

    console.log(`New subscriber: ${email} from ${source}`);

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

// Create checkout session
const handleCreateCheckout = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { productId, email } = body;

    if (!productId || !PRODUCTS[productId as keyof typeof PRODUCTS]) {
      return new Response(JSON.stringify({ error: "Invalid product" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const product = PRODUCTS[productId as keyof typeof PRODUCTS];
    const session = await createCheckoutSession({
      productId: productId as keyof typeof PRODUCTS,
      customerEmail: email,
    });

    // Create customer and order in database
    if (email) {
      const customer = getOrCreateCustomer(email);
      createOrder(customer.id, product.type, product.priceCents, session.id);
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create checkout" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Verify order and get details
const handleGetOrder = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Session ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = await getCheckoutSession(sessionId);
    if (!session) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update order status if payment completed
    if (session.payment_status === "paid") {
      const order = updateOrderStatus(sessionId, "completed");

      // Create download token if order found
      if (order) {
        const existingTokens = getTokensByOrderId(order.id);
        let token = existingTokens[0];
        if (!token) {
          token = createDownloadToken(order.id, 72);
        }

        return new Response(
          JSON.stringify({
            success: true,
            order: {
              id: order.id,
              productType: order.product_type,
              status: order.status,
              email: session.customer_email,
            },
            downloadToken: token.token,
            downloadExpiry: token.expires_at,
            downloadsRemaining: token.max_downloads - token.download_count,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        paymentStatus: session.payment_status,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Get order error:", error);
    return new Response(JSON.stringify({ error: "Failed to retrieve order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Order portal - lookup orders by email
const handleOrderPortal = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const orders = getCompletedOrdersByEmail(email);

    if (orders.length === 0) {
      return new Response(
        JSON.stringify({
          found: false,
          message: "No orders found for this email address",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get download tokens for each order
    const ordersWithTokens = orders.map((order) => {
      const tokens = getTokensByOrderId(order.id);
      let activeToken = tokens.find(
        (t) => new Date(t.expires_at) > new Date() && t.download_count < t.max_downloads
      );

      // Create new token if none active
      if (!activeToken) {
        activeToken = createDownloadToken(order.id, 72);
      }

      return {
        id: order.id,
        productType: order.product_type,
        purchaseDate: order.created_at,
        downloadToken: activeToken.token,
        downloadExpiry: activeToken.expires_at,
        downloadsRemaining: activeToken.max_downloads - activeToken.download_count,
      };
    });

    return new Response(
      JSON.stringify({
        found: true,
        orders: ordersWithTokens,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Order portal error:", error);
    return new Response(JSON.stringify({ error: "Failed to lookup orders" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Download endpoint with token validation
const handleDownload = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ error: "Download token required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = validateAndIncrementDownload(token);

    if (!result.valid) {
      return new Response(
        JSON.stringify({
          error: result.reason,
          expired: result.reason === "Token has expired",
          limitReached: result.reason === "Download limit reached",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the order to determine product type
    const downloadToken = result.token!;
    const order = getOrderById(downloadToken.order_id);

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Serve the eBook file
    const ebookPath = "./downloads/curls-and-contemplation.epub";
    const file = Bun.file(ebookPath);

    if (!(await file.exists())) {
      // In production, this would serve the actual file
      // For now, return a placeholder response
      return new Response(
        JSON.stringify({
          message: "Download validated",
          downloadsRemaining: downloadToken.max_downloads - downloadToken.download_count,
          note: "eBook file would be served here in production",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(file, {
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": 'attachment; filename="curls-and-contemplation.epub"',
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new Response(JSON.stringify({ error: "Download failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Stripe webhook handler
const handleWebhook = async (req: Request): Promise<Response> => {
  try {
    const signature = req.headers.get("stripe-signature");
    const payload = await req.text();

    if (signature) {
      const isValid = await verifyWebhookSignature(payload, signature);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const event = parseWebhookEvent(payload);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const order = updateOrderStatus(session.id, "completed");

        if (order) {
          // Create download token
          createDownloadToken(order.id, 72);

          // In production: send confirmation email with download link
          console.log(`Order completed: ${order.id} for ${session.customer_email}`);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        updateOrderStatus(session.id, "expired");
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Get products endpoint
const handleGetProducts = (): Response => {
  const products = Object.entries(PRODUCTS).map(([id, product]) => ({
    id,
    name: product.name,
    description: product.description,
    price: product.priceCents / 100,
    priceCents: product.priceCents,
    type: product.type,
  }));

  return new Response(JSON.stringify({ products, podLinks: POD_LINKS }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
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
    epub: "application/epub+zip",
  };
  return types[ext || ""] || "application/octet-stream";
};

// Legal page HTML template
const legalPageTemplate = (title: string, content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Curls & Contemplation</title>
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <div class="container" style="padding-top: 120px; max-width: 800px; padding-bottom: 60px;">
    <h1 class="display-title">${title}</h1>
    <p style="color: var(--color-muted); margin-bottom: var(--space-lg);">Last updated: ${new Date().toISOString().split("T")[0]}</p>
    ${content}
    <p style="margin-top: var(--space-xl);"><a href="/" class="btn btn-outline">Back to Home</a></p>
  </div>
</body>
</html>`;

// Privacy policy content
const privacyContent = `
<h2>Information We Collect</h2>
<p>We collect the following types of information:</p>
<ul>
  <li><strong>Email address:</strong> When you subscribe to our newsletter or make a purchase</li>
  <li><strong>Payment information:</strong> Processed securely through Stripe (we do not store card details)</li>
  <li><strong>Usage data:</strong> Anonymous analytics to improve our website</li>
</ul>

<h2>How We Use Your Information</h2>
<ul>
  <li>Send book launch updates and exclusive content</li>
  <li>Process your orders and deliver digital products</li>
  <li>Provide customer support</li>
  <li>Send promotional communications (with your consent)</li>
</ul>

<h2>Data Security</h2>
<p>We implement appropriate security measures to protect your personal information. Payment processing is handled by Stripe, a PCI-compliant payment processor.</p>

<h2>Your Rights</h2>
<p>You have the right to:</p>
<ul>
  <li>Access your personal data</li>
  <li>Request correction of your data</li>
  <li>Request deletion of your data</li>
  <li>Unsubscribe from marketing emails at any time</li>
</ul>

<h2>Contact</h2>
<p>For privacy-related questions, please contact us through the website.</p>
`;

// Terms of service content
const termsContent = `
<h2>Agreement to Terms</h2>
<p>By accessing or using our website and purchasing our products, you agree to be bound by these Terms of Service.</p>

<h2>Digital Products</h2>
<p>When you purchase a digital product (eBook):</p>
<ul>
  <li>You receive a non-exclusive, non-transferable license to use the content for personal purposes</li>
  <li>You may download the file up to 5 times within 72 hours of purchase</li>
  <li>You may not redistribute, resell, or share the digital files</li>
  <li>All sales of digital products are final</li>
</ul>

<h2>Pre-Orders</h2>
<p>For print-on-demand books ordered through third-party platforms (Amazon), the terms and refund policies of those platforms apply.</p>

<h2>Intellectual Property</h2>
<p>All content, including text, images, and designs, is protected by copyright and owned by Michael David Warren unless otherwise stated.</p>

<h2>Limitation of Liability</h2>
<p>We provide our products and services "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages.</p>

<h2>Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Continued use of the website constitutes acceptance of updated terms.</p>
`;

// Cookie policy content
const cookieContent = `
<h2>What Are Cookies</h2>
<p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience.</p>

<h2>Cookies We Use</h2>
<h3>Essential Cookies</h3>
<p>Required for the website to function properly. These cannot be disabled.</p>
<ul>
  <li>Session management</li>
  <li>Security tokens</li>
</ul>

<h3>Analytics Cookies</h3>
<p>Help us understand how visitors interact with our website.</p>
<ul>
  <li>Google Analytics (anonymized)</li>
  <li>Page view tracking</li>
</ul>

<h3>Marketing Cookies</h3>
<p>Used to track the effectiveness of our marketing campaigns.</p>

<h2>Managing Cookies</h2>
<p>You can control cookies through your browser settings. Note that disabling certain cookies may affect website functionality.</p>

<h2>Third-Party Cookies</h2>
<p>We use services from third parties (Stripe, Google Analytics) that may set their own cookies. Please refer to their privacy policies for more information.</p>
`;

// Pre-order policy content
const preorderContent = `
<h2>eBook Pre-Orders</h2>
<p>When you pre-order the eBook directly from our website:</p>
<ul>
  <li>Your payment will be processed immediately</li>
  <li>You will receive download access when the book is released</li>
  <li>Pre-order customers receive early access before public availability</li>
</ul>

<h2>Print Book Pre-Orders</h2>
<p>Print-on-demand books are ordered through Amazon. Pre-order terms and delivery are governed by Amazon's policies.</p>

<h2>Refund Policy</h2>
<h3>Digital Products</h3>
<p>Due to the nature of digital products, all sales are final once download access has been provided. If you experience technical issues, please contact us for support.</p>

<h3>Print Books</h3>
<p>Refunds for print books are handled by the retailer (Amazon) according to their return policy.</p>

<h2>Delivery</h2>
<ul>
  <li><strong>eBook:</strong> Instant delivery via download link sent to your email</li>
  <li><strong>Print Book:</strong> Shipping times vary by location and are determined by Amazon</li>
</ul>

<h2>Contact</h2>
<p>For questions about your order, please email us or use the Order Portal to access your purchases.</p>
`;

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

    "/api/checkout": {
      POST: handleCreateCheckout,
    },

    "/api/order": {
      GET: handleGetOrder,
    },

    "/api/orders": {
      POST: handleOrderPortal,
    },

    "/api/download": {
      GET: handleDownload,
    },

    "/api/products": {
      GET: handleGetProducts,
    },

    "/api/webhook": {
      POST: handleWebhook,
    },

    // Health check
    "/api/health": {
      GET: () =>
        new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
          headers: { "Content-Type": "application/json" },
        }),
    },

    // Legal pages
    "/privacy": new Response(legalPageTemplate("Privacy Policy", privacyContent), {
      headers: { "Content-Type": "text/html" },
    }),

    "/terms": new Response(legalPageTemplate("Terms of Service", termsContent), {
      headers: { "Content-Type": "text/html" },
    }),

    "/cookies": new Response(legalPageTemplate("Cookie Policy", cookieContent), {
      headers: { "Content-Type": "text/html" },
    }),

    "/pre-order-policy": new Response(legalPageTemplate("Pre-Order & Refund Policy", preorderContent), {
      headers: { "Content-Type": "text/html" },
    }),

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
    <loc>https://curlsandcontemplation.com/#pre-order</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
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
    <loc>https://curlsandcontemplation.com/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://curlsandcontemplation.com/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`,
      { headers: { "Content-Type": "application/xml" } }
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
Curls & Contemplation Author Website
------------------------------------
Server running at: http://localhost:${server.port}

Available routes:
  - /              Homepage
  - /pre-order     Pre-Order Page
  - /book-preview  Table of Contents
  - /about         About the Author
  - /resources     Free Resources
  - /newsletter    Newsletter Signup
  - /order-portal  Access Your Purchases
  - /privacy       Privacy Policy
  - /terms         Terms of Service
  - /cookies       Cookie Policy

API endpoints:
  - POST /api/subscribe    Email subscription
  - POST /api/checkout     Create Stripe checkout
  - GET  /api/order        Get order details
  - POST /api/orders       Order portal lookup
  - GET  /api/download     Download with token
  - GET  /api/products     Get products & PoD links
  - POST /api/webhook      Stripe webhooks
  - GET  /api/health       Health check
------------------------------------
`);
