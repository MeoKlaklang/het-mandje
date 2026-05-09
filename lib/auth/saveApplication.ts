import { createClient } from "@/lib/supabase/client";

export async function saveApplication(
  answers: Record<string, string>
) {
  const supabase = createClient();

  // Huidige ingelogde user ophalen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: new Error("Geen ingelogde gebruiker gevonden.") };
  }

  // Antwoorden opslaan in foster_applications
  const { error: applicationError } = await supabase
    .from("foster_applications")
    .insert({
      user_id: user.id,
      answers,
      status: "in_review",
      current_step: 1,
    });

  if (applicationError) {
    return { error: applicationError };
  }

  // Profiel updaten zodat onboarding voltooid is
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError };
  }

  return { error: null };
}