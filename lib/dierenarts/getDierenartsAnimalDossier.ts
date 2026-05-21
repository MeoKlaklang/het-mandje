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

type AnimalRow = Omit<
  DierenartsAnimalDossier,
  "shelter" | "fosterApplication"
> & {
  shelters:
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
};

type ApplicationRow = {
  id: string;
  user_id: string;
  status: string;
  message: string | null;
  start_date: string | null;
  end_date: string | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
};

export async function getDierenartsAnimalDossier(animalId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "Je bent niet ingelogd.",
    };
  }

  const { data: veterinarian, error: veterinarianError } = await supabase
    .from("veterinarians")
    .select("id, user_id, shelter_id")
    .eq("user_id", user.id)
    .single();

  if (veterinarianError || !veterinarian) {
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
    .single();

  if (animalError || !animalData) {
    return {
      data: null,
      error:
        animalError?.message ||
        "Dossier niet gevonden of dit dier hoort niet bij jouw gekoppeld asiel.",
    };
  }

  const animalRow = animalData as AnimalRow;

  const shelter = Array.isArray(animalRow.shelters)
    ? animalRow.shelters[0]
    : animalRow.shelters;

  let fosterApplication: DierenartsAnimalDossier["fosterApplication"] = null;

  const { data: applicationData, error: applicationError } = await supabase
    .from("animal_applications")
    .select(
      `
      id,
      user_id,
      status,
      message,
      start_date,
      end_date
    `
    )
    .eq("animal_id", animalId)
    .eq("shelter_id", veterinarian.shelter_id)
    .eq("status", "goedgekeurd")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (applicationError) {
    console.error(
      "Fout bij ophalen goedgekeurde opvangaanvraag:",
      applicationError
    );
  }

  const application = applicationData as ApplicationRow | null;

  if (application?.user_id) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, city, postal_code, phone, email")
      .eq("id", application.user_id)
      .maybeSingle();

    if (profileError) {
      console.error("Fout bij ophalen pleeggezin profiel:", profileError);
    }

    fosterApplication = {
      id: application.id,
      user_id: application.user_id,
      status: application.status,
      message: application.message,
      start_date: application.start_date,
      end_date: application.end_date,
      fosterProfile: (profileData as ProfileRow | null) || null,
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