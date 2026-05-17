import { createClient } from "@/lib/supabase/client";

export type AnimalNote = {
  id: string;
  animal_id: string;
  application_id: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_by_role: string | null;
  title: string;
  content: string;
  visible_to_foster: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export async function getAnimalNotes(animalId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      notes: [],
      error: "Je bent niet ingelogd.",
    };
  }

  const { data, error } = await supabase
    .from("animal_notes")
    .select(
      `
      id,
      animal_id,
      application_id,
      created_by,
      created_by_name,
      created_by_role,
      title,
      content,
      visible_to_foster,
      created_at,
      updated_at
    `
    )
    .eq("animal_id", animalId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fout bij ophalen notities:", error);

    return {
      notes: [],
      error: error.message,
    };
  }

  return {
    notes: (data || []) as AnimalNote[],
    error: null,
  };
}