import { createClient } from "@/lib/supabase/client";

type CreateDierenartsAnimalMedicationData = {
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

export async function createDierenartsAnimalMedication(
  data: CreateDierenartsAnimalMedicationData
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

  const createdByName =
    data.createdByName ||
    veterinarian.practice_name ||
    `Dr. ${veterinarian.last_name || veterinarian.first_name || ""}`.trim() ||
    "Dierenarts";

  const { error } = await supabase.from("animal_medications").insert({
    animal_id: data.animalId,
    created_by: user.id,

    name: data.name,
    dosage: data.dosage || null,
    frequency: data.frequency || null,
    instructions: data.instructions || null,
    start_date: data.startDate || null,
    end_date: data.endDate || null,

    created_by_name: createdByName,
    created_by_role: data.createdByRole || "dierenarts",
    visible_to_foster: data.visibleToFoster,
  });

  if (error) {
    console.error("Fout bij toevoegen medicatie:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  if (data.visibleToFoster) {
    const { data: application } = await supabase
      .from("animal_applications")
      .select("id, user_id")
      .eq("animal_id", data.animalId)
      .eq("shelter_id", veterinarian.shelter_id)
      .eq("status", "goedgekeurd")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (application?.user_id) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: application.user_id,
          title: `Nieuwe medicatie voor ${animal.name}`,
          message: `${createdByName} heeft medicatie toegevoegd voor ${animal.name}: ${data.name}.`,
          type: "medication",
          related_animal_id: data.animalId,
          related_application_id: application.id,
        });

      if (notificationError) {
        console.error("Fout bij maken medicatie-notificatie:", notificationError);
      }
    }
  }

  return {
    success: true,
    error: null,
  };
}