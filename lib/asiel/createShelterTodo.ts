import { createClient } from "@/lib/supabase/client";

type CreateShelterTodoData = {
  description: string;
  createdBy: string;
};

export async function createShelterTodo(data: CreateShelterTodoData) {
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

  const { error } = await supabase.from("shelter_todos").insert({
    shelter_id: shelter.id,
    description: data.description,
    created_by: data.createdBy || null,
    is_done: false,
    completed_at: null,
  });

  if (error) {
    console.error("Fout bij aanmaken todo:", error);

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