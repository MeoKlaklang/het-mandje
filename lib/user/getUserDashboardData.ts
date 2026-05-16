import { createClient } from "@/lib/supabase/client";

export type DashboardProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  birth: string | null;
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

export type HistoryItem = {
  id: string;
  title: string;
  description: string;
  date: string | null;
};

export type UserDashboardData = {
  profile: DashboardProfile | null;
  notifications: DashboardNotification[];
  applications: DashboardAnimalApplication[];
  requiredActions: RequiredAction[];
  history: HistoryItem[];
};

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
    .limit(5);

  if (notificationsError) {
    console.error("Fout bij ophalen notificaties:", notificationsError);
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
    .limit(4);

  if (applicationsError) {
    console.error("Fout bij ophalen mijn dieren:", applicationsError);
  }

  const actions: RequiredAction[] = [];

  if (!profile?.street || !profile?.house_number || !profile?.postal_code || !profile?.city) {
    actions.push({
      id: "address",
      title: "Voeg je adres toe",
      description:
        "Een volledig adres helpt dierenasielen om beter in te schatten of een opvangmatch haalbaar is.",
      href: "/profiel",
    });
  }

  actions.push({
    id: "photo",
    title: "Voeg een profielfoto toe",
    description:
      "Zo weten dierenasielen wie er achter een aanvraag zit. Dit verhoogt vertrouwen.",
    href: "/profiel",
  });

  actions.push({
    id: "phone",
    title: "Verifieer je telefoonnummer",
    description:
      "Voor veiligheid en duidelijke communicatie vragen we later om telefoonverificatie.",
    href: "/profiel",
  });

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

  const history: HistoryItem[] = [
    ...applicationList.map((application) => ({
      id: `application-${application.id}`,
      title: application.animals
        ? `Aanvraag ingediend voor ${application.animals.name}`
        : "Aanvraag ingediend",
      description:
        application.status === "goedgekeurd"
          ? "Je aanvraag werd goedgekeurd."
          : application.status === "afgewezen"
          ? "Je aanvraag werd niet goedgekeurd."
          : "Je aanvraag wordt bekeken door het dierenasiel.",
      date: application.created_at,
    })),
    ...notificationList.map((notification) => ({
      id: `notification-${notification.id}`,
      title: notification.title,
      description: notification.message,
      date: notification.created_at,
    })),
  ]
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const dashboardData: UserDashboardData = {
    profile: profile || null,
    notifications: notificationList,
    applications: applicationList,
    requiredActions: actions,
    history,
  };

  return {
    data: dashboardData,
    error: null,
  };
}