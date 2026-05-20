import { createClient } from "@/lib/supabase/client";

export type DierenartsTodo = {
  id: string;
  veterinarian_id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string;
  is_done: boolean;
  created_at: string;
};

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

export async function getDierenartsTodos() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      todos: [],
      error: "Je bent niet ingelogd.",
    };
  }

  const { data, error } = await supabase
    .from("veterinarian_todos")
    .select(
      `
      id,
      veterinarian_id,
      user_id,
      title,
      description,
      due_date,
      is_done,
      created_at
    `
    )
    .eq("user_id", user.id)
    .or(`due_date.eq.${todayDate()},is_done.eq.false`)
    .order("is_done", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fout bij ophalen dierenarts todos:", error);

    return {
      todos: [],
      error: error.message,
    };
  }

  return {
    todos: (data || []) as DierenartsTodo[],
    error: null,
  };
}