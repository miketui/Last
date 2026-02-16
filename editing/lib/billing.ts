// Stripe billing integration for subscription management
// Three tiers: Starter ($19/mo), Professional ($49/mo), Enterprise ($149/mo)

import Stripe from "stripe";
import db from "./database";
import { updateUserPlan } from "./auth";

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });
  }
  return stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    manuscripts_per_month: 1,
    max_word_count: 10000,
    modules: 3,
    features: ["Grammar & Spelling", "Style Guide", "Tone & Voice", "1 manuscript/month", "Up to 10k words"],
  },
  starter: {
    name: "Starter",
    price: 19,
    manuscripts_per_month: 5,
    max_word_count: 80000,
    modules: 7,
    features: ["All Free features", "+ Fact-Checking", "+ Readability", "+ Dialogue Quality", "+ Continuity", "5 manuscripts/month", "Up to 80k words"],
  },
  professional: {
    name: "Professional",
    price: 49,
    manuscripts_per_month: 20,
    max_word_count: 200000,
    modules: 10,
    features: ["All 10 editing modules", "20 manuscripts/month", "Up to 200k words", "Priority processing", "Export to all formats"],
  },
  enterprise: {
    name: "Enterprise",
    price: 149,
    manuscripts_per_month: -1,
    max_word_count: 500000,
    modules: 10,
    features: ["Everything in Professional", "Unlimited manuscripts", "Up to 500k words", "API access", "Custom style guides", "Dedicated support"],
  },
};

/** Create a Stripe Checkout session for subscription */
export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: "starter" | "professional" | "enterprise",
  returnUrl: string
): Promise<string> {
  const s = getStripe();

  // Get or create customer
  let customerId: string;
  const user = db.query("SELECT stripe_customer_id FROM users WHERE id = ?").get(userId) as any;

  if (user?.stripe_customer_id) {
    customerId = user.stripe_customer_id;
  } else {
    const customer = await s.customers.create({ email, metadata: { user_id: userId } });
    customerId = customer.id;
    db.run("UPDATE users SET stripe_customer_id = ? WHERE id = ?", [customerId, userId]);
  }

  const priceIds: Record<string, string> = {
    starter: process.env.STRIPE_PRICE_STARTER || "",
    professional: process.env.STRIPE_PRICE_PROFESSIONAL || "",
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "",
  };

  if (!priceIds[plan]) throw new Error(`Stripe price ID not configured for plan: ${plan}`);

  const session = await s.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceIds[plan], quantity: 1 }],
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?canceled=true`,
    metadata: { user_id: userId, plan },
  });

  return session.url!;
}

/** Handle Stripe webhook events */
export async function handleWebhook(body: string, signature: string): Promise<void> {
  const s = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not set");

  const event = s.webhooks.constructEvent(body, signature, secret);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;
      if (userId && plan) {
        updateUserPlan(userId, plan, session.subscription as string);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = (db.query("SELECT id FROM users WHERE stripe_subscription_id = ?").get(sub.id) as any)?.id;
      if (userId) updateUserPlan(userId, "free");
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      if (sub.status === "past_due" || sub.status === "unpaid") {
        const userId = (db.query("SELECT id FROM users WHERE stripe_subscription_id = ?").get(sub.id) as any)?.id;
        if (userId) updateUserPlan(userId, "free");
      }
      break;
    }
  }
}
