import { createClient } from "@/lib/supabase/client";

export type DierenartsAgendaAppointment = {
	id: string;
	title: string;
	description: string | null;
	start_at: string;
	end_at: string;
	status: string | null;
	approval_status: string | null;
	appointment_type: string | null;
	location: string | null;
	created_by: string | null;
	requested_by: string | null;
	response_message: string | null;
	proposed_new_start_at: string | null;
	proposed_new_end_at: string | null;

	animal_id: string | null;
	foster_id: string | null;
	veterinarian_id: string | null;
	shelter_id: string | null;

	animal: {
		id: string;
		name: string;
		image_url: string | null;
		species: string | null;
		breed: string | null;
	} | null;

	fosterProfile: {
		id: string;
		first_name: string | null;
		last_name: string | null;
		city: string | null;
		postal_code: string | null;
	} | null;
};

type AppointmentRow = {
	id: string;
	title: string;
	description: string | null;
	start_at: string;
	end_at: string;
	status: string | null;
	approval_status: string | null;
	appointment_type: string | null;
	location: string | null;
	created_by: string | null;
	requested_by: string | null;
	response_message: string | null;
	proposed_new_start_at: string | null;
	proposed_new_end_at: string | null;

	animal_id: string | null;
	foster_id: string | null;
	veterinarian_id: string | null;
	shelter_id: string | null;

	animals:
		| {
				id: string;
				name: string;
				image_url: string | null;
				species: string | null;
				breed: string | null;
		  }
		| {
				id: string;
				name: string;
				image_url: string | null;
				species: string | null;
				breed: string | null;
		  }[]
		| null;
};

type ProfileRow = {
	id: string;
	first_name: string | null;
	last_name: string | null;
	city: string | null;
	postal_code: string | null;
};

export async function getDierenartsAgendaData() {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return {
			appointments: [],
			error: "Je bent niet ingelogd.",
		};
	}

	const { data: veterinarian, error: veterinarianError } = await supabase.from("veterinarians").select("id, user_id, shelter_id").eq("user_id", user.id).maybeSingle();

	if (veterinarianError || !veterinarian?.shelter_id) {
		return {
			appointments: [],
			error: "Geen gekoppeld dierenasiel gevonden.",
		};
	}

	const { data, error } = await supabase
		.from("appointments")
		.select(
			`
      id,
      title,
      description,
      start_at,
      end_at,
      status,
      approval_status,
      appointment_type,
      location,
      created_by,
      requested_by,
      response_message,
      proposed_new_start_at,
      proposed_new_end_at,
      animal_id,
      foster_id,
      veterinarian_id,
      shelter_id,
      animals (
        id,
        name,
        image_url,
        species,
        breed
      )
    `,
		)
		.eq("veterinarian_id", user.id)
		.neq("status", "cancelled")
		.order("start_at", { ascending: true });

	if (error) {
		console.error("Fout bij ophalen dierenarts agenda:", error);

		return {
			appointments: [],
			error: error.message,
		};
	}

	const appointmentRows = (data || []) as AppointmentRow[];

	const fosterIds = Array.from(new Set(appointmentRows.map((appointment) => appointment.foster_id).filter(Boolean))) as string[];

	let fosterProfiles: ProfileRow[] = [];

	if (fosterIds.length > 0) {
		const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("id, first_name, last_name, city, postal_code").in("id", fosterIds);

		if (profilesError) {
			console.error("Fout bij ophalen pleeggezinnen:", profilesError);
		} else {
			fosterProfiles = (profilesData || []) as ProfileRow[];
		}
	}

	const appointments = appointmentRows.map((appointment) => {
		const animal = Array.isArray(appointment.animals) ? appointment.animals[0] : appointment.animals;

		const fosterProfile = appointment.foster_id ? fosterProfiles.find((profile) => profile.id === appointment.foster_id) || null : null;

		return {
			id: appointment.id,
			title: appointment.title,
			description: appointment.description,
			start_at: appointment.start_at,
			end_at: appointment.end_at,
			status: appointment.status,
			approval_status: appointment.approval_status,
			appointment_type: appointment.appointment_type,
			location: appointment.location,
			created_by: appointment.created_by,
			requested_by: appointment.requested_by,
			response_message: appointment.response_message,
			proposed_new_start_at: appointment.proposed_new_start_at,
			proposed_new_end_at: appointment.proposed_new_end_at,
			animal_id: appointment.animal_id,
			foster_id: appointment.foster_id,
			veterinarian_id: appointment.veterinarian_id,
			shelter_id: appointment.shelter_id,
			animal: animal || null,
			fosterProfile,
		};
	});

	return {
		appointments: appointments as DierenartsAgendaAppointment[],
		error: null,
	};
}
