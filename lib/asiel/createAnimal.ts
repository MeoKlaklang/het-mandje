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
  imageFiles?: File[];

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

const BUCKET_NAME = "animal-images";
const MAX_IMAGES = 5;

function getFileExtension(file: File) {
  const fileNameParts = file.name.split(".");
  const extension = fileNameParts.pop();

  return extension ? extension.toLowerCase() : "jpg";
}

function createSafeFileName(file: File, index: number) {
  const extension = getFileExtension(file);

  const cleanName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `foto-${index + 1}-${cleanName || "dier"}-${Date.now()}.${extension}`;
}

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

  const imageFiles = data.imageFiles || [];

  if (imageFiles.length > MAX_IMAGES) {
    return {
      success: false,
      error: `Je kan maximum ${MAX_IMAGES} foto's uploaden.`,
    };
  }

  const invalidFile = imageFiles.find((file) => !file.type.startsWith("image/"));

  if (invalidFile) {
    return {
      success: false,
      error: "Je kan alleen afbeeldingen uploaden.",
    };
  }

  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .insert({
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
    })
    .select("id")
    .single();

  if (animalError || !animal) {
    console.error("Fout bij toevoegen dier:", animalError);

    return {
      success: false,
      error: animalError?.message || "Dier kon niet worden toegevoegd.",
    };
  }

  const uploadedImageUrls: string[] = [];

  for (let index = 0; index < imageFiles.length; index++) {
    const file = imageFiles[index];

    const filePath = `${shelter.id}/${animal.id}/${createSafeFileName(
      file,
      index
    )}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Fout bij uploaden afbeelding:", uploadError);

      return {
        success: false,
        error: uploadError.message,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    uploadedImageUrls.push(publicUrlData.publicUrl);
  }

  if (uploadedImageUrls.length > 0) {
    const imageRows = uploadedImageUrls.map((imageUrl, index) => ({
      animal_id: animal.id,
      image_url: imageUrl,
      image_order: index + 1,
    }));

    const { error: imagesError } = await supabase
      .from("animal_images")
      .insert(imageRows);

    if (imagesError) {
      console.error("Fout bij opslaan dierfoto's:", imagesError);

      return {
        success: false,
        error: imagesError.message,
      };
    }

    const { error: updateMainImageError } = await supabase
      .from("animals")
      .update({
        image_url: uploadedImageUrls[0],
      })
      .eq("id", animal.id);

    if (updateMainImageError) {
      console.error("Fout bij instellen hoofdfoto:", updateMainImageError);

      return {
        success: false,
        error: updateMainImageError.message,
      };
    }
  }

  if (uploadedImageUrls.length === 0 && data.imageUrl) {
    const { error: imageUrlRowError } = await supabase
      .from("animal_images")
      .insert({
        animal_id: animal.id,
        image_url: data.imageUrl,
        image_order: 1,
      });

    if (imageUrlRowError) {
      console.error("Fout bij opslaan afbeelding URL:", imageUrlRowError);
    }
  }

  return {
    success: true,
    error: null,
  };
}