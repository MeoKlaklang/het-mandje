import { createClient } from "@/lib/supabase/client";

export type AnimalDossier = {
	animal: {
		id: string;
		shelter_id: string | null;
		name: string;
		species: string;
		breed: string | null;
		gender: string | null;
		age: string | null;
		size: string | null;
		weight: string | null;
		coat_color: string | null;
		status: string | null;
		image_url: string | null;
		chip_number: string | null;
		passport_number: string | null;
		description: string | null;
		short_description: string | null;
		medical_notes: string | null;
		behavior_notes: string | null;
		special_needs: string | null;
		temperament: string | null;
		vaccinated: boolean | null;
		neutered: boolean | null;
		needs_medication: boolean | null;
		house_trained: boolean | null;
		can_live_with_cats: boolean | null;
		can_live_with_dogs: boolean | null;
		can_live_with_children: boolean | null;
		can_be_home_alone: boolean | null;
		created_at: string | null;
	} | null;

	foster: {
		applicationId: string;
		status: string | null;
		startDate: string | null;
		endDate: string | null;
		message: string | null;
		profile: {
			id: string;
			first_name: string | null;
			last_name: string | null;
			birth: string | null;
			street: string | null;
			house_number: string | null;
			postal_code: string | null;
			city: string | null;
			country: string | null;
		} | null;
	} | null;

	appointments: {
		id: string;
		title: string;
		description: string | null;
		start_at: string;
		end_at: string;
		appointment_type: string | null;
		created_by: string | null;
		status: string | null;
		approval_status: string | null;
		location: string | null;
		response_message: string | null;
		proposed_new_start_at: string | null;
		proposed_new_end_at: string | null;
	}[];
};

export async function getAnimalDossier(animalId: string) {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return {
			data: null,
			error: "Je bent niet ingelogd.",
		};
	}

	const { data: shelter, error: shelterError } = await supabase.from("shelters").select("id").eq("owner_id", user.id).single();

	if (shelterError || !shelter) {
		return {
			data: null,
			error: "Er is geen dierenasiel gekoppeld aan dit account.",
		};
	}

	const { data: animal, error: animalError } = await supabase
		.from("animals")
		.select(
			`
      id,
      shelter_id,
      name,
      species,
      breed,
      gender,
      age,
      size,
      weight,
      coat_color,
      status,
      image_url,
      chip_number,
      passport_number,
      description,
      short_description,
      medical_notes,
      behavior_notes,
      special_needs,
      temperament,
      vaccinated,
      neutered,
      needs_medication,
      house_trained,
      can_live_with_cats,
      can_live_with_dogs,
      can_live_with_children,
      can_be_home_alone,
      created_at
    `,
		)
		.eq("id", animalId)
		.eq("shelter_id", shelter.id)
		.single();

	if (animalError || !animal) {
		return {
			data: null,
			error: animalError?.message || "Dier niet gevonden.",
		};
	}

	const { data: approvedApplication, error: applicationError } = await supabase
		.from("animal_applications")
		.select(
			`
      id,
      status,
      start_date,
      end_date,
      message,
      user_id
    `,
		)
		.eq("animal_id", animalId)
		.eq("shelter_id", shelter.id)
		.eq("status", "goedgekeurd")
		.maybeSingle();

	if (applicationError) {
		console.error("Fout bij ophalen goedgekeurde aanvraag:", applicationError);
	}

	let fosterProfile = null;

	if (approvedApplication?.user_id) {
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select(
				`
        id,
        first_name,
        last_name,
        birth,
        street,
        house_number,
        postal_code,
        city,
        country
      `,
			)
			.eq("id", approvedApplication.user_id)
			.single();

		if (profileError) {
			console.error("Fout bij ophalen pleeggezin:", profileError);
		}

		fosterProfile = profile || null;
	}

	const { data: appointments, error: appointmentsError } = await supabase
		.from("appointments")
		.select(
			`
    id,
    title,
    description,
    start_at,
    end_at,
    appointment_type,
    created_by,
    status,
    approval_status,
    location,
    response_message,
    proposed_new_start_at,
    proposed_new_end_at
  `,
		)
		.eq("animal_id", animalId)
		.eq("shelter_id", shelter.id)
		.order("start_at", { ascending: false })
		.limit(8);

	if (appointmentsError) {
		console.error("Fout bij ophalen afspraken:", appointmentsError);
	}

	const dossier: AnimalDossier = {
		animal,
		foster: approvedApplication
			? {
					applicationId: approvedApplication.id,
					status: approvedApplication.status,
					startDate: approvedApplication.start_date,
					endDate: approvedApplication.end_date,
					message: approvedApplication.message,
					profile: fosterProfile,
				}
			: null,
		appointments: appointments || [],
	};

	return {
		data: dossier,
		error: null,
	};
}
