import { createClient } from "@/lib/supabase/client";

export type DierenartsAnimalAgendaOption = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  image_url: string | null;
  status: string | null;
};

export async function getDierenartsAnimalsForAgenda() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      animals: [],
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
      animals: [],
      error: "Geen gekoppeld dierenasiel gevonden.",
    };
  }

  const { data, error } = await supabase
    .from("animals")
    .select("id, name, species, breed, image_url, status")
    .eq("shelter_id", veterinarian.shelter_id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Fout bij ophalen dieren:", error);

    return {
      animals: [],
      error: error.message,
    };
  }

  return {
    animals: (data || []) as DierenartsAnimalAgendaOption[],
    error: null,
  };
}