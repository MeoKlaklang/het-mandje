import { createClient } from "@/lib/supabase/client";

export type DashboardProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  birth: string | null;
  phone: string | null;
  avatar_url: string | null;
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  onboarding_completed: boolean | null;
};

export type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string;
  related_animal_id: string | null;
  related_application_id: string | null;
};

export type DashboardAppointment = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  status: string | null;
  approval_status: string | null;
  requested_by: string | null;
  created_by: string | null;
  appointment_type: string | null;
  location: string | null;
  animal: {
    id: string;
    name: string;
    image_url: string | null;
    species: string | null;
    breed: string | null;
  } | null;
  shelter: {
    id: string;
    name: string | null;
  } | null;
};

export type DashboardAnimalApplication = {
  id: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  animals: {
    id: string;
    name: string;
    breed: string | null;
    species: string;
    age: string | null;
    image_url: string | null;
  } | null;
};

export type RequiredAction = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type DashboardUpdate = {
  id: string;
  title: string;
  description: string;
  date: string | null;
  type: string | null;
};

export type UserDashboardData = {
  profile: DashboardProfile | null;
  appointments: DashboardAppointment[];
  applications: DashboardAnimalApplication[];
  requiredActions: RequiredAction[];
  updates: DashboardUpdate[];
};

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function isAppointmentNotification(type: string | null) {
  if (!type) return false;

  return (
    type.includes("appointment") ||
    type.includes("afspraak") ||
    type === "appointment_request" ||
    type === "veterinarian_appointment_request"
  );
}

export async function getUserDashboardData() {
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      birth,
      phone,
      avatar_url,
      street,
      house_number,
      postal_code,
      city,
      country,
      onboarding_completed
    `
    )
    .eq("id", user.id)
    .single();

  if (profileError) {
    return {
      data: null,
      error: profileError.message,
    };
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
      status,
      approval_status,
      requested_by,
      created_by,
      appointment_type,
      location,
      animals (
        id,
        name,
        image_url,
        species,
        breed
      ),
      shelters (
        id,
        name
      )
    `
    )
    .eq("foster_id", user.id)
    .order("start_at", { ascending: false })
    .limit(30);

  if (appointmentsError) {
    console.error("Fout bij ophalen afspraken:", appointmentsError);
  }

  const { data: notifications, error: notificationsError } = await supabase
    .from("notifications")
    .select(
      `
      id,
      title,
      message,
      type,
      is_read,
      created_at,
      related_animal_id,
      related_application_id
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (notificationsError) {
    console.error("Fout bij ophalen updates:", notificationsError);
  }

  const { data: applications, error: applicationsError } = await supabase
    .from("animal_applications")
    .select(
      `
      id,
      status,
      start_date,
      end_date,
      created_at,
      animals (
        id,
        name,
        breed,
        species,
        age,
        image_url
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (applicationsError) {
    console.error("Fout bij ophalen mijn dieren:", applicationsError);
  }

  const appointmentList = (appointments || []).map((appointment) => {
    const animalData = Array.isArray(appointment.animals)
      ? appointment.animals[0]
      : appointment.animals;

    const shelterData = Array.isArray(appointment.shelters)
      ? appointment.shelters[0]
      : appointment.shelters;

    return {
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      start_at: appointment.start_at,
      end_at: appointment.end_at,
      status: appointment.status,
      approval_status: appointment.approval_status,
      requested_by: appointment.requested_by,
      created_by: appointment.created_by,
      appointment_type: appointment.appointment_type,
      location: appointment.location,
      animal: animalData || null,
      shelter: shelterData || null,
    };
  }) as DashboardAppointment[];

  const applicationList = (applications || []).map((application) => {
    const animalData = Array.isArray(application.animals)
      ? application.animals[0]
      : application.animals;

    return {
      id: application.id,
      status: application.status,
      start_date: application.start_date,
      end_date: application.end_date,
      created_at: application.created_at,
      animals: animalData || null,
    };
  }) as DashboardAnimalApplication[];

  const notificationList = (notifications || []) as DashboardNotification[];

  const updates: DashboardUpdate[] = notificationList
    .filter((notification) => !isAppointmentNotification(notification.type))
    .map((notification) => ({
      id: notification.id,
      title: notification.title,
      description: notification.message,
      date: notification.created_at,
      type: notification.type,
    }));

  const hasAddress =
    hasText(profile?.street) &&
    hasText(profile?.house_number) &&
    hasText(profile?.postal_code) &&
    hasText(profile?.city);

  const hasProfileImage = hasText(profile?.avatar_url);
  const hasPhone = hasText(profile?.phone);

  const actions: RequiredAction[] = [];

  if (!hasAddress) {
    actions.push({
      id: "address",
      title: "Voeg je adres toe",
      description:
        "Een volledig adres helpt dierenasielen om beter in te schatten of een opvangmatch haalbaar is.",
      href: "/profiel",
    });
  }

  if (!hasProfileImage) {
    actions.push({
      id: "photo",
      title: "Voeg een profielfoto toe",
      description:
        "Zo weten dierenasielen wie er achter een aanvraag zit. Dit verhoogt vertrouwen.",
      href: "/profiel",
    });
  }

  if (!hasPhone) {
    actions.push({
      id: "phone",
      title: "Voeg je telefoonnummer toe",
      description:
        "Voor veiligheid en duidelijke communicatie vragen we een telefoonnummer.",
      href: "/profiel",
    });
  }

  appointmentList
    .filter((appointment) => appointment.approval_status === "pending_user_approval")
    .slice(0, 3)
    .forEach((appointment) => {
      actions.push({
        id: `appointment-${appointment.id}`,
        title: "Afspraak wacht op jouw reactie",
        description: `${appointment.title} ${
          appointment.animal?.name ? `voor ${appointment.animal.name}` : ""
        } moet nog goedgekeurd of geweigerd worden.`,
        href: "/kalender",
      });
    });

  const dashboardData: UserDashboardData = {
    profile: profile || null,
    appointments: appointmentList,
    applications: applicationList,
    requiredActions: actions,
    updates,
  };

  return {
    data: dashboardData,
    error: null,
  };
}