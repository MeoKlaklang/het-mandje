import { createClient } from "@/lib/supabase/client";

export type ShelterOption = {
  id: string;
  name: string;
  city: string | null;
};

export async function getSheltersForVeterinarian() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("shelters")
    .select("id, name, city")
    .order("name", { ascending: true });

  if (error) {
    console.error("Fout bij ophalen dierenasielen:", error);

    return {
      shelters: [],
      error: error.message,
    };
  }

  return {
    shelters: (data || []) as ShelterOption[],
    error: null,
  };
}