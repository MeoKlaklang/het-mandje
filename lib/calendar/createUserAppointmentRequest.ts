import { createClient } from "@/lib/supabase/client";

type CreateUserAppointmentRequestData = {
  animalId: string;
  shelterId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
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

  const { error } = await supabase.from("appointments").insert({
    foster_id: user.id,
    shelter_id: data.shelterId,
    animal_id: data.animalId,

    title: data.title,
    description: data.description || null,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),

    appointment_type: data.appointmentType || "algemeen",
    created_by: "Pleeggezin",
    requested_by: "foster",

    status: "pending",
    approval_status: "pending_shelter_approval",
  });

  if (error) {
    console.error("Fout bij afspraak aanvragen:", error);

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