import { createClient } from "@/lib/supabase/client";

export type AsielDashboardShelter = {
	id: string;
	name: string;
	description: string | null;
	owner_id: string | null;
	city: string | null;
};

export type AsielDashboardAnimal = {
	id: string;
	name: string;
	species: string;
	breed: string | null;
	age: string | null;
	gender: string | null;
	size: string | null;
	status: string | null;
	image_url: string | null;
	created_at: string | null;
};

export type AsielDashboardApplication = {
	id: string;
	status: string | null;
	created_at: string | null;
	animal_id: string;
	user_id: string;
};

export type AsielDashboardData = {
	shelter: AsielDashboardShelter | null;
	animals: AsielDashboardAnimal[];
	applications: AsielDashboardApplication[];
	totalAnimals: number;
	availableAnimals: number;
	pendingApplications: number;
};

export async function getAsielDashboardData() {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return {
			data: null,
			error: "Niet ingelogd.",
		};
	}

	const { data: profile, error: profileError } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();

	if (profileError || !profile) {
		return {
			data: null,
			error: "Profiel niet gevonden.",
		};
	}

	if (profile.role !== "dierenasiel") {
		return {
			data: null,
			error: "Je hebt geen toegang tot het dierenasielplatform.",
		};
	}

	const { data: shelter, error: shelterError } = await supabase.from("shelters").select("id, name, description, owner_id, city").eq("owner_id", user.id).single();

	if (shelterError || !shelter) {
		return {
			data: null,
			error: "Geen dierenasiel gekoppeld aan dit account.",
		};
	}

	const { data: animals, error: animalsError } = await supabase.from("animals").select("id, name, species, breed, age, gender, size, status, image_url, created_at").eq("shelter_id", shelter.id).order("created_at", { ascending: false });

	if (animalsError) {
		console.error("Fout bij ophalen dieren asiel:", animalsError);

		return {
			data: null,
			error: animalsError.message,
		};
	}

	const { data: applications, error: applicationsError } = await supabase
		.from("animal_applications")
		.select("id, status, created_at, animal_id, user_id")
		.eq("shelter_id", shelter.id)
		.eq("status", "in_afwachting")
		.order("created_at", { ascending: false });

	if (applicationsError) {
		console.error("Fout bij ophalen aanvragen asiel:", applicationsError);

		return {
			data: null,
			error: applicationsError.message,
		};
	}

	const animalsList = (animals || []) as AsielDashboardAnimal[];
	const applicationsList = (applications || []) as AsielDashboardApplication[];

	const dashboardData: AsielDashboardData = {
		shelter: shelter as AsielDashboardShelter,
		animals: animalsList,
		applications: applicationsList,
		totalAnimals: animalsList.length,
		availableAnimals: animalsList.filter((animal) => animal.status === "beschikbaar").length,
		pendingApplications: applicationsList.filter((application) => application.status === "in_afwachting").length,
	};

	return {
		data: dashboardData,
		error: null,
	};
}
