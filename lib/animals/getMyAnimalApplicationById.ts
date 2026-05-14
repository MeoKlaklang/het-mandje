import { createClient } from "@/lib/supabase/client";

export type MyAnimalDetailShelter = {
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

export type MyAnimalDetailImage = {
  id: string;
  image_url: string;
  image_order: number | null;
};

export type MyAnimalDetailAnimal = {
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

  shelters: MyAnimalDetailShelter | null;
  animal_images: MyAnimalDetailImage[];
};

export type AnimalNote = {
  id: string;
  created_at: string | null;
  created_by_name: string | null;
  created_by_role: string | null;
  title: string;
  content: string;
};

export type AnimalMedication = {
  id: string;
  created_at: string | null;
  name: string;
  dosage: string | null;
  instructions: string | null;
  start_date: string | null;
  end_date: string | null;
};

export type MyAnimalApplicationDetail = {
  id: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  message: string | null;
  animal_id: string;
  user_id: string;
  shelter_id: string | null;

  animals: MyAnimalDetailAnimal | null;
  animal_notes: AnimalNote[];
  animal_medications: AnimalMedication[];
};

export async function getMyAnimalApplicationById(applicationId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      application: null,
      error: "Niet ingelogd.",
    };
  }

  const { data, error } = await supabase
    .from("animal_applications")
    .select(
      `
      id,
      status,
      start_date,
      end_date,
      message,
      animal_id,
      user_id,
      shelter_id,

      animals (
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
      ),

      animal_notes (
        id,
        created_at,
        created_by_name,
        created_by_role,
        title,
        content
      ),

      animal_medications (
        id,
        created_at,
        name,
        dosage,
        instructions,
        start_date,
        end_date
      )
    `
    )
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Fout bij ophalen mijn dier detail:", error);

    return {
      application: null,
      error: error.message,
    };
  }

  return {
    application: data as unknown as MyAnimalApplicationDetail,
    error: null,
  };
}