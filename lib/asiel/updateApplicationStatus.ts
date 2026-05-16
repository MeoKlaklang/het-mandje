import { createClient } from "@/lib/supabase/client";

type ApplicationDecision = "goedgekeurd" | "afgewezen";

type UpdateApplicationStatusData = {
  applicationId: string;
  animalId: string;
  decision: ApplicationDecision;
};

export async function updateApplicationStatus(
  data: UpdateApplicationStatusData
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

  const { data: shelter, error: shelterError } = await supabase
    .from("shelters")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (shelterError || !shelter) {
    return {
      success: false,
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const newAnimalStatus =
    data.decision === "goedgekeurd" ? "in_opvang" : "beschikbaar";

  const { error: applicationError } = await supabase
    .from("animal_applications")
    .update({
      status: data.decision,
    })
    .eq("id", data.applicationId)
    .eq("shelter_id", shelter.id);

  if (applicationError) {
    console.error("Fout bij aanpassen aanvraag:", applicationError);

    return {
      success: false,
      error: applicationError.message,
    };
  }

  const { error: animalError } = await supabase
    .from("animals")
    .update({
      status: newAnimalStatus,
    })
    .eq("id", data.animalId)
    .eq("shelter_id", shelter.id);

  if (animalError) {
    console.error("Fout bij aanpassen dierstatus:", animalError);

    return {
      success: false,
      error: animalError.message,
    };
  }

  return {
    success: true,
    error: null,
  };
}