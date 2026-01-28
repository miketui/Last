// Email module for transactional and marketing emails
// Per SOW: Resend for transactional, Mailchimp for marketing

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER || "us1";
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@curlsandcontemplation.com";
const FROM_NAME = process.env.FROM_NAME || "Curls & Contemplation";
const SITE_URL = process.env.SITE_URL || "https://curlsandcontemplation.com";

// Email templates
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Send email via Resend
export async function sendEmail(data: EmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log("[Email] Would send:", data.subject, "to", data.to);
    return true; // Development mode
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      }),
    });

    if (!response.ok) {
      console.error("[Email] Failed to send:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Email] Error:", error);
    return false;
  }
}

// Order Confirmation Email (Pre-Order)
export async function sendPreOrderConfirmation(data: {
  email: string;
  name?: string;
  orderId: string;
  amount: number;
  portalUrl: string;
  releaseDate: string;
}): Promise<boolean> {
  const formattedAmount = (data.amount / 100).toFixed(2);
  const formattedDate = new Date(data.releaseDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Pre-Order is Confirmed!</title>
</head>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #444; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2B9999; font-family: 'Georgia', serif; margin-bottom: 10px;">Curls & Contemplation</h1>
    <p style="color: #C9A961; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">A Freelance Hairstylist's Guide to Creative Excellence</p>
  </div>

  <div style="background: linear-gradient(135deg, #f9f7f2 0%, #fff 100%); border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #2B9999; margin-top: 0;">Your pre-order is confirmed!</h2>
    <p>Thank you${data.name ? `, ${data.name}` : ""}! Your copy of <em>Curls & Contemplation</em> has been secured.</p>

    <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1a1a1a;">Order Summary</h3>
      <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId.slice(0, 8).toUpperCase()}</p>
      <p style="margin: 5px 0;"><strong>Amount:</strong> $${formattedAmount} USD</p>
      <p style="margin: 5px 0;"><strong>Product:</strong> Curls & Contemplation eBook (EPUB + PDF)</p>
    </div>

    <h3 style="color: #2B9999;">What happens next?</h3>
    <ul style="padding-left: 20px;">
      <li>Your eBook will be delivered on <strong>${formattedDate}</strong> at 10:00 AM CT</li>
      <li>You'll receive an email with direct download links</li>
      <li>Downloads will also be available in your order portal</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.portalUrl}" style="display: inline-block; background: #C9A961; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 4px; font-weight: bold;">View Your Order Portal</a>
    </div>

    <p style="font-size: 14px; color: #888;">Your portal contains your order details and download links when available.</p>
  </div>

  <div style="text-align: center; padding: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888;">
    <p>Questions? Reply to this email or contact ${FROM_EMAIL}</p>
    <p>&copy; ${new Date().getFullYear()} Michael David Warren. All rights reserved.</p>
  </div>
</body>
</html>`;

  const text = `
Your pre-order is confirmed!

Thank you${data.name ? `, ${data.name}` : ""}! Your copy of Curls & Contemplation has been secured.

Order Summary:
- Order ID: ${data.orderId.slice(0, 8).toUpperCase()}
- Amount: $${formattedAmount} USD
- Product: Curls & Contemplation eBook (EPUB + PDF)

What happens next?
- Your eBook will be delivered on ${formattedDate} at 10:00 AM CT
- You'll receive an email with direct download links
- Downloads will also be available in your order portal

View Your Order Portal: ${data.portalUrl}

Questions? Contact ${FROM_EMAIL}
`;

  return sendEmail({
    to: data.email,
    subject: "Your pre-order is confirmed!",
    html,
    text,
  });
}

// eBook Ready Email (Launch Day / Post-Launch)
export async function sendEbookReady(data: {
  email: string;
  name?: string;
  portalUrl: string;
  epubDownloadUrl: string;
  pdfDownloadUrl?: string;
}): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your eBook is Ready!</title>
</head>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #444; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2B9999; font-family: 'Georgia', serif; margin-bottom: 10px;">Curls & Contemplation</h1>
    <p style="color: #C9A961; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">A Freelance Hairstylist's Guide to Creative Excellence</p>
  </div>

  <div style="background: linear-gradient(135deg, #f9f7f2 0%, #fff 100%); border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #2B9999; margin-top: 0;">Your eBook is ready to download!</h2>
    <p>${data.name ? `${data.name}, the` : "The"} wait is over! Your copy of <em>Curls & Contemplation</em> is now available.</p>

    <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #1a1a1a;">Download Your eBook</h3>
      <div style="margin: 20px 0;">
        <a href="${data.epubDownloadUrl}" style="display: inline-block; background: #2B9999; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; margin: 5px;">Download EPUB</a>
        ${data.pdfDownloadUrl ? `<a href="${data.pdfDownloadUrl}" style="display: inline-block; background: #C9A961; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; margin: 5px;">Download PDF</a>` : ""}
      </div>
      <p style="font-size: 12px; color: #888; margin-bottom: 0;">3 downloads per format | Links expire in 7 days</p>
    </div>

    <h3 style="color: #2B9999;">Download Limits</h3>
    <ul style="padding-left: 20px;">
      <li>You have <strong>3 downloads</strong> per format</li>
      <li>Links are valid for <strong>7 days</strong></li>
      <li>Need more time or downloads? Visit your portal to extend</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.portalUrl}" style="display: inline-block; border: 2px solid #2B9999; color: #2B9999; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold;">View Order Portal</a>
    </div>

    <h3 style="color: #2B9999;">Want the paperback?</h3>
    <p>Print editions are available from these retailers:</p>
    <ul style="padding-left: 20px;">
      <li><a href="${SITE_URL}/book?region=us" style="color: #2B9999;">Amazon US</a></li>
      <li><a href="${SITE_URL}/book?region=uk" style="color: #2B9999;">Amazon UK</a></li>
      <li><a href="${SITE_URL}/book?region=ca" style="color: #2B9999;">Amazon CA</a></li>
    </ul>
  </div>

  <div style="text-align: center; padding: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888;">
    <p>Questions? Reply to this email or contact ${FROM_EMAIL}</p>
    <p>&copy; ${new Date().getFullYear()} Michael David Warren. All rights reserved.</p>
  </div>
</body>
</html>`;

  const text = `
Your eBook is ready to download!

${data.name ? `${data.name}, the` : "The"} wait is over! Your copy of Curls & Contemplation is now available.

Download Your eBook:
- EPUB: ${data.epubDownloadUrl}
${data.pdfDownloadUrl ? `- PDF: ${data.pdfDownloadUrl}` : ""}

Download Limits:
- You have 3 downloads per format
- Links are valid for 7 days
- Need more time or downloads? Visit your portal to extend

View Order Portal: ${data.portalUrl}

Want the paperback? Visit ${SITE_URL}/book for print retailers.

Questions? Contact ${FROM_EMAIL}
`;

  return sendEmail({
    to: data.email,
    subject: "Your eBook is ready - download now!",
    html,
    text,
  });
}

// Free Resource Delivery Email
export async function sendFreeResourceDelivery(data: {
  email: string;
  name?: string;
  resourceName: string;
  downloadUrl: string;
}): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${data.resourceName} is Here!</title>
</head>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #444; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2B9999; font-family: 'Georgia', serif; margin-bottom: 10px;">Curls & Contemplation</h1>
    <p style="color: #C9A961; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Free Resource Delivery</p>
  </div>

  <div style="background: linear-gradient(135deg, #f9f7f2 0%, #fff 100%); border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #2B9999; margin-top: 0;">Your ${data.resourceName} is here!</h2>
    <p>Hi${data.name ? ` ${data.name}` : ""}! Here's the free resource you requested.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.downloadUrl}" style="display: inline-block; background: #2B9999; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 4px; font-weight: bold;">Download Now</a>
    </div>

    <h3 style="color: #2B9999;">Here's what's inside:</h3>
    <ul style="padding-left: 20px;">
      <li><strong>Pricing Clarity Worksheet</strong> - See the real worth of what you deliver</li>
      <li><strong>Client Script Templates</strong> - Communicate your value confidently</li>
      <li><strong>12-Point Quick Audit Checklist</strong> - Diagnose why clients don't rebook</li>
    </ul>

    <p>Start with page 1 - your pricing clarity worksheet. It takes about 10 minutes and will transform how you think about your services.</p>

    <div style="background: rgba(43, 153, 153, 0.08); border-left: 4px solid #2B9999; padding: 15px; margin: 20px 0;">
      <h4 style="color: #2B9999; margin-top: 0;">Want the full system?</h4>
      <p style="margin-bottom: 10px;"><em>Curls & Contemplation</em> covers everything in this kit and goes deeper: creative process, client experience design, business strategy, digital marketing, financial wisdom, and building a sustainable career you love.</p>
      <a href="${SITE_URL}/book" style="color: #C9A961; font-weight: bold;">Pre-order the eBook &rarr;</a>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888;">
    <p>Questions? Reply to this email or contact ${FROM_EMAIL}</p>
    <p>&copy; ${new Date().getFullYear()} Michael David Warren. All rights reserved.</p>
  </div>
</body>
</html>`;

  const text = `
Your ${data.resourceName} is here!

Hi${data.name ? ` ${data.name}` : ""}! Here's the free resource you requested.

Download Now: ${data.downloadUrl}

Here's what's inside:
- Pricing Clarity Worksheet - See the real worth of what you deliver
- Client Script Templates - Communicate your value confidently
- 12-Point Quick Audit Checklist - Diagnose why clients don't rebook

Start with page 1 - your pricing clarity worksheet. It takes about 10 minutes and will transform how you think about your services.

Want the full system?
Curls & Contemplation covers everything in this kit and goes deeper. Pre-order at ${SITE_URL}/book

Questions? Contact ${FROM_EMAIL}
`;

  return sendEmail({
    to: data.email,
    subject: `Your ${data.resourceName} is here!`,
    html,
    text,
  });
}

// Mailchimp: Add/update subscriber with tags
export async function addToMailchimp(data: {
  email: string;
  name?: string;
  tags: string[];
}): Promise<boolean> {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID) {
    console.log("[Mailchimp] Would add:", data.email, "with tags:", data.tags);
    return true; // Development mode
  }

  const subscriberHash = await hashEmail(data.email);
  const url = `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`;

  try {
    // Upsert member
    const memberResponse = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
      },
      body: JSON.stringify({
        email_address: data.email,
        status_if_new: "subscribed",
        merge_fields: {
          FNAME: data.name?.split(" ")[0] || "",
          LNAME: data.name?.split(" ").slice(1).join(" ") || "",
        },
      }),
    });

    if (!memberResponse.ok) {
      console.error("[Mailchimp] Failed to add member:", await memberResponse.text());
      return false;
    }

    // Add tags
    if (data.tags.length > 0) {
      const tagsUrl = `${url}/tags`;
      const tagsResponse = await fetch(tagsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify({
          tags: data.tags.map((tag) => ({ name: tag, status: "active" })),
        }),
      });

      if (!tagsResponse.ok) {
        console.error("[Mailchimp] Failed to add tags:", await tagsResponse.text());
      }
    }

    return true;
  } catch (error) {
    console.error("[Mailchimp] Error:", error);
    return false;
  }
}

// Helper to hash email for Mailchimp
async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase());
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Mailchimp tags per SOW
export const MAILCHIMP_TAGS = {
  LEAD_FREEBIE: "lead_freebie",
  CUSTOMER_PREORDER: "customer_preorder",
  CUSTOMER_POSTLAUNCH: "customer_postlaunch",
  REFUNDED: "refunded",
} as const;
