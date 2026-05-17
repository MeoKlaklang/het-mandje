import { createClient } from "@/lib/supabase/client";

type CreateAnimalMedicationData = {
  animalId: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: string;
  endDate: string;
  createdByName: string;
  createdByRole: string;
  visibleToFoster: boolean;
};

export async function createAnimalMedication(data: CreateAnimalMedicationData) {
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
      error: "Je mag geen medicatie toevoegen aan dit dier.",
    };
  }

  const { data: approvedApplication } = await supabase
    .from("animal_applications")
    .select("id, user_id")
    .eq("animal_id", data.animalId)
    .eq("shelter_id", shelter.id)
    .eq("status", "goedgekeurd")
    .maybeSingle();

  const { error: medicationError } = await supabase
    .from("animal_medications")
    .insert({
      animal_id: data.animalId,
      application_id: approvedApplication?.id || null,
      created_by: user.id,
      created_by_name: data.createdByName || shelter.name,
      created_by_role: data.createdByRole || "asiel",
      name: data.name,
      dosage: data.dosage || null,
      frequency: data.frequency || null,
      instructions: data.instructions || null,
      start_date: data.startDate || null,
      end_date: data.endDate || null,
      visible_to_foster: data.visibleToFoster,
    });

  if (medicationError) {
    console.error("Fout bij aanmaken medicatie:", medicationError);

    return {
      success: false,
      error: medicationError.message,
    };
  }

  if (data.visibleToFoster && approvedApplication?.user_id) {
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: approvedApplication.user_id,
        title: `Nieuwe medicatie toegevoegd bij ${animal.name}`,
        message: `${
          data.createdByName || shelter.name
        } heeft medicatie toegevoegd voor ${animal.name}: ${data.name}.`,
        type: "animal_medication",
        related_animal_id: data.animalId,
        related_application_id: approvedApplication.id,
      });

    if (notificationError) {
      console.error("Fout bij maken medicatie-notificatie:", notificationError);

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