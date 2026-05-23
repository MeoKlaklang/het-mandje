import { createClient } from "@/lib/supabase/client";

export async function respondToUserVetAppointmentRequest(
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

  const nextStatus = response === "accepted" ? "confirmed" : "declined";
  const nextApprovalStatus = response === "accepted" ? "confirmed" : "declined";

  const { error } = await supabase
    .from("appointments")
    .update({
      status: nextStatus,
      approval_status: nextApprovalStatus,
    })
    .eq("id", appointmentId)
    .eq("veterinarian_id", user.id);

  if (error) {
    console.error("Fout bij beantwoorden afspraakverzoek:", error);

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