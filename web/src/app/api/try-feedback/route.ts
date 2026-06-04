import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Anonymous feedback from the public /try page.
 * Stores (hook + params + result + verdict + comment) via the service-role
 * client so it works without login. No PII is collected.
 */
const requestSchema = z.object({
  hookText: z.string().min(1).max(300),
  platform: z.enum(["instagram", "shorts", "tiktok"]),
  industry: z.string().min(1).max(64),
  target: z.string().max(120).optional(),
  totalScore: z.number().int().optional(),
  breakdown: z.record(z.string(), z.number()).optional(),
  improvements: z.array(z.unknown()).optional(),
  verdict: z.enum(["up", "down"]).optional(),
  comment: z.string().max(2000).optional(),
  sessionId: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = requestSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid request", details: String(e) }, { status: 400 });
  }

  // Supabase 未設定の環境（UI先行プレビュー等）では黙って成功扱いにする。
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("try_feedback").insert({
      hook_text: parsed.hookText,
      platform: parsed.platform,
      industry: parsed.industry,
      target: parsed.target ?? null,
      total_score: parsed.totalScore ?? null,
      breakdown: parsed.breakdown ?? null,
      improvements: parsed.improvements ?? null,
      verdict: parsed.verdict ?? null,
      comment: parsed.comment ?? null,
      session_id: parsed.sessionId ?? null,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true, stored: true });
  } catch (e) {
    console.error("[/api/try-feedback] insert failed:", e);
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
