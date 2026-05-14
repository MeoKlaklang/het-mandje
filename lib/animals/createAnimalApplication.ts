import { createClient } from "@/lib/supabase/client";

type CreateAnimalApplicationData = {
  animalId: string;
  shelterId: string | null;
  message?: string;
  startDate?: string | null;
  endDate?: string | null;
};

type ApplicationResult = {
  success: boolean;
  error?: string;
  application_id?: string;
};

export async function createAnimalApplication(
  data: CreateAnimalApplicationData
) {
  const supabase = createClient();

  const { data: result, error } = await supabase.rpc(
    "create_application_and_reserve_animal",
    {
      p_animal_id: data.animalId,
      p_shelter_id: data.shelterId,
      p_message: data.message || null,
      p_start_date: data.startDate || null,
      p_end_date: data.endDate || null,
    }
  );

  if (error) {
    console.error("Fout bij maken aanvraag:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  const parsedResult = result as ApplicationResult;

  if (!parsedResult.success) {
    return {
      success: false,
      error: parsedResult.error || "Er ging iets mis.",
    };
  }

  return {
    success: true,
    error: null,
    applicationId: parsedResult.application_id,
  };
}