import { createClient } from "@/lib/supabase/client";

type CreateDierenartsTodoData = {
  title: string;
  description?: string;
  dueDate?: string;
};

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

export async function createDierenartsTodo(data: CreateDierenartsTodoData) {
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

  const { error } = await supabase.from("veterinarian_todos").insert({
    veterinarian_id: veterinarian.id,
    user_id: user.id,
    title: data.title,
    description: data.description || null,
    due_date: data.dueDate || todayDate(),
    is_done: false,
  });

  if (error) {
    console.error("Fout bij toevoegen dierenarts todo:", error);

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