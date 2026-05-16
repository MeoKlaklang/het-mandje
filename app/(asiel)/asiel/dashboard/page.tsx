"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import styles from "./asiel-dashboard.module.css";

const agendaItems = [
  {
    time: "09:30",
    title: "Intake gesprek - Familie Vermeulen",
  },
  {
    time: "11:00",
    title: "Consultatie volgen",
  },
];

const tasks = [
  "Quarantaine ruimte schoonmaken van de katten",
  "Nieuwe aanvragen controleren",
  "Medicatieoverzicht nakijken",
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

function formatStatus(status: string | null) {
  if (status === "gereserveerd") return "Gereserveerd";
  if (status === "in_opvang") return "In opvang";
  if (status === "niet_beschikbaar") return "Niet beschikbaar";
  if (status === "concept") return "Concept";
  return "Beschikbaar";
}

function getStatusClass(status: string | null) {
  if (status === "gereserveerd") return styles.statusReserved;
  if (status === "in_opvang") return styles.statusFoster;
  if (status === "niet_beschikbaar") return styles.statusUnavailable;
  if (status === "concept") return styles.statusConcept;
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

export default function AsielDashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<AsielDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationDetails | null>(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);

  async function loadDashboard() {
    const { data, error } = await getAsielDashboardData();

    if (error) {
      setErrorMessage(error);
    } else {
      setErrorMessage("");
    }

    setDashboardData(data);
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const recentAnimals = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.animals.slice(0, 4);
  }, [dashboardData]);

  const shelterName = dashboardData?.shelter?.name || "Dierenasiel";

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
    setLoading(true);
    await loadDashboard();
  };

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <Link href="/home" className={styles.logoLink}>
          <Image
            src="/images/logo.png"
            alt="Het Mandje logo"
            width={90}
            height={65}
            className={styles.logo}
          />
        </Link>

        <nav className={styles.nav}>
          <p>MENU</p>

          <Link href="/asiel/dashboard" className={styles.active}>
            Dashboard
          </Link>

          <Link href="/asiel/agenda">Agenda</Link>
          <Link href="/asiel/taken">Task</Link>
          <Link href="/asiel/dieren/nieuw">+ Nieuw dier</Link>

          <p>GENERAL</p>

          <Link href="/asiel/settings">Settings</Link>
          <Link href="/asiel/help">Help</Link>
          <Link href="/asielen/login">Logout</Link>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Zoek een dier, chipnummer, adoptant"
            />
            <span>⌕</span>
          </div>

          <div className={styles.topActions}>
            <button type="button" className={styles.notificationButton}>
              ♧
            </button>

            <div className={styles.profile}>
              <div className={styles.avatar}>👤</div>
              <span>{shelterName}</span>
            </div>
          </div>
        </header>

        <div className={styles.dashboardContent}>
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
                          Bekijk welke dieren zichtbaar zijn en waar aanvragen
                          op lopen.
                        </p>
                      </div>

                      <Link href="/asiel/dieren/nieuw">+ Nieuw dier</Link>
                    </div>

                    <div className={styles.tabs}>
                      <button type="button" className={styles.activeTab}>
                        Recent toegevoegd
                      </button>
                      <button type="button">Beschikbaar</button>
                      <button type="button">Gereserveerd</button>
                      <button type="button">In opvang</button>
                      <button type="button">Concept</button>
                    </div>

                    {recentAnimals.length === 0 ? (
                      <div className={styles.emptyAnimals}>
                        <div className={styles.emptyIcon}>🐾</div>

                        <h3>Nog geen dieren toegevoegd</h3>

                        <p>
                          Voeg je eerste hond of kat toe zodat pleeggezinnen
                          interesse kunnen tonen en je aanvragen kan opvolgen.
                        </p>

                        <Link href="/asiel/dieren/nieuw">
                          + Nieuw dier toevoegen
                        </Link>
                      </div>
                    ) : (
                      <div className={styles.animalCardsList}>
                        {recentAnimals.map((animal: AsielDashboardAnimal) => {
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
                              <img
                                src={animal.image_url || "/images/dog3.jpg"}
                                alt={animal.name}
                                className={styles.animalCardImage}
                              />

                              <div className={styles.animalCardInfo}>
                                <div className={styles.animalCardTitle}>
                                  <h3>{animal.name}</h3>

                                  <span
                                    className={`${styles.statusBadge} ${getStatusClass(
                                      animal.status
                                    )}`}
                                  >
                                    {formatStatus(animal.status)}
                                  </span>
                                </div>

                                <p className={styles.animalMeta}>
                                  {animal.breed || animal.species} ·{" "}
                                  {animal.age || "Leeftijd onbekend"}
                                  {animal.gender
                                    ? ` · ${animal.gender}`
                                    : ""}
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
                                    <span
                                      className={styles.noApplicationBadge}
                                    >
                                      Geen aanvragen
                                    </span>
                                  )}

                                  <Link
                                    href={`/asiel/dieren/${animal.id}/bewerken`}
                                    className={styles.viewAnimalLink}
                                  >
                                    Bekijken →
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
                      <h2>Agenda vandaag</h2>
                      <Link href="/asiel/agenda">
                        Bekijk volledige agenda
                      </Link>
                    </div>

                    <div className={styles.agendaList}>
                      {agendaItems.map((item) => (
                        <div key={item.time} className={styles.agendaItem}>
                          <span>{item.time}</span>
                          <p>{item.title}</p>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className={styles.sideCard}>
                    <div className={styles.sideHeader}>
                      <h2>Taken</h2>
                      <Link href="/asiel/taken">Bekijk alle taken</Link>
                    </div>

                    <div className={styles.taskList}>
                      {tasks.map((task, index) => (
                        <label key={index} className={styles.taskItem}>
                          <input type="checkbox" />
                          <span>{task}</span>
                        </label>
                      ))}
                    </div>

                    <button type="button" className={styles.addTaskButton}>
                      + Nieuwe taak toevoegen
                    </button>
                  </article>

                  <article className={styles.notificationCard}>
                    <h2>Recente Notificatie</h2>

                    {dashboardData.pendingApplications > 0 ? (
                      <p>Nieuwe aanvraag voor een dier uit jouw asiel.</p>
                    ) : (
                      <p>Er zijn momenteel geen nieuwe aanvragen.</p>
                    )}
                  </article>
                </aside>
              </section>
            </>
          )}
        </div>
      </section>

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
                Aanvraag voor{" "}
                {selectedApplication.animal?.name || "dit dier"}
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
    </main>
  );
}