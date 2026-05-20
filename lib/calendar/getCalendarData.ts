import { createClient } from "@/lib/supabase/client";

export type Appointment = {
  id: string;
  foster_id: string | null;
  shelter_id: string | null;
  animal_id: string | null;
  veterinarian_id: string | null;

  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  status: string | null;

  approval_status: string | null;
  location: string | null;
  response_message: string | null;
  proposed_new_start_at: string | null;
  proposed_new_end_at: string | null;

  appointment_type: string | null;
  created_by: string | null;

  animal?: {
    id: string;
    name: string;
    image_url: string | null;
    breed: string | null;
    species: string | null;
  } | null;

  shelter?: {
    id: string;
    name: string;
  } | null;
};

export type Reminder = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_at: string;
  priority: "normal" | "important";
  status: string | null;
  created_at: string;
};

type AppointmentRow = Omit<Appointment, "animal" | "shelter"> & {
  animal:
    | {
        id: string;
        name: string;
        image_url: string | null;
        breed: string | null;
        species: string | null;
      }
    | {
        id: string;
        name: string;
        image_url: string | null;
        breed: string | null;
        species: string | null;
      }[]
    | null;

  shelter:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
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
    };
  }

  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from("appointments")
    .select(
      `
      id,
      foster_id,
      shelter_id,
      animal_id,
      veterinarian_id,
      title,
      description,
      start_at,
      end_at,
      status,
      approval_status,
      location,
      response_message,
      proposed_new_start_at,
      proposed_new_end_at,
      appointment_type,
      created_by,
      animal:animals!appointments_animal_id_fkey (
        id,
        name,
        image_url,
        breed,
        species
      ),
      shelter:shelters!appointments_shelter_id_fkey (
        id,
        name
      )
    `
    )
    .eq("foster_id", user.id)
    .order("start_at", { ascending: true });

  if (appointmentsError) {
    console.error("Fout bij ophalen afspraken:", appointmentsError);
  }

  const appointments = ((appointmentsData || []) as AppointmentRow[]).map(
    (appointment) => {
      const animal = Array.isArray(appointment.animal)
        ? appointment.animal[0]
        : appointment.animal;

      const shelter = Array.isArray(appointment.shelter)
        ? appointment.shelter[0]
        : appointment.shelter;

      return {
        ...appointment,
        animal: animal || null,
        shelter: shelter || null,
      };
    }
  );

  const { data: remindersData, error: remindersError } = await supabase
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
      created_at
    `
    )
    .eq("user_id", user.id)
    .order("due_at", { ascending: true });

  if (remindersError) {
    console.error("Fout bij ophalen herinneringen:", remindersError);
  }

  return {
    appointments: appointments as Appointment[],
    reminders: (remindersData || []) as Reminder[],
  };
}