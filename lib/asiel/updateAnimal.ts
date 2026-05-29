import { createClient } from "@/lib/supabase/client";

type ExistingAnimalImageInput = {
  id: string;
  image_url: string;
  image_order: number | null;
};

type UpdateAnimalData = {
  animalId: string;

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
  existingImages?: ExistingAnimalImageInput[];
  newImageFiles?: File[];

  shortDescription: string;
  description: string;
  behaviorNotes: string;
  medicalNotes: string;
  temperament: string;

  availableFrom: string;
  availableUntil: string;
  expectedDuration: string;
  careLevel: string;
  status:
    | "concept"
    | "beschikbaar"
    | "gereserveerd"
    | "in_opvang"
    | "niet_beschikbaar";

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

export async function updateAnimal(data: UpdateAnimalData) {
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

  const existingImages = data.existingImages || [];
  const newImageFiles = data.newImageFiles || [];

  if (existingImages.length + newImageFiles.length > MAX_IMAGES) {
    return {
      success: false,
      error: `Je kan maximum ${MAX_IMAGES} foto's bewaren.`,
    };
  }

  const invalidFile = newImageFiles.find(
    (file) => !file.type.startsWith("image/")
  );

  if (invalidFile) {
    return {
      success: false,
      error: "Je kan alleen afbeeldingen uploaden.",
    };
  }

  const { data: currentAnimal, error: currentAnimalError } = await supabase
    .from("animals")
    .select("id")
    .eq("id", data.animalId)
    .eq("shelter_id", shelter.id)
    .single();

  if (currentAnimalError || !currentAnimal) {
    return {
      success: false,
      error: "Dit dier hoort niet bij jouw dierenasiel.",
    };
  }

  const uploadedImageUrls: string[] = [];

  for (let index = 0; index < newImageFiles.length; index++) {
    const file = newImageFiles[index];

    const filePath = `${shelter.id}/${data.animalId}/${createSafeFileName(
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

  let finalImageUrls = [
    ...existingImages.map((image) => image.image_url),
    ...uploadedImageUrls,
  ];

  if (finalImageUrls.length === 0 && data.imageUrl.trim()) {
    finalImageUrls = [data.imageUrl.trim()];
  }

  const mainImageUrl = finalImageUrls[0] || "/images/dog3.jpg";

  const { error } = await supabase
    .from("animals")
    .update({
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

      origin: data.origin || null,
      intake_date: data.intakeDate || null,
      intake_reason: data.intakeReason || null,
      intake_notes: data.intakeNotes || null,
      admitted_by: data.admittedBy || null,

      chip_number: data.chipNumber || null,
      passport_number: data.passportNumber || null,

      image_url: mainImageUrl,

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
    .eq("id", data.animalId)
    .eq("shelter_id", shelter.id);

  if (error) {
    console.error("Fout bij aanpassen dier:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  const { error: deleteImagesError } = await supabase
    .from("animal_images")
    .delete()
    .eq("animal_id", data.animalId);

  if (deleteImagesError) {
    console.error("Fout bij verwijderen oude dierfoto's:", deleteImagesError);

    return {
      success: false,
      error: deleteImagesError.message,
    };
  }

  if (finalImageUrls.length > 0) {
    const imageRows = finalImageUrls.map((imageUrl, index) => ({
      animal_id: data.animalId,
      image_url: imageUrl,
      image_order: index + 1,
    }));

    const { error: insertImagesError } = await supabase
      .from("animal_images")
      .insert(imageRows);

    if (insertImagesError) {
      console.error("Fout bij opslaan nieuwe dierfoto's:", insertImagesError);

      return {
        success: false,
        error: insertImagesError.message,
      };
    }
  }

  return {
    success: true,
    error: null,
  };
}