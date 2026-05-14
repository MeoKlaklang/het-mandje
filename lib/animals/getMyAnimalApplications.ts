import { createClient } from "@/lib/supabase/client";

export type MyAnimal = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: string | null;
  gender: string | null;
  size: string | null;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  expected_duration: string | null;
  care_level: string | null;
};

export type MyAnimalApplication = {
  id: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  animals: MyAnimal | null;
};

export async function getMyAnimalApplications() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      applications: [] as MyAnimalApplication[],
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
      animals (
        id,
        name,
        species,
        breed,
        age,
        gender,
        size,
        description,
        short_description,
        image_url,
        expected_duration,
        care_level
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fout bij ophalen mijn dieren:", error);

    return {
      applications: [] as MyAnimalApplication[],
      error: error.message,
    };
  }

  return {
    applications: (data || []) as unknown as MyAnimalApplication[],
    error: null,
  };
}