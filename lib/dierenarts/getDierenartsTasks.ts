import { createClient } from "@/lib/supabase/client";

export type DierenartsTaskStatus = "in_progress" | "in_review" | "done";

export type DierenartsTask = {
  id: string;
  created_at: string;
  veterinarian_id: string;
  user_id: string;
  title: string;
  description: string | null;
  animal_id: string | null;
  created_by_name: string | null;
  status: DierenartsTaskStatus;
  animal: {
    id: string;
    name: string;
    image_url: string | null;
    species: string | null;
    breed: string | null;
  } | null;
};

type TaskRow = Omit<DierenartsTask, "animal"> & {
  animals:
    | {
        id: string;
        name: string;
        image_url: string | null;
        species: string | null;
        breed: string | null;
      }
    | {
        id: string;
        name: string;
        image_url: string | null;
        species: string | null;
        breed: string | null;
      }[]
    | null;
};

export async function getDierenartsTasks() {
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

  const { data, error } = await supabase
    .from("veterinarian_tasks")
    .select(
      `
      id,
      created_at,
      veterinarian_id,
      user_id,
      title,
      description,
      animal_id,
      created_by_name,
      status,
      animals (
        id,
        name,
        image_url,
        species,
        breed
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fout bij ophalen dierenarts taken:", error);

    return {
      tasks: [],
      error: error.message,
    };
  }

  const tasks = ((data || []) as TaskRow[]).map((task) => {
    const animal = Array.isArray(task.animals) ? task.animals[0] : task.animals;

    return {
      ...task,
      animal: animal || null,
    };
  });

  return {
    tasks: tasks as DierenartsTask[],
    error: null,
  };
}