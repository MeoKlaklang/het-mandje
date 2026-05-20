import { createClient } from "@/lib/supabase/client";

export type UserFosterAnimal = {
  applicationId: string;
  animalId: string;
  shelterId: string;
  animalName: string;
  animalImageUrl: string | null;
  animalSpecies: string | null;
  animalBreed: string | null;
  shelterName: string | null;
};

type ApplicationRow = {
  id: string;
  animal_id: string;
  shelter_id: string;
  animals:
    | {
        id: string;
        name: string;
        image_url: string | null;
        species: string | null;
        breed: string | null;
      }
    | {
        id: string;
        name: string;
        image_url: string | null;
        species: string | null;
        breed: string | null;
      }[]
    | null;
  shelters:
    | {
        id: string;
        name: string | null;
      }
    | {
        id: string;
        name: string | null;
      }[]
    | null;
};

export async function getUserFosterAnimals() {
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

  const { data, error } = await supabase
    .from("animal_applications")
    .select(
      `
      id,
      animal_id,
      shelter_id,
      animals (
        id,
        name,
        image_url,
        species,
        breed
      ),
      shelters (
        id,
        name
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "goedgekeurd");

  if (error) {
    console.error("Fout bij ophalen opvangdieren:", error);

    return {
      animals: [],
      error: error.message,
    };
  }

  const rows = (data || []) as ApplicationRow[];

  const animals: UserFosterAnimal[] = rows
    .map((row) => {
      const animal = Array.isArray(row.animals) ? row.animals[0] : row.animals;
      const shelter = Array.isArray(row.shelters)
        ? row.shelters[0]
        : row.shelters;

      if (!animal) return null;

      return {
        applicationId: row.id,
        animalId: animal.id,
        shelterId: row.shelter_id,
        animalName: animal.name,
        animalImageUrl: animal.image_url,
        animalSpecies: animal.species,
        animalBreed: animal.breed,
        shelterName: shelter?.name || null,
      };
    })
    .filter(Boolean) as UserFosterAnimal[];

  return {
    animals,
    error: null,
  };
}