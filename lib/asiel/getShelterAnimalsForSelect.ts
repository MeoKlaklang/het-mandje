import { createClient } from "@/lib/supabase/client";

export type ShelterAnimalOption = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  image_url: string | null;
};

export async function getShelterAnimalsForSelect() {
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

  const { data: shelter, error: shelterError } = await supabase
    .from("shelters")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (shelterError || !shelter) {
    return {
      animals: [],
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const { data, error } = await supabase
    .from("animals")
    .select("id, name, species, breed, image_url")
    .eq("shelter_id", shelter.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Fout bij ophalen dieren voor select:", error);

    return {
      animals: [],
      error: error.message,
    };
  }

  return {
    animals: (data || []) as ShelterAnimalOption[],
    error: null,
  };
}