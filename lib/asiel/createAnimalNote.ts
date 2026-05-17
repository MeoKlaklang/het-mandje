import { createClient } from "@/lib/supabase/client";

type CreateAnimalNoteData = {
  animalId: string;
  title: string;
  content: string;
  createdByName: string;
  createdByRole: string;
  visibleToFoster: boolean;
};

export async function createAnimalNote(data: CreateAnimalNoteData) {
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

  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .select("id, name, shelter_id")
    .eq("id", data.animalId)
    .single();

  if (animalError || !animal) {
    return {
      success: false,
      error: animalError?.message || "Dier niet gevonden.",
    };
  }

  const { data: shelter, error: shelterError } = await supabase
    .from("shelters")
    .select("id, name")
    .eq("id", animal.shelter_id)
    .eq("owner_id", user.id)
    .single();

  if (shelterError || !shelter) {
    return {
      success: false,
      error: "Je mag geen notitie toevoegen aan dit dier.",
    };
  }

  const { data: approvedApplication } = await supabase
    .from("animal_applications")
    .select("id, user_id")
    .eq("animal_id", data.animalId)
    .eq("shelter_id", shelter.id)
    .eq("status", "goedgekeurd")
    .maybeSingle();

  const { error: noteError } = await supabase.from("animal_notes").insert({
    animal_id: data.animalId,
    application_id: approvedApplication?.id || null,
    created_by: user.id,
    created_by_name: data.createdByName || shelter.name,
    created_by_role: data.createdByRole || "asiel",
    title: data.title,
    content: data.content,
    visible_to_foster: data.visibleToFoster,
  });

  if (noteError) {
    console.error("Fout bij aanmaken notitie:", noteError);

    return {
      success: false,
      error: noteError.message,
    };
  }

  if (data.visibleToFoster && approvedApplication?.user_id) {
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: approvedApplication.user_id,
        title: `Nieuwe notitie toegevoegd bij ${animal.name}`,
        message: `${data.createdByName || shelter.name} heeft een nieuwe notitie toegevoegd aan het dossier van ${animal.name}.`,
        type: "animal_note",
        related_animal_id: data.animalId,
        related_application_id: approvedApplication.id,
      });

    if (notificationError) {
      console.error("Fout bij maken notificatie:", notificationError);

      return {
        success: false,
        error: notificationError.message,
      };
    }
  }

  return {
    success: true,
    error: null,
  };
}