import { createClient } from "@/lib/supabase/server";
import type { Platform } from "@/types/domain";

export interface DashboardData {
  profile: {
    companyName: string | null;
    plan: "free" | "pro" | "team";
  };
  stats: {
    monthlyCount: number;
    monthlyDelta: number; // vs last month
    averageScore: number;
    averageDelta: number;
    hitCount: number; // score >= 80
    hitDelta: number;
    todayCount: number;
  };
  recentAnalyses: RecentAnalysis[];
  activeDays: number[]; // day-of-month with >=1 analysis (current month)
}

export interface RecentAnalysis {
  id: string;
  hookText: string;
  platform: Platform;
  score: number;
  createdAt: string; // ISO
}

const HIT_THRESHOLD = 80;

export async function loadDashboard(): Promise<DashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Should be unreachable behind auth guard, but keep a safe default.
    return emptyDashboard();
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [profileRes, monthlyRes, lastMonthlyRes, todayRes, recentRes, allMonthRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("company_name, plan")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("analyses")
        .select("total_score", { count: "exact" })
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString()),
      supabase
        .from("analyses")
        .select("total_score", { count: "exact" })
        .eq("user_id", user.id)
        .gte("created_at", lastMonthStart.toISOString())
        .lt("created_at", monthStart.toISOString()),
      supabase
        .from("analyses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString()),
      supabase
        .from("analyses")
        .select("id, hook_text, platform, total_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("analyses")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString()),
    ]);

  const monthlyScores = monthlyRes.data ?? [];
  const lastMonthScores = lastMonthlyRes.data ?? [];
  const monthlyCount = monthlyRes.count ?? monthlyScores.length;
  const lastMonthlyCount = lastMonthlyRes.count ?? lastMonthScores.length;

  const avg = (rows: { total_score: number | null }[]) => {
    if (rows.length === 0) return 0;
    const sum = rows.reduce((a, r) => a + (r.total_score ?? 0), 0);
    return Math.round(sum / rows.length);
  };
  const averageScore = avg(monthlyScores as { total_score: number | null }[]);
  const lastAvg = avg(lastMonthScores as { total_score: number | null }[]);
  const hitCount = (monthlyScores as { total_score: number | null }[]).filter(
    (r) => (r.total_score ?? 0) >= HIT_THRESHOLD,
  ).length;
  const lastHit = (lastMonthScores as { total_score: number | null }[]).filter(
    (r) => (r.total_score ?? 0) >= HIT_THRESHOLD,
  ).length;

  const activeDays = Array.from(
    new Set(
      (allMonthRes.data ?? []).map((r) => new Date(r.created_at as string).getDate()),
    ),
  );

  return {
    profile: {
      companyName: profileRes.data?.company_name ?? null,
      plan: (profileRes.data?.plan ?? "free") as DashboardData["profile"]["plan"],
    },
    stats: {
      monthlyCount,
      monthlyDelta: monthlyCount - lastMonthlyCount,
      averageScore,
      averageDelta: lastAvg === 0 ? 0 : averageScore - lastAvg,
      hitCount,
      hitDelta: hitCount - lastHit,
      todayCount: todayRes.count ?? 0,
    },
    recentAnalyses: (recentRes.data ?? []).map((r) => ({
      id: r.id as string,
      hookText: r.hook_text as string,
      platform: r.platform as Platform,
      score: r.total_score as number,
      createdAt: r.created_at as string,
    })),
    activeDays,
  };
}

function emptyDashboard(): DashboardData {
  return {
    profile: { companyName: null, plan: "free" },
    stats: {
      monthlyCount: 0,
      monthlyDelta: 0,
      averageScore: 0,
      averageDelta: 0,
      hitCount: 0,
      hitDelta: 0,
      todayCount: 0,
    },
    recentAnalyses: [],
    activeDays: [],
  };
}
