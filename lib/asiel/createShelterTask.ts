import { createClient } from "@/lib/supabase/client";

type CreateShelterTaskData = {
  title: string;
  description: string;
  createdBy: string;
  animalId: string;
  priority: string;
  dueDate: string;
};

export async function createShelterTask(data: CreateShelterTaskData) {
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

  const { data: shelter, error: shelterError } = await supabase
    .from("shelters")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (shelterError || !shelter) {
    return {
      success: false,
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const { error } = await supabase.from("shelter_tasks").insert({
    shelter_id: shelter.id,
    animal_id: data.animalId || null,
    title: data.title,
    description: data.description || null,
    created_by: data.createdBy || null,
    status: "in_progress",
    priority: data.priority || "normal",
    due_date: data.dueDate || null,
  });

  if (error) {
    console.error("Fout bij aanmaken taak:", error);

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