import { createClient } from "@/lib/supabase/client";

export async function deleteDierenartsAppointment(appointmentId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Je bent niet ingelogd.",
    };
  }

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId)
    .eq("veterinarian_id", user.id);

  if (error) {
    console.error("Fout bij verwijderen afspraak:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    error: null,
  };
}