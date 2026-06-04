"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";

export type AuthState = { error?: string } | null;

/* ------------------------------------------------------------------ */
/* Sign up with email + password                                       */
/* ------------------------------------------------------------------ */
export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "メールとパスワードを入力してください" };
  if (password.length < 8) return { error: "パスワードは8文字以上で設定してください" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${publicEnv().NEXT_PUBLIC_APP_URL}/dashboard`,
    },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

/* ------------------------------------------------------------------ */
/* Log in with email + password                                        */
/* ------------------------------------------------------------------ */
export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "メールとパスワードを入力してください" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/* ------------------------------------------------------------------ */
/* Sign out                                                            */
/* ------------------------------------------------------------------ */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/* ------------------------------------------------------------------ */
/* OAuth — Google                                                      */
/* ------------------------------------------------------------------ */
export async function googleSignInAction() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${publicEnv().NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });
  if (error) throw new Error(error.message);
  if (data.url) redirect(data.url);
}
