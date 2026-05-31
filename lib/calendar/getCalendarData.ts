import { createClient } from "@/lib/supabase/client";

export type CalendarAnimal = {
  id: string;
  name: string;
  image_url: string | null;
  species: string | null;
  breed: string | null;
};

export type CalendarShelter = {
  id: string;
  name: string | null;
};

export type Appointment = {
  id: string;
  foster_id: string | null;
  shelter_id: string | null;
  veterinarian_id: string | null;
  animal_id: string | null;

  title: string;
  description: string | null;
  start_at: string;
  end_at: string;

  appointment_type: string | null;
  location: string | null;
  created_by: string | null;
  requested_by: string | null;

  status: string | null;
  approval_status: string | null;
  response_message: string | null;

  proposed_new_start_at: string | null;
  proposed_new_end_at: string | null;

  animals: CalendarAnimal | CalendarAnimal[] | null;
  shelters: CalendarShelter | CalendarShelter[] | null;
};

export type Reminder = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_at: string;
  priority: string | null;
  status: string | null;
  completed_at: string | null;
};

export async function getCalendarData() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      appointments: [],
      reminders: [],
      error: "Je bent niet ingelogd.",
    };
  }

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select(
      `
      id,
      foster_id,
      shelter_id,
      veterinarian_id,
      animal_id,
      title,
      description,
      start_at,
      end_at,
      appointment_type,
      location,
      created_by,
      requested_by,
      status,
      approval_status,
      response_message,
      proposed_new_start_at,
      proposed_new_end_at,
      animals (
        id,
        name,
        image_url,
        species,
        breed
      ),
      shelters (
        id,
        name
      )
    `
    )
    .eq("foster_id", user.id)
    .order("start_at", { ascending: true });

  if (appointmentsError) {
    console.error("Fout bij ophalen afspraken:", appointmentsError);

    return {
      appointments: [],
      reminders: [],
      error: appointmentsError.message,
    };
  }

  const { data: reminders, error: remindersError } = await supabase
    .from("reminders")
    .select(
      `
      id,
      user_id,
      title,
      description,
      due_at,
      priority,
      status,
      completed_at
    `
    )
    .eq("user_id", user.id)
    .order("due_at", { ascending: true });

  if (remindersError) {
    console.error("Fout bij ophalen todo's:", remindersError);

    return {
      appointments: (appointments || []) as Appointment[],
      reminders: [],
      error: remindersError.message,
    };
  }

  return {
    appointments: (appointments || []) as Appointment[],
    reminders: (reminders || []) as Reminder[],
    error: null,
  };
}