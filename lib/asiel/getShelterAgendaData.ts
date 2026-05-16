import { createClient } from "@/lib/supabase/client";

export type ShelterAgendaAppointment = {
  id: string;
  shelter_id: string;
  animal_id: string | null;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  status: string | null;
  appointment_type: string | null;
  created_by: string | null;
  animals?: {
    id: string;
    name: string;
    image_url: string | null;
  } | null;
};

export async function getShelterAgendaData() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      appointments: [],
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
      appointments: [],
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      shelter_id,
      animal_id,
      title,
      description,
      start_at,
      end_at,
      status,
      appointment_type,
      created_by,
      animals (
        id,
        name,
        image_url
      )
    `
    )
    .eq("shelter_id", shelter.id)
    .order("start_at", { ascending: true });

  if (error) {
    console.error("Fout bij ophalen asiel agenda:", error);

    return {
      appointments: [],
      error: error.message,
    };
  }

  const appointments = (data || []).map((appointment) => {
    const animalData = Array.isArray(appointment.animals)
      ? appointment.animals[0]
      : appointment.animals;

    return {
      ...appointment,
      animals: animalData || null,
    };
  }) as ShelterAgendaAppointment[];

  return {
    appointments,
    error: null,
  };
}