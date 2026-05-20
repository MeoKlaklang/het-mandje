import { createClient } from "@/lib/supabase/client";

type CreateAnimalAppointmentRequestData = {
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

export async function createAnimalAppointmentRequest(
  data: CreateAnimalAppointmentRequestData
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

  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .select("id, name, shelter_id")
    .eq("id", data.animalId)
    .single();

  if (animalError || !animal) {
    return {
      success: false,
      error: animalError?.message || "Dier niet gevonden.",
    };
  }

  const { data: shelter, error: shelterError } = await supabase
    .from("shelters")
    .select("id, name")
    .eq("id", animal.shelter_id)
    .eq("owner_id", user.id)
    .single();

  if (shelterError || !shelter) {
    return {
      success: false,
      error: "Je mag geen afspraak maken voor dit dier.",
    };
  }

  const { data: approvedApplication, error: applicationError } = await supabase
    .from("animal_applications")
    .select("id, user_id")
    .eq("animal_id", data.animalId)
    .eq("shelter_id", shelter.id)
    .eq("status", "goedgekeurd")
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
        "Dit dier heeft nog geen goedgekeurd pleeggezin. Je kan nog geen afspraak voorstellen aan een user.",
    };
  }

  const startAt = new Date(`${data.date}T${data.startTime}:00`);
  const endAt = new Date(`${data.date}T${data.endTime}:00`);

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      shelter_id: shelter.id,
      animal_id: data.animalId,
      foster_id: approvedApplication.user_id,

      title: data.title,
      description: data.description || null,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),

      appointment_type: data.appointmentType || "algemeen",
      created_by: data.createdBy || shelter.name,
      location: data.location || null,

      status: "pending",
      approval_status: "pending_user_approval",
    })
    .select("id")
    .single();

  if (appointmentError || !appointment) {
    console.error("Fout bij afspraakvoorstel:", appointmentError);

    return {
      success: false,
      error: appointmentError?.message || "Afspraak kon niet worden opgeslagen.",
    };
  }

  const readableDate = formatAppointmentDate(startAt, endAt);

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: approvedApplication.user_id,
      title: `Nieuwe afspraak voorgesteld voor ${animal.name}`,
      message: `${shelter.name} heeft een afspraak voorgesteld voor ${animal.name}: ${data.title} op ${readableDate}.`,
      type: "appointment_request",
      related_animal_id: data.animalId,
      related_application_id: approvedApplication.id,
    });

  if (notificationError) {
    console.error("Fout bij maken afspraak-notificatie:", notificationError);

    return {
      success: false,
      error: notificationError.message,
    };
  }

  return {
    success: true,
    error: null,
  };
}