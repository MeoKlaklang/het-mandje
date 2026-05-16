import { createClient } from "@/lib/supabase/client";

export type ShelterTaskStatus = "in_progress" | "in_review" | "done";

export type ShelterTask = {
  id: string;
  shelter_id: string;
  animal_id: string | null;
  title: string;
  description: string | null;
  created_by: string | null;
  status: ShelterTaskStatus;
  priority: string | null;
  due_date: string | null;
  created_at: string;
  animals?: {
    id: string;
    name: string;
    image_url: string | null;
  } | null;
};

export async function getShelterTasks() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      tasks: [],
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
      tasks: [],
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const { data, error } = await supabase
    .from("shelter_tasks")
    .select(
      `
      id,
      shelter_id,
      animal_id,
      title,
      description,
      created_by,
      status,
      priority,
      due_date,
      created_at,
      animals (
        id,
        name,
        image_url
      )
    `
    )
    .eq("shelter_id", shelter.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fout bij ophalen taken:", error);

    return {
      tasks: [],
      error: error.message,
    };
  }

  const tasks = (data || []).map((task) => {
    const animalData = Array.isArray(task.animals)
      ? task.animals[0]
      : task.animals;

    return {
      ...task,
      animals: animalData || null,
    };
  }) as ShelterTask[];

  return {
    tasks,
    error: null,
  };
}