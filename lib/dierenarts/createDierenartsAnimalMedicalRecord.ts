import { createClient } from "@/lib/supabase/client";

type CreateDierenartsAnimalMedicalRecordData = {
  animalId: string;
  title: string;
  recordDate: string;
  createdByName: string;
  createdByRole: string;
  visitReason: string;
  examination: string;
  diagnosis: string;
  performedAction: string;
  vaccinationOrProcedure: string;
  followUpAdvice: string;
};

export async function createDierenartsAnimalMedicalRecord(
  data: CreateDierenartsAnimalMedicalRecordData
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
    .select("id")
    .eq("id", data.animalId)
    .eq("shelter_id", veterinarian.shelter_id)
    .maybeSingle();

  if (animalError || !animal) {
    return {
      success: false,
      error: "Dit dier hoort niet bij jouw gekoppeld asiel.",
    };
  }

  const doctorName =
    data.createdByName ||
    veterinarian.practice_name ||
    `Dr. ${veterinarian.last_name || veterinarian.first_name || ""}`.trim() ||
    "Dierenarts";

  const { error } = await supabase.from("animal_medical_records").insert({
    animal_id: data.animalId,
    created_by: user.id,
    created_by_name: doctorName,
    created_by_role: data.createdByRole || "dierenarts",

    title: data.title,
    record_date: data.recordDate || null,
    visit_reason: data.visitReason || null,
    examination: data.examination || null,
    diagnosis: data.diagnosis || null,
    performed_action: data.performedAction || null,
    vaccination_or_procedure: data.vaccinationOrProcedure || null,
    follow_up_advice: data.followUpAdvice || null,
  });

  if (error) {
    console.error("Fout bij toevoegen medisch verslag:", error);

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