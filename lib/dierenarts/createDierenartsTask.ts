import { createClient } from "@/lib/supabase/client";

type CreateDierenartsTaskData = {
  title: string;
  description: string;
  animalId?: string;
  createdByName: string;
};

export async function createDierenartsTask(data: CreateDierenartsTaskData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Je bent niet ingelogd.",
    };
  }

  const { data: veterinarian, error: veterinarianError } = await supabase
    .from("veterinarians")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (veterinarianError || !veterinarian) {
    return {
      success: false,
      error: "Geen dierenartsprofiel gevonden.",
    };
  }

  const { error } = await supabase.from("veterinarian_tasks").insert({
    veterinarian_id: veterinarian.id,
    user_id: user.id,
    title: data.title,
    description: data.description || null,
    animal_id: data.animalId || null,
    created_by_name: data.createdByName || null,
    status: "in_progress",
  });

  if (error) {
    console.error("Fout bij aanmaken dierenarts taak:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    error: null,
  };
}