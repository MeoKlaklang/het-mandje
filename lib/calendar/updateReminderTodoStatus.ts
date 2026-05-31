import { createClient } from "@/lib/supabase/client";

type UpdateReminderTodoStatusData = {
  reminderId: string;
  completed: boolean;
};

export async function updateReminderTodoStatus(
  data: UpdateReminderTodoStatusData
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
    .from("reminders")
    .update({
      status: data.completed ? "done" : "open",
      completed_at: data.completed ? new Date().toISOString() : null,
    })
    .eq("id", data.reminderId)
    .eq("user_id", user.id);

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