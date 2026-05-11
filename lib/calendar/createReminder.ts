import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/auth/getProfile";

type CreateReminderData = {
  title: string;
  description: string;
  dueAt: string;
  priority: "normal" | "important";
};

export async function createReminder(data: CreateReminderData) {
  const supabase = createClient();

  // Huidige gebruiker ophalen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Je bent niet ingelogd.",
    };
  }

  // Profiel ophalen voor naam
  const { profile } = await getCurrentProfile();

  const fullName =
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || "Gebruiker";

  // Reminder opslaan
  const { error } = await supabase.from("reminders").insert({
    user_id: user.id,
    title: data.title,
    description: data.description,
    due_at: data.dueAt,
    priority: data.priority,
    status: "open",
    created_by: user.id,
    source_name: fullName,
    source_role: "user",
  });

  if (error) {
    console.error("Fout bij maken reminder:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}