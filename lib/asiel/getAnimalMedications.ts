import { createClient } from "@/lib/supabase/client";

export type AnimalMedication = {
  id: string;
  animal_id: string;
  application_id: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_by_role: string | null;
  name: string;
  dosage: string | null;
  frequency: string | null;
  instructions: string | null;
  start_date: string | null;
  end_date: string | null;
  visible_to_foster: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export async function getAnimalMedications(animalId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      medications: [],
      error: "Je bent niet ingelogd.",
    };
  }

  const { data, error } = await supabase
    .from("animal_medications")
    .select(
      `
      id,
      animal_id,
      application_id,
      created_by,
      created_by_name,
      created_by_role,
      name,
      dosage,
      frequency,
      instructions,
      start_date,
      end_date,
      visible_to_foster,
      created_at,
      updated_at
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
    medications: (data || []) as AnimalMedication[],
    error: null,
  };
}