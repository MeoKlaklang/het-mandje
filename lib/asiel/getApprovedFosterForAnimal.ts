import { createClient } from "@/lib/supabase/client";

export type ApprovedFosterForAnimal = {
  applicationId: string;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  message: string | null;

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
};

export async function getApprovedFosterForAnimal(animalId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      foster: null,
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
      foster: null,
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const { data: application, error: applicationError } = await supabase
    .from("animal_applications")
    .select(
      `
      id,
      status,
      start_date,
      end_date,
      message,
      user_id,
      animal_id,
      shelter_id
    `
    )
    .eq("animal_id", animalId)
    .eq("shelter_id", shelter.id)
    .eq("status", "goedgekeurd")
    .maybeSingle();

  if (applicationError) {
    console.error("Fout bij ophalen goedgekeurd pleeggezin:", applicationError);

    return {
      foster: null,
      error: applicationError.message,
    };
  }

  if (!application) {
    return {
      foster: null,
      error: null,
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
    console.error("Fout bij ophalen profiel pleeggezin:", profileError);
  }

  const foster: ApprovedFosterForAnimal = {
    applicationId: application.id,
    status: application.status,
    startDate: application.start_date,
    endDate: application.end_date,
    message: application.message,
    profile: profile || null,
  };

  return {
    foster,
    error: null,
  };
}