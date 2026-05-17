import { createClient } from "@/lib/supabase/client";

export type AnimalMedicalRecord = {
  id: string;
  animal_id: string;
  application_id: string | null;
  created_by: string | null;

  title: string;
  record_date: string | null;

  created_by_name: string | null;
  created_by_role: string | null;

  visit_reason: string | null;
  examination: string | null;
  diagnosis: string | null;
  performed_action: string | null;
  vaccination_or_procedure: string | null;
  follow_up_advice: string | null;

  created_at: string;
  updated_at: string | null;
};

export async function getAnimalMedicalRecords(animalId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      records: [],
      error: "Je bent niet ingelogd.",
    };
  }

  const { data, error } = await supabase
    .from("animal_medical_records")
    .select(
      `
      id,
      animal_id,
      application_id,
      created_by,
      title,
      record_date,
      created_by_name,
      created_by_role,
      visit_reason,
      examination,
      diagnosis,
      performed_action,
      vaccination_or_procedure,
      follow_up_advice,
      created_at,
      updated_at
    `
    )
    .eq("animal_id", animalId)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fout bij ophalen medische verslagen:", error);

    return {
      records: [],
      error: error.message,
    };
  }

  return {
    records: (data || []) as AnimalMedicalRecord[],
    error: null,
  };
}