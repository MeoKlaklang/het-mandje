"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  getUserDashboardData,
  UserDashboardData,
  DashboardAnimalApplication,
  DashboardAppointment,
} from "@/lib/user/getUserDashboardData";
import styles from "./dashboard.module.css";

function formatDate(date: string | null) {
  if (!date) return "Datum onbekend";

  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status: string | null) {
  if (status === "goedgekeurd") return "Goedgekeurd";
  if (status === "afgewezen") return "Niet goedgekeurd";
  if (status === "in_afwachting") return "In afwachting";
  return "In afwachting";
}

function getStatusClass(status: string | null) {
  if (status === "goedgekeurd") return styles.statusApproved;
  if (status === "afgewezen") return styles.statusRejected;
  return styles.statusPending;
}

function formatAppointmentStatus(status: string | null) {
  if (status === "pending_user_approval") return "Wacht op jouw goedkeuring";
  if (status === "pending_shelter_approval")
    return "Wacht op goedkeuring asiel";
  if (status === "pending_veterinarian_approval")
    return "Wacht op goedkeuring dierenarts";
  if (status === "confirmed") return "Bevestigd";
  if (status === "declined") return "Geweigerd";
  if (status === "new_time_requested") return "Nieuw tijdstip voorgesteld";
  return "In afwachting";
}

function getAppointmentStatusClass(status: string | null) {
  if (status === "confirmed") return styles.statusApproved;
  if (status === "declined") return styles.statusRejected;
  return styles.statusPending;
}

function getAppointmentSubtitle(appointment: DashboardAppointment) {
  const animalName = appointment.animal?.name;
  const shelterName = appointment.shelter?.name;

  if (animalName && shelterName) {
    return `${animalName} · ${shelterName}`;
  }

  if (animalName) return animalName;
  if (shelterName) return shelterName;

  return "Afspraak";
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const { data, error } = await getUserDashboardData();

      if (error) {
        setErrorMessage(error);
      }

      setDashboardData(data);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const profile = dashboardData?.profile;
  const firstName = profile?.first_name || "daar";

  const hasPhone = Boolean(profile?.phone?.trim());
  const hasProfileImage = Boolean(profile?.avatar_url?.trim());

  const hasAddress =
    Boolean(profile?.street?.trim()) &&
    Boolean(profile?.house_number?.trim()) &&
    Boolean(profile?.postal_code?.trim()) &&
    Boolean(profile?.city?.trim());

  const latestApplications = dashboardData?.applications || [];
  const latestAppointments = dashboardData?.appointments || [];
  const requiredActions = dashboardData?.requiredActions || [];
  const updates = dashboardData?.updates || [];

  return (
    <>
      <DashboardNavbar />

      <main className={styles.dashboard}>
        {loading ? (
          <section className={styles.statusBox}>
            <h1>Dashboard wordt geladen...</h1>
            <p>We halen je gegevens op.</p>
          </section>
        ) : errorMessage || !dashboardData ? (
          <section className={styles.statusBox}>
            <h1>Er ging iets mis</h1>
            <p>{errorMessage || "Je dashboard kon niet geladen worden."}</p>
          </section>
        ) : (
          <>
            <section className={styles.statusBox}>
              <div className={styles.welcomeText}>
                <p className={styles.welcomeLabel}>Welkom terug</p>

                <h1>Hallo {firstName}, alles op één plek.</h1>

                <p>
                  Hier vind je je afspraken, je opvangdieren, openstaande acties
                  en updates van dierenasielen of dierenartsen.
                </p>
              </div>

              <div className={styles.steps}>
                <div className={styles.stepItem}>
                  <div
                    className={`${styles.circle} ${
                      hasPhone ? styles.circleDone : ""
                    }`}
                  >
                    {hasPhone ? "✓" : "☎"}
                  </div>
                  <span>
                    {hasPhone ? "Telefoon ingevuld" : "Telefoon toevoegen"}
                  </span>
                </div>

                <div
                  className={`${styles.line} ${
                    hasPhone && hasProfileImage ? styles.lineDone : ""
                  }`}
                ></div>

                <div className={styles.stepItem}>
                  <div
                    className={`${styles.circle} ${
                      hasProfileImage ? styles.circleDone : ""
                    }`}
                  >
                    {hasProfileImage ? "✓" : "👤"}
                  </div>
                  <span>
                    {hasProfileImage
                      ? "Profielfoto toegevoegd"
                      : "Profielfoto toevoegen"}
                  </span>
                </div>

                <div
                  className={`${styles.line} ${
                    hasProfileImage && hasAddress ? styles.lineDone : ""
                  }`}
                ></div>

                <div className={styles.stepItem}>
                  <div
                    className={`${styles.circle} ${
                      hasAddress ? styles.circleDone : ""
                    }`}
                  >
                    {hasAddress ? "✓" : "⌂"}
                  </div>
                  <span>{hasAddress ? "Adres ingevuld" : "Adres toevoegen"}</span>
                </div>
              </div>
            </section>

            <section className={styles.dashboardColumns}>
              <div className={styles.dashboardColumn}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2>Afspraken</h2>
                    <Link href="/kalender">Bekijk kalender</Link>
                  </div>

                  {latestAppointments.length === 0 ? (
                    <div className={styles.emptyBox}>
                      <h3>Geen afspraken</h3>
                      <p>
                        Wanneer een asiel of dierenarts een afspraak maakt,
                        verschijnt die hier.
                      </p>
                    </div>
                  ) : (
                    <div className={styles.appointmentList}>
                      {latestAppointments.map((appointment) => (
                        <Link
                          key={appointment.id}
                          href="/kalender"
                          className={styles.appointmentItem}
                        >
                          <div className={styles.appointmentDate}>
                            <strong>{formatDate(appointment.start_at)}</strong>
                            <span>{formatTime(appointment.start_at)}</span>
                          </div>

                          <div className={styles.appointmentContent}>
                            <h3>{appointment.title}</h3>
                            <p>{getAppointmentSubtitle(appointment)}</p>

                            <span
                              className={`${styles.statusBadge} ${getAppointmentStatusClass(
                                appointment.approval_status
                              )}`}
                            >
                              {formatAppointmentStatus(
                                appointment.approval_status
                              )}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2>Mijn dieren</h2>
                    <Link href="/mijn-dieren">Bekijk alles</Link>
                  </div>

                  {latestApplications.length === 0 ? (
                    <div className={styles.emptyBox}>
                      <h3>Nog geen dier toegewezen</h3>
                      <p>
                        Je kan alvast dieren bekijken die op zoek zijn naar een
                        tijdelijk thuis.
                      </p>
                      <Link href="/dieren">Vind een dier</Link>
                    </div>
                  ) : (
                    <div className={styles.myAnimalsList}>
                      {latestApplications.map(
                        (application: DashboardAnimalApplication) => (
                          <Link
                            key={application.id}
                            href="/mijn-dieren"
                            className={styles.myAnimalItem}
                          >
                            <img
                              src={
                                application.animals?.image_url ||
                                "/images/dog3.jpg"
                              }
                              alt={application.animals?.name || "Dier"}
                            />

                            <div>
                              <h3>{application.animals?.name || "Dier"}</h3>
                              <p>
                                {application.animals?.breed ||
                                  application.animals?.species ||
                                  "Onbekend"}
                              </p>

                              <span
                                className={`${styles.statusBadge} ${getStatusClass(
                                  application.status
                                )}`}
                              >
                                {formatStatus(application.status)}
                              </span>
                            </div>
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.dashboardColumn}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2>Actie vereist</h2>
                    <Link href="/profiel">Profiel openen</Link>
                  </div>

                  {requiredActions.length === 0 ? (
                    <div className={styles.emptyBox}>
                      <h3>Alles is in orde</h3>
                      <p>
                        Je profiel is volledig genoeg en er wachten geen
                        dringende acties.
                      </p>
                    </div>
                  ) : (
                    <div className={styles.actionList}>
                      {requiredActions.map((action) => (
                        <article key={action.id} className={styles.actionItem}>
                          <div>
                            <h3>{action.title}</h3>
                            <p>{action.description}</p>
                          </div>

                          <Link href={action.href}>Bekijken</Link>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2>Updates</h2>
                  </div>

                  {updates.length === 0 ? (
                    <div className={styles.emptyBox}>
                      <h3>Nog geen updates</h3>
                      <p>
                        Medische notities, medicatie-updates of berichten van
                        asielen en dierenartsen verschijnen hier.
                      </p>
                    </div>
                  ) : (
                    <div className={styles.updateList}>
                      {updates.map((update) => (
                        <article key={update.id} className={styles.updateItem}>
                          <span></span>

                          <div>
                            <h3>{update.title}</h3>
                            <p>{update.description}</p>
                            <small>{formatDate(update.date)}</small>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}