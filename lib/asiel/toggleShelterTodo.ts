import { createClient } from "@/lib/supabase/client";

type ToggleShelterTodoData = {
  todoId: string;
  isDone: boolean;
};

export async function toggleShelterTodo(data: ToggleShelterTodoData) {
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

  const { error } = await supabase
    .from("shelter_todos")
    .update({
      is_done: data.isDone,
      completed_at: data.isDone ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.todoId)
    .eq("shelter_id", shelter.id);

  if (error) {
    console.error("Fout bij aanpassen todo:", error);

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