import { createClient } from "@/lib/supabase/client";

export async function logoutUser() {
  const supabase = createClient();

  await supabase.auth.signOut();
}