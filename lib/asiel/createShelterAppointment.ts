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
    .select("id")
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

  const { error } = await supabase.from("appointments").insert({
    shelter_id: shelter.id,
    animal_id: data.animalId || null,
    title: data.title,
    description: data.description || null,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    appointment_type: data.appointmentType || "algemeen",
    created_by: data.createdBy || null,
    status: "confirmed",
  });

  if (error) {
    console.error("Fout bij aanmaken asiel afspraak:", error);

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