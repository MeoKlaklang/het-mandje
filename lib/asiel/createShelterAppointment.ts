import { createClient } from "@/lib/supabase/client";

type CreateShelterAppointmentData = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  animalId: string;
  appointmentType: string;
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

export async function createShelterAppointment(
  data: CreateShelterAppointmentData
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

  const startAt = new Date(`${data.date}T${data.startTime}:00`);
  const endAt = new Date(`${data.date}T${data.endTime}:00`);

  let fosterId: string | null = null;
  let applicationId: string | null = null;
  let animalName = "";

  if (data.animalId) {
    const { data: animal, error: animalError } = await supabase
      .from("animals")
      .select("id, name, shelter_id")
      .eq("id", data.animalId)
      .eq("shelter_id", shelter.id)
      .single();

    if (animalError || !animal) {
      return {
        success: false,
        error: animalError?.message || "Dier niet gevonden.",
      };
    }

    animalName = animal.name;

    const { data: approvedApplication, error: applicationError } =
      await supabase
        .from("animal_applications")
        .select("id, user_id, created_at")
        .eq("animal_id", data.animalId)
        .eq("shelter_id", shelter.id)
        .eq("status", "goedgekeurd")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (applicationError) {
      console.error("Fout bij ophalen goedgekeurde aanvraag:", applicationError);

      return {
        success: false,
        error: applicationError.message,
      };
    }

    if (approvedApplication?.user_id) {
      fosterId = approvedApplication.user_id;
      applicationId = approvedApplication.id;
    }
  }

  const needsUserApproval = Boolean(fosterId && data.animalId);

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      shelter_id: shelter.id,
      animal_id: data.animalId || null,
      foster_id: fosterId,

      title: data.title,
      description: data.description || null,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),

      appointment_type: data.appointmentType || "algemeen",
      created_by: data.createdBy || shelter.name,

      status: needsUserApproval ? "pending" : "confirmed",
      approval_status: needsUserApproval
        ? "pending_user_approval"
        : "confirmed",
    })
    .select("id")
    .single();

  if (appointmentError || !appointment) {
    console.error("Fout bij aanmaken asiel afspraak:", appointmentError);

    return {
      success: false,
      error:
        appointmentError?.message || "Afspraak kon niet worden opgeslagen.",
    };
  }

  if (needsUserApproval && fosterId && applicationId) {
    const readableDate = formatAppointmentDate(startAt, endAt);

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: fosterId,
        title: `Nieuwe afspraak voorgesteld voor ${animalName}`,
        message: `${shelter.name} heeft een afspraak voorgesteld voor ${animalName}: ${data.title} op ${readableDate}.`,
        type: "appointment_request",
        related_animal_id: data.animalId,
        related_application_id: applicationId,
      });

    if (notificationError) {
      console.error("Fout bij maken afspraak-notificatie:", notificationError);

      return {
        success: false,
        error: notificationError.message,
      };
    }
  }

  return {
    success: true,
    error: null,
  };
}