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
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (shelterError || !shelter) {
    return {
      success: false,
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const { data: application, error: applicationFetchError } = await supabase
    .from("animal_applications")
    .select(
      `
      id,
      user_id,
      animal_id,
      shelter_id,
      animals (
        id,
        name
      )
    `
    )
    .eq("id", data.applicationId)
    .eq("shelter_id", shelter.id)
    .single();

  if (applicationFetchError || !application) {
    return {
      success: false,
      error: applicationFetchError?.message || "Aanvraag niet gevonden.",
    };
  }

  const animalData = Array.isArray(application.animals)
    ? application.animals[0]
    : application.animals;

  const animalName = animalData?.name || "dit dier";

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

  const notificationTitle =
    data.decision === "goedgekeurd"
      ? "Je aanvraag werd goedgekeurd"
      : "Je aanvraag werd niet goedgekeurd";

  const notificationMessage =
    data.decision === "goedgekeurd"
      ? `${shelter.name} heeft je aanvraag voor ${animalName} goedgekeurd. Je mag ${animalName} tijdelijk opvangen.`
      : `${shelter.name} heeft je aanvraag voor ${animalName} niet goedgekeurd. Je kan opnieuw een ander dier zoeken.`;

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: application.user_id,
      title: notificationTitle,
      message: notificationMessage,
      type: data.decision,
      related_animal_id: data.animalId,
      related_application_id: data.applicationId,
    });

  if (notificationError) {
    console.error("Fout bij maken notificatie:", notificationError);

    return {
      success: false,
      error: notificationError.message,
    };
  }

  return {
    success: true,
    error: null,
  };
}