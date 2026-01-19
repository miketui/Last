// Stripe API integration for checkout and webhooks

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

// Product configuration
export const PRODUCTS = {
  ebook: {
    id: 'ebook',
    name: 'Curls & Contemplation (eBook)',
    description: 'Digital edition with interactive worksheets and resources',
    priceId: process.env.STRIPE_EBOOK_PRICE_ID || '',
    priceCents: 1499, // $14.99
    type: 'ebook' as const,
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;

interface CreateCheckoutSessionParams {
  productId: ProductId;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface CheckoutSession {
  id: string;
  url: string | null;
  payment_status: string;
  customer_email: string | null;
  amount_total: number | null;
  metadata: Record<string, string>;
}

// Create a Stripe checkout session
export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSession> {
  const { productId, customerEmail, successUrl, cancelUrl } = params;
  const product = PRODUCTS[productId];

  if (!product) {
    throw new Error(`Invalid product: ${productId}`);
  }

  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }

  const body = new URLSearchParams();
  body.append('mode', 'payment');
  body.append('success_url', successUrl || `${SITE_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`);
  body.append('cancel_url', cancelUrl || `${SITE_URL}/pre-order`);
  body.append('line_items[0][price_data][currency]', 'usd');
  body.append('line_items[0][price_data][product_data][name]', product.name);
  body.append('line_items[0][price_data][product_data][description]', product.description);
  body.append('line_items[0][price_data][unit_amount]', product.priceCents.toString());
  body.append('line_items[0][quantity]', '1');
  body.append('metadata[product_id]', productId);
  body.append('metadata[product_type]', product.type);

  if (customerEmail) {
    body.append('customer_email', customerEmail);
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create checkout session');
  }

  return response.json();
}

// Retrieve a checkout session
export async function getCheckoutSession(sessionId: string): Promise<CheckoutSession | null> {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }

  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
    {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to retrieve checkout session');
  }

  return response.json();
}

// Verify Stripe webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn('Webhook secret not configured, skipping verification');
    return true;
  }

  try {
    // Parse the signature header
    const elements = signature.split(',');
    let timestamp = '';
    let v1Signature = '';

    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1') v1Signature = value;
    }

    if (!timestamp || !v1Signature) {
      return false;
    }

    // Check timestamp tolerance (5 minutes)
    const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (timestampAge > 300) {
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const key = new TextEncoder().encode(STRIPE_WEBHOOK_SECRET);
    const data = new TextEncoder().encode(signedPayload);

    // Use Web Crypto API for HMAC-SHA256
    return crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(async (cryptoKey) => {
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
      const expectedSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      return expectedSignature === v1Signature;
    });
  } catch {
    return false;
  }
}

// Parse webhook event
export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: CheckoutSession;
  };
}

export function parseWebhookEvent(payload: string): WebhookEvent {
  return JSON.parse(payload);
}

// Print-on-Demand links
export const POD_LINKS = {
  amazonUS: {
    label: 'Amazon US',
    url: 'https://www.amazon.com/dp/PLACEHOLDER_ASIN',
    flag: 'US',
  },
  amazonUK: {
    label: 'Amazon UK',
    url: 'https://www.amazon.co.uk/dp/PLACEHOLDER_ASIN',
    flag: 'UK',
  },
  amazonCA: {
    label: 'Amazon CA',
    url: 'https://www.amazon.ca/dp/PLACEHOLDER_ASIN',
    flag: 'CA',
  },
} as const;
