import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { stripeEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Plan = "free" | "pro" | "team";

/** Maps a Stripe Price ID to our plan tier. */
function priceToPlan(priceId: string | undefined): Plan {
  if (!priceId) return "free";
  const env = stripeEnv();
  if (priceId === env.STRIPE_PRICE_ID_PRO) return "pro";
  if (priceId === env.STRIPE_PRICE_ID_TEAM) return "team";
  return "free";
}

async function updatePlanFromSubscription(sub: Stripe.Subscription) {
  const userId = (sub.metadata?.supabase_user_id ?? null) as string | null;
  if (!userId) return;

  const priceId = sub.items.data[0]?.price?.id;
  const status = sub.status;
  const isActive = status === "active" || status === "trialing";
  const plan: Plan = isActive ? priceToPlan(priceId) : "free";

  const supabase = createAdminClient();
  await supabase.from("profiles").update({ plan }).eq("user_id", userId);
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const stripe = getStripe();
  const env = stripeEnv();
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature invalid: ${err}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await updatePlanFromSubscription(event.data.object as Stripe.Subscription);
        break;
      default:
        // ignore other events for now
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler failed", err);
    return NextResponse.json({ received: false, error: String(err) }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
