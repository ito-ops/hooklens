/**
 * One-time setup: creates Tsukami's Pro / Team Stripe Products + Prices.
 *
 *   npm run setup:stripe
 *
 * Uses STRIPE_SECRET_KEY from .env.local. Idempotent — if products with the
 * same lookup_key already exist, reuses them.
 *
 * Outputs the resulting Price IDs so they can be copied into .env.local.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import Stripe from "stripe";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY missing in .env.local");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
});

interface PlanSpec {
  key: "pro" | "team";
  name: string;
  description: string;
  amountJpy: number;
  lookupKey: string;
}

const PLANS: PlanSpec[] = [
  {
    key: "pro",
    name: "Tsukami Pro",
    description:
      "分析・履歴 無制限 / 改善案 5パターン / Instagram レポート 月20件 / 競合分析 月10件 / PDF出力",
    amountJpy: 2980,
    lookupKey: "tsukami_pro_monthly_jpy",
  },
  {
    key: "team",
    name: "Tsukami Team",
    description:
      "Pro 機能すべて / Instagram レポート 月100件 / 競合分析 月50件 / チームメンバー 10人 / API連携",
    amountJpy: 14800,
    lookupKey: "tsukami_team_monthly_jpy",
  },
];

async function ensureProductWithPrice(spec: PlanSpec) {
  /* ---------- Reuse existing Price by lookup_key if present ---------- */
  const existing = await stripe.prices.list({
    lookup_keys: [spec.lookupKey],
    expand: ["data.product"],
    active: true,
    limit: 1,
  });
  if (existing.data.length > 0) {
    const price = existing.data[0];
    const product =
      typeof price.product === "string" ? null : (price.product as Stripe.Product);
    console.log(`[${spec.key}] reused existing price ${price.id}`);
    return { price, product };
  }

  /* ---------- Find / create Product by name ---------- */
  const products = await stripe.products.search({
    query: `name:"${spec.name}" AND active:'true'`,
    limit: 1,
  });
  let product = products.data[0];
  if (!product) {
    product = await stripe.products.create({
      name: spec.name,
      description: spec.description,
      metadata: { plan_key: spec.key },
    });
    console.log(`[${spec.key}] created product ${product.id}`);
  } else {
    console.log(`[${spec.key}] reused product ${product.id}`);
  }

  /* ---------- Create monthly recurring price ---------- */
  const price = await stripe.prices.create({
    product: product.id,
    currency: "jpy",
    unit_amount: spec.amountJpy,
    recurring: { interval: "month" },
    lookup_key: spec.lookupKey,
    metadata: { plan_key: spec.key },
  });
  console.log(`[${spec.key}] created price ${price.id} (¥${spec.amountJpy}/month)`);
  return { price, product };
}

async function main() {
  console.log("\nSetting up Tsukami Stripe products & prices…\n");
  const results: { key: string; priceId: string }[] = [];

  for (const spec of PLANS) {
    const { price } = await ensureProductWithPrice(spec);
    results.push({ key: spec.key, priceId: price.id });
  }

  console.log("\n============================================================");
  console.log("Add these to your .env.local:\n");
  for (const { key, priceId } of results) {
    console.log(`STRIPE_PRICE_ID_${key.toUpperCase()}=${priceId}`);
  }
  console.log("============================================================\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
