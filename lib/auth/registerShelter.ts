import { createClient } from "@/lib/supabase/client";

type RegisterShelterData = {
  shelterName: string;
  recognitionNumber: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  shelterPhone: string;
  website: string;

  contactFirstName: string;
  contactLastName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;

  accountEmail: string;
  password: string;
  animalTypes: string;
  description: string;
};

export async function registerShelter(data: RegisterShelterData) {
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.accountEmail,
    password: data.password,
  });

  if (authError) {
    return {
      success: false,
      error: authError.message,
    };
  }

  const userId = authData.user?.id;

  if (!userId) {
    return {
      success: false,
      error: "Geen gebruiker gevonden na registratie.",
    };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    first_name: data.contactFirstName,
    last_name: data.contactLastName,
    role: "dierenasiel",
    onboarding_completed: true,
    street: data.street,
    house_number: data.houseNumber,
    postal_code: data.postalCode,
    city: data.city,
    country: "België",
  });

  if (profileError) {
    console.error("Fout bij maken profiel:", profileError);

    return {
      success: false,
      error: profileError.message,
    };
  }

  const { error: shelterError } = await supabase.from("shelters").insert({
    owner_id: userId,

    name: data.shelterName,
    recognition_number: data.recognitionNumber || null,
    description: data.description || null,

    street: data.street,
    house_number: data.houseNumber,
    postal_code: data.postalCode,
    city: data.city,
    country: "België",

    phone: data.shelterPhone || data.contactPhone || null,
    email: data.contactEmail,
    website: data.website || null,

    contact_first_name: data.contactFirstName,
    contact_last_name: data.contactLastName,
    contact_role: data.contactRole || null,
    contact_email: data.contactEmail,
    contact_phone: data.contactPhone || null,

    animal_types: data.animalTypes,
    image_url: "/images/dog3.jpg",
  });

  if (shelterError) {
    console.error("Fout bij maken shelter:", shelterError);

    return {
      success: false,
      error: shelterError.message,
    };
  }

  return {
    success: true,
    error: null,
  };
}