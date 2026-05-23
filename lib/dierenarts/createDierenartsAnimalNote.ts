import { createClient } from "@/lib/supabase/client";

type CreateDierenartsAnimalNoteData = {
  animalId: string;
  title: string;
  content: string;
  createdByName: string;
  createdByRole: string;
  visibleToFoster: boolean;
};

export async function createDierenartsAnimalNote(
  data: CreateDierenartsAnimalNoteData
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

  const { data: veterinarian, error: veterinarianError } = await supabase
    .from("veterinarians")
    .select("id, shelter_id, first_name, last_name, practice_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (veterinarianError || !veterinarian?.shelter_id) {
    return {
      success: false,
      error: "Geen gekoppeld dierenasiel gevonden.",
    };
  }

  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .select("id, name, shelter_id")
    .eq("id", data.animalId)
    .eq("shelter_id", veterinarian.shelter_id)
    .maybeSingle();

  if (animalError || !animal) {
    return {
      success: false,
      error: "Dit dier hoort niet bij jouw gekoppeld asiel.",
    };
  }

  const { data: application, error: applicationError } = await supabase
    .from("animal_applications")
    .select("id, user_id")
    .eq("animal_id", data.animalId)
    .eq("shelter_id", veterinarian.shelter_id)
    .eq("status", "goedgekeurd")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (applicationError) {
    return {
      success: false,
      error: applicationError.message,
    };
  }

  const createdByName =
    data.createdByName ||
    veterinarian.practice_name ||
    `Dr. ${veterinarian.last_name || veterinarian.first_name || ""}`.trim() ||
    "Dierenarts";

  const { error } = await supabase.from("animal_notes").insert({
    animal_id: data.animalId,
    application_id: application?.id || null,
    created_by: user.id,
    created_by_name: createdByName,
    created_by_role: data.createdByRole || "dierenarts",
    title: data.title,
    content: data.content,
    visible_to_foster: data.visibleToFoster,
  });

  if (error) {
    console.error("Fout bij toevoegen notitie:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  if (data.visibleToFoster && application?.user_id) {
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: application.user_id,
        title: `Nieuwe notitie voor ${animal.name}`,
        message: `${createdByName} heeft een notitie toegevoegd voor ${animal.name}: ${data.title}.`,
        type: "veterinarian_note",
        related_animal_id: data.animalId,
        related_application_id: application.id,
        is_read: false,
      });

    if (notificationError) {
      console.error("Fout bij maken notitie-notificatie:", notificationError);

      return {
        success: false,
        error: `Notitie is opgeslagen, maar notificatie kon niet gemaakt worden: ${notificationError.message}`,
      };
    }
  }

  return {
    success: true,
    error: null,
  };
}