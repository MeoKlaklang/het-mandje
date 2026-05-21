import { createClient } from "@/lib/supabase/client";

type CreateDierenartsAnimalAppointmentRequestData = {
  animalId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  location: string;
  createdBy: string;
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

export async function createDierenartsAnimalAppointmentRequest(
  data: CreateDierenartsAnimalAppointmentRequestData
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
    .single();

  if (veterinarianError || !veterinarian) {
    return {
      success: false,
      error: "Geen dierenartsprofiel gevonden.",
    };
  }

  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .select("id, name, shelter_id")
    .eq("id", data.animalId)
    .eq("shelter_id", veterinarian.shelter_id)
    .single();

  if (animalError || !animal) {
    return {
      success: false,
      error: animalError?.message || "Dier niet gevonden voor dit dierenasiel.",
    };
  }

  const { data: approvedApplication, error: applicationError } = await supabase
    .from("animal_applications")
    .select("id, user_id")
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

  if (!approvedApplication?.user_id) {
    return {
      success: false,
      error:
        "Dit dier heeft momenteel geen goedgekeurd pleeggezin om een afspraak naar te sturen.",
    };
  }

  const startAt = new Date(`${data.date}T${data.startTime}:00`);
  const endAt = new Date(`${data.date}T${data.endTime}:00`);

  const doctorName =
    data.createdBy ||
    veterinarian.practice_name ||
    `Dr. ${veterinarian.last_name || veterinarian.first_name || ""}`.trim();

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      foster_id: approvedApplication.user_id,
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
    })
    .select("id")
    .single();

  if (appointmentError || !appointment) {
    return {
      success: false,
      error: appointmentError?.message || "Afspraak kon niet aangemaakt worden.",
    };
  }

  const readableDate = formatAppointmentDate(startAt, endAt);

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: approvedApplication.user_id,
      title: `Nieuwe dierenartsafspraak voorgesteld voor ${animal.name}`,
      message: `${doctorName} heeft een afspraak voorgesteld voor ${animal.name}: ${data.title} op ${readableDate}.`,
      type: "appointment_request",
      related_animal_id: data.animalId,
      related_application_id: approvedApplication.id,
    });

  if (notificationError) {
    console.error("Fout bij maken notificatie:", notificationError);
  }

  return {
    success: true,
    error: null,
  };
}