import { z } from "zod";

/* -------------------------------------------------------------------- *
 * Public (NEXT_PUBLIC_*) env — accessed from both client and server.
 * -------------------------------------------------------------------- */

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Tsukami"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
});

let _publicEnv: z.infer<typeof publicSchema> | null = null;

export function publicEnv() {
  if (!_publicEnv) {
    _publicEnv = publicSchema.parse({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  }
  return _publicEnv;
}

/* -------------------------------------------------------------------- *
 * Per-service server env getters.
 *
 * Each service validates only its own keys. This lets the app run with
 * partial credentials (e.g. only Gemini set during dev) instead of
 * requiring every key to be present.
 * -------------------------------------------------------------------- */

function assertServer() {
  if (typeof window !== "undefined") {
    throw new Error("Server env must not be accessed from the client");
  }
}

const geminiSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
});

const supabaseAdminSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const stripeSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_ID_PRO: z.string().optional(),
  STRIPE_PRICE_ID_TEAM: z.string().optional(),
});

const apifySchema = z.object({
  APIFY_API_TOKEN: z.string().min(1),
  APIFY_INSTAGRAM_SCRAPER_ACTOR: z.string().default("apify/instagram-scraper"),
});

export const geminiEnv = (() => {
  let v: z.infer<typeof geminiSchema> | null = null;
  return () => {
    assertServer();
    return (v ??= geminiSchema.parse({
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL,
    }));
  };
})();

export const supabaseAdminEnv = (() => {
  let v: z.infer<typeof supabaseAdminSchema> | null = null;
  return () => {
    assertServer();
    return (v ??= supabaseAdminSchema.parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    }));
  };
})();

export const stripeEnv = (() => {
  let v: z.infer<typeof stripeSchema> | null = null;
  return () => {
    assertServer();
    return (v ??= stripeSchema.parse({
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO,
      STRIPE_PRICE_ID_TEAM: process.env.STRIPE_PRICE_ID_TEAM,
    }));
  };
})();

export const apifyEnv = (() => {
  let v: z.infer<typeof apifySchema> | null = null;
  return () => {
    assertServer();
    return (v ??= apifySchema.parse({
      APIFY_API_TOKEN: process.env.APIFY_API_TOKEN,
      APIFY_INSTAGRAM_SCRAPER_ACTOR: process.env.APIFY_INSTAGRAM_SCRAPER_ACTOR,
    }));
  };
})();
