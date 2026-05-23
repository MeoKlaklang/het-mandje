"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import styles from "./dieren.module.css";

type AnimalTab = "alle" | "beschikbaar" | "aanvragen" | "in_opvang";

const tabs: { id: AnimalTab; label: string }[] = [
  { id: "alle", label: "Alle dieren" },
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

function normalizeStatus(status: string | null) {
  return (status || "").toLowerCase().replaceAll(" ", "_");
}

function formatDate(date: string | null) {
  if (!date) return "Onbekend";

  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatStatus(status: string | null) {
  const normalized = normalizeStatus(status);

  if (normalized === "beschikbaar") return "Beschikbaar";
  if (normalized === "in_opvang") return "In opvang";
  if (normalized === "gereserveerd") return "Gereserveerd";
  if (normalized === "niet_beschikbaar") return "Niet beschikbaar";

  return status || "Onbekend";
}

function getStatusClass(status: string | null) {
  const normalized = normalizeStatus(status);

  if (normalized === "beschikbaar") return styles.statusAvailable;
  if (normalized === "in_opvang") return styles.statusFoster;
  if (normalized === "gereserveerd") return styles.statusReserved;
  if (normalized === "niet_beschikbaar") return styles.statusUnavailable;

  return styles.statusNeutral;
}

function getApplicationsForAnimal(
  animalId: string,
  applications: AsielDashboardApplication[]
) {
  return applications.filter(
    (application) =>
      application.animal_id === animalId &&
      application.status === "in_afwachting"
  );
}

function DierenOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dashboardData, setDashboardData] =
    useState<AsielDashboardData | null>(null);

  const [activeTab, setActiveTab] = useState<AnimalTab>("alle");
  const [searchValue, setSearchValue] = useState("");

  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);

  async function loadData() {
    setLoading(true);

    const result = await getAsielDashboardData();

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setErrorMessage("");
    }

    setDashboardData(result.data);
    setLoading(false);
  }

  useEffect(() => {
    const tab = searchParams.get("tab") as AnimalTab | null;

    if (
      tab === "alle" ||
      tab === "beschikbaar" ||
      tab === "aanvragen" ||
      tab === "in_opvang"
    ) {
      setActiveTab(tab);
    }

    loadData();
  }, [searchParams]);

  const animals = dashboardData?.animals || [];
  const applications = dashboardData?.applications || [];

  const availableAnimals = useMemo(() => {
    return animals.filter(
      (animal) => normalizeStatus(animal.status) === "beschikbaar"
    );
  }, [animals]);

  const requestAnimals = useMemo(() => {
    const idsWithApplications = new Set(
      applications
        .filter((application) => application.status === "in_afwachting")
        .map((application) => application.animal_id)
    );

    return animals.filter((animal) => idsWithApplications.has(animal.id));
  }, [animals, applications]);

  const fosterAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const status = normalizeStatus(animal.status);
      return status === "in_opvang" || status === "opvang";
    });
  }, [animals]);

  const tabAnimals = useMemo(() => {
    if (activeTab === "beschikbaar") return availableAnimals;
    if (activeTab === "aanvragen") return requestAnimals;
    if (activeTab === "in_opvang") return fosterAnimals;
    return animals;
  }, [activeTab, animals, availableAnimals, requestAnimals, fosterAnimals]);

  const filteredAnimals = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) return tabAnimals;

    return tabAnimals.filter((animal) => {
      const name = animal.name.toLowerCase();
      const species = animal.species.toLowerCase();
      const breed = animal.breed?.toLowerCase() || "";
      const status = animal.status?.toLowerCase() || "";

      return (
        name.includes(query) ||
        species.includes(query) ||
        breed.includes(query) ||
        status.includes(query)
      );
    });
  }, [searchValue, tabAnimals]);

  const handleTabChange = (tab: AnimalTab) => {
    setActiveTab(tab);
    router.push(`/asiel/dieren?tab=${tab}`);
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

    setSelectedApplication(null);
    await loadData();
  };

  if (loading) {
    return (
      <AsielLayout>
        <main className={styles.page}>
          <section className={styles.messageCard}>
            <h1>Dieren worden geladen...</h1>
            <p>We halen het overzicht van je asiel op.</p>
          </section>
        </main>
      </AsielLayout>
    );
  }

  if (!dashboardData || errorMessage) {
    return (
      <AsielLayout>
        <main className={styles.page}>
          <section className={styles.messageCard}>
            <h1>Er ging iets mis</h1>
            <p>{errorMessage || "Dieren konden niet geladen worden."}</p>
          </section>
        </main>
      </AsielLayout>
    );
  }

  return (
    <AsielLayout>
      <main className={styles.page}>
        <div className={styles.wrapper}>
          <section className={styles.header}>
            <div>
              <p>Dierenbeheer</p>
              <h1>Alle dieren</h1>
              <span>
                Beheer alle dieren van {dashboardData.shelter?.name || "je asiel"} op één overzichtelijke plek.
              </span>
            </div>

            <Link href="/asiel/dieren/nieuw" className={styles.primaryButton}>
              + Nieuw dier toevoegen
            </Link>
          </section>

          <section className={styles.statsGrid}>
            <article>
              <p>Totaal dieren</p>
              <h2>{animals.length}</h2>
            </article>

            <article>
              <p>Beschikbaar</p>
              <h2>{availableAnimals.length}</h2>
            </article>

            <article>
              <p>Aanvragen</p>
              <h2>{requestAnimals.length}</h2>
            </article>

            <article>
              <p>In opvang</p>
              <h2>{fosterAnimals.length}</h2>
            </article>
          </section>

          <section className={styles.panel}>
            <div className={styles.toolbar}>
              <div className={styles.tabs}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={activeTab === tab.id ? styles.activeTab : ""}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className={styles.searchBox}>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Zoek op naam, soort, ras of status..."
                />
                <span>⌕</span>
              </div>
            </div>

            <div className={styles.resultBar}>
              <p>
                {filteredAnimals.length}{" "}
                {filteredAnimals.length === 1 ? "dier gevonden" : "dieren gevonden"}
              </p>

              {searchValue && (
                <button type="button" onClick={() => setSearchValue("")}>
                  Zoekopdracht wissen
                </button>
              )}
            </div>

            {filteredAnimals.length === 0 ? (
              <div className={styles.emptyState}>
                <div>🐾</div>
                <h2>Geen dieren gevonden</h2>
                <p>
                  Er zijn geen dieren die overeenkomen met deze filter of zoekopdracht.
                </p>
              </div>
            ) : (
              <div className={styles.animalsGrid}>
                {filteredAnimals.map((animal: AsielDashboardAnimal) => {
                  const animalApplications = getApplicationsForAnimal(
                    animal.id,
                    applications
                  );

                  const firstApplication = animalApplications[0];

                  return (
                    <article key={animal.id} className={styles.animalCard}>
                      <Link
                        href={`/asiel/dieren/${animal.id}/dossier`}
                        className={styles.imageLink}
                      >
                        <img
                          src={animal.image_url || "/images/dog3.jpg"}
                          alt={animal.name}
                        />
                      </Link>

                      <div className={styles.cardBody}>
                        <div className={styles.cardTop}>
                          <div>
                            <Link
                              href={`/asiel/dieren/${animal.id}/dossier`}
                              className={styles.nameLink}
                            >
                              <h2>{animal.name}</h2>
                            </Link>

                            <p>
                              {animal.breed || animal.species} ·{" "}
                              {animal.age || "leeftijd onbekend"}
                              {animal.gender ? ` · ${animal.gender}` : ""}
                            </p>
                          </div>

                          <span
                            className={`${styles.statusBadge} ${getStatusClass(
                              animal.status
                            )}`}
                          >
                            {activeTab === "aanvragen"
                              ? "Aanvraag"
                              : formatStatus(animal.status)}
                          </span>
                        </div>

                        <div className={styles.cardMeta}>
                          <p>
                            <strong>Soort</strong>
                            <span>{animal.species}</span>
                          </p>

                          <p>
                            <strong>Grootte</strong>
                            <span>{animal.size || "Niet ingevuld"}</span>
                          </p>

                          <p>
                            <strong>Toegevoegd</strong>
                            <span>{formatDate(animal.created_at)}</span>
                          </p>
                        </div>

                        <div className={styles.cardFooter}>
                          {firstApplication ? (
                            <button
                              type="button"
                              className={styles.applicationButton}
                              onClick={() =>
                                handleOpenApplication(firstApplication.id)
                              }
                            >
                              {animalApplications.length}{" "}
                              {animalApplications.length === 1
                                ? "aanvraag"
                                : "aanvragen"}
                            </button>
                          ) : (
                            <span className={styles.noApplicationBadge}>
                              Geen open aanvraag
                            </span>
                          )}

                          <div className={styles.cardActions}>
                            <Link href={`/asiel/dieren/${animal.id}/dossier`}>
                              Dossier
                            </Link>

                            <Link href={`/asiel/dieren/${animal.id}/bewerken`}>
                              Bewerk
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

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
                onClick={() => setSelectedApplication(null)}
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
                        ·{" "}
                        {selectedApplication.animal?.age ||
                          "Leeftijd onbekend"}
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
                    {formatDate(selectedApplication.profile?.birth || null)}
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
                    {formatDate(selectedApplication.start_date)} -{" "}
                    {formatDate(selectedApplication.end_date)}
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
                        <p>{String(value)}</p>
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
    </AsielLayout>
  );
}

export default function AsielDierenPage() {
  return (
    <Suspense fallback={null}>
      <DierenOverviewContent />
    </Suspense>
  );
}