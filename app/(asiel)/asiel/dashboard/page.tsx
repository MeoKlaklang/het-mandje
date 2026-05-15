"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getAsielDashboardData,
  AsielDashboardData,
  AsielDashboardAnimal,
} from "@/lib/asiel/getAsielDashboardData";
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

function formatDate(date: string | null) {
  if (!date) return "Datum onbekend";

  return `Toegevoegd ${new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
}

function formatStatus(status: string | null) {
  if (status === "gereserveerd") return "Gereserveerd";
  if (status === "in_opvang") return "In opvang";
  if (status === "niet_beschikbaar") return "Niet beschikbaar";
  return "Beschikbaar";
}

function getApplicationsForAnimal(
  animalId: string,
  data: AsielDashboardData
) {
  return data.applications.filter(
    (application) => application.animal_id === animalId
  );
}

export default function AsielDashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<AsielDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const { data, error } = await getAsielDashboardData();

      if (error) {
        setErrorMessage(error);
      }

      setDashboardData(data);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const recentAnimals = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.animals.slice(0, 4);
  }, [dashboardData]);

  const shelterName = dashboardData?.shelter?.name || "Dierenasiel";

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
                    <div className={styles.cardHeader}>
                      <h2>Dierenoverzicht</h2>
                    </div>

                    <div className={styles.tabs}>
                      <button type="button" className={styles.activeTab}>
                        Recent toegevoegd
                      </button>
                      <button type="button">Beschikbaar</button>
                      <button type="button">Intake</button>
                      <button type="button">Niet beschikbaar</button>
                    </div>

                    {recentAnimals.length === 0 ? (
                      <div className={styles.emptyAnimals}>
                        <h3>Nog geen dieren toegevoegd</h3>
                        <p>
                          Voeg je eerste dier toe zodat pleeggezinnen interesse
                          kunnen tonen.
                        </p>

                        <Link href="/asiel/dieren/nieuw">
                          + Nieuw dier toevoegen
                        </Link>
                      </div>
                    ) : (
                      <div className={styles.animalList}>
                        {recentAnimals.map((animal: AsielDashboardAnimal) => {
                          const applications = getApplicationsForAnimal(
                            animal.id,
                            dashboardData
                          );

                          return (
                            <Link
                              key={animal.id}
                              href="/asiel/dieren"
                              className={styles.animalRow}
                            >
                              <img
                                src={animal.image_url || "/images/dog3.jpg"}
                                alt={animal.name}
                              />

                              <div>
                                <h3>{animal.name}</h3>
                                <p>{animal.breed || animal.species}</p>
                              </div>

                              <span>{animal.age || "Onbekend"}</span>

                              <span className={styles.statusPill}>
                                {formatStatus(animal.status)}
                              </span>

                              <small>
                                {applications.length > 0
                                  ? `${applications.length} aanvraag`
                                  : formatDate(animal.created_at)}
                              </small>
                            </Link>
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
                      <Link href="/asiel/agenda">Bekijk volledige agenda</Link>
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
                      <p>
                        Nieuwe aanvraag voor een dier uit jouw asiel.
                      </p>
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
    </main>
  );
}