import { createClient } from "@/lib/supabase/client";

export type AnimalForEdit = {
  id: string;
  shelter_id: string;

  species: "hond" | "kat";
  name: string;
  breed: string | null;
  gender: string | null;
  birth_date: string | null;
  age: string | null;
  size: string | null;
  weight: string | null;
  coat_color: string | null;
  special_needs: string | null;

  origin: string | null;
  intake_date: string | null;
  intake_reason: string | null;
  intake_notes: string | null;
  admitted_by: string | null;

  chip_number: string | null;
  passport_number: string | null;

  image_url: string | null;

  short_description: string | null;
  description: string | null;
  behavior_notes: string | null;
  medical_notes: string | null;
  temperament: string | null;

  available_from: string | null;
  available_until: string | null;
  expected_duration: string | null;
  care_level: string | null;
  status: "concept" | "beschikbaar" | "gereserveerd" | "in_opvang" | "niet_beschikbaar";

  vaccinated: boolean | null;
  neutered: boolean | null;
  can_live_with_cats: boolean | null;
  can_live_with_dogs: boolean | null;
  can_live_with_children: boolean | null;
  can_be_home_alone: boolean | null;
  house_trained: boolean | null;
  needs_medication: boolean | null;
};

export async function getAnimalForEdit(animalId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      animal: null,
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
      animal: null,
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const { data, error } = await supabase
    .from("animals")
    .select(
      `
      id,
      shelter_id,
      species,
      name,
      breed,
      gender,
      birth_date,
      age,
      size,
      weight,
      coat_color,
      special_needs,
      origin,
      intake_date,
      intake_reason,
      intake_notes,
      admitted_by,
      chip_number,
      passport_number,
      image_url,
      short_description,
      description,
      behavior_notes,
      medical_notes,
      temperament,
      available_from,
      available_until,
      expected_duration,
      care_level,
      status,
      vaccinated,
      neutered,
      can_live_with_cats,
      can_live_with_dogs,
      can_live_with_children,
      can_be_home_alone,
      house_trained,
      needs_medication
    `
    )
    .eq("id", animalId)
    .eq("shelter_id", shelter.id)
    .single();

  if (error) {
    console.error("Fout bij ophalen dier om te bewerken:", error);

    return {
      animal: null,
      error: error.message,
    };
  }

  return {
    animal: data as unknown as AnimalForEdit,
    error: null,
  };
}