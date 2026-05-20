import { createClient } from "@/lib/supabase/client";

type RespondToAppointmentProposalData = {
  appointmentId: string;
  action: "accept_proposal" | "decline_proposal";
};

function formatAppointmentDate(startAt: Date, endAt: Date) {
  const date = startAt.toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const start = startAt.toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const end = endAt.toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} van ${start} tot ${end}`;
}

export async function respondToAppointmentProposal(
  data: RespondToAppointmentProposalData
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
      proposed_new_start_at,
      proposed_new_end_at,
      animals (
        id,
        name
      )
    `
    )
    .eq("id", data.appointmentId)
    .eq("shelter_id", shelter.id)
    .single();

  if (appointmentError || !appointment) {
    return {
      success: false,
      error: appointmentError?.message || "Afspraak niet gevonden.",
    };
  }

  if (data.action === "accept_proposal") {
    if (!appointment.proposed_new_start_at || !appointment.proposed_new_end_at) {
      return {
        success: false,
        error: "Er is geen nieuw datumvoorstel gevonden.",
      };
    }

    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        start_at: appointment.proposed_new_start_at,
        end_at: appointment.proposed_new_end_at,
        approval_status: "confirmed",
        status: "confirmed",
        proposed_new_start_at: null,
        proposed_new_end_at: null,
      })
      .eq("id", data.appointmentId)
      .eq("shelter_id", shelter.id);

    if (updateError) {
      console.error("Fout bij accepteren voorstel:", updateError);

      return {
        success: false,
        error: updateError.message,
      };
    }

    const animalData = Array.isArray(appointment.animals)
      ? appointment.animals[0]
      : appointment.animals;

    const readableDate = formatAppointmentDate(
      new Date(appointment.proposed_new_start_at),
      new Date(appointment.proposed_new_end_at)
    );

    if (appointment.foster_id) {
      await supabase.from("notifications").insert({
        user_id: appointment.foster_id,
        title: `Nieuw datumvoorstel goedgekeurd`,
        message: `${shelter.name} heeft je nieuw voorstel voor ${
          animalData?.name || "de afspraak"
        } goedgekeurd. De afspraak staat nu gepland op ${readableDate}.`,
        type: "appointment_confirmed",
        related_animal_id: appointment.animal_id,
      });
    }

    return {
      success: true,
      error: null,
    };
  }

  if (data.action === "decline_proposal") {
    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        approval_status: "declined",
        status: "cancelled",
      })
      .eq("id", data.appointmentId)
      .eq("shelter_id", shelter.id);

    if (updateError) {
      console.error("Fout bij weigeren voorstel:", updateError);

      return {
        success: false,
        error: updateError.message,
      };
    }

    const animalData = Array.isArray(appointment.animals)
      ? appointment.animals[0]
      : appointment.animals;

    if (appointment.foster_id) {
      await supabase.from("notifications").insert({
        user_id: appointment.foster_id,
        title: `Nieuw datumvoorstel geweigerd`,
        message: `${shelter.name} heeft je nieuw voorstel voor ${
          animalData?.name || "de afspraak"
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