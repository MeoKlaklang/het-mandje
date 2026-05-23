import { createClient } from "@/lib/supabase/client";

type CreateDierenartsAppointmentData = {
  animalId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  location?: string;
  createdBy: string;
};

function formatReadableDate(startAt: Date, endAt: Date) {
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

export async function createDierenartsAppointment(
  data: CreateDierenartsAppointmentData
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

  const { data: veterinarian, error: veterinarianError } = await supabase
    .from("veterinarians")
    .select("id, user_id, shelter_id, first_name, last_name, practice_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (veterinarianError || !veterinarian?.shelter_id) {
    return {
      success: false,
      error: "Geen gekoppeld dierenasiel gevonden.",
    };
  }

  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .select("id, name, shelter_id")
    .eq("id", data.animalId)
    .eq("shelter_id", veterinarian.shelter_id)
    .maybeSingle();

  if (animalError || !animal) {
    return {
      success: false,
      error: "Dit dier hoort niet bij jouw gekoppeld asiel.",
    };
  }

  const { data: application, error: applicationError } = await supabase
    .from("animal_applications")
    .select("id, user_id, status")
    .eq("animal_id", data.animalId)
    .eq("shelter_id", veterinarian.shelter_id)
    .eq("status", "goedgekeurd")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (applicationError) {
    return {
      success: false,
      error: applicationError.message,
    };
  }

  if (!application?.user_id) {
    return {
      success: false,
      error:
        "Dit dier heeft geen goedgekeurd pleeggezin. Je kan nog geen afspraak voorstellen.",
    };
  }

  const startAt = new Date(`${data.date}T${data.startTime}:00`);
  const endAt = new Date(`${data.date}T${data.endTime}:00`);

  const doctorName =
    data.createdBy ||
    veterinarian.practice_name ||
    `Dr. ${veterinarian.last_name || veterinarian.first_name || ""}`.trim() ||
    "Dierenarts";

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      foster_id: application.user_id,
      shelter_id: veterinarian.shelter_id,
      animal_id: data.animalId,
      veterinarian_id: user.id,

      title: data.title,
      description: data.description || null,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),

      appointment_type: data.appointmentType || "dierenarts",
      location: data.location || null,
      created_by: doctorName,

      status: "pending",
      approval_status: "pending_user_approval",
      requested_by: "veterinarian",

      response_message: null,
      proposed_new_start_at: null,
      proposed_new_end_at: null,
    })
    .select("id")
    .single();

  if (appointmentError || !appointment) {
    return {
      success: false,
      error:
        appointmentError?.message || "Afspraak kon niet aangemaakt worden.",
    };
  }

  const readableDate = formatReadableDate(startAt, endAt);

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: application.user_id,
      title: "Nieuwe dierenartsafspraak",
      message: `${doctorName} heeft een afspraak voorgesteld voor ${animal.name}: ${data.title} op ${readableDate}.`,
      type: "veterinarian_appointment_request",
      related_animal_id: data.animalId,
      related_application_id: application.id,
      is_read: false,
    });

  if (notificationError) {
    console.error("Fout bij maken dierenarts-notificatie:", notificationError);

    return {
      success: false,
      error: `Afspraak is aangemaakt, maar de notificatie kon niet gemaakt worden: ${notificationError.message}`,
    };
  }

  return {
    success: true,
    error: null,
  };
}