"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AsielLayout from "@/components/asiel/AsielLayout";
import {
  getAsielDashboardData,
  AsielDashboardAnimal,
  AsielDashboardData,
  AsielDashboardApplication,
} from "@/lib/asiel/getAsielDashboardData";
import {
  getApplicationDetailsForShelter,
  ApplicationDetails,
} from "@/lib/asiel/getApplicationDetailsForShelter";
import { updateApplicationStatus } from "@/lib/asiel/updateApplicationStatus";
import {
  getShelterAgendaData,
  ShelterAgendaAppointment,
} from "@/lib/asiel/getShelterAgendaData";
import { getShelterTodos, ShelterTodo } from "@/lib/asiel/getShelterTodos";
import { createShelterTodo } from "@/lib/asiel/createShelterTodo";
import { toggleShelterTodo } from "@/lib/asiel/toggleShelterTodo";
import styles from "./asiel-dashboard.module.css";

type AnimalTab = "recent" | "beschikbaar" | "aanvragen" | "in_opvang";

const animalTabs: { id: AnimalTab; label: string }[] = [
  { id: "recent", label: "Recent toegevoegd" },
  { id: "beschikbaar", label: "Beschikbaar" },
  { id: "aanvragen", label: "Aanvragen" },
  { id: "in_opvang", label: "In opvang" },
];

const answerLabels: Record<string, string> = {
  opvang_duur: "Welke opvangperiode past het best bij jou?",
  woning_type: "In wat voor woning woon je?",
  huishouden: "Met wie woon je samen?",
  kinderen: "Zijn er kinderen in huis?",
  tijd_thuis: "Hoe vaak ben je gemiddeld thuis?",
  motivatie: "Waarom wil je pleeggezin worden?",
  ervaring_dieren: "Hoeveel ervaring heb je met dieren?",
};

function formatDate(date: string | null) {
  if (!date) return "Datum onbekend";

  return `Toegevoegd ${new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
}

function formatNormalDate(date: string | null) {
  if (!date) return "Onbekend";

  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status: string | null) {
  if (status === "gereserveerd") return "Gereserveerd";
  if (status === "in_opvang") return "In opvang";
  if (status === "niet_beschikbaar") return "Niet beschikbaar";
  return "Beschikbaar";
}

function getStatusClass(status: string | null) {
  if (status === "gereserveerd") return styles.statusReserved;
  if (status === "in_opvang") return styles.statusFoster;
  if (status === "niet_beschikbaar") return styles.statusUnavailable;
  return styles.statusAvailable;
}

function getApplicationsForAnimal(
  animalId: string,
  data: AsielDashboardData
) {
  return data.applications.filter(
    (application) =>
      application.animal_id === animalId &&
      application.status === "in_afwachting"
  );
}

function sameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function startOfWeek(date: Date) {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  newDate.setDate(newDate.getDate() + diff);
  newDate.setHours(0, 0, 0, 0);

  return newDate;
}

function addDays(date: Date, amount: number) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + amount);
  return newDate;
}

function getCalendarDays(currentMonth: Date) {
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const start = startOfWeek(firstDay);

  return Array.from({ length: 35 }, (_, index) => addDays(start, index));
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("nl-BE", {
    month: "long",
    year: "numeric",
  });
}

function getAnimalName(
  animalId: string | null,
  animals: AsielDashboardAnimal[]
) {
  if (!animalId) return "Onbekend dier";

  return animals.find((animal) => animal.id === animalId)?.name || "Onbekend dier";
}

export default function AsielDashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<AsielDashboardData | null>(null);

  const [appointments, setAppointments] = useState<ShelterAgendaAppointment[]>(
    []
  );

  const [todos, setTodos] = useState<ShelterTodo[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [activeAnimalTab, setActiveAnimalTab] = useState<AnimalTab>("recent");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [newTodo, setNewTodo] = useState("");
  const [todoSaving, setTodoSaving] = useState(false);

  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationDetails | null>(null);

  const [applicationLoading, setApplicationLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);

  async function loadDashboard() {
    setLoading(true);

    const [dashboardResult, agendaResult, todoResult] = await Promise.all([
      getAsielDashboardData(),
      getShelterAgendaData(),
      getShelterTodos(),
    ]);

    if (dashboardResult.error) {
      setErrorMessage(dashboardResult.error);
    } else if (agendaResult.error) {
      setErrorMessage(agendaResult.error);
    } else if (todoResult.error) {
      setErrorMessage(todoResult.error);
    } else {
      setErrorMessage("");
    }

    setDashboardData(dashboardResult.data);
    setAppointments(agendaResult.appointments || []);
    setTodos(todoResult.todos || []);
    setLoading(false);
  }

  async function reloadTodos() {
    const result = await getShelterTodos();

    if (result.error) {
      alert(result.error);
      return;
    }

    setTodos(result.todos || []);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const shelterName = dashboardData?.shelter?.name || "Dierenasiel";

  const recentAnimals = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.animals.slice(0, 4);
  }, [dashboardData]);

  const availableAnimals = useMemo(() => {
    if (!dashboardData) return [];

    return dashboardData.animals
      .filter((animal) => animal.status === "beschikbaar")
      .slice(0, 4);
  }, [dashboardData]);

  const aanvraagAnimals = useMemo(() => {
    if (!dashboardData) return [];

    const animalIdsWithApplications = new Set(
      dashboardData.applications
        .filter((application) => application.status === "in_afwachting")
        .map((application) => application.animal_id)
    );

    return dashboardData.animals
      .filter((animal) => animalIdsWithApplications.has(animal.id))
      .slice(0, 4);
  }, [dashboardData]);

  const fosterAnimals = useMemo(() => {
    if (!dashboardData) return [];

    return dashboardData.animals
      .filter((animal) => animal.status === "in_opvang")
      .slice(0, 4);
  }, [dashboardData]);

  const visibleAnimals = useMemo(() => {
    if (activeAnimalTab === "beschikbaar") return availableAnimals;
    if (activeAnimalTab === "aanvragen") return aanvraagAnimals;
    if (activeAnimalTab === "in_opvang") return fosterAnimals;
    return recentAnimals;
  }, [
    activeAnimalTab,
    availableAnimals,
    aanvraagAnimals,
    fosterAnimals,
    recentAnimals,
  ]);

  const calendarDays = useMemo(() => {
    return getCalendarDays(calendarMonth);
  }, [calendarMonth]);

  const recentUpdates = useMemo(() => {
    if (!dashboardData) return [];

    const applicationUpdates = dashboardData.applications.map((application) => ({
      id: `application-${application.id}`,
      title: `Nieuwe aanvraag voor ${getAnimalName(
        application.animal_id,
        dashboardData.animals
      )}`,
      date: application.created_at,
    }));

    const appointmentUpdates = appointments.map((appointment) => ({
      id: `appointment-${appointment.id}`,
      title: `Afspraak: ${appointment.title}`,
      date: appointment.start_at,
    }));

    return [...applicationUpdates, ...appointmentUpdates]
      .filter((update) => update.date)
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 4);
  }, [dashboardData, appointments]);

  const previousMonth = () => {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  };

  const handleOpenApplication = async (applicationId: string) => {
    setApplicationLoading(true);

    const { application, error } =
      await getApplicationDetailsForShelter(applicationId);

    setApplicationLoading(false);

    if (error || !application) {
      alert(error || "Aanvraag kon niet geladen worden.");
      return;
    }

    setSelectedApplication(application);
  };

  const handleCloseModal = () => {
    setSelectedApplication(null);
  };

  const handleDecision = async (decision: "goedgekeurd" | "afgewezen") => {
    if (!selectedApplication?.animal) return;

    const confirmed = confirm(
      decision === "goedgekeurd"
        ? "Weet je zeker dat je deze aanvraag wilt goedkeuren?"
        : "Weet je zeker dat je deze aanvraag wilt weigeren?"
    );

    if (!confirmed) return;

    setDecisionLoading(true);

    const result = await updateApplicationStatus({
      applicationId: selectedApplication.id,
      animalId: selectedApplication.animal.id,
      decision,
    });

    setDecisionLoading(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    alert(
      decision === "goedgekeurd"
        ? "Aanvraag werd goedgekeurd."
        : "Aanvraag werd geweigerd."
    );

    setSelectedApplication(null);
    await loadDashboard();
  };

  const handleCreateTodo = async () => {
    if (!newTodo.trim()) {
      alert("Schrijf eerst een todo.");
      return;
    }

    setTodoSaving(true);

    const result = await createShelterTodo({
      description: newTodo,
      createdBy: shelterName,
    });

    setTodoSaving(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setNewTodo("");
    await reloadTodos();
  };

  const handleToggleTodo = async (todo: ShelterTodo) => {
    const result = await toggleShelterTodo({
      todoId: todo.id,
      isDone: !todo.is_done,
    });

    if (!result.success) {
      alert(result.error);
      return;
    }

    await reloadTodos();
  };

  return (
    <AsielLayout>
      <main className={styles.dashboardContent}>
        {loading ? (
          <section className={styles.errorCard}>
            <h1>Dashboard wordt geladen...</h1>
            <p>We halen de gegevens van je dierenasiel op.</p>
          </section>
        ) : errorMessage || !dashboardData ? (
          <section className={styles.errorCard}>
            <h1>Er ging iets mis</h1>
            <p>{errorMessage || "Dashboard kon niet geladen worden."}</p>
          </section>
        ) : (
          <>
            <section className={styles.welcome}>
              <h1>Welkom, {shelterName}!</h1>
              <p>Dit is wat er vandaag speelt in het asiel.</p>
            </section>

            <section className={styles.statsGrid}>
              <article className={styles.statCard}>
                <p>Totaal dieren</p>
                <h2>{dashboardData.totalAnimals}</h2>

                <span>
                  {
                    dashboardData.animals.filter(
                      (animal) => animal.species === "hond"
                    ).length
                  }{" "}
                  honden &nbsp;&nbsp;
                  {
                    dashboardData.animals.filter(
                      (animal) => animal.species === "kat"
                    ).length
                  }{" "}
                  katten
                </span>

                <Link href="/asiel/dieren">
                  Bekijk alle dieren <span>→</span>
                </Link>
              </article>

              <article className={styles.statCard}>
                <p>Beschikbaar</p>
                <h2>{dashboardData.availableAnimals}</h2>
                <span>Dieren zichtbaar voor pleeggezinnen</span>

                <Link href="/asiel/dieren">
                  Bekijk beschikbaar <span>→</span>
                </Link>
              </article>

              <article className={styles.statCard}>
                <p>Aanvragen</p>
                <h2>{dashboardData.pendingApplications}</h2>
                <span>Nieuwe aanvragen in afwachting</span>

                <Link href="/asiel/aanvragen">
                  Bekijk <span>→</span>
                </Link>
              </article>
            </section>

            <section className={styles.mainGrid}>
              <div className={styles.leftColumn}>
                <article className={styles.animalOverview}>
                  <div className={styles.overviewHeader}>
                    <div>
                      <h2>Dierenoverzicht</h2>
                      <p>
                        Bekijk welke dieren zichtbaar zijn en waar aanvragen op
                        lopen.
                      </p>
                    </div>

                    <Link href="/asiel/dieren/nieuw">+ Nieuw dier</Link>
                  </div>

                  <div className={styles.tabs}>
                    {animalTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        className={
                          activeAnimalTab === tab.id ? styles.activeTab : ""
                        }
                        onClick={() => setActiveAnimalTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {visibleAnimals.length === 0 ? (
                    <div className={styles.emptyAnimals}>
                      <div className={styles.emptyIcon}>🐾</div>

                      <h3>Geen dieren gevonden</h3>

                      <p>
                        Er zijn momenteel geen dieren binnen deze categorie.
                      </p>

                      <Link href="/asiel/dieren/nieuw">
                        + Nieuw dier toevoegen
                      </Link>
                    </div>
                  ) : (
                    <div className={styles.animalCardsList}>
                      {visibleAnimals.map((animal: AsielDashboardAnimal) => {
                        const applications = getApplicationsForAnimal(
                          animal.id,
                          dashboardData
                        );

                        const firstPendingApplication = applications.find(
                          (application: AsielDashboardApplication) =>
                            application.status === "in_afwachting"
                        );

                        return (
                          <article
                            key={animal.id}
                            className={styles.animalCard}
                          >
                            <Link href={`/asiel/dieren/${animal.id}/dossier`}>
                              <img
                                src={animal.image_url || "/images/dog3.jpg"}
                                alt={animal.name}
                                className={styles.animalCardImage}
                              />
                            </Link>

                            <div className={styles.animalCardInfo}>
                              <div className={styles.animalCardTitle}>
                                <Link
                                  href={`/asiel/dieren/${animal.id}/dossier`}
                                  className={styles.animalNameLink}
                                >
                                  <h3>{animal.name}</h3>
                                </Link>

                                <span
                                  className={`${styles.statusBadge} ${getStatusClass(
                                    animal.status
                                  )}`}
                                >
                                  {activeAnimalTab === "aanvragen"
                                    ? "Aanvraag"
                                    : formatStatus(animal.status)}
                                </span>
                              </div>

                              <p className={styles.animalMeta}>
                                {animal.breed || animal.species} ·{" "}
                                {animal.age || "Leeftijd onbekend"}
                                {animal.gender ? ` · ${animal.gender}` : ""}
                              </p>

                              <p className={styles.animalDate}>
                                {formatDate(animal.created_at)}
                              </p>

                              <div className={styles.animalCardFooter}>
                                {firstPendingApplication ? (
                                  <button
                                    type="button"
                                    className={styles.applicationButton}
                                    onClick={() =>
                                      handleOpenApplication(
                                        firstPendingApplication.id
                                      )
                                    }
                                  >
                                    ⏳ {applications.length}{" "}
                                    {applications.length === 1
                                      ? "aanvraag"
                                      : "aanvragen"}
                                  </button>
                                ) : (
                                  <span className={styles.noApplicationBadge}>
                                    Geen aanvragen
                                  </span>
                                )}

                                <Link
                                  href={`/asiel/dieren/${animal.id}/bewerken`}
                                  className={styles.viewAnimalLink}
                                >
                                  Bewerk →
                                </Link>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}

                  <Link href="/asiel/dieren" className={styles.viewAll}>
                    Bekijk alle dieren <span>→</span>
                  </Link>
                </article>

                <article className={styles.quickActions}>
                  <h2>Snelle acties</h2>

                  <div className={styles.actionButtons}>
                    <Link href="/asiel/dieren/nieuw">
                      <span>🐾</span>
                      Nieuw dier toevoegen
                    </Link>

                    <Link href="/asiel/dieren">
                      <span>⌕</span>
                      Dier zoeken
                    </Link>
                  </div>
                </article>
              </div>

              <aside className={styles.rightColumn}>
                <article className={styles.sideCard}>
                  <div className={styles.sideHeader}>
                    <h2>Mini kalender</h2>
                    <Link href="/asiel/agenda">Bekijk volledige agenda</Link>
                  </div>

                  <div className={styles.miniCalendar}>
                    <div className={styles.calendarTop}>
                      <button type="button" onClick={previousMonth}>
                        ‹
                      </button>

                      <h3>{formatMonth(calendarMonth)}</h3>

                      <button type="button" onClick={nextMonth}>
                        ›
                      </button>
                    </div>

                    <div className={styles.calendarDaysHeader}>
                      <span>Ma</span>
                      <span>Di</span>
                      <span>Wo</span>
                      <span>Do</span>
                      <span>Vr</span>
                      <span>Za</span>
                      <span>Zo</span>
                    </div>

                    <div className={styles.calendarGrid}>
                      {calendarDays.map((day) => {
                        const hasAppointment = appointments.some(
                          (appointment) =>
                            sameDay(new Date(appointment.start_at), day)
                        );

                        const isCurrentMonth =
                          day.getMonth() === calendarMonth.getMonth();

                        return (
                          <button
                            type="button"
                            key={day.toISOString()}
                            className={`${styles.calendarDay} ${
                              sameDay(day, new Date()) ? styles.todayDay : ""
                            } ${!isCurrentMonth ? styles.otherMonth : ""}`}
                          >
                            {day.getDate()}
                            {hasAppointment && <span></span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </article>

                <article className={styles.sideCard}>
                  <div className={styles.sideHeader}>
                    <h2>To do’s vandaag</h2>
                  </div>

                  <div className={styles.todoInput}>
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(event) => setNewTodo(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleCreateTodo();
                        }
                      }}
                      placeholder="Nieuwe todo..."
                    />

                    <button
                      type="button"
                      disabled={todoSaving}
                      onClick={handleCreateTodo}
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.taskList}>
                    {todos.length === 0 ? (
                      <p className={styles.emptyTodo}>
                        Geen todo’s voor vandaag.
                      </p>
                    ) : (
                      todos.map((todo) => (
                        <label
                          key={todo.id}
                          className={`${styles.taskItem} ${
                            todo.is_done ? styles.taskDone : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={todo.is_done}
                            onChange={() => handleToggleTodo(todo)}
                          />

                          <span>{todo.description}</span>
                        </label>
                      ))
                    )}
                  </div>

                  <p className={styles.todoHint}>
                    Afgevinkte todo’s verdwijnen automatisch de volgende dag.
                  </p>
                </article>

                <article className={styles.notificationCard}>
                  <h2>Recente notificaties</h2>

                  {recentUpdates.length === 0 ? (
                    <p>Er zijn momenteel geen nieuwe updates.</p>
                  ) : (
                    <div className={styles.recentUpdateList}>
                      {recentUpdates.map((update) => (
                        <div key={update.id} className={styles.recentUpdate}>
                          <strong>{update.title}</strong>
                          <span>{formatNormalDate(update.date)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              </aside>
            </section>
          </>
        )}
      </main>

      {applicationLoading && (
        <div className={styles.modalOverlay}>
          <div className={styles.applicationModal}>
            <p>Aanvraag wordt geladen...</p>
          </div>
        </div>
      )}

      {selectedApplication && (
        <div className={styles.modalOverlay}>
          <div className={styles.applicationModal}>
            <button
              type="button"
              className={styles.closeModal}
              onClick={handleCloseModal}
            >
              ×
            </button>

            <div className={styles.modalHeader}>
              <p>Aanvraag bekijken</p>
              <h2>
                Aanvraag voor {selectedApplication.animal?.name || "dit dier"}
              </h2>
            </div>

            <div className={styles.modalGrid}>
              <section className={styles.modalCard}>
                <h3>Dier</h3>

                <div className={styles.modalAnimal}>
                  <img
                    src={
                      selectedApplication.animal?.image_url ||
                      "/images/dog3.jpg"
                    }
                    alt={selectedApplication.animal?.name || "Dier"}
                  />

                  <div>
                    <h4>{selectedApplication.animal?.name}</h4>
                    <p>
                      {selectedApplication.animal?.breed ||
                        selectedApplication.animal?.species}{" "}
                      · {selectedApplication.animal?.age || "Leeftijd onbekend"}
                    </p>
                    <span>
                      Status:{" "}
                      {formatStatus(selectedApplication.animal?.status || null)}
                    </span>
                  </div>
                </div>
              </section>

              <section className={styles.modalCard}>
                <h3>Pleeggezin</h3>

                <p className={styles.personName}>
                  {selectedApplication.profile?.first_name || ""}{" "}
                  {selectedApplication.profile?.last_name || ""}
                </p>

                <p>
                  Geboortedatum:{" "}
                  {formatNormalDate(selectedApplication.profile?.birth || null)}
                </p>

                <p>
                  Adres:{" "}
                  {[
                    selectedApplication.profile?.street,
                    selectedApplication.profile?.house_number,
                    selectedApplication.profile?.postal_code,
                    selectedApplication.profile?.city,
                  ]
                    .filter(Boolean)
                    .join(" ") || "Niet ingevuld"}
                </p>
              </section>
            </div>

            <section className={styles.modalCard}>
              <h3>Aanvraaginformatie</h3>

              <div className={styles.infoRows}>
                <p>
                  <strong>Periode:</strong>{" "}
                  {formatNormalDate(selectedApplication.start_date)} -{" "}
                  {formatNormalDate(selectedApplication.end_date)}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {selectedApplication.status || "Onbekend"}
                </p>

                <p>
                  <strong>Bericht:</strong>{" "}
                  {selectedApplication.message || "Geen bericht toegevoegd."}
                </p>
              </div>
            </section>

            <section className={styles.modalCard}>
              <h3>Aanmeldingsantwoorden</h3>

              {selectedApplication.fosterApplication?.answers ? (
                <div className={styles.answersList}>
                  {Object.entries(
                    selectedApplication.fosterApplication.answers
                  ).map(([key, value]) => (
                    <div key={key} className={styles.answerItem}>
                      <span>{answerLabels[key] || key}</span>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Er zijn geen aanmeldingsantwoorden gevonden.</p>
              )}
            </section>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.rejectButton}
                disabled={decisionLoading}
                onClick={() => handleDecision("afgewezen")}
              >
                {decisionLoading ? "Bezig..." : "Weigeren"}
              </button>

              <button
                type="button"
                className={styles.approveButton}
                disabled={decisionLoading}
                onClick={() => handleDecision("goedgekeurd")}
              >
                {decisionLoading ? "Bezig..." : "Goedkeuren"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AsielLayout>
  );
}