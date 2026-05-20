import { createClient } from "@/lib/supabase/client";

export async function toggleDierenartsTodo(todoId: string, isDone: boolean) {
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

  const { error } = await supabase
    .from("veterinarian_todos")
    .update({
      is_done: isDone,
    })
    .eq("id", todoId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Fout bij aanpassen dierenarts todo:", error);

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