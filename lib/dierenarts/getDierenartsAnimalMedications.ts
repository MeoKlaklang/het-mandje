import { createClient } from "@/lib/supabase/client";

export type DierenartsAnimalMedication = {
  id: string;
  created_at: string | null;
  animal_id: string;
  application_id: string | null;
  created_by: string | null;

  name: string;
  dosage: string | null;
  frequency: string | null;
  instructions: string | null;
  start_date: string | null;
  end_date: string | null;

  created_by_name: string | null;
  created_by_role: string | null;
  visible_to_foster: boolean;
};

async function canAccessAnimal(animalId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      allowed: false,
      error: "Je bent niet ingelogd.",
    };
  }

  const { data: veterinarian, error: veterinarianError } = await supabase
    .from("veterinarians")
    .select("shelter_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (veterinarianError || !veterinarian?.shelter_id) {
    return {
      allowed: false,
      error: "Geen gekoppeld dierenasiel gevonden.",
    };
  }

  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .select("id")
    .eq("id", animalId)
    .eq("shelter_id", veterinarian.shelter_id)
    .maybeSingle();

  if (animalError || !animal) {
    return {
      allowed: false,
      error: "Dit dier hoort niet bij jouw gekoppeld asiel.",
    };
  }

  return {
    allowed: true,
    error: null,
  };
}

export async function getDierenartsAnimalMedications(animalId: string) {
  const supabase = createClient();

  const access = await canAccessAnimal(animalId);

  if (!access.allowed) {
    return {
      medications: [],
      error: access.error,
    };
  }

  const { data, error } = await supabase
    .from("animal_medications")
    .select(
      `
      id,
      created_at,
      animal_id,
      application_id,
      created_by,
      name,
      dosage,
      frequency,
      instructions,
      start_date,
      end_date,
      created_by_name,
      created_by_role,
      visible_to_foster
    `
    )
    .eq("animal_id", animalId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fout bij ophalen medicatie:", error);

    return {
      medications: [],
      error: error.message,
    };
  }

  return {
    medications: (data || []) as DierenartsAnimalMedication[],
    error: null,
  };
}