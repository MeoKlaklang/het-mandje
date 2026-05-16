import { createClient } from "@/lib/supabase/client";
import { ShelterTaskStatus } from "./getShelterTasks";

type UpdateShelterTaskStatusData = {
  taskId: string;
  status: ShelterTaskStatus;
};

export async function updateShelterTaskStatus(
  data: UpdateShelterTaskStatusData
) {
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
    .from("shelter_tasks")
    .update({
      status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.taskId)
    .eq("shelter_id", shelter.id);

  if (error) {
    console.error("Fout bij aanpassen taakstatus:", error);

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