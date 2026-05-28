"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createClient } from "@/lib/supabase/client";
import {
  getMyAnimalApplicationById,
  MyAnimalApplicationDetail,
} from "@/lib/animals/getMyAnimalApplicationById";
import styles from "./medicatie.module.css";

function todayDateKey() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(date: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function MedicatieOverzichtPage() {
  const params = useParams<{ id: string }>();
  const applicationId = params.id;
  const supabase = createClient();

  const [application, setApplication] =
    useState<MyAnimalApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [givenMedicationIds, setGivenMedicationIds] = useState<string[]>([]);
  const [medicationSavingId, setMedicationSavingId] = useState<string | null>(
    null
  );

  async function loadMedicationAdministrations(medicationIds: string[]) {
    if (medicationIds.length === 0) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("medication_administrations")
      .select("medication_id")
      .eq("user_id", user.id)
      .eq("given_on", todayDateKey())
      .in("medication_id", medicationIds);

    if (error) {
      console.error("Fout bij ophalen medicatie-afvinkingen:", error);
      return;
    }

    setGivenMedicationIds((data || []).map((item) => item.medication_id));
  }

  async function loadData() {
    setLoading(true);

    const { application } = await getMyAnimalApplicationById(applicationId);

    setApplication(application);
    setLoading(false);

    if (application?.animal_medications?.length) {
      await loadMedicationAdministrations(
        application.animal_medications.map((medication) => medication.id)
      );
    }
  }

  useEffect(() => {
    loadData();
  }, [applicationId]);

  const sortedMedications = useMemo(() => {
    return [...(application?.animal_medications || [])].sort((a, b) => {
      const aGiven = givenMedicationIds.includes(a.id);
      const bGiven = givenMedicationIds.includes(b.id);

      if (aGiven && !bGiven) return 1;
      if (!aGiven && bGiven) return -1;

      const dateA = new Date(
        (a as any).created_at || a.start_date || 0
      ).getTime();

      const dateB = new Date(
        (b as any).created_at || b.start_date || 0
      ).getTime();

      return dateB - dateA;
    });
  }, [application, givenMedicationIds]);

  const handleToggleMedicationGiven = async (medicationId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Je bent niet ingelogd.");
      return;
    }

    const isGiven = givenMedicationIds.includes(medicationId);
    setMedicationSavingId(medicationId);

    if (isGiven) {
      const { error } = await supabase
        .from("medication_administrations")
        .delete()
        .eq("user_id", user.id)
        .eq("medication_id", medicationId)
        .eq("given_on", todayDateKey());

      setMedicationSavingId(null);

      if (error) {
        alert(error.message);
        return;
      }

      setGivenMedicationIds((current) =>
        current.filter((id) => id !== medicationId)
      );

      return;
    }

    const { error } = await supabase.from("medication_administrations").insert({
      user_id: user.id,
      medication_id: medicationId,
      given_on: todayDateKey(),
    });

    setMedicationSavingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    setGivenMedicationIds((current) => [...current, medicationId]);
  };

  if (loading) {
    return (
      <>
        <DashboardNavbar />

        <main className={styles.page}>
          <p>Medicatie wordt geladen...</p>
        </main>
      </>
    );
  }

  if (!application || !application.animals) {
    return (
      <>
        <DashboardNavbar />

        <main className={styles.page}>
          <p>Dit dier werd niet gevonden.</p>
        </main>
      </>
    );
  }

  const animal = application.animals;

  return (
    <>
      <DashboardNavbar />

      <main className={styles.page}>
        <div className={styles.container}>
          <Link href={`/mijn-dieren/${application.id}`} className={styles.backLink}>
            ⟵ Terug naar {animal.name}
          </Link>

          <section className={styles.header}>
            <div>
              <h1>Alle medicatie</h1>
              <p>
                Een overzicht van alle medicatie voor <strong>{animal.name}</strong>.
                Afgevinkte medicatie geldt enkel voor vandaag.
              </p>
            </div>

            <div className={styles.countCard}>
              <span>{sortedMedications.length}</span>
              <p>medicatie</p>
            </div>
          </section>

          {sortedMedications.length === 0 ? (
            <section className={styles.emptyState}>
              <h2>Geen medicatie</h2>
              <p>Er werd nog geen medicatie toegevoegd voor dit dier.</p>
            </section>
          ) : (
            <section className={styles.medicationList}>
              {sortedMedications.map((medication) => {
                const isGiven = givenMedicationIds.includes(medication.id);

                return (
                  <article
                    key={medication.id}
                    className={`${styles.medicationCard} ${
                      isGiven ? styles.medicationGiven : ""
                    }`}
                  >
                    <div className={styles.medicationDate}>
                      {formatDate(medication.start_date) ||
                        formatDate((medication as any).created_at)}
                    </div>

                    <div className={styles.medicationTitleRow}>
                      <label className={styles.bigMedicationCheck}>
                        <input
                          type="checkbox"
                          checked={isGiven}
                          disabled={medicationSavingId === medication.id}
                          onChange={() =>
                            handleToggleMedicationGiven(medication.id)
                          }
                        />
                        <span></span>
                      </label>

                      <h2>{medication.name}</h2>
                    </div>

                    <ul className={styles.medicationBullets}>
                      {medication.dosage && (
                        <li>
                          <strong>Dosering:</strong> {medication.dosage}
                        </li>
                      )}

                      {(medication as any).frequency && (
                        <li>
                          <strong>Frequentie:</strong>{" "}
                          {(medication as any).frequency}
                        </li>
                      )}

                      {medication.instructions && (
                        <li>
                          <strong>Toediening:</strong>{" "}
                          {medication.instructions}
                        </li>
                      )}
                    </ul>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </>
  );
}