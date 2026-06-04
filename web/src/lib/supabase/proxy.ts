import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";

const PUBLIC_PATHS = [
  "/",
  "/try", // public, login-free test page
  "/login",
  "/signup",
  "/auth/callback",
  "/auth", // namespace for OAuth callbacks
];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/analyze",
  "/onboarding",
  "/history",
  "/reports",
  "/library",
  "/settings",
];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Refreshes the Supabase auth session on each request, then enforces
 * basic route protection by redirecting unauthenticated users.
 */
export async function updateSession(request: NextRequest) {
  let proxyResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  // 公開ページ・APIルートは認証セッションを必要としないため、Supabase への
  // 往復をスキップする。これにより匿名のテスト面（/try, /api/analyze 等）が、
  // Supabase が一時停止/不通でもハングしない。
  if (isPublic(pathname) || pathname.startsWith("/api/")) {
    return proxyResponse;
  }

  const supabase = createServerClient(
    publicEnv().NEXT_PUBLIC_SUPABASE_URL,
    publicEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          proxyResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            proxyResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth guard — redirect unauthenticated users away from protected pages.
  if (!user && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // If logged in and visiting login/signup, bounce to dashboard.
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  void isPublic; // referenced for future symmetric checks
  return proxyResponse;
}
