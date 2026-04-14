import Stripe from "stripe";

// Lazy singleton — initialized only on first real request, not at build time.
// This prevents "Neither apiKey nor config.authenticator provided" during `next build`.
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(key, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    const instance = getStripe();
    const value = instance[prop as keyof Stripe];
    return typeof value === "function" ? (value as Function).bind(instance) : value;
  },
});

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?checkout=canceled`,
    metadata: { userId },
  });
  if (!session.url) {
    throw new Error("Stripe checkout session URL was not returned");
  }
  return session.url;
}

export async function createPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  });
  return session.url;
}

export async function createOrGetCustomer(
  email: string,
  name?: string | null
): Promise<string> {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    return existing.data[0].id;
  }
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
  });
  return customer.id;
}
