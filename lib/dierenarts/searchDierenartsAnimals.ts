import { createClient } from "@/lib/supabase/client";

export type DierenartsAnimalSearchResult = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  image_url: string | null;
  status: string | null;
};

export async function searchDierenartsAnimals(query: string) {
  const supabase = createClient();

  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) {
    return {
      animals: [],
      error: null,
    };
  }

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
    .or(
      `name.ilike.%${cleanQuery}%,species.ilike.%${cleanQuery}%,breed.ilike.%${cleanQuery}%`
    )
    .limit(8);

  if (error) {
    console.error("Fout bij zoeken dieren voor dierenarts:", error);

    return {
      animals: [],
      error: error.message,
    };
  }

  return {
    animals: (data || []) as DierenartsAnimalSearchResult[],
    error: null,
  };
}