import { createClient } from "@/lib/supabase/client";

type RespondToAppointmentData = {
  appointmentId: string;
  action: "confirmed" | "declined" | "new_time_requested";
  responseMessage?: string;
  proposedNewDate?: string;
  proposedNewStartTime?: string;
  proposedNewEndTime?: string;
};

export async function respondToAppointment(data: RespondToAppointmentData) {
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

  let updateData: Record<string, string | null> = {
    response_message: data.responseMessage || null,
  };

  if (data.action === "confirmed") {
    updateData = {
      ...updateData,
      approval_status: "confirmed",
      status: "confirmed",
      proposed_new_start_at: null,
      proposed_new_end_at: null,
    };
  }

  if (data.action === "declined") {
    updateData = {
      ...updateData,
      approval_status: "declined",
      status: "cancelled",
      proposed_new_start_at: null,
      proposed_new_end_at: null,
    };
  }

  if (data.action === "new_time_requested") {
    if (
      !data.proposedNewDate ||
      !data.proposedNewStartTime ||
      !data.proposedNewEndTime
    ) {
      return {
        success: false,
        error: "Vul een nieuwe datum, startuur en einduur in.",
      };
    }

    const proposedStart = new Date(
      `${data.proposedNewDate}T${data.proposedNewStartTime}:00`
    );

    const proposedEnd = new Date(
      `${data.proposedNewDate}T${data.proposedNewEndTime}:00`
    );

    updateData = {
      ...updateData,
      approval_status: "new_time_requested",
      status: "pending",
      proposed_new_start_at: proposedStart.toISOString(),
      proposed_new_end_at: proposedEnd.toISOString(),
    };
  }

  const { error } = await supabase
    .from("appointments")
    .update(updateData)
    .eq("id", data.appointmentId)
    .eq("foster_id", user.id);

  if (error) {
    console.error("Fout bij beantwoorden afspraak:", error);

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