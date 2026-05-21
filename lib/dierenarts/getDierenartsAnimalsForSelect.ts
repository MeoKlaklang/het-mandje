import { createClient } from "@/lib/supabase/client";

export type DierenartsAnimalOption = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  image_url: string | null;
  status: string | null;
};

export async function getDierenartsAnimalsForSelect() {
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
    .single();

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
    console.error("Fout bij ophalen dieren voor taak:", error);

    return {
      animals: [],
      error: error.message,
    };
  }

  return {
    animals: (data || []) as DierenartsAnimalOption[],
    error: null,
  };
}