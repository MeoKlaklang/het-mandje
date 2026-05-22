import { createClient } from "@/lib/supabase/client";

export type DierenartsAnimalDossier = {
  id: string;
  created_at: string | null;
  shelter_id: string | null;

  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  age: string | null;
  size: string | null;

  city: string | null;
  postal_code: string | null;
  country: string | null;

  description: string | null;
  short_description: string | null;
  care_level: string | null;
  medical_notes: string | null;
  behavior_notes: string | null;

  available_from: string | null;
  available_until: string | null;
  expected_duration: string | null;
  status: string | null;
  image_url: string | null;

  vaccinated: boolean | null;
  neutered: boolean | null;
  can_live_with_cats: boolean | null;
  can_live_with_dogs: boolean | null;
  can_live_with_children: boolean | null;
  can_be_home_alone: boolean | null;

  chip_number: string | null;
  passport_number: string | null;
  birth_date: string | null;
  weight: string | null;
  coat_color: string | null;
  special_needs: string | null;

  origin: string | null;
  intake_date: string | null;
  intake_reason: string | null;
  intake_notes: string | null;
  admitted_by: string | null;

  temperament: string | null;
  needs_medication: boolean | null;
  house_trained: boolean | null;

  shelter: {
    id: string;
    name: string;
    city: string | null;
  } | null;

  fosterApplication: {
    id: string;
    user_id: string;
    status: string;
    message: string | null;
    start_date: string | null;
    end_date: string | null;
    fosterProfile: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      city: string | null;
      postal_code: string | null;
      phone: string | null;
      email: string | null;
    } | null;
  } | null;
};

type ShelterJoin =
  | {
      id: string;
      name: string;
      city: string | null;
    }
  | {
      id: string;
      name: string;
      city: string | null;
    }[]
  | null;

type AnimalRow = Omit<
  DierenartsAnimalDossier,
  "shelter" | "fosterApplication"
> & {
  shelters: ShelterJoin;
};

type ApplicationRow = {
  id: string;
  user_id: string;
  status: string;
  message: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  postal_code: string | null;
};

const ACTIVE_APPLICATION_STATUSES = [
  "goedgekeurd",
  "Goedgekeurd",
  "approved",
  "Approved",
  "accepted",
  "Accepted",
  "in_opvang",
  "In opvang",
  "opvang",
];

export async function getDierenartsAnimalDossier(animalId: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: "Je bent niet ingelogd.",
    };
  }

  const { data: veterinarian, error: veterinarianError } = await supabase
    .from("veterinarians")
    .select("id, user_id, shelter_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (veterinarianError) {
    console.error("Fout bij ophalen dierenartsprofiel:", veterinarianError);

    return {
      data: null,
      error: veterinarianError.message,
    };
  }

  if (!veterinarian) {
    return {
      data: null,
      error: "Geen dierenartsprofiel gevonden.",
    };
  }

  if (!veterinarian.shelter_id) {
    return {
      data: null,
      error: "Er is geen dierenasiel gekoppeld aan dit dierenartsaccount.",
    };
  }

  const { data: animalData, error: animalError } = await supabase
    .from("animals")
    .select(
      `
      *,
      shelters (
        id,
        name,
        city
      )
    `
    )
    .eq("id", animalId)
    .eq("shelter_id", veterinarian.shelter_id)
    .maybeSingle();

  if (animalError) {
    console.error("Fout bij ophalen dierendossier:", animalError);

    return {
      data: null,
      error: animalError.message,
    };
  }

  if (!animalData) {
    return {
      data: null,
      error:
        "Dossier niet gevonden of dit dier hoort niet bij jouw gekoppeld asiel.",
    };
  }

  const animalRow = animalData as AnimalRow;

  const shelter = Array.isArray(animalRow.shelters)
    ? animalRow.shelters[0]
    : animalRow.shelters;

  let fosterApplication: DierenartsAnimalDossier["fosterApplication"] = null;

  const { data: applicationsData, error: applicationError } = await supabase
    .from("animal_applications")
    .select(
      `
      id,
      user_id,
      status,
      message,
      start_date,
      end_date,
      created_at
    `
    )
    .eq("animal_id", animalId)
    .eq("shelter_id", veterinarian.shelter_id)
    .order("created_at", { ascending: false });

  if (applicationError) {
    console.error("Fout bij ophalen pleegaanvragen:", applicationError);
  }

  const applications = (applicationsData || []) as ApplicationRow[];

  const activeApplication =
    applications.find((application) =>
      ACTIVE_APPLICATION_STATUSES.includes(application.status)
    ) || null;

  if (activeApplication?.user_id) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, city, postal_code")
      .eq("id", activeApplication.user_id)
      .maybeSingle();

    if (profileError) {
      console.error("Fout bij ophalen pleeggezin:", profileError);
    }

    const profile = profileData as ProfileRow | null;

    fosterApplication = {
      id: activeApplication.id,
      user_id: activeApplication.user_id,
      status: activeApplication.status,
      message: activeApplication.message,
      start_date: activeApplication.start_date,
      end_date: activeApplication.end_date,
      fosterProfile: profile
        ? {
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            city: profile.city,
            postal_code: profile.postal_code,
            phone: null,
            email: null,
          }
        : null,
    };
  }

  const animal: DierenartsAnimalDossier = {
    ...animalRow,
    shelter: shelter || null,
    fosterApplication,
  };

  return {
    data: animal,
    error: null,
  };
}