import { createClient } from "@/lib/supabase/client";

export async function getCurrentProfile() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      role,
      avatar_url,
      phone,
      phone_verified
    `
    )
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { profile: null };
  }

  return { profile };
}