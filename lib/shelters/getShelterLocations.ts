import { createClient } from "@/lib/supabase/client";

export type ShelterLocation = {
  id: string;
  name: string;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number;
  longitude: number;
  is_platform_partner: boolean | null;
  linked_shelter_id: string | null;
};

export async function getShelterLocations() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("shelter_locations")
    .select(
      `
      id,
      name,
      street,
      house_number,
      postal_code,
      city,
      province,
      country,
      phone,
      email,
      website,
      latitude,
      longitude,
      is_platform_partner,
      linked_shelter_id
    `
    )
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Fout bij ophalen dierenasielen voor map:", error);

    return {
      shelterLocations: [],
      error: error.message,
    };
  }

  return {
    shelterLocations: data as ShelterLocation[],
    error: null,
  };
}