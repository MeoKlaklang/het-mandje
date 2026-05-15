import { createClient } from "@/lib/supabase/client";

type CreateAnimalData = {
  species: "hond" | "kat";
  name: string;
  breed: string;
  gender: string;
  birthDate: string;
  age: string;
  size: string;
  weight: string;
  coatColor: string;
  specialNeeds: string;

  origin: string;
  intakeDate: string;
  intakeReason: string;
  intakeNotes: string;
  admittedBy: string;

  chipNumber: string;
  passportNumber: string;

  imageUrl: string;

  shortDescription: string;
  description: string;
  behaviorNotes: string;
  medicalNotes: string;
  temperament: string;

  availableFrom: string;
  availableUntil: string;
  expectedDuration: string;
  careLevel: string;
  status: "concept" | "beschikbaar";

  vaccinated: boolean;
  neutered: boolean;
  canLiveWithCats: boolean;
  canLiveWithDogs: boolean;
  canLiveWithChildren: boolean;
  canBeHomeAlone: boolean;
  houseTrained: boolean;
  needsMedication: boolean;
};

export async function createAnimal(data: CreateAnimalData) {
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
    .select("id, city, postal_code")
    .eq("owner_id", user.id)
    .single();

  if (shelterError || !shelter) {
    return {
      success: false,
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const { error } = await supabase.from("animals").insert({
    shelter_id: shelter.id,

    species: data.species,
    name: data.name,
    breed: data.breed || null,
    gender: data.gender || null,
    birth_date: data.birthDate || null,
    age: data.age || null,
    size: data.size || null,
    weight: data.weight || null,
    coat_color: data.coatColor || null,
    special_needs: data.specialNeeds || null,

    city: shelter.city,
    postal_code: shelter.postal_code,

    origin: data.origin || null,
    intake_date: data.intakeDate || null,
    intake_reason: data.intakeReason || null,
    intake_notes: data.intakeNotes || null,
    admitted_by: data.admittedBy || null,

    chip_number: data.chipNumber || null,
    passport_number: data.passportNumber || null,

    image_url: data.imageUrl || "/images/dog3.jpg",

    short_description: data.shortDescription || null,
    description: data.description || null,
    behavior_notes: data.behaviorNotes || null,
    medical_notes: data.medicalNotes || null,
    temperament: data.temperament || null,

    available_from: data.availableFrom || null,
    available_until: data.availableUntil || null,
    expected_duration: data.expectedDuration || null,
    care_level: data.careLevel || "normaal",
    status: data.status,

    vaccinated: data.vaccinated,
    neutered: data.neutered,
    can_live_with_cats: data.canLiveWithCats,
    can_live_with_dogs: data.canLiveWithDogs,
    can_live_with_children: data.canLiveWithChildren,
    can_be_home_alone: data.canBeHomeAlone,
    house_trained: data.houseTrained,
    needs_medication: data.needsMedication,
  });

  if (error) {
    console.error("Fout bij toevoegen dier:", error);

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