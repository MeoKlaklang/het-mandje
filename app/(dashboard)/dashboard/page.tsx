"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  getUserDashboardData,
  UserDashboardData,
  DashboardAnimalApplication,
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

  const hasAddress =
    !!profile?.street &&
    !!profile?.house_number &&
    !!profile?.postal_code &&
    !!profile?.city;

  const latestApplications = dashboardData?.applications || [];
  const latestNotifications = dashboardData?.notifications || [];
  const requiredActions = dashboardData?.requiredActions || [];
  const history = dashboardData?.history || [];

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
              <div>
                <p className={styles.welcomeLabel}>Welkom terug</p>

                <h1>Hallo {firstName}, alles op één plek.</h1>

                <p>
                  Hier vind je updates van dierenasielen, je aanvragen,
                  openstaande acties en je recente geschiedenis.
                </p>
              </div>

              <div className={styles.steps}>
                <div className={styles.stepItem}>
                  <div className={styles.circle}>☎</div>
                  <span>Telefoon verificatie</span>
                </div>

                <div className={styles.line}></div>

                <div className={styles.stepItem}>
                  <div className={styles.circle}>▧</div>
                  <span>Profielfoto</span>
                </div>

                <div className={styles.line}></div>

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

            <section className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Notificatie</h2>
                  <Link href="/notificaties">Bekijk alles</Link>
                </div>

                {latestNotifications.length === 0 ? (
                  <div className={styles.emptyBox}>
                    <h3>Geen nieuwe notificaties</h3>
                    <p>Wanneer een asiel of dierenarts iets toevoegt, zie je het hier.</p>
                  </div>
                ) : (
                  <div className={styles.notificationList}>
                    {latestNotifications.map((notification) => (
                      <article key={notification.id} className={styles.notificationItem}>
                        <span className={styles.notificationDot}></span>

                        <div>
                          <h3>{notification.title}</h3>
                          <p>{notification.message}</p>
                          <small>{formatDate(notification.created_at)}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Actie vereist</h2>
                  <Link href="/profiel">Profiel openen</Link>
                </div>

                {requiredActions.length === 0 ? (
                  <div className={styles.emptyBox}>
                    <h3>Alles is in orde</h3>
                    <p>Je profiel is volledig genoeg om aanvragen te doen.</p>
                  </div>
                ) : (
                  <div className={styles.actionList}>
                    {requiredActions.slice(0, 3).map((action) => (
                      <article key={action.id} className={styles.actionItem}>
                        <div>
                          <h3>{action.title}</h3>
                          <p>{action.description}</p>
                        </div>

                        <Link href={action.href}>Bijwerken</Link>
                      </article>
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

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Je historie</h2>
                </div>

                {history.length === 0 ? (
                  <div className={styles.emptyBox}>
                    <h3>Nog geen activiteit</h3>
                    <p>Zodra je aanvragen of updates hebt, verschijnt je tijdlijn hier.</p>
                  </div>
                ) : (
                  <div className={styles.historyList}>
                    {history.map((item) => (
                      <article key={item.id} className={styles.historyItem}>
                        <span></span>

                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                          <small>{formatDate(item.date)}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}