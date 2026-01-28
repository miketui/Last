// Stripe integration for eBook checkout
// Per SOW: Stripe Payment Element, Apple Pay/Google Pay, Stripe Tax, coupons

import Stripe from "stripe";

// Initialize Stripe (only if key is available)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// Site configuration
const SITE_URL = process.env.SITE_URL || "https://curlsandcontemplation.com";

// Product configuration
export const EBOOK_PRICE_CENTS = 1999; // $19.99
export const EBOOK_PRODUCT_NAME = "Curls & Contemplation eBook";
export const EBOOK_PRODUCT_DESCRIPTION = "A Freelance Hairstylist's Guide to Creative Excellence - EPUB + PDF formats";

// Release date configuration (10:00 AM CT = 4:00 PM UTC)
export const RELEASE_DATE = new Date(process.env.RELEASE_DATE || "2026-03-15T16:00:00.000Z");

export function isPostLaunch(): boolean {
  return new Date() >= RELEASE_DATE;
}

export function isPreLaunch(): boolean {
  return new Date() < RELEASE_DATE;
}

// Create a Payment Intent for checkout
export async function createPaymentIntent(data: {
  email: string;
  amount?: number;
  coupon?: string;
  metadata?: Record<string, string>;
}): Promise<{ clientSecret: string; paymentIntentId: string; amount: number } | null> {
  if (!stripe) {
    console.error("Stripe not initialized - missing STRIPE_SECRET_KEY");
    return null;
  }

  let finalAmount = data.amount ?? EBOOK_PRICE_CENTS;
  let couponId: string | undefined;

  // Apply coupon if provided
  if (data.coupon) {
    try {
      const coupon = await stripe.coupons.retrieve(data.coupon);
      if (coupon.valid) {
        if (coupon.percent_off) {
          finalAmount = Math.round(finalAmount * (1 - coupon.percent_off / 100));
        } else if (coupon.amount_off) {
          finalAmount = Math.max(0, finalAmount - coupon.amount_off);
        }
        couponId = coupon.id;
      }
    } catch {
      // Invalid coupon, continue without discount
    }
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalAmount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true, // Enables Apple Pay, Google Pay, Cards, etc.
    },
    metadata: {
      email: data.email,
      product: "ebook",
      launch_state: isPostLaunch() ? "post_launch" : "pre_order",
      coupon: couponId || "",
      ...data.metadata,
    },
    receipt_email: data.email,
    description: EBOOK_PRODUCT_NAME,
  });

  if (!paymentIntent.client_secret) {
    return null;
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: finalAmount,
  };
}

// Retrieve Payment Intent
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  if (!stripe) return null;

  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch {
    return null;
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  if (!stripe) return null;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}

// Validate coupon
export async function validateCoupon(couponCode: string): Promise<{
  valid: boolean;
  percentOff?: number;
  amountOff?: number;
  name?: string;
}> {
  if (!stripe) {
    return { valid: false };
  }

  try {
    const coupon = await stripe.coupons.retrieve(couponCode);
    if (coupon.valid) {
      return {
        valid: true,
        percentOff: coupon.percent_off ?? undefined,
        amountOff: coupon.amount_off ?? undefined,
        name: coupon.name ?? undefined,
      };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// Create a refund (called when admin initiates refund)
export async function createRefund(paymentIntentId: string): Promise<Stripe.Refund | null> {
  if (!stripe) return null;

  try {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  } catch (error) {
    console.error("Refund failed:", error);
    return null;
  }
}

// Get Stripe publishable key for frontend
export function getPublishableKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY || "";
}

// Export stripe instance for direct use if needed
export { stripe };

// Types for frontend
export interface CheckoutConfig {
  publishableKey: string;
  amount: number;
  productName: string;
  productDescription: string;
  isPreOrder: boolean;
  releaseDate: string;
}

export function getCheckoutConfig(): CheckoutConfig {
  return {
    publishableKey: getPublishableKey(),
    amount: EBOOK_PRICE_CENTS,
    productName: EBOOK_PRODUCT_NAME,
    productDescription: EBOOK_PRODUCT_DESCRIPTION,
    isPreOrder: isPreLaunch(),
    releaseDate: RELEASE_DATE.toISOString(),
  };
}
