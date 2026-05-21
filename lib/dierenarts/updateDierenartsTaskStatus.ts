import { createClient } from "@/lib/supabase/client";
import { DierenartsTaskStatus } from "./getDierenartsTasks";

export async function updateDierenartsTaskStatus(
  taskId: string,
  status: DierenartsTaskStatus
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

  const { error } = await supabase
    .from("veterinarian_tasks")
    .update({ status })
    .eq("id", taskId)
    .eq("user_id", user.id);

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