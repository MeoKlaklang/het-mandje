import { createClient } from "@/lib/supabase/client";

export async function deleteAccount() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Geen gebruiker gevonden.");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (profileError) {
    throw profileError;
  }

  await supabase.auth.signOut();
}