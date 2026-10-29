import Stripe from "stripe";

let client: Stripe | null = null;

// Created lazily so builds succeed without Stripe keys present.
export function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}
