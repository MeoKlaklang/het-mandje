"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  getMyAnimalApplicationById,
  MyAnimalApplicationDetail,
} from "@/lib/animals/getMyAnimalApplicationById";
import styles from "./notities.module.css";

function formatDate(date: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getRoleLabel(role: string | null) {
  if (role === "dierenarts") return "Dierenarts";
  if (role === "dierenasiel") return "Dierenasiel";
  if (role === "pleeggezin") return "Pleeggezin";
  return "Onbekend";
}

export default function NotitiesOverzichtPage() {
  const params = useParams<{ id: string }>();
  const applicationId = params.id;

  const [application, setApplication] =
    useState<MyAnimalApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { application } = await getMyAnimalApplicationById(applicationId);

      setApplication(application);
      setLoading(false);
    }

    loadData();
  }, [applicationId]);

  const sortedNotes = useMemo(() => {
    return [...(application?.animal_notes || [])].sort((a, b) => {
      const dateA = new Date((a as any).created_at || 0).getTime();
      const dateB = new Date((b as any).created_at || 0).getTime();

      return dateB - dateA;
    });
  }, [application]);

  if (loading) {
    return (
      <>
        <DashboardNavbar />

        <main className={styles.page}>
          <p>Notities worden geladen...</p>
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
              <h1>Alle notities</h1>
              <p>
                Een volledig overzicht van alle observaties en updates over{" "}
                <strong>{animal.name}</strong>.
              </p>
            </div>

            <div className={styles.countCard}>
              <span>{sortedNotes.length}</span>
              <p>notities</p>
            </div>
          </section>

          {sortedNotes.length === 0 ? (
            <section className={styles.emptyState}>
              <h2>Nog geen notities</h2>
              <p>
                Zodra jij, het dierenasiel of de dierenarts een notitie toevoegt,
                verschijnt die hier.
              </p>
            </section>
          ) : (
            <section className={styles.notesList}>
              {sortedNotes.map((note) => (
                <article key={note.id} className={styles.noteCard}>
                  <div className={styles.noteTop}>
                    <div>
                      <h2>{note.title}</h2>

                      <p className={styles.author}>
                        {note.created_by_name || "Onbekend"} ·{" "}
                        {getRoleLabel((note as any).created_by_role)}
                      </p>
                    </div>

                    <span>{formatDate((note as any).created_at)}</span>
                  </div>

                  <p className={styles.noteContent}>{note.content}</p>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}