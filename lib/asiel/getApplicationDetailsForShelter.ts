import { createClient } from "@/lib/supabase/client";

export type FosterApplicationAnswers = Record<string, string>;

export type ApplicationDetails = {
  id: string;
  status: string | null;
  message: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;

  animal: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    age: string | null;
    gender: string | null;
    image_url: string | null;
    status: string | null;
  } | null;

  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    birth: string | null;
    street: string | null;
    house_number: string | null;
    postal_code: string | null;
    city: string | null;
    country: string | null;
  } | null;

  fosterApplication: {
    id: string;
    status: string | null;
    answers: FosterApplicationAnswers | null;
  } | null;

  userEmail: string | null;
};

export async function getApplicationDetailsForShelter(applicationId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      application: null,
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
      application: null,
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const { data: application, error: applicationError } = await supabase
    .from("animal_applications")
    .select(
      `
      id,
      status,
      message,
      start_date,
      end_date,
      created_at,
      animal_id,
      user_id,
      shelter_id,

      animals (
        id,
        name,
        species,
        breed,
        age,
        gender,
        image_url,
        status
      )
    `
    )
    .eq("id", applicationId)
    .eq("shelter_id", shelter.id)
    .single();

  if (applicationError || !application) {
    console.error("Fout bij ophalen aanvraag:", applicationError);

    return {
      application: null,
      error: applicationError?.message || "Aanvraag niet gevonden.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      birth,
      street,
      house_number,
      postal_code,
      city,
      country
    `
    )
    .eq("id", application.user_id)
    .single();

  if (profileError) {
    console.error("Fout bij ophalen pleeggezin profiel:", profileError);
  }

  const { data: fosterApplication, error: fosterApplicationError } =
    await supabase
      .from("foster_applications")
      .select("id, status, answers")
      .eq("user_id", application.user_id)
      .maybeSingle();

  if (fosterApplicationError) {
    console.error(
      "Fout bij ophalen pleeggezin aanmelding:",
      fosterApplicationError
    );
  }

  const animalData = Array.isArray(application.animals)
    ? application.animals[0]
    : application.animals;

  const formattedApplication: ApplicationDetails = {
    id: application.id,
    status: application.status,
    message: application.message,
    start_date: application.start_date,
    end_date: application.end_date,
    created_at: application.created_at,

    animal: animalData
      ? {
          id: animalData.id,
          name: animalData.name,
          species: animalData.species,
          breed: animalData.breed,
          age: animalData.age,
          gender: animalData.gender,
          image_url: animalData.image_url,
          status: animalData.status,
        }
      : null,

    profile: profile || null,
    fosterApplication: fosterApplication
      ? {
          id: fosterApplication.id,
          status: fosterApplication.status,
          answers: fosterApplication.answers as FosterApplicationAnswers,
        }
      : null,

    userEmail: null,
  };

  return {
    application: formattedApplication,
    error: null,
  };
}