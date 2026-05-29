import { createClient } from "@/lib/supabase/client";

type AppointmentTarget = "shelter" | "veterinarian";

type CreateUserAppointmentRequestData = {
  animalId: string;
  shelterId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  appointmentTarget: AppointmentTarget;
};

export async function createUserAppointmentRequest(
  data: CreateUserAppointmentRequestData
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

  const startAt = new Date(`${data.date}T${data.startTime}:00`);
  const endAt = new Date(`${data.date}T${data.endTime}:00`);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return {
      success: false,
      error: "De datum of het uur is ongeldig.",
    };
  }

  if (endAt <= startAt) {
    return {
      success: false,
      error: "Het einduur moet later zijn dan het startuur.",
    };
  }

  let veterinarianUserId: string | null = null;

  if (data.appointmentTarget === "veterinarian") {
    const { data: veterinarians, error: veterinarianError } = await supabase
      .from("veterinarians")
      .select("id, user_id, shelter_id, practice_name, first_name, last_name")
      .eq("shelter_id", data.shelterId)
      .not("user_id", "is", null)
      .limit(1);

    if (veterinarianError) {
      console.error("Fout bij ophalen dierenarts:", veterinarianError);

      return {
        success: false,
        error: veterinarianError.message,
      };
    }

    const veterinarian = veterinarians?.[0];

    if (!veterinarian?.user_id) {
      console.error("Geen dierenarts gevonden voor shelter_id:", data.shelterId);

      return {
        success: false,
        error:
          "Er is geen dierenarts gevonden voor dit dierenasiel. Controleer of de dierenarts in Supabase dezelfde shelter_id heeft als dit dier.",
      };
    }

    veterinarianUserId = veterinarian.user_id;
  }

  const approvalStatus =
    data.appointmentTarget === "veterinarian"
      ? "pending_veterinarian_approval"
      : "pending_shelter_approval";

  const appointmentType =
    data.appointmentTarget === "veterinarian"
      ? data.appointmentType || "dierenarts"
      : data.appointmentType || "algemeen";

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      foster_id: user.id,
      shelter_id: data.shelterId,
      animal_id: data.animalId,

      // Belangrijk:
      // dierenartsagenda zoekt op veterinarian_id = auth user id van dierenarts
      veterinarian_id: veterinarianUserId,

      title: data.title,
      description: data.description || null,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),

      appointment_type: appointmentType,
      created_by: "Pleeggezin",
      requested_by: "foster",

      status: "pending",
      approval_status: approvalStatus,

      response_message: null,
      proposed_new_start_at: null,
      proposed_new_end_at: null,
    })
    .select("id")
    .single();

  if (error || !appointment) {
    console.error("Fout bij afspraak aanvragen:", error);

    return {
      success: false,
      error: error?.message || "Afspraak kon niet aangevraagd worden.",
    };
  }

  return {
    success: true,
    error: null,
  };
}