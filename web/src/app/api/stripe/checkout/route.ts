import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/client";
import { stripeEnv, publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  plan: z.enum(["pro", "team"]),
});

export async function POST(req: Request) {
  /* ---------- Validate ---------- */
  let body;
  try {
    body = requestSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid request", details: String(e) }, { status: 400 });
  }

  /* ---------- Auth ---------- */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  /* ---------- Resolve Price ID ---------- */
  const env = stripeEnv();
  const priceId = body.plan === "pro" ? env.STRIPE_PRICE_ID_PRO : env.STRIPE_PRICE_ID_TEAM;
  if (!priceId) {
    return NextResponse.json(
      { error: `${body.plan} の Stripe Price ID が未設定です` },
      { status: 503 },
    );
  }

  /* ---------- Ensure Stripe customer ---------- */
  const stripe = getStripe();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, company_name")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: profile?.company_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  /* ---------- Create Checkout session ---------- */
  const appUrl = publicEnv().NEXT_PUBLIC_APP_URL;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${appUrl}/settings/billing?success=1`,
    cancel_url: `${appUrl}/settings/billing?canceled=1`,
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan: body.plan },
    },
  });

  return NextResponse.json({ url: session.url });
}
