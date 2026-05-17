import { createClient } from "@/lib/supabase/client";

type CreateAnimalMedicalRecordData = {
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

export async function createAnimalMedicalRecord(
  data: CreateAnimalMedicalRecordData
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
      error: "Je mag geen medisch verslag toevoegen aan dit dier.",
    };
  }

  const { data: approvedApplication } = await supabase
    .from("animal_applications")
    .select("id")
    .eq("animal_id", data.animalId)
    .eq("shelter_id", shelter.id)
    .eq("status", "goedgekeurd")
    .maybeSingle();

  const { error } = await supabase.from("animal_medical_records").insert({
    animal_id: data.animalId,
    application_id: approvedApplication?.id || null,
    created_by: user.id,

    title: data.title,
    record_date: data.recordDate || null,

    created_by_name: data.createdByName || shelter.name,
    created_by_role: data.createdByRole || "asiel",

    visit_reason: data.visitReason || null,
    examination: data.examination || null,
    diagnosis: data.diagnosis || null,
    performed_action: data.performedAction || null,
    vaccination_or_procedure: data.vaccinationOrProcedure || null,
    follow_up_advice: data.followUpAdvice || null,
  });

  if (error) {
    console.error("Fout bij aanmaken medisch verslag:", error);

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