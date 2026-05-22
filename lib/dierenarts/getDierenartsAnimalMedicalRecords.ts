import { createClient } from "@/lib/supabase/client";

export type DierenartsAnimalMedicalRecord = {
  id: string;
  created_at: string | null;
  animal_id: string;
  created_by: string | null;
  created_by_name: string | null;
  created_by_role: string | null;

  title: string;
  record_date: string | null;
  visit_reason: string | null;
  examination: string | null;
  diagnosis: string | null;
  performed_action: string | null;
  vaccination_or_procedure: string | null;
  follow_up_advice: string | null;
};

async function canAccessAnimal(animalId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { allowed: false, userId: null, error: "Je bent niet ingelogd." };

  const { data: veterinarian, error: veterinarianError } = await supabase
    .from("veterinarians")
    .select("shelter_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (veterinarianError || !veterinarian?.shelter_id) {
    return {
      allowed: false,
      userId: user.id,
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
      userId: user.id,
      error: "Dit dier hoort niet bij jouw gekoppeld asiel.",
    };
  }

  return { allowed: true, userId: user.id, error: null };
}

export async function getDierenartsAnimalMedicalRecords(animalId: string) {
  const supabase = createClient();

  const access = await canAccessAnimal(animalId);

  if (!access.allowed) {
    return {
      records: [],
      error: access.error,
    };
  }

  const { data, error } = await supabase
    .from("animal_medical_records")
    .select(
      `
      id,
      created_at,
      animal_id,
      created_by,
      created_by_name,
      created_by_role,
      title,
      record_date,
      visit_reason,
      examination,
      diagnosis,
      performed_action,
      vaccination_or_procedure,
      follow_up_advice
    `
    )
    .eq("animal_id", animalId)
    .order("record_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fout bij ophalen medische dossiers:", error);

    return {
      records: [],
      error: error.message,
    };
  }

  return {
    records: (data || []) as DierenartsAnimalMedicalRecord[],
    error: null,
  };
}