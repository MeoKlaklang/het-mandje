import { createClient } from "@/lib/supabase/client";

export type AsielSearchResult = {
  animalId: string;
  animalName: string;
  species: string;
  breed: string | null;
  status: string | null;
  imageUrl: string | null;

  fosterName: string | null;
  city: string | null;

  href: string;
};

type AnimalRow = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  status: string | null;
  image_url: string | null;
};

type ApplicationRow = {
  id: string;
  animal_id: string;
  user_id: string;
  status: string | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
};

export async function searchAsielRecords(searchTerm: string) {
  const supabase = createClient();

  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return {
      results: [],
      error: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      results: [],
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
      results: [],
      error: "Er is geen dierenasiel gekoppeld aan dit account.",
    };
  }

  const { data: animals, error: animalsError } = await supabase
    .from("animals")
    .select("id, name, species, breed, status, image_url")
    .eq("shelter_id", shelter.id)
    .order("name", { ascending: true })
    .limit(80);

  if (animalsError) {
    console.error("Fout bij zoeken dieren:", animalsError);

    return {
      results: [],
      error: animalsError.message,
    };
  }

  const animalList = (animals || []) as AnimalRow[];
  const animalIds = animalList.map((animal) => animal.id);

  if (animalIds.length === 0) {
    return {
      results: [],
      error: null,
    };
  }

  const { data: applications, error: applicationsError } = await supabase
    .from("animal_applications")
    .select("id, animal_id, user_id, status")
    .eq("shelter_id", shelter.id)
    .in("animal_id", animalIds)
    .in("status", ["goedgekeurd", "in_afwachting"]);

  if (applicationsError) {
    console.error("Fout bij zoeken aanvragen:", applicationsError);

    return {
      results: [],
      error: applicationsError.message,
    };
  }

  const applicationList = (applications || []) as ApplicationRow[];
  const userIds = Array.from(
    new Set(applicationList.map((application) => application.user_id))
  );

  let profileList: ProfileRow[] = [];

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, city")
      .in("id", userIds);

    if (profilesError) {
      console.error("Fout bij zoeken profielen:", profilesError);
    } else {
      profileList = (profiles || []) as ProfileRow[];
    }
  }

  const results: AsielSearchResult[] = animalList
    .map((animal) => {
      const application = applicationList.find(
        (item) =>
          item.animal_id === animal.id &&
          (item.status === "goedgekeurd" || item.status === "in_afwachting")
      );

      const profile = application
        ? profileList.find((item) => item.id === application.user_id)
        : null;

      const fosterName = profile
        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
        : null;

      return {
        animalId: animal.id,
        animalName: animal.name,
        species: animal.species,
        breed: animal.breed,
        status: animal.status,
        imageUrl: animal.image_url,
        fosterName: fosterName || null,
        city: profile?.city || null,
        href: `/asiel/dieren/${animal.id}/dossier`,
      };
    })
    .filter((result) => {
      const searchableText = [
        result.animalName,
        result.species,
        result.breed,
        result.status,
        result.fosterName,
        result.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    })
    .slice(0, 8);

  return {
    results,
    error: null,
  };
}