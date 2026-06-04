"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Platform } from "@/types/domain";

export type OnboardingInput = {
  companyName: string;
  platforms: Platform[];
  industries: string[];
  urls: string[];
};

export async function saveProfileAction(input: OnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };

  // The DB trigger handle_new_user already inserts an empty row on signup.
  // First try to update; if no row exists yet (race condition / older user),
  // fall back to inserting one.
  const payload = {
    company_name: input.companyName || null,
    primary_platforms: input.platforms,
    industries: input.industries,
    reference_urls: input.urls.filter((u) => u.trim().length > 0),
  };

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update(payload)
    .eq("user_id", user.id)
    .select("id");

  if (updateError) return { error: updateError.message };

  if (!updated || updated.length === 0) {
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({ ...payload, user_id: user.id });
    if (insertError) return { error: insertError.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
