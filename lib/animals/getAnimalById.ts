import { createClient } from "@/lib/supabase/client";

export type Shelter = {
  id: string;
  name: string;
  description: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type AnimalImage = {
  id: string;
  image_url: string;
  image_order: number | null;
};

export type AnimalDetail = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  age: string | null;
  size: string | null;
  city: string | null;
  postal_code: string | null;
  description: string | null;
  short_description: string | null;
  care_level: string | null;
  medical_notes: string | null;
  behavior_notes: string | null;
  available_from: string | null;
  available_until: string | null;
  expected_duration: string | null;
  status: string | null;
  image_url: string | null;

  vaccinated: boolean | null;
  neutered: boolean | null;
  can_live_with_cats: boolean | null;
  can_live_with_dogs: boolean | null;
  can_live_with_children: boolean | null;
  can_be_home_alone: boolean | null;

  shelters: Shelter | null;
  animal_images: AnimalImage[];
};

export async function getAnimalById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("animals")
    .select(
      `
      id,
      name,
      species,
      breed,
      gender,
      age,
      size,
      city,
      postal_code,
      description,
      short_description,
      care_level,
      medical_notes,
      behavior_notes,
      available_from,
      available_until,
      expected_duration,
      status,
      image_url,
      vaccinated,
      neutered,
      can_live_with_cats,
      can_live_with_dogs,
      can_live_with_children,
      can_be_home_alone,
      shelters (
        id,
        name,
        description,
        street,
        house_number,
        postal_code,
        city,
        country,
        phone,
        email,
        website,
        image_url,
        latitude,
        longitude
      ),
      animal_images (
        id,
        image_url,
        image_order
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Fout bij ophalen dier:", error);

    return {
      animal: null,
      error,
    };
  }

return {
  animal: data as unknown as AnimalDetail,
  error: null,
};
}