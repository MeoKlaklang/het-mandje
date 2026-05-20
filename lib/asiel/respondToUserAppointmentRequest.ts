import { createClient } from "@/lib/supabase/client";

type RespondToUserAppointmentRequestData = {
  appointmentId: string;
  action: "accept_request" | "decline_request";
};

export async function respondToUserAppointmentRequest(
  data: RespondToUserAppointmentRequestData
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

  const { data: shelter, error: shelterError } = await supabase
    .from("shelters")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (shelterError || !shelter) {
    return {
      success: false,
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select(
      `
      id,
      shelter_id,
      foster_id,
      animal_id,
      title,
      start_at,
      end_at,
      animals (
        id,
        name
      )
    `
    )
    .eq("id", data.appointmentId)
    .eq("shelter_id", shelter.id)
    .eq("approval_status", "pending_shelter_approval")
    .single();

  if (appointmentError || !appointment) {
    return {
      success: false,
      error:
        appointmentError?.message ||
        "Afspraakaanvraag niet gevonden of al beantwoord.",
    };
  }

  const animalData = Array.isArray(appointment.animals)
    ? appointment.animals[0]
    : appointment.animals;

  if (data.action === "accept_request") {
    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        approval_status: "confirmed",
        status: "confirmed",
      })
      .eq("id", data.appointmentId)
      .eq("shelter_id", shelter.id);

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      };
    }

    if (appointment.foster_id) {
      await supabase.from("notifications").insert({
        user_id: appointment.foster_id,
        title: "Afspraak goedgekeurd",
        message: `${shelter.name} heeft je afspraakaanvraag voor ${
          animalData?.name || "het dier"
        } goedgekeurd.`,
        type: "appointment_confirmed",
        related_animal_id: appointment.animal_id,
      });
    }

    return {
      success: true,
      error: null,
    };
  }

  if (data.action === "decline_request") {
    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        approval_status: "declined",
        status: "cancelled",
      })
      .eq("id", data.appointmentId)
      .eq("shelter_id", shelter.id);

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      };
    }

    if (appointment.foster_id) {
      await supabase.from("notifications").insert({
        user_id: appointment.foster_id,
        title: "Afspraak geweigerd",
        message: `${shelter.name} heeft je afspraakaanvraag voor ${
          animalData?.name || "het dier"
        } geweigerd.`,
        type: "appointment_declined",
        related_animal_id: appointment.animal_id,
      });
    }

    return {
      success: true,
      error: null,
    };
  }

  return {
    success: false,
    error: "Onbekende actie.",
  };
}