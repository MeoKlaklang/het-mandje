import { createClient } from "@/lib/supabase/client";

export type DierenartsDashboardProfile = {
  id: string;
  user_id: string;
  shelter_id: string | null;
  first_name: string | null;
  last_name: string | null;
  practice_name: string | null;
};

export type DierenartsDashboardAppointment = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  status: string | null;
  approval_status: string | null;
  appointment_type: string | null;
  created_by: string | null;
  foster_id: string | null;
  animal_id: string | null;

  animal: {
    id: string;
    name: string;
    image_url: string | null;
    species: string | null;
    breed: string | null;
  } | null;

  fosterProfile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    city: string | null;
  } | null;
};

export type DierenartsCalendarAppointment = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
};

export type DierenartsDashboardPatient = {
  id: string;
  name: string;
  image_url: string | null;
  species: string | null;
  breed: string | null;
  status: string | null;
};

type AppointmentRow = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  status: string | null;
  approval_status: string | null;
  appointment_type: string | null;
  created_by: string | null;
  foster_id: string | null;
  animal_id: string | null;

  animals:
    | {
        id: string;
        name: string;
        image_url: string | null;
        species: string | null;
        breed: string | null;
      }
    | {
        id: string;
        name: string;
        image_url: string | null;
        species: string | null;
        breed: string | null;
      }[]
    | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export async function getDierenartsDashboardData() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      profile: null,
      todayAppointments: [],
      appointmentRequests: [],
      calendarAppointments: [],
      patients: [],
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
      profile: null,
      todayAppointments: [],
      appointmentRequests: [],
      calendarAppointments: [],
      patients: [],
      error: "Geen dierenartsprofiel gevonden.",
    };
  }

  const { data: patientsData, error: patientsError } = await supabase
    .from("animals")
    .select("id, name, image_url, species, breed, status")
    .eq("shelter_id", veterinarian.shelter_id)
    .order("created_at", { ascending: false })
    .limit(6);

  if (patientsError) {
    console.error("Fout bij ophalen patiënten:", patientsError);
  }

  const { data: todayData, error: todayError } = await supabase
    .from("appointments")
    .select(
      `
      id,
      title,
      description,
      start_at,
      end_at,
      status,
      approval_status,
      appointment_type,
      created_by,
      foster_id,
      animal_id,
      animals (
        id,
        name,
        image_url,
        species,
        breed
      )
    `
    )
    .eq("veterinarian_id", user.id)
    .neq("status", "cancelled")
    .gte("start_at", startOfToday())
    .lte("start_at", endOfToday())
    .order("start_at", { ascending: true });

  if (todayError) {
    console.error("Fout bij ophalen afspraken vandaag:", todayError);
  }

  const { data: requestData, error: requestError } = await supabase
    .from("appointments")
    .select(
      `
      id,
      title,
      description,
      start_at,
      end_at,
      status,
      approval_status,
      appointment_type,
      created_by,
      foster_id,
      animal_id,
      animals (
        id,
        name,
        image_url,
        species,
        breed
      )
    `
    )
    .eq("veterinarian_id", user.id)
    .eq("approval_status", "pending_veterinarian_approval")
    .order("start_at", { ascending: true })
    .limit(6);

  if (requestError) {
    console.error("Fout bij ophalen afspraakaanvragen:", requestError);
  }

  const { data: calendarData, error: calendarError } = await supabase
    .from("appointments")
    .select(
      `
      id,
      title,
      start_at,
      end_at
    `
    )
    .eq("veterinarian_id", user.id)
    .neq("status", "cancelled")
    .order("start_at", { ascending: true });

  if (calendarError) {
    console.error("Fout bij ophalen kalenderafspraken:", calendarError);
  }

  const allAppointmentRows = [
    ...(((todayData || []) as AppointmentRow[]) || []),
    ...(((requestData || []) as AppointmentRow[]) || []),
  ];

  const fosterIds = Array.from(
    new Set(
      allAppointmentRows
        .map((appointment) => appointment.foster_id)
        .filter(Boolean)
    )
  ) as string[];

  let fosterProfiles: ProfileRow[] = [];

  if (fosterIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, city")
      .in("id", fosterIds);

    if (profilesError) {
      console.error("Fout bij ophalen pleeggezinnen:", profilesError);
    } else {
      fosterProfiles = (profilesData || []) as ProfileRow[];
    }
  }

  function mapAppointment(row: AppointmentRow): DierenartsDashboardAppointment {
    const animal = Array.isArray(row.animals) ? row.animals[0] : row.animals;

    const fosterProfile = row.foster_id
      ? fosterProfiles.find((profile) => profile.id === row.foster_id) || null
      : null;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      start_at: row.start_at,
      end_at: row.end_at,
      status: row.status,
      approval_status: row.approval_status,
      appointment_type: row.appointment_type,
      created_by: row.created_by,
      foster_id: row.foster_id,
      animal_id: row.animal_id,
      animal: animal || null,
      fosterProfile,
    };
  }

  return {
    profile: veterinarian as DierenartsDashboardProfile,

    todayAppointments: ((todayData || []) as AppointmentRow[]).map(
      mapAppointment
    ),

    appointmentRequests: ((requestData || []) as AppointmentRow[]).map(
      mapAppointment
    ),

    calendarAppointments: (calendarData ||
      []) as DierenartsCalendarAppointment[],

    patients: (patientsData || []) as DierenartsDashboardPatient[],

    error: null,
  };
}