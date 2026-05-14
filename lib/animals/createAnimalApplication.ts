import { createClient } from "@/lib/supabase/client";

type CreateAnimalApplicationData = {
  animalId: string;
  shelterId: string | null;
  message?: string;
  startDate?: string | null;
  endDate?: string | null;
};

export async function createAnimalApplication(
  data: CreateAnimalApplicationData
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Je moet ingelogd zijn om interesse te tonen.",
    };
  }

  const { error } = await supabase.from("animal_applications").insert({
    animal_id: data.animalId,
    user_id: user.id,
    shelter_id: data.shelterId,
    message: data.message || null,
    start_date: data.startDate || null,
    end_date: data.endDate || null,
    status: "in_afwachting",
  });

  if (error) {
    console.error("Fout bij maken aanvraag:", error);

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