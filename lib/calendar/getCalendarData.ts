import { createClient } from "@/lib/supabase/client";

export type Appointment = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  status: "pending" | "confirmed" | "cancelled";
};

export type Reminder = {
  id: string;
  title: string;
  description: string | null;
  due_at: string;
  priority: string;
};

export async function getCalendarData() {
  const supabase = createClient();

  // Huidige gebruiker ophalen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      appointments: [] as Appointment[],
      reminders: [] as Reminder[],
    };
  }

  // Afspraken ophalen
  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("id, title, description, start_at, end_at, status")
    .eq("foster_id", user.id)
    .order("start_at", { ascending: true });

  if (appointmentsError) {
    console.error("Fout bij ophalen afspraken:", appointmentsError);
  }

  // Herinneringen ophalen
  const { data: reminders, error: remindersError } = await supabase
    .from("reminders")
    .select("id, title, description, due_at, priority")
    .eq("user_id", user.id)
    .order("due_at", { ascending: true });

  if (remindersError) {
    console.error("Fout bij ophalen reminders:", remindersError);
  }

  return {
    appointments: (appointments || []) as Appointment[],
    reminders: (reminders || []) as Reminder[],
  };
}