import { createClient } from "@/lib/supabase/client";

export type AnimalShelter = {
  id: string;
  name: string;
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

export type Animal = {
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
  expected_duration: string | null;
  status: string | null;
  image_url: string | null;

  shelters: AnimalShelter | null;
};

export async function getAnimals() {
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
      expected_duration,
      status,
      image_url,
      shelters (
        id,
        name,
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
      )
    `
    )
    .eq("status", "beschikbaar")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fout bij ophalen dieren:", error);

    return {
      animals: [] as Animal[],
      error,
    };
  }

  return {
    animals: (data || []) as unknown as Animal[],
    error: null,
  };
}