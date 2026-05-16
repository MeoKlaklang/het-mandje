import { createClient } from "@/lib/supabase/client";

export type ShelterTodo = {
  id: string;
  shelter_id: string;
  description: string;
  created_by: string | null;
  is_done: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

function getTodayStartIso() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

export async function getShelterTodos() {
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

  const { data: shelter, error: shelterError } = await supabase
    .from("shelters")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (shelterError || !shelter) {
    return {
      todos: [],
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const todayStart = getTodayStartIso();

  const { data, error } = await supabase
    .from("shelter_todos")
    .select(
      `
      id,
      shelter_id,
      description,
      created_by,
      is_done,
      completed_at,
      created_at,
      updated_at
    `
    )
    .eq("shelter_id", shelter.id)
    .or(`is_done.eq.false,completed_at.gte.${todayStart}`)
    .order("is_done", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fout bij ophalen todos:", error);

    return {
      todos: [],
      error: error.message,
    };
  }

  return {
    todos: (data || []) as ShelterTodo[],
    error: null,
  };
}