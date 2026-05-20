import { createClient } from "@/lib/supabase/client";

export type ShelterAgendaAppointment = {
  id: string;
  shelter_id: string;
  animal_id: string | null;
  foster_id: string | null;

  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  status: string | null;

  approval_status: string | null;
  location: string | null;
  response_message: string | null;
  proposed_new_start_at: string | null;
  proposed_new_end_at: string | null;

  appointment_type: string | null;
  created_by: string | null;

  animals?: {
    id: string;
    name: string;
    image_url: string | null;
    breed?: string | null;
    species?: string | null;
  } | null;

  fosterProfile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    city: string | null;
  } | null;
};

type AppointmentRow = {
  id: string;
  shelter_id: string;
  animal_id: string | null;
  foster_id: string | null;

  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  status: string | null;

  approval_status: string | null;
  location: string | null;
  response_message: string | null;
  proposed_new_start_at: string | null;
  proposed_new_end_at: string | null;

  appointment_type: string | null;
  created_by: string | null;

  animals:
    | {
        id: string;
        name: string;
        image_url: string | null;
        breed: string | null;
        species: string | null;
      }
    | {
        id: string;
        name: string;
        image_url: string | null;
        breed: string | null;
        species: string | null;
      }[]
    | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
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
      foster_id,
      title,
      description,
      start_at,
      end_at,
      status,
      approval_status,
      location,
      response_message,
      proposed_new_start_at,
      proposed_new_end_at,
      appointment_type,
      created_by,
      animals (
        id,
        name,
        image_url,
        breed,
        species
      )
    `
    )
    .eq("shelter_id", shelter.id)
    .order("start_at", { ascending: false });

  if (error) {
    console.error("Fout bij ophalen asiel agenda:", error);

    return {
      appointments: [],
      error: error.message,
    };
  }

  const appointmentRows = (data || []) as AppointmentRow[];

  const fosterIds = Array.from(
    new Set(
      appointmentRows
        .map((appointment) => appointment.foster_id)
        .filter(Boolean)
    )
  ) as string[];

  let profiles: ProfileRow[] = [];

  if (fosterIds.length > 0) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, city")
      .in("id", fosterIds);

    if (profileError) {
      console.error("Fout bij ophalen pleeggezinnen:", profileError);
    } else {
      profiles = (profileData || []) as ProfileRow[];
    }
  }

  const appointments = appointmentRows.map((appointment) => {
    const animalData = Array.isArray(appointment.animals)
      ? appointment.animals[0]
      : appointment.animals;

    const fosterProfile = appointment.foster_id
      ? profiles.find((profile) => profile.id === appointment.foster_id) || null
      : null;

    return {
      ...appointment,
      animals: animalData || null,
      fosterProfile,
    };
  }) as ShelterAgendaAppointment[];

  return {
    appointments,
    error: null,
  };
}