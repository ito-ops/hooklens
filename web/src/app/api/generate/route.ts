import { NextResponse } from "next/server";
import { z } from "zod";
import { generateHooks } from "@/lib/scoring/generate";

const requestSchema = z.object({
  platform: z.enum(["instagram", "shorts", "tiktok"]),
  industry: z.string().min(1).max(64),
  target: z.string().max(200).optional(),
  script: z.string().max(4000).optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = requestSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid request", details: String(e) }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "フック生成には GEMINI_API_KEY の設定が必要です。" },
      { status: 503 },
    );
  }

  try {
    const hooks = await generateHooks(parsed);
    return NextResponse.json({ hooks });
  } catch (e) {
    console.error("[/api/generate] failed:", e);
    return NextResponse.json({ error: "フックの生成に失敗しました。時間をおいて再試行してください。" }, { status: 500 });
  }
}
