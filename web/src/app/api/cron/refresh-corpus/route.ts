import { NextResponse } from "next/server";
import type { Industry } from "@/types/domain";
import { runCorpusRefresh } from "@/lib/pipeline/run";
import { collectableIndustries } from "@/lib/pipeline/keywords";

// パイプラインは収集+文字起こしで時間がかかるため上限を引き上げる（Vercel Pro想定）。
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * 週次のコーパス更新パイプライン。
 * Vercel Cron から呼ばれる（CRON_SECRET が設定されていると Authorization: Bearer で届く）。
 * 手動実行も同じ Bearer トークンで可能。
 *
 * クエリ:
 *   ?dryRun=1            … DB書き込みせず統計のみ
 *   ?industries=a,b      … 対象業界を限定
 *   ?perIndustry=12      … 業界ごとの収集上限
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET 未設定" }, { status: 500 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "1";
  const perIndustry = Number(url.searchParams.get("perIndustry")) || undefined;
  const industriesParam = url.searchParams.get("industries");
  const valid = new Set(collectableIndustries());
  const industries = industriesParam
    ? (industriesParam.split(",").map((s) => s.trim()).filter((s) => valid.has(s as Industry)) as Industry[])
    : undefined;

  try {
    const result = await runCorpusRefresh({
      trigger: "cron",
      dryRun,
      perIndustry,
      industries,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[cron/refresh-corpus] failed:", e);
    return NextResponse.json({ error: "pipeline failed", details: String(e) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
