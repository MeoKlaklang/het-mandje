import { createClient } from "@/lib/supabase/client";

export async function respondToDierenartsAppointmentProposal(
  appointmentId: string,
  response: "accepted" | "declined"
) {
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

  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("id, proposed_new_start_at, proposed_new_end_at")
    .eq("id", appointmentId)
    .eq("veterinarian_id", user.id)
    .maybeSingle();

  if (fetchError || !appointment) {
    return {
      success: false,
      error: fetchError?.message || "Afspraak niet gevonden.",
    };
  }

  if (response === "accepted") {
    if (!appointment.proposed_new_start_at || !appointment.proposed_new_end_at) {
      return {
        success: false,
        error: "Er is geen nieuw voorstel gevonden.",
      };
    }

    const { error } = await supabase
      .from("appointments")
      .update({
        start_at: appointment.proposed_new_start_at,
        end_at: appointment.proposed_new_end_at,
        proposed_new_start_at: null,
        proposed_new_end_at: null,
        status: "confirmed",
        approval_status: "confirmed",
      })
      .eq("id", appointmentId)
      .eq("veterinarian_id", user.id);

    if (error) {
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

  const { error } = await supabase
    .from("appointments")
    .update({
      status: "declined",
      approval_status: "declined",
    })
    .eq("id", appointmentId)
    .eq("veterinarian_id", user.id);

  if (error) {
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