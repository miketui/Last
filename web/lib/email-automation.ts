// Email Automation System
// Manages automated email sequences, scheduling, and sending for:
// - Welcome/thank you emails for newsletter signup
// - Pre-order/purchase thank you emails
// - Launch reminder sequences
// - Nurture email campaigns
// - Newsletter broadcasts

import { db, generateToken } from "./database";
import { sendEmail, addToMailchimp, MAILCHIMP_TAGS } from "./email";

const SITE_URL = process.env.SITE_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@curlsandcontemplation.com";

// ============================================================================
// DATABASE SCHEMA FOR EMAIL AUTOMATION
// ============================================================================

// Initialize email automation tables
db.exec(`
  -- Email sequences (e.g., welcome series, launch reminders)
  CREATE TABLE IF NOT EXISTS email_sequences (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    trigger_type TEXT CHECK(trigger_type IN ('signup', 'purchase', 'preorder', 'manual', 'date')) NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Individual emails within a sequence
  CREATE TABLE IF NOT EXISTS sequence_emails (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    sequence_id TEXT NOT NULL REFERENCES email_sequences(id),
    position INTEGER NOT NULL,
    subject TEXT NOT NULL,
    template_key TEXT NOT NULL,
    delay_hours INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(sequence_id, position)
  );

  -- Scheduled emails queue
  CREATE TABLE IF NOT EXISTS email_queue (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT NOT NULL,
    template_key TEXT NOT NULL,
    template_data TEXT,
    scheduled_for TEXT NOT NULL,
    sequence_id TEXT REFERENCES email_sequences(id),
    sequence_email_id TEXT REFERENCES sequence_emails(id),
    status TEXT CHECK(status IN ('pending', 'sent', 'failed', 'cancelled')) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    sent_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Track which sequence emails a subscriber has received
  CREATE TABLE IF NOT EXISTS subscriber_sequence_progress (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    subscriber_email TEXT NOT NULL,
    sequence_id TEXT NOT NULL REFERENCES email_sequences(id),
    last_email_position INTEGER DEFAULT 0,
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    is_active INTEGER DEFAULT 1,
    UNIQUE(subscriber_email, sequence_id)
  );

  -- Newsletter broadcasts (one-time sends to segments)
  CREATE TABLE IF NOT EXISTS newsletter_broadcasts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_key TEXT NOT NULL,
    segment TEXT,
    scheduled_for TEXT,
    status TEXT CHECK(status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')) DEFAULT 'draft',
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    sent_at TEXT
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for, status);
  CREATE INDEX IF NOT EXISTS idx_email_queue_recipient ON email_queue(recipient_email);
  CREATE INDEX IF NOT EXISTS idx_sequence_progress_email ON subscriber_sequence_progress(subscriber_email);
`);

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export const EMAIL_TEMPLATES = {
  // Welcome/Thank you for signing up
  welcome_signup: {
    subject: "Welcome to Curls & Contemplation!",
    generate: (data: { name?: string; downloadUrl?: string }) => ({
      html: generateWelcomeEmail(data),
      text: generateWelcomeEmailText(data),
    }),
  },

  // Pre-order thank you
  preorder_thanks: {
    subject: "Your pre-order is confirmed!",
    generate: (data: { name?: string; orderId: string; amount: number; portalUrl: string; releaseDate: string }) => ({
      html: generatePreorderThanksEmail(data),
      text: generatePreorderThanksEmailText(data),
    }),
  },

  // Purchase thank you (post-launch)
  purchase_thanks: {
    subject: "Your eBook is ready!",
    generate: (data: { name?: string; portalUrl: string; epubUrl: string; pdfUrl: string }) => ({
      html: generatePurchaseThanksEmail(data),
      text: generatePurchaseThanksEmailText(data),
    }),
  },

  // Launch reminder - 7 days before
  launch_reminder_7day: {
    subject: "7 days until your eBook arrives!",
    generate: (data: { name?: string; releaseDate: string; portalUrl: string }) => ({
      html: generateLaunchReminderEmail(data, 7),
      text: generateLaunchReminderEmailText(data, 7),
    }),
  },

  // Launch reminder - 1 day before
  launch_reminder_1day: {
    subject: "Tomorrow: Your eBook is almost here!",
    generate: (data: { name?: string; releaseDate: string; portalUrl: string }) => ({
      html: generateLaunchReminderEmail(data, 1),
      text: generateLaunchReminderEmailText(data, 1),
    }),
  },

  // Launch day announcement
  launch_day: {
    subject: "It's here! Download your eBook now",
    generate: (data: { name?: string; portalUrl: string; epubUrl?: string; pdfUrl?: string }) => ({
      html: generateLaunchDayEmail(data),
      text: generateLaunchDayEmailText(data),
    }),
  },

  // Nurture email 1 - Value delivery
  nurture_value_1: {
    subject: "The #1 mistake stylists make with pricing",
    generate: (data: { name?: string }) => ({
      html: generateNurtureEmail1(data),
      text: generateNurtureEmail1Text(data),
    }),
  },

  // Nurture email 2 - Social proof
  nurture_value_2: {
    subject: "How Sarah doubled her rebooking rate",
    generate: (data: { name?: string }) => ({
      html: generateNurtureEmail2(data),
      text: generateNurtureEmail2Text(data),
    }),
  },

  // Nurture email 3 - Soft sell
  nurture_value_3: {
    subject: "Ready to transform your freelance career?",
    generate: (data: { name?: string }) => ({
      html: generateNurtureEmail3(data),
      text: generateNurtureEmail3Text(data),
    }),
  },

  // Newsletter template
  newsletter: {
    subject: "", // Set dynamically
    generate: (data: { name?: string; subject: string; content: string; ctaText?: string; ctaUrl?: string }) => ({
      html: generateNewsletterEmail(data),
      text: generateNewsletterEmailText(data),
    }),
  },
} as const;

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;

// ============================================================================
// SEQUENCE MANAGEMENT
// ============================================================================

// Pre-defined sequences
export const SEQUENCES = {
  // Welcome sequence for new subscribers (lead magnet)
  WELCOME_SUBSCRIBER: {
    name: "welcome_subscriber",
    description: "Welcome sequence for newsletter subscribers who download the free resource",
    trigger: "signup" as const,
    emails: [
      { position: 1, template: "welcome_signup" as const, delayHours: 0 },
      { position: 2, template: "nurture_value_1" as const, delayHours: 48 },
      { position: 3, template: "nurture_value_2" as const, delayHours: 96 },
      { position: 4, template: "nurture_value_3" as const, delayHours: 168 },
    ],
  },

  // Pre-order confirmation and reminders
  PREORDER_SEQUENCE: {
    name: "preorder_sequence",
    description: "Pre-order confirmation and launch reminders",
    trigger: "preorder" as const,
    emails: [
      { position: 1, template: "preorder_thanks" as const, delayHours: 0 },
      // Launch reminders are scheduled based on release date, not delay
    ],
  },

  // Post-purchase sequence
  PURCHASE_SEQUENCE: {
    name: "purchase_sequence",
    description: "Post-purchase thank you and onboarding",
    trigger: "purchase" as const,
    emails: [{ position: 1, template: "purchase_thanks" as const, delayHours: 0 }],
  },
};

// Initialize default sequences
export function initializeSequences() {
  for (const [key, seq] of Object.entries(SEQUENCES)) {
    // Create or update sequence
    db.prepare(`
      INSERT INTO email_sequences (name, description, trigger_type, is_active)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(name) DO UPDATE SET description = excluded.description
    `).run(seq.name, seq.description, seq.trigger);

    // Get sequence ID
    const sequence = db.prepare("SELECT id FROM email_sequences WHERE name = ?").get(seq.name) as { id: string };

    // Add emails to sequence
    for (const email of seq.emails) {
      db.prepare(`
        INSERT INTO sequence_emails (sequence_id, position, subject, template_key, delay_hours, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
        ON CONFLICT(sequence_id, position) DO UPDATE SET
          subject = excluded.subject,
          template_key = excluded.template_key,
          delay_hours = excluded.delay_hours
      `).run(
        sequence.id,
        email.position,
        EMAIL_TEMPLATES[email.template].subject,
        email.template,
        email.delayHours
      );
    }
  }

  console.log("[EmailAutomation] Sequences initialized");
}

// ============================================================================
// EMAIL QUEUE OPERATIONS
// ============================================================================

export interface QueuedEmail {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  template_key: string;
  template_data: string | null;
  scheduled_for: string;
  sequence_id: string | null;
  sequence_email_id: string | null;
  status: "pending" | "sent" | "failed" | "cancelled";
  attempts: number;
  last_error: string | null;
  sent_at: string | null;
  created_at: string;
}

// Add email to queue
export function queueEmail(data: {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  templateKey: EmailTemplateKey;
  templateData?: Record<string, any>;
  scheduledFor: Date;
  sequenceId?: string;
  sequenceEmailId?: string;
}): QueuedEmail {
  const stmt = db.prepare(`
    INSERT INTO email_queue (recipient_email, recipient_name, subject, template_key, template_data, scheduled_for, sequence_id, sequence_email_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `);

  return stmt.get(
    data.recipientEmail.toLowerCase(),
    data.recipientName || null,
    data.subject,
    data.templateKey,
    data.templateData ? JSON.stringify(data.templateData) : null,
    data.scheduledFor.toISOString(),
    data.sequenceId || null,
    data.sequenceEmailId || null
  ) as QueuedEmail;
}

// Get pending emails ready to send
export function getPendingEmails(limit: number = 50): QueuedEmail[] {
  return db
    .prepare(
      `
    SELECT * FROM email_queue
    WHERE status = 'pending' AND scheduled_for <= datetime('now')
    ORDER BY scheduled_for ASC
    LIMIT ?
  `
    )
    .all(limit) as QueuedEmail[];
}

// Mark email as sent
export function markEmailSent(emailId: string) {
  return db
    .prepare(
      `
    UPDATE email_queue
    SET status = 'sent', sent_at = datetime('now')
    WHERE id = ?
    RETURNING *
  `
    )
    .get(emailId) as QueuedEmail;
}

// Mark email as failed
export function markEmailFailed(emailId: string, error: string) {
  return db
    .prepare(
      `
    UPDATE email_queue
    SET status = CASE WHEN attempts >= 3 THEN 'failed' ELSE status END,
        attempts = attempts + 1,
        last_error = ?
    WHERE id = ?
    RETURNING *
  `
    )
    .get(error, emailId) as QueuedEmail;
}

// Cancel queued emails for a recipient
export function cancelQueuedEmails(recipientEmail: string, sequenceId?: string) {
  if (sequenceId) {
    return db
      .prepare(
        `
      UPDATE email_queue
      SET status = 'cancelled'
      WHERE recipient_email = ? AND sequence_id = ? AND status = 'pending'
    `
      )
      .run(recipientEmail.toLowerCase(), sequenceId);
  }

  return db
    .prepare(
      `
    UPDATE email_queue
    SET status = 'cancelled'
    WHERE recipient_email = ? AND status = 'pending'
  `
    )
    .run(recipientEmail.toLowerCase());
}

// ============================================================================
// SEQUENCE ENROLLMENT
// ============================================================================

// Enroll subscriber in a sequence
export function enrollInSequence(
  email: string,
  sequenceName: string,
  templateData?: Record<string, any>
): boolean {
  const sequence = db
    .prepare("SELECT * FROM email_sequences WHERE name = ? AND is_active = 1")
    .get(sequenceName) as { id: string; name: string } | null;

  if (!sequence) {
    console.error(`[EmailAutomation] Sequence not found: ${sequenceName}`);
    return false;
  }

  // Check if already enrolled and active
  const existing = db
    .prepare(
      `
    SELECT * FROM subscriber_sequence_progress
    WHERE subscriber_email = ? AND sequence_id = ? AND is_active = 1
  `
    )
    .get(email.toLowerCase(), sequence.id);

  if (existing) {
    console.log(`[EmailAutomation] Already enrolled in ${sequenceName}: ${email}`);
    return false;
  }

  // Create enrollment
  db.prepare(`
    INSERT INTO subscriber_sequence_progress (subscriber_email, sequence_id, last_email_position, is_active)
    VALUES (?, ?, 0, 1)
    ON CONFLICT(subscriber_email, sequence_id) DO UPDATE SET is_active = 1, last_email_position = 0, started_at = datetime('now')
  `).run(email.toLowerCase(), sequence.id);

  // Queue sequence emails
  const sequenceEmails = db
    .prepare(
      `
    SELECT * FROM sequence_emails
    WHERE sequence_id = ? AND is_active = 1
    ORDER BY position ASC
  `
    )
    .all(sequence.id) as Array<{
    id: string;
    sequence_id: string;
    position: number;
    subject: string;
    template_key: string;
    delay_hours: number;
  }>;

  const subscriber = db.prepare("SELECT name FROM subscribers WHERE email = ?").get(email.toLowerCase()) as {
    name: string | null;
  } | null;

  for (const seqEmail of sequenceEmails) {
    const scheduledFor = new Date(Date.now() + seqEmail.delay_hours * 60 * 60 * 1000);

    queueEmail({
      recipientEmail: email,
      recipientName: subscriber?.name || undefined,
      subject: seqEmail.subject,
      templateKey: seqEmail.template_key as EmailTemplateKey,
      templateData: { ...templateData, name: subscriber?.name },
      scheduledFor,
      sequenceId: sequence.id,
      sequenceEmailId: seqEmail.id,
    });
  }

  console.log(`[EmailAutomation] Enrolled ${email} in sequence: ${sequenceName}`);
  return true;
}

// ============================================================================
// LAUNCH REMINDER SCHEDULING
// ============================================================================

// Schedule launch reminders for pre-order customers
export function scheduleLaunchReminders(
  email: string,
  name: string | undefined,
  portalUrl: string,
  releaseDate: Date
) {
  const now = new Date();

  // 7-day reminder (only if more than 7 days until launch)
  const sevenDaysBefore = new Date(releaseDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (sevenDaysBefore > now) {
    queueEmail({
      recipientEmail: email,
      recipientName: name,
      subject: EMAIL_TEMPLATES.launch_reminder_7day.subject,
      templateKey: "launch_reminder_7day",
      templateData: { name, releaseDate: releaseDate.toISOString(), portalUrl },
      scheduledFor: sevenDaysBefore,
    });
  }

  // 1-day reminder (only if more than 1 day until launch)
  const oneDayBefore = new Date(releaseDate.getTime() - 24 * 60 * 60 * 1000);
  if (oneDayBefore > now) {
    queueEmail({
      recipientEmail: email,
      recipientName: name,
      subject: EMAIL_TEMPLATES.launch_reminder_1day.subject,
      templateKey: "launch_reminder_1day",
      templateData: { name, releaseDate: releaseDate.toISOString(), portalUrl },
      scheduledFor: oneDayBefore,
    });
  }

  // Launch day email
  queueEmail({
    recipientEmail: email,
    recipientName: name,
    subject: EMAIL_TEMPLATES.launch_day.subject,
    templateKey: "launch_day",
    templateData: { name, portalUrl },
    scheduledFor: releaseDate,
  });

  console.log(`[EmailAutomation] Scheduled launch reminders for ${email}`);
}

// ============================================================================
// NEWSLETTER BROADCASTS
// ============================================================================

export interface NewsletterBroadcast {
  id: string;
  name: string;
  subject: string;
  template_key: string;
  segment: string | null;
  scheduled_for: string | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
  sent_count: number;
  failed_count: number;
  created_at: string;
  sent_at: string | null;
}

// Create a newsletter broadcast
export function createBroadcast(data: {
  name: string;
  subject: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  segment?: string;
  scheduledFor?: Date;
}): NewsletterBroadcast {
  const templateData = {
    subject: data.subject,
    content: data.content,
    ctaText: data.ctaText,
    ctaUrl: data.ctaUrl,
  };

  const stmt = db.prepare(`
    INSERT INTO newsletter_broadcasts (name, subject, template_key, segment, scheduled_for, status)
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `);

  // Store template data in a separate column or encode in template_key
  return stmt.get(
    data.name,
    data.subject,
    `newsletter:${JSON.stringify(templateData)}`,
    data.segment || null,
    data.scheduledFor?.toISOString() || null,
    data.scheduledFor ? "scheduled" : "draft"
  ) as NewsletterBroadcast;
}

// Get subscribers by segment for broadcast
export function getSubscribersBySegment(segment?: string): Array<{ email: string; name: string | null }> {
  if (!segment) {
    return db.prepare("SELECT email, name FROM subscribers WHERE confirmed = 1 OR confirmed = 0").all() as Array<{
      email: string;
      name: string | null;
    }>;
  }

  // Segment by tags
  return db
    .prepare(
      `
    SELECT email, name FROM subscribers
    WHERE (confirmed = 1 OR confirmed = 0) AND tags LIKE ?
  `
    )
    .all(`%${segment}%`) as Array<{ email: string; name: string | null }>;
}

// Queue broadcast for sending
export function queueBroadcast(broadcastId: string): number {
  const broadcast = db.prepare("SELECT * FROM newsletter_broadcasts WHERE id = ?").get(broadcastId) as NewsletterBroadcast | null;

  if (!broadcast || broadcast.status === "sent" || broadcast.status === "sending") {
    return 0;
  }

  // Parse template data from template_key
  const templateDataStr = broadcast.template_key.replace("newsletter:", "");
  const templateData = JSON.parse(templateDataStr);

  // Get subscribers
  const subscribers = getSubscribersBySegment(broadcast.segment || undefined);

  // Queue emails
  const scheduledFor = broadcast.scheduled_for ? new Date(broadcast.scheduled_for) : new Date();

  for (const sub of subscribers) {
    queueEmail({
      recipientEmail: sub.email,
      recipientName: sub.name || undefined,
      subject: broadcast.subject,
      templateKey: "newsletter",
      templateData: { ...templateData, name: sub.name },
      scheduledFor,
    });
  }

  // Update broadcast status
  db.prepare(`
    UPDATE newsletter_broadcasts
    SET status = 'scheduled'
    WHERE id = ?
  `).run(broadcastId);

  console.log(`[EmailAutomation] Queued broadcast ${broadcast.name} to ${subscribers.length} subscribers`);
  return subscribers.length;
}

// ============================================================================
// EMAIL SENDING
// ============================================================================

// Process and send queued emails
export async function processEmailQueue(limit: number = 50): Promise<{ sent: number; failed: number }> {
  const pendingEmails = getPendingEmails(limit);
  let sent = 0;
  let failed = 0;

  for (const email of pendingEmails) {
    try {
      // Get template
      const templateKey = email.template_key as EmailTemplateKey;
      const template = EMAIL_TEMPLATES[templateKey];

      if (!template) {
        console.error(`[EmailAutomation] Unknown template: ${templateKey}`);
        markEmailFailed(email.id, `Unknown template: ${templateKey}`);
        failed++;
        continue;
      }

      // Generate email content
      const templateData = email.template_data ? JSON.parse(email.template_data) : {};
      const content = template.generate(templateData);

      // Send email
      const success = await sendEmail({
        to: email.recipient_email,
        subject: email.subject,
        html: content.html,
        text: content.text,
      });

      if (success) {
        markEmailSent(email.id);
        sent++;
        console.log(`[EmailAutomation] Sent: ${email.subject} to ${email.recipient_email}`);
      } else {
        markEmailFailed(email.id, "Send failed");
        failed++;
      }
    } catch (error: any) {
      markEmailFailed(email.id, error.message || "Unknown error");
      failed++;
      console.error(`[EmailAutomation] Error sending to ${email.recipient_email}:`, error);
    }
  }

  return { sent, failed };
}

// ============================================================================
// TRIGGERED AUTOMATIONS
// ============================================================================

// Called when someone signs up for newsletter / downloads lead magnet
export async function onSubscriberSignup(email: string, name?: string, source?: string) {
  // Add to Mailchimp
  await addToMailchimp({
    email,
    name,
    tags: [MAILCHIMP_TAGS.LEAD_FREEBIE],
  });

  // Enroll in welcome sequence
  enrollInSequence(email, SEQUENCES.WELCOME_SUBSCRIBER.name, { name });
}

// Called when someone pre-orders
export async function onPreOrder(
  email: string,
  name: string | undefined,
  orderId: string,
  amount: number,
  portalUrl: string,
  releaseDate: Date
) {
  // Add to Mailchimp
  await addToMailchimp({
    email,
    name,
    tags: [MAILCHIMP_TAGS.CUSTOMER_PREORDER],
  });

  // Queue immediate confirmation
  queueEmail({
    recipientEmail: email,
    recipientName: name,
    subject: EMAIL_TEMPLATES.preorder_thanks.subject,
    templateKey: "preorder_thanks",
    templateData: {
      name,
      orderId,
      amount,
      portalUrl,
      releaseDate: releaseDate.toISOString(),
    },
    scheduledFor: new Date(),
  });

  // Schedule launch reminders
  scheduleLaunchReminders(email, name, portalUrl, releaseDate);

  // Cancel nurture sequence if enrolled (they've already bought)
  cancelQueuedEmails(email, SEQUENCES.WELCOME_SUBSCRIBER.name);
}

// Called when someone purchases (post-launch)
export async function onPurchase(
  email: string,
  name: string | undefined,
  portalUrl: string,
  epubUrl: string,
  pdfUrl: string
) {
  // Add to Mailchimp
  await addToMailchimp({
    email,
    name,
    tags: [MAILCHIMP_TAGS.CUSTOMER_POSTLAUNCH],
  });

  // Queue thank you email
  queueEmail({
    recipientEmail: email,
    recipientName: name,
    subject: EMAIL_TEMPLATES.purchase_thanks.subject,
    templateKey: "purchase_thanks",
    templateData: { name, portalUrl, epubUrl, pdfUrl },
    scheduledFor: new Date(),
  });

  // Cancel nurture sequence if enrolled (they've already bought)
  cancelQueuedEmails(email, SEQUENCES.WELCOME_SUBSCRIBER.name);
}

// ============================================================================
// EMAIL TEMPLATE GENERATORS
// ============================================================================

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #444; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f7f2;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2B9999; font-family: 'Georgia', serif; margin-bottom: 10px; font-size: 24px;">Curls & Contemplation</h1>
    <p style="color: #C9A961; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">A Freelance Hairstylist's Guide to Creative Excellence</p>
  </div>

  <div style="background: #fff; border-radius: 8px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
    ${content}
  </div>

  <div style="text-align: center; padding: 20px; font-size: 12px; color: #888;">
    <p>Questions? Reply to this email or contact ${FROM_EMAIL}</p>
    <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} Michael David Warren. All rights reserved.</p>
    <p style="margin-top: 10px;">
      <a href="${SITE_URL}" style="color: #2B9999; text-decoration: none;">Website</a> &bull;
      <a href="${SITE_URL}/privacy" style="color: #2B9999; text-decoration: none;">Privacy Policy</a> &bull;
      <a href="${SITE_URL}/unsubscribe" style="color: #2B9999; text-decoration: none;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}

function generateWelcomeEmail(data: { name?: string; downloadUrl?: string }): string {
  return emailWrapper(`
    <h2 style="color: #2B9999; margin-top: 0;">Welcome to the Curls & Contemplation community!</h2>

    <p>Hi${data.name ? ` ${data.name}` : ""},</p>

    <p>Thank you for joining our community of creative freelance hairstylists. You've taken the first step toward building a more confident, profitable, and fulfilling career.</p>

    ${
      data.downloadUrl
        ? `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${data.downloadUrl}" style="display: inline-block; background: #2B9999; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-weight: bold;">Download Your Free Resource</a>
    </div>
    `
        : ""
    }

    <p>Here's what you can expect from us:</p>
    <ul style="padding-left: 20px;">
      <li><strong>Practical tips</strong> to elevate your craft and business</li>
      <li><strong>Inspiration</strong> from fellow stylists who've built thriving careers</li>
      <li><strong>Exclusive resources</strong> to help you grow with confidence</li>
    </ul>

    <p>In the meantime, here's a quick tip: <em>The most successful freelance stylists aren't necessarily the most talented—they're the ones who understand their unique value and communicate it clearly.</em></p>

    <p>We'll be in touch soon with more insights to help you on your journey.</p>

    <p style="margin-top: 25px;">With gratitude,</p>
    <p style="margin-bottom: 0;"><strong>Michael David Warren</strong><br>Author, Curls & Contemplation</p>
  `);
}

function generateWelcomeEmailText(data: { name?: string; downloadUrl?: string }): string {
  return `Welcome to the Curls & Contemplation community!

Hi${data.name ? ` ${data.name}` : ""},

Thank you for joining our community of creative freelance hairstylists. You've taken the first step toward building a more confident, profitable, and fulfilling career.

${data.downloadUrl ? `Download your free resource: ${data.downloadUrl}\n\n` : ""}Here's what you can expect from us:
- Practical tips to elevate your craft and business
- Inspiration from fellow stylists who've built thriving careers
- Exclusive resources to help you grow with confidence

Quick tip: The most successful freelance stylists aren't necessarily the most talented—they're the ones who understand their unique value and communicate it clearly.

We'll be in touch soon with more insights to help you on your journey.

With gratitude,
Michael David Warren
Author, Curls & Contemplation

---
${SITE_URL} | Reply to unsubscribe`;
}

function generatePreorderThanksEmail(data: {
  name?: string;
  orderId: string;
  amount: number;
  portalUrl: string;
  releaseDate: string;
}): string {
  const formattedAmount = (data.amount / 100).toFixed(2);
  const formattedDate = new Date(data.releaseDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return emailWrapper(`
    <h2 style="color: #2B9999; margin-top: 0;">Your pre-order is confirmed!</h2>

    <p>Thank you${data.name ? `, ${data.name}` : ""}! Your copy of <em>Curls & Contemplation</em> has been secured.</p>

    <div style="background: #f9f7f2; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1a1a1a; font-size: 16px;">Order Summary</h3>
      <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId.slice(0, 8).toUpperCase()}</p>
      <p style="margin: 5px 0;"><strong>Amount:</strong> $${formattedAmount} USD</p>
      <p style="margin: 5px 0;"><strong>Product:</strong> Curls & Contemplation eBook (EPUB + PDF)</p>
    </div>

    <h3 style="color: #2B9999;">What happens next?</h3>
    <ul style="padding-left: 20px;">
      <li>Your eBook will be delivered on <strong>${formattedDate}</strong></li>
      <li>You'll receive an email with direct download links</li>
      <li>We'll send you a reminder as launch day approaches</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.portalUrl}" style="display: inline-block; background: #C9A961; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-weight: bold;">View Your Order Portal</a>
    </div>

    <p style="font-size: 14px; color: #666;">Your portal contains your order details. Download links will appear here on launch day.</p>
  `);
}

function generatePreorderThanksEmailText(data: {
  name?: string;
  orderId: string;
  amount: number;
  portalUrl: string;
  releaseDate: string;
}): string {
  const formattedAmount = (data.amount / 100).toFixed(2);
  const formattedDate = new Date(data.releaseDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `Your pre-order is confirmed!

Thank you${data.name ? `, ${data.name}` : ""}! Your copy of Curls & Contemplation has been secured.

Order Summary:
- Order ID: ${data.orderId.slice(0, 8).toUpperCase()}
- Amount: $${formattedAmount} USD
- Product: Curls & Contemplation eBook (EPUB + PDF)

What happens next?
- Your eBook will be delivered on ${formattedDate}
- You'll receive an email with direct download links
- We'll send you a reminder as launch day approaches

View Your Order Portal: ${data.portalUrl}

---
Questions? Contact ${FROM_EMAIL}`;
}

function generatePurchaseThanksEmail(data: {
  name?: string;
  portalUrl: string;
  epubUrl: string;
  pdfUrl: string;
}): string {
  return emailWrapper(`
    <h2 style="color: #2B9999; margin-top: 0;">Your eBook is ready!</h2>

    <p>${data.name ? `${data.name}, congratulations` : "Congratulations"}! Your copy of <em>Curls & Contemplation</em> is ready to download.</p>

    <div style="text-align: center; margin: 25px 0;">
      <a href="${data.epubUrl}" style="display: inline-block; background: #2B9999; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 5px;">Download EPUB</a>
      <a href="${data.pdfUrl}" style="display: inline-block; background: #C9A961; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 5px;">Download PDF</a>
    </div>

    <p style="text-align: center; font-size: 12px; color: #888;">3 downloads per format | Links expire in 7 days</p>

    <h3 style="color: #2B9999;">Getting Started</h3>
    <p>I recommend starting with <strong>Chapter 1: Unveiling Your Creative Odyssey</strong>. It sets the foundation for everything that follows and includes exercises you can do immediately.</p>

    <p>For the best reading experience:</p>
    <ul style="padding-left: 20px;">
      <li><strong>EPUB</strong> - Best for e-readers (Kindle, Kobo) and reading apps</li>
      <li><strong>PDF</strong> - Best for printing or reading on your computer</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.portalUrl}" style="display: inline-block; border: 2px solid #2B9999; color: #2B9999; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">View Order Portal</a>
    </div>

    <p>Need more downloads or have questions? Visit your order portal or reply to this email.</p>
  `);
}

function generatePurchaseThanksEmailText(data: {
  name?: string;
  portalUrl: string;
  epubUrl: string;
  pdfUrl: string;
}): string {
  return `Your eBook is ready!

${data.name ? `${data.name}, congratulations` : "Congratulations"}! Your copy of Curls & Contemplation is ready to download.

Download EPUB: ${data.epubUrl}
Download PDF: ${data.pdfUrl}

(3 downloads per format, links expire in 7 days)

Getting Started:
I recommend starting with Chapter 1: Unveiling Your Creative Odyssey. It sets the foundation for everything that follows.

For the best reading experience:
- EPUB - Best for e-readers (Kindle, Kobo) and reading apps
- PDF - Best for printing or reading on your computer

View Order Portal: ${data.portalUrl}

Need more downloads or have questions? Reply to this email.

---
Questions? Contact ${FROM_EMAIL}`;
}

function generateLaunchReminderEmail(
  data: { name?: string; releaseDate: string; portalUrl: string },
  daysUntil: number
): string {
  const formattedDate = new Date(data.releaseDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headline = daysUntil === 1 ? "Tomorrow is the day!" : `Just ${daysUntil} days to go!`;
  const message =
    daysUntil === 1
      ? "Your copy of <em>Curls & Contemplation</em> will be in your inbox tomorrow morning."
      : `Your copy of <em>Curls & Contemplation</em> arrives on <strong>${formattedDate}</strong>.`;

  return emailWrapper(`
    <h2 style="color: #2B9999; margin-top: 0;">${headline}</h2>

    <p>Hi${data.name ? ` ${data.name}` : ""},</p>

    <p>${message}</p>

    <div style="background: linear-gradient(135deg, rgba(43,153,153,0.1) 0%, rgba(201,169,97,0.1) 100%); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="font-size: 18px; margin: 0;"><strong>Release Date</strong></p>
      <p style="font-size: 24px; color: #2B9999; margin: 10px 0;">${formattedDate}</p>
    </div>

    <h3 style="color: #2B9999;">What to expect:</h3>
    <ul style="padding-left: 20px;">
      <li>You'll receive an email with <strong>direct download links</strong></li>
      <li>Both <strong>EPUB and PDF</strong> formats included</li>
      <li>Downloads also available in your <strong>order portal</strong></li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.portalUrl}" style="display: inline-block; background: #C9A961; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-weight: bold;">View Your Order</a>
    </div>

    <p>Thank you for your patience and support. I can't wait for you to dive in!</p>
  `);
}

function generateLaunchReminderEmailText(
  data: { name?: string; releaseDate: string; portalUrl: string },
  daysUntil: number
): string {
  const formattedDate = new Date(data.releaseDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headline = daysUntil === 1 ? "Tomorrow is the day!" : `Just ${daysUntil} days to go!`;

  return `${headline}

Hi${data.name ? ` ${data.name}` : ""},

Your copy of Curls & Contemplation arrives on ${formattedDate}.

What to expect:
- You'll receive an email with direct download links
- Both EPUB and PDF formats included
- Downloads also available in your order portal

View Your Order: ${data.portalUrl}

Thank you for your patience and support!

---
Questions? Contact ${FROM_EMAIL}`;
}

function generateLaunchDayEmail(data: {
  name?: string;
  portalUrl: string;
  epubUrl?: string;
  pdfUrl?: string;
}): string {
  return emailWrapper(`
    <h2 style="color: #2B9999; margin-top: 0;">It's here! Your eBook is ready</h2>

    <p>Hi${data.name ? ` ${data.name}` : ""},</p>

    <p>The wait is over! <em>Curls & Contemplation</em> is now available for download.</p>

    <div style="text-align: center; margin: 25px 0; padding: 20px; background: linear-gradient(135deg, rgba(43,153,153,0.1) 0%, rgba(201,169,97,0.1) 100%); border-radius: 8px;">
      <p style="font-size: 14px; color: #666; margin-bottom: 15px;">Download your copy now:</p>
      ${
        data.epubUrl && data.pdfUrl
          ? `
      <a href="${data.epubUrl}" style="display: inline-block; background: #2B9999; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 5px;">Download EPUB</a>
      <a href="${data.pdfUrl}" style="display: inline-block; background: #C9A961; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 5px;">Download PDF</a>
      `
          : `
      <a href="${data.portalUrl}" style="display: inline-block; background: #2B9999; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-weight: bold;">Get Your Download Links</a>
      `
      }
    </div>

    <p>Inside the book, you'll discover:</p>
    <ul style="padding-left: 20px;">
      <li>How to uncover and communicate your unique creative value</li>
      <li>Systems for building a sustainable, profitable practice</li>
      <li>Strategies for attracting and retaining ideal clients</li>
      <li>The mindset shifts that separate thriving stylists from struggling ones</li>
    </ul>

    <p><strong>My recommendation:</strong> Start with Chapter 1 and do the reflection exercises. They'll set the foundation for everything that follows.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.portalUrl}" style="display: inline-block; border: 2px solid #2B9999; color: #2B9999; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">View Order Portal</a>
    </div>

    <p>Thank you for being part of this journey. I can't wait to hear how the book helps you!</p>
  `);
}

function generateLaunchDayEmailText(data: {
  name?: string;
  portalUrl: string;
  epubUrl?: string;
  pdfUrl?: string;
}): string {
  return `It's here! Your eBook is ready

Hi${data.name ? ` ${data.name}` : ""},

The wait is over! Curls & Contemplation is now available for download.

${data.epubUrl ? `Download EPUB: ${data.epubUrl}` : ""}
${data.pdfUrl ? `Download PDF: ${data.pdfUrl}` : ""}
${!data.epubUrl && !data.pdfUrl ? `Get your download links: ${data.portalUrl}` : ""}

Inside the book, you'll discover:
- How to uncover and communicate your unique creative value
- Systems for building a sustainable, profitable practice
- Strategies for attracting and retaining ideal clients
- The mindset shifts that separate thriving stylists from struggling ones

My recommendation: Start with Chapter 1 and do the reflection exercises.

View Order Portal: ${data.portalUrl}

Thank you for being part of this journey!

---
Questions? Contact ${FROM_EMAIL}`;
}

function generateNurtureEmail1(data: { name?: string }): string {
  return emailWrapper(`
    <h2 style="color: #2B9999; margin-top: 0;">The #1 mistake stylists make with pricing</h2>

    <p>Hi${data.name ? ` ${data.name}` : ""},</p>

    <p>After working with hundreds of freelance stylists, I've noticed one pricing mistake that comes up again and again:</p>

    <p style="font-size: 18px; color: #2B9999; font-style: italic; margin: 20px 0; padding-left: 20px; border-left: 3px solid #C9A961;">"I'll raise my prices when I get better."</p>

    <p>Here's the problem: <strong>you're already good enough.</strong></p>

    <p>The stylists who charge premium prices aren't necessarily more talented than you. They're the ones who:</p>

    <ul style="padding-left: 20px;">
      <li>Understand the <em>full value</em> of what they provide</li>
      <li>Communicate that value confidently to clients</li>
      <li>Position themselves for the clients who appreciate quality</li>
    </ul>

    <p>The Pricing Confidence Kit I sent you includes a worksheet that helps you calculate the true worth of your services. If you haven't done it yet, I encourage you to spend 10 minutes on it this week.</p>

    <p>You might be surprised by what you discover.</p>

    <div style="background: rgba(43, 153, 153, 0.08); border-left: 4px solid #2B9999; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Quick action:</strong> List three things you provide that go beyond "just a haircut" (education, experience, atmosphere, products, etc.). This is the beginning of understanding your true value.</p>
    </div>

    <p>More insights coming soon.</p>

    <p style="margin-top: 25px;">Rooting for you,</p>
    <p style="margin-bottom: 0;"><strong>Michael</strong></p>
  `);
}

function generateNurtureEmail1Text(data: { name?: string }): string {
  return `The #1 mistake stylists make with pricing

Hi${data.name ? ` ${data.name}` : ""},

After working with hundreds of freelance stylists, I've noticed one pricing mistake that comes up again and again:

"I'll raise my prices when I get better."

Here's the problem: you're already good enough.

The stylists who charge premium prices aren't necessarily more talented than you. They're the ones who:
- Understand the full value of what they provide
- Communicate that value confidently to clients
- Position themselves for the clients who appreciate quality

The Pricing Confidence Kit I sent you includes a worksheet that helps you calculate the true worth of your services. If you haven't done it yet, spend 10 minutes on it this week.

Quick action: List three things you provide that go beyond "just a haircut" (education, experience, atmosphere, products, etc.).

More insights coming soon.

Rooting for you,
Michael

---
Questions? Contact ${FROM_EMAIL}`;
}

function generateNurtureEmail2(data: { name?: string }): string {
  return emailWrapper(`
    <h2 style="color: #2B9999; margin-top: 0;">How Sarah doubled her rebooking rate</h2>

    <p>Hi${data.name ? ` ${data.name}` : ""},</p>

    <p>I want to share a quick story about a stylist named Sarah (name changed for privacy).</p>

    <p>When we first connected, Sarah was frustrated. She had talent—lots of it—but her clients weren't rebooking. She was spending more time marketing than styling.</p>

    <p>The breakthrough came when she stopped focusing on <em>attracting</em> clients and started focusing on the <em>experience</em> she created.</p>

    <p>She made three specific changes:</p>

    <ol style="padding-left: 20px;">
      <li><strong>Pre-appointment preparation</strong> - A quick text the day before confirming and asking about any new concerns</li>
      <li><strong>In-chair education</strong> - Explaining what she was doing and why, making clients feel involved</li>
      <li><strong>Follow-up care</strong> - A brief message 3 days after with one tip for maintaining their style</li>
    </ol>

    <p>The result? Her rebooking rate went from 35% to over 70% in three months. And those clients started referring their friends.</p>

    <p style="color: #2B9999; font-weight: bold;">The lesson: retention beats acquisition every time.</p>

    <p>In <em>Curls & Contemplation</em>, I dedicate an entire chapter to creating remarkable client experiences. But you can start today with one small change.</p>

    <div style="background: rgba(43, 153, 153, 0.08); border-left: 4px solid #2B9999; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Try this:</strong> Send a simple follow-up message to your next three clients. Just checking in, offering one maintenance tip. Notice how they respond.</p>
    </div>

    <p>Talk soon,</p>
    <p style="margin-bottom: 0;"><strong>Michael</strong></p>
  `);
}

function generateNurtureEmail2Text(data: { name?: string }): string {
  return `How Sarah doubled her rebooking rate

Hi${data.name ? ` ${data.name}` : ""},

I want to share a quick story about a stylist named Sarah.

When we first connected, Sarah was frustrated. She had talent—lots of it—but her clients weren't rebooking.

The breakthrough came when she stopped focusing on attracting clients and started focusing on the experience she created.

She made three specific changes:

1. Pre-appointment preparation - A quick text the day before confirming and asking about any new concerns

2. In-chair education - Explaining what she was doing and why, making clients feel involved

3. Follow-up care - A brief message 3 days after with one tip for maintaining their style

The result? Her rebooking rate went from 35% to over 70% in three months.

The lesson: retention beats acquisition every time.

Try this: Send a simple follow-up message to your next three clients. Just checking in, offering one maintenance tip. Notice how they respond.

Talk soon,
Michael

---
Questions? Contact ${FROM_EMAIL}`;
}

function generateNurtureEmail3(data: { name?: string }): string {
  return emailWrapper(`
    <h2 style="color: #2B9999; margin-top: 0;">Ready to transform your freelance career?</h2>

    <p>Hi${data.name ? ` ${data.name}` : ""},</p>

    <p>Over the past few emails, we've talked about:</p>
    <ul style="padding-left: 20px;">
      <li>Why you're already good enough to charge premium prices</li>
      <li>How small experience improvements lead to dramatic rebooking increases</li>
    </ul>

    <p>These aren't just tips—they're part of a complete system I've developed over years of working with freelance hairstylists.</p>

    <p><em>Curls & Contemplation</em> puts it all together: the mindset shifts, the practical strategies, and the step-by-step actions that transform overwhelmed stylists into confident, thriving professionals.</p>

    <div style="background: #f9f7f2; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #2B9999;">Inside the book:</h3>
      <ul style="padding-left: 20px; margin-bottom: 0;">
        <li>16 chapters covering every aspect of freelance success</li>
        <li>Practical exercises you can implement immediately</li>
        <li>Real strategies for pricing, marketing, and client retention</li>
        <li>Guidance on building a sustainable, fulfilling career</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${SITE_URL}/book" style="display: inline-block; background: #C9A961; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-weight: bold; font-size: 16px;">Learn More About the Book</a>
    </div>

    <p>If you have any questions, just reply to this email. I read every message.</p>

    <p style="margin-top: 25px;">Here's to your success,</p>
    <p style="margin-bottom: 0;"><strong>Michael David Warren</strong></p>
  `);
}

function generateNurtureEmail3Text(data: { name?: string }): string {
  return `Ready to transform your freelance career?

Hi${data.name ? ` ${data.name}` : ""},

Over the past few emails, we've talked about:
- Why you're already good enough to charge premium prices
- How small experience improvements lead to dramatic rebooking increases

These aren't just tips—they're part of a complete system I've developed over years of working with freelance hairstylists.

Curls & Contemplation puts it all together: the mindset shifts, the practical strategies, and the step-by-step actions that transform overwhelmed stylists into confident, thriving professionals.

Inside the book:
- 16 chapters covering every aspect of freelance success
- Practical exercises you can implement immediately
- Real strategies for pricing, marketing, and client retention
- Guidance on building a sustainable, fulfilling career

Learn more: ${SITE_URL}/book

If you have any questions, just reply to this email. I read every message.

Here's to your success,
Michael David Warren

---
Questions? Contact ${FROM_EMAIL}`;
}

function generateNewsletterEmail(data: {
  name?: string;
  subject: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  return emailWrapper(`
    <p>Hi${data.name ? ` ${data.name}` : ""},</p>

    ${data.content}

    ${
      data.ctaText && data.ctaUrl
        ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.ctaUrl}" style="display: inline-block; background: #C9A961; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-weight: bold;">${data.ctaText}</a>
    </div>
    `
        : ""
    }
  `);
}

function generateNewsletterEmailText(data: {
  name?: string;
  subject: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  // Strip HTML from content for plain text
  const plainContent = data.content
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  return `Hi${data.name ? ` ${data.name}` : ""},

${plainContent}

${data.ctaText && data.ctaUrl ? `${data.ctaText}: ${data.ctaUrl}` : ""}

---
Questions? Contact ${FROM_EMAIL}
Unsubscribe: ${SITE_URL}/unsubscribe`;
}

// ============================================================================
// STATS AND REPORTING
// ============================================================================

export function getEmailStats(): {
  queued: number;
  sent: number;
  failed: number;
  broadcasts: number;
  activeSequences: number;
} {
  const queued = db.prepare("SELECT COUNT(*) as count FROM email_queue WHERE status = 'pending'").get() as { count: number };
  const sent = db.prepare("SELECT COUNT(*) as count FROM email_queue WHERE status = 'sent'").get() as { count: number };
  const failed = db.prepare("SELECT COUNT(*) as count FROM email_queue WHERE status = 'failed'").get() as { count: number };
  const broadcasts = db.prepare("SELECT COUNT(*) as count FROM newsletter_broadcasts").get() as { count: number };
  const activeSequences = db.prepare("SELECT COUNT(*) as count FROM subscriber_sequence_progress WHERE is_active = 1").get() as { count: number };

  return {
    queued: queued.count,
    sent: sent.count,
    failed: failed.count,
    broadcasts: broadcasts.count,
    activeSequences: activeSequences.count,
  };
}

// Initialize sequences on module load
initializeSequences();
