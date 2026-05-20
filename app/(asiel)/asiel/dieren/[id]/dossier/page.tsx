"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AsielLayout from "@/components/asiel/AsielLayout";

import {
  getAnimalDossier,
  AnimalDossier,
} from "@/lib/asiel/getAnimalDossier";

import { getAnimalNotes, AnimalNote } from "@/lib/asiel/getAnimalNotes";
import { createAnimalNote } from "@/lib/asiel/createAnimalNote";

import {
  getAnimalMedications,
  AnimalMedication,
} from "@/lib/asiel/getAnimalMedications";
import { createAnimalMedication } from "@/lib/asiel/createAnimalMedication";

import {
  getAnimalMedicalRecords,
  AnimalMedicalRecord,
} from "@/lib/asiel/getAnimalMedicalRecords";
import { createAnimalMedicalRecord } from "@/lib/asiel/createAnimalMedicalRecord";

import { createAnimalAppointmentRequest } from "@/lib/asiel/createAnimalAppointmentRequest";

import styles from "./dossier.module.css";

type DossierTab =
  | "overzicht"
  | "medisch"
  | "behandelingen"
  | "afspraken"
  | "notities";

type ActivityItem = {
  id: string;
  title: string;
  date: string | null;
};

function formatDate(date: string | null) {
  if (!date) return "Onbekend";

  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date: string | null) {
  if (!date) return "Onbekend";

  return new Date(date).toLocaleString("nl-BE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status: string | null) {
  if (status === "beschikbaar") return "Beschikbaar";
  if (status === "gereserveerd") return "Gereserveerd";
  if (status === "in_opvang") return "In opvang";
  if (status === "niet_beschikbaar") return "Niet beschikbaar";
  if (status === "concept") return "Concept";
  return "Status onbekend";
}

function formatAppointmentStatus(status: string | null) {
  if (status === "pending_user_approval") return "Wachten op goedkeuring";
  if (status === "confirmed") return "Bevestigd";
  if (status === "declined") return "Geweigerd";
  if (status === "new_time_requested") return "Nieuw voorstel gevraagd";
  return "Bevestigd";
}

export default function AnimalDossierPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const animalId = params.id;

  const [dossier, setDossier] = useState<AnimalDossier | null>(null);
  const [notes, setNotes] = useState<AnimalNote[]>([]);
  const [medications, setMedications] = useState<AnimalMedication[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<AnimalMedicalRecord[]>(
    []
  );

  const [activeTab, setActiveTab] = useState<DossierTab>("overzicht");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCreatedBy, setNoteCreatedBy] = useState("");
  const [noteRole, setNoteRole] = useState("asiel");
  const [visibleToFoster, setVisibleToFoster] = useState(false);

  const [medicationModalOpen, setMedicationModalOpen] = useState(false);
  const [savingMedication, setSavingMedication] = useState(false);

  const [medicationName, setMedicationName] = useState("");
  const [medicationDosage, setMedicationDosage] = useState("");
  const [medicationFrequency, setMedicationFrequency] = useState("");
  const [medicationInstructions, setMedicationInstructions] = useState("");
  const [medicationStartDate, setMedicationStartDate] = useState("");
  const [medicationEndDate, setMedicationEndDate] = useState("");
  const [medicationCreatedBy, setMedicationCreatedBy] = useState("");
  const [medicationRole, setMedicationRole] = useState("asiel");
  const [medicationVisibleToFoster, setMedicationVisibleToFoster] =
    useState(true);

  const [medicalModalOpen, setMedicalModalOpen] = useState(false);
  const [savingMedicalRecord, setSavingMedicalRecord] = useState(false);

  const [medicalTitle, setMedicalTitle] = useState("");
  const [medicalDate, setMedicalDate] = useState("");
  const [medicalCreatedBy, setMedicalCreatedBy] = useState("");
  const [medicalRole, setMedicalRole] = useState("dierenarts");
  const [visitReason, setVisitReason] = useState("");
  const [examination, setExamination] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [performedAction, setPerformedAction] = useState("");
  const [vaccinationOrProcedure, setVaccinationOrProcedure] = useState("");
  const [followUpAdvice, setFollowUpAdvice] = useState("");

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [savingAppointment, setSavingAppointment] = useState(false);

  const [appointmentTitle, setAppointmentTitle] = useState("");
  const [appointmentDescription, setAppointmentDescription] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentStartTime, setAppointmentStartTime] = useState("13:00");
  const [appointmentEndTime, setAppointmentEndTime] = useState("14:00");
  const [appointmentType, setAppointmentType] = useState("intake");
  const [appointmentLocation, setAppointmentLocation] = useState("");
  const [appointmentCreatedBy, setAppointmentCreatedBy] = useState("");

  useEffect(() => {
    async function loadDossier() {
      const [
        dossierResult,
        notesResult,
        medicationsResult,
        medicalRecordsResult,
      ] = await Promise.all([
        getAnimalDossier(animalId),
        getAnimalNotes(animalId),
        getAnimalMedications(animalId),
        getAnimalMedicalRecords(animalId),
      ]);

      if (dossierResult.error) {
        setErrorMessage(dossierResult.error);
      } else if (notesResult.error) {
        setErrorMessage(notesResult.error);
      } else if (medicationsResult.error) {
        setErrorMessage(medicationsResult.error);
      } else if (medicalRecordsResult.error) {
        setErrorMessage(medicalRecordsResult.error);
      } else {
        setErrorMessage("");
      }

      setDossier(dossierResult.data);
      setNotes(notesResult.notes);
      setMedications(medicationsResult.medications);
      setMedicalRecords(medicalRecordsResult.records);
      setLoading(false);
    }

    loadDossier();
  }, [animalId]);

  const handleCreateNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      alert("Vul een titel en notitie in.");
      return;
    }

    setSavingNote(true);

    const result = await createAnimalNote({
      animalId,
      title: noteTitle,
      content: noteContent,
      createdByName: noteCreatedBy,
      createdByRole: noteRole,
      visibleToFoster,
    });

    setSavingNote(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setNoteTitle("");
    setNoteContent("");
    setNoteCreatedBy("");
    setNoteRole("asiel");
    setVisibleToFoster(false);
    setNoteModalOpen(false);

    const { notes: newNotes } = await getAnimalNotes(animalId);
    setNotes(newNotes);
  };

  const handleCreateMedication = async () => {
    if (!medicationName.trim()) {
      alert("Vul de naam van de medicatie in.");
      return;
    }

    setSavingMedication(true);

    const result = await createAnimalMedication({
      animalId,
      name: medicationName,
      dosage: medicationDosage,
      frequency: medicationFrequency,
      instructions: medicationInstructions,
      startDate: medicationStartDate,
      endDate: medicationEndDate,
      createdByName: medicationCreatedBy,
      createdByRole: medicationRole,
      visibleToFoster: medicationVisibleToFoster,
    });

    setSavingMedication(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setMedicationName("");
    setMedicationDosage("");
    setMedicationFrequency("");
    setMedicationInstructions("");
    setMedicationStartDate("");
    setMedicationEndDate("");
    setMedicationCreatedBy("");
    setMedicationRole("asiel");
    setMedicationVisibleToFoster(true);
    setMedicationModalOpen(false);

    const { medications: newMedications } =
      await getAnimalMedications(animalId);
    setMedications(newMedications);
  };

  const handleCreateMedicalRecord = async () => {
    if (!medicalTitle.trim()) {
      alert("Vul een titel in voor het medisch verslag.");
      return;
    }

    setSavingMedicalRecord(true);

    const result = await createAnimalMedicalRecord({
      animalId,
      title: medicalTitle,
      recordDate: medicalDate,
      createdByName: medicalCreatedBy,
      createdByRole: medicalRole,
      visitReason,
      examination,
      diagnosis,
      performedAction,
      vaccinationOrProcedure,
      followUpAdvice,
    });

    setSavingMedicalRecord(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setMedicalTitle("");
    setMedicalDate("");
    setMedicalCreatedBy("");
    setMedicalRole("dierenarts");
    setVisitReason("");
    setExamination("");
    setDiagnosis("");
    setPerformedAction("");
    setVaccinationOrProcedure("");
    setFollowUpAdvice("");
    setMedicalModalOpen(false);

    const { records: newRecords } = await getAnimalMedicalRecords(animalId);
    setMedicalRecords(newRecords);
  };

  const handleCreateAppointment = async () => {
    if (!appointmentTitle.trim()) {
      alert("Vul een titel in voor de afspraak.");
      return;
    }

    if (!appointmentDate || !appointmentStartTime || !appointmentEndTime) {
      alert("Vul datum, startuur en einduur in.");
      return;
    }

    setSavingAppointment(true);

    const result = await createAnimalAppointmentRequest({
      animalId,
      title: appointmentTitle,
      description: appointmentDescription,
      date: appointmentDate,
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      appointmentType,
      location: appointmentLocation,
      createdBy: appointmentCreatedBy,
    });

    setSavingAppointment(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setAppointmentTitle("");
    setAppointmentDescription("");
    setAppointmentDate("");
    setAppointmentStartTime("13:00");
    setAppointmentEndTime("14:00");
    setAppointmentType("intake");
    setAppointmentLocation("");
    setAppointmentCreatedBy("");
    setAppointmentModalOpen(false);

    const { data } = await getAnimalDossier(animalId);

    if (data) {
      setDossier(data);
    }
  };

  const recentActivities = useMemo<ActivityItem[]>(() => {
    const animalCreatedActivity: ActivityItem[] = dossier?.animal?.created_at
      ? [
          {
            id: "animal-created",
            title: "Dossier aangemaakt",
            date: dossier.animal.created_at,
          },
        ]
      : [];

    const fosterActivity: ActivityItem[] = dossier?.foster?.startDate
      ? [
          {
            id: "foster-linked",
            title: "Pleeggezin gekoppeld",
            date: dossier.foster.startDate,
          },
        ]
      : [];

    const appointmentActivities: ActivityItem[] =
      dossier?.appointments.map((appointment) => ({
        id: `appointment-${appointment.id}`,
        title: `Afspraak: ${appointment.title}`,
        date: appointment.start_at,
      })) || [];

    const noteActivities: ActivityItem[] = notes.map((note) => ({
      id: `note-${note.id}`,
      title: `Notitie: ${note.title}`,
      date: note.created_at,
    }));

    const medicationActivities: ActivityItem[] = medications.map(
      (medication) => ({
        id: `medication-${medication.id}`,
        title: `Medicatie toegevoegd: ${medication.name}`,
        date: medication.created_at,
      })
    );

    const medicalActivities: ActivityItem[] = medicalRecords.map((record) => ({
      id: `medical-${record.id}`,
      title: `Medisch verslag: ${record.title}`,
      date: record.record_date || record.created_at,
    }));

    return [
      ...animalCreatedActivity,
      ...fosterActivity,
      ...appointmentActivities,
      ...noteActivities,
      ...medicationActivities,
      ...medicalActivities,
    ]
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 4);
  }, [dossier, notes, medications, medicalRecords]);

  if (loading) {
    return (
      <AsielLayout>
        <main className={styles.page}>
          <section className={styles.messageCard}>
            <h1>Dossier wordt geladen...</h1>
            <p>We halen de gegevens van dit dier op.</p>
          </section>
        </main>
      </AsielLayout>
    );
  }

  if (errorMessage || !dossier?.animal) {
    return (
      <AsielLayout>
        <main className={styles.page}>
          <section className={styles.messageCard}>
            <h1>Dossier niet gevonden</h1>
            <p>{errorMessage || "Dit dier kon niet geladen worden."}</p>

            <button
              type="button"
              onClick={() => router.push("/asiel/dashboard")}
            >
              Terug naar dashboard
            </button>
          </section>
        </main>
      </AsielLayout>
    );
  }

  const animal = dossier.animal;
  const foster = dossier.foster;
  const latestAppointment = dossier.appointments[0];
  const latestMedication = medications[0];
  const latestMedicalRecord = medicalRecords[0];

  return (
    <AsielLayout>
      <main className={styles.page}>
        <div className={styles.wrapper}>
          <div className={styles.topLine}>
            <Link href="/asiel/dashboard" className={styles.backLink}>
              ← Terug naar dashboard
            </Link>

            <div className={styles.topActions}>
              <Link href={`/asiel/dieren/${animal.id}/bewerken`}>
                Dier bewerken
              </Link>

              <button
                type="button"
                onClick={() => setAppointmentModalOpen(true)}
              >
                + Afspraak maken
              </button>
            </div>
          </div>

          <section className={styles.dossierHero}>
            <img
              src={animal.image_url || "/images/dog3.jpg"}
              alt={animal.name}
              className={styles.heroImage}
            />

            <div className={styles.heroMain}>
              <p className={styles.label}>Dierdossier</p>

              <div className={styles.titleRow}>
                <div>
                  <h1>{animal.name}</h1>
                  <p>
                    {animal.breed || animal.species} ·{" "}
                    {animal.age || "Leeftijd onbekend"}
                    {animal.gender ? ` · ${animal.gender}` : ""}
                  </p>
                </div>

                <span className={styles.statusPill}>
                  {formatStatus(animal.status)}
                </span>
              </div>

              <div className={styles.compactTags}>
                {animal.vaccinated && <span>Gevaccineerd</span>}
                {animal.neutered && <span>Gecastreerd</span>}
                {animal.house_trained && <span>Zindelijk</span>}
                {animal.needs_medication && <span>Medicatie nodig</span>}
              </div>

              <div className={styles.heroMeta}>
                <p>
                  <strong>Chipnummer</strong>
                  <span>{animal.chip_number || "Niet ingevuld"}</span>
                </p>

                <p>
                  <strong>Kleur / vacht</strong>
                  <span>{animal.coat_color || "Niet ingevuld"}</span>
                </p>

                <p>
                  <strong>Toegevoegd</strong>
                  <span>{formatDate(animal.created_at)}</span>
                </p>
              </div>
            </div>

            <aside className={styles.heroFoster}>
              <h2>Huidig pleeggezin</h2>

              {foster?.profile ? (
                <>
                  <div className={styles.personMini}>
                    <div className={styles.avatar}>👤</div>

                    <div>
                      <h3>
                        {foster.profile.first_name} {foster.profile.last_name}
                      </h3>

                      <p>
                        {[foster.profile.postal_code, foster.profile.city]
                          .filter(Boolean)
                          .join(" ") || "Adres niet ingevuld"}
                      </p>
                    </div>
                  </div>

                  <div className={styles.fosterSmallInfo}>
                    <p>
                      <strong>Opvangperiode</strong>
                      <span>
                        {formatDate(foster.startDate)} -{" "}
                        {formatDate(foster.endDate)}
                      </span>
                    </p>

                    {foster.message && (
                      <p>
                        <strong>Bericht</strong>
                        <span>{foster.message}</span>
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className={styles.emptyText}>
                  Dit dier is momenteel niet gekoppeld aan een pleeggezin.
                </p>
              )}
            </aside>
          </section>

          <section className={styles.tabs}>
            <button
              type="button"
              className={activeTab === "overzicht" ? styles.activeTab : ""}
              onClick={() => setActiveTab("overzicht")}
            >
              Overzicht
            </button>

            <button
              type="button"
              className={activeTab === "medisch" ? styles.activeTab : ""}
              onClick={() => setActiveTab("medisch")}
            >
              Medisch dossier
            </button>

            <button
              type="button"
              className={activeTab === "behandelingen" ? styles.activeTab : ""}
              onClick={() => setActiveTab("behandelingen")}
            >
              Behandelingen
            </button>

            <button
              type="button"
              className={activeTab === "afspraken" ? styles.activeTab : ""}
              onClick={() => setActiveTab("afspraken")}
            >
              Afspraken
            </button>

            <button
              type="button"
              className={activeTab === "notities" ? styles.activeTab : ""}
              onClick={() => setActiveTab("notities")}
            >
              Notities
            </button>
          </section>

          {activeTab === "overzicht" && (
            <section className={styles.tabGrid}>
              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Actuele situatie</h2>
                </div>

                <div className={styles.summaryGrid}>
                  <div>
                    <strong>Status</strong>
                    <span>{formatStatus(animal.status)}</span>
                  </div>

                  <div>
                    <strong>Laatste afspraak</strong>
                    <span>
                      {latestAppointment
                        ? latestAppointment.title
                        : "Geen afspraken"}
                    </span>
                  </div>

                  <div>
                    <strong>Pleeggezin</strong>
                    <span>
                      {foster?.profile
                        ? `${foster.profile.first_name} ${foster.profile.last_name}`
                        : "Niet gekoppeld"}
                    </span>
                  </div>

                  <div>
                    <strong>Laatste medisch verslag</strong>
                    <span>
                      {latestMedicalRecord
                        ? latestMedicalRecord.title
                        : "Geen medisch verslag"}
                    </span>
                  </div>

                  <div>
                    <strong>Medicatie</strong>
                    <span>
                      {latestMedication
                        ? latestMedication.name
                        : "Geen medicatie toegevoegd"}
                    </span>
                  </div>
                </div>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Gedrag & verzorging</h2>
                </div>

                <div className={styles.textBlock}>
                  <h3>Gedrag</h3>
                  <p>
                    {animal.behavior_notes ||
                      "Geen gedragsnotities toegevoegd."}
                  </p>
                </div>

                <div className={styles.matchGrid}>
                  <span>
                    {animal.can_live_with_cats ? "✓" : "×"} Kan bij katten
                  </span>
                  <span>
                    {animal.can_live_with_dogs ? "✓" : "×"} Kan bij honden
                  </span>
                  <span>
                    {animal.can_live_with_children ? "✓" : "×"} Kan bij
                    kinderen
                  </span>
                  <span>
                    {animal.can_be_home_alone ? "✓" : "×"} Kan alleen thuis
                    zijn
                  </span>
                </div>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Identificatie</h2>
                </div>

                <div className={styles.infoRows}>
                  <p>
                    <strong>Chipnummer</strong>
                    <span>{animal.chip_number || "Niet ingevuld"}</span>
                  </p>

                  <p>
                    <strong>Paspoortnummer</strong>
                    <span>{animal.passport_number || "Niet ingevuld"}</span>
                  </p>

                  <p>
                    <strong>Ras</strong>
                    <span>{animal.breed || "Niet ingevuld"}</span>
                  </p>

                  <p>
                    <strong>Kleur</strong>
                    <span>{animal.coat_color || "Niet ingevuld"}</span>
                  </p>
                </div>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Recente activiteit</h2>
                  <button type="button">Bekijk alles</button>
                </div>

                <div className={styles.timeline}>
                  {recentActivities.length === 0 ? (
                    <div>
                      <span></span>
                      <p>Nog geen recente activiteit</p>
                      <small>Geen updates gevonden</small>
                    </div>
                  ) : (
                    recentActivities.map((activity) => (
                      <div key={activity.id}>
                        <span></span>
                        <p>{activity.title}</p>
                        <small>{formatDate(activity.date)}</small>
                      </div>
                    ))
                  )}
                </div>
              </article>
            </section>
          )}

          {activeTab === "medisch" && (
            <section className={styles.tabGrid}>
              <article className={styles.cardWide}>
                <div className={styles.cardHeader}>
                  <h2>Medisch dossier</h2>

                  <button
                    type="button"
                    onClick={() => setMedicalModalOpen(true)}
                  >
                    + Medisch verslag toevoegen
                  </button>
                </div>

                {medicalRecords.length === 0 ? (
                  <div className={styles.emptyBox}>
                    Nog geen medische verslagen toegevoegd. Deze informatie is
                    intern voor het asiel en de dierenarts.
                  </div>
                ) : (
                  <div className={styles.medicalRecordList}>
                    {medicalRecords.map((record) => (
                      <article
                        key={record.id}
                        className={styles.medicalRecordItem}
                      >
                        <div className={styles.medicalRecordTop}>
                          <div>
                            <h3>{record.title}</h3>

                            <p>
                              {formatDate(record.record_date)} ·{" "}
                              {record.created_by_name || "Onbekend"} ·{" "}
                              {record.created_by_role || "dierenarts"}
                            </p>
                          </div>

                          <span>Intern dossier</span>
                        </div>

                        <div className={styles.medicalRecordGrid}>
                          {record.visit_reason && (
                            <div>
                              <strong>Reden van bezoek</strong>
                              <p>{record.visit_reason}</p>
                            </div>
                          )}

                          {record.examination && (
                            <div>
                              <strong>Onderzoek / observatie</strong>
                              <p>{record.examination}</p>
                            </div>
                          )}

                          {record.diagnosis && (
                            <div>
                              <strong>Diagnose / conclusie</strong>
                              <p>{record.diagnosis}</p>
                            </div>
                          )}

                          {record.performed_action && (
                            <div>
                              <strong>Uitgevoerde handeling</strong>
                              <p>{record.performed_action}</p>
                            </div>
                          )}

                          {record.vaccination_or_procedure && (
                            <div>
                              <strong>Vaccinatie / test / procedure</strong>
                              <p>{record.vaccination_or_procedure}</p>
                            </div>
                          )}

                          {record.follow_up_advice && (
                            <div>
                              <strong>Advies voor opvolging</strong>
                              <p>{record.follow_up_advice}</p>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Gezondheid</h2>
                </div>

                <div className={styles.infoRows}>
                  <p>
                    <strong>Gevaccineerd</strong>
                    <span>{animal.vaccinated ? "Ja" : "Nee"}</span>
                  </p>

                  <p>
                    <strong>Gecastreerd / gesteriliseerd</strong>
                    <span>{animal.neutered ? "Ja" : "Nee"}</span>
                  </p>

                  <p>
                    <strong>Medicatie nodig</strong>
                    <span>{animal.needs_medication ? "Ja" : "Nee"}</span>
                  </p>
                </div>
              </article>
            </section>
          )}

          {activeTab === "behandelingen" && (
            <section className={styles.tabGrid}>
              <article className={styles.cardWide}>
                <div className={styles.cardHeader}>
                  <h2>Behandelingen & medicatie</h2>

                  <button
                    type="button"
                    onClick={() => setMedicationModalOpen(true)}
                  >
                    + Medicatie toevoegen
                  </button>
                </div>

                {medications.length === 0 ? (
                  <div className={styles.emptyBox}>
                    Nog geen behandelingen of medicatie toegevoegd.
                  </div>
                ) : (
                  <div className={styles.medicationList}>
                    {medications.map((medication) => (
                      <article
                        key={medication.id}
                        className={styles.medicationItem}
                      >
                        <div className={styles.medicationTop}>
                          <div>
                            <h3>{medication.name}</h3>

                            <p>
                              {medication.created_by_name || "Onbekend"} ·{" "}
                              {medication.created_by_role || "asiel"} ·{" "}
                              {formatDate(medication.created_at)}
                            </p>
                          </div>

                          <span
                            className={
                              medication.visible_to_foster
                                ? styles.visibleBadge
                                : styles.privateBadge
                            }
                          >
                            {medication.visible_to_foster
                              ? "Zichtbaar voor pleeggezin"
                              : "Intern"}
                          </span>
                        </div>

                        <div className={styles.medicationMeta}>
                          <p>
                            <strong>Dosering</strong>
                            <span>{medication.dosage || "Niet ingevuld"}</span>
                          </p>

                          <p>
                            <strong>Frequentie</strong>
                            <span>
                              {medication.frequency || "Niet ingevuld"}
                            </span>
                          </p>

                          <p>
                            <strong>Startdatum</strong>
                            <span>{formatDate(medication.start_date)}</span>
                          </p>

                          <p>
                            <strong>Einddatum</strong>
                            <span>{formatDate(medication.end_date)}</span>
                          </p>
                        </div>

                        {medication.instructions && (
                          <p className={styles.medicationInstructions}>
                            {medication.instructions}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}

          {activeTab === "afspraken" && (
            <section className={styles.tabGrid}>
              <article className={styles.cardWide}>
                <div className={styles.cardHeader}>
                  <h2>Afspraken</h2>

                  <button
                    type="button"
                    onClick={() => setAppointmentModalOpen(true)}
                  >
                    + Nieuwe afspraak
                  </button>
                </div>

                {dossier.appointments.length === 0 ? (
                  <div className={styles.emptyBox}>
                    Nog geen afspraken voor dit dier.
                  </div>
                ) : (
                  <div className={styles.appointmentList}>
                    {dossier.appointments.map((appointment) => (
                      <article
                        key={appointment.id}
                        className={styles.appointmentItem}
                      >
                        <div className={styles.appointmentTop}>
                          <span>{formatDateTime(appointment.start_at)}</span>

                          <strong
                            className={
                              appointment.approval_status ===
                              "pending_user_approval"
                                ? styles.pendingBadge
                                : appointment.approval_status === "declined"
                                ? styles.declinedBadge
                                : styles.confirmedBadge
                            }
                          >
                            {formatAppointmentStatus(
                              appointment.approval_status
                            )}
                          </strong>
                        </div>

                        <h3>{appointment.title}</h3>

                        <p>
                          {appointment.appointment_type || "Algemeen"} ·{" "}
                          {appointment.created_by || "Asielteam"}
                        </p>

                        {appointment.location && (
                          <p className={styles.appointmentDetail}>
                            Locatie: {appointment.location}
                          </p>
                        )}

                        {appointment.description && (
                          <p className={styles.appointmentDetail}>
                            {appointment.description}
                          </p>
                        )}

                        {appointment.response_message && (
                          <p className={styles.appointmentResponse}>
                            Reactie pleeggezin: {appointment.response_message}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}

          {activeTab === "notities" && (
            <section className={styles.tabGrid}>
              <article className={styles.cardWide}>
                <div className={styles.cardHeader}>
                  <h2>Notities</h2>

                  <button type="button" onClick={() => setNoteModalOpen(true)}>
                    + Notitie toevoegen
                  </button>
                </div>

                {notes.length === 0 ? (
                  <div className={styles.emptyBox}>
                    Nog geen notities toegevoegd. Hier komen notities van het
                    asiel en de dierenarts.
                  </div>
                ) : (
                  <div className={styles.notesList}>
                    {notes.map((note) => (
                      <article key={note.id} className={styles.noteItem}>
                        <div className={styles.noteTop}>
                          <div>
                            <h3>{note.title}</h3>

                            <p>
                              {note.created_by_name || "Onbekend"} ·{" "}
                              {note.created_by_role || "asiel"} ·{" "}
                              {formatDate(note.created_at)}
                            </p>
                          </div>

                          <span
                            className={
                              note.visible_to_foster
                                ? styles.visibleBadge
                                : styles.privateBadge
                            }
                          >
                            {note.visible_to_foster
                              ? "Zichtbaar voor pleeggezin"
                              : "Intern"}
                          </span>
                        </div>

                        <p className={styles.noteContent}>{note.content}</p>
                      </article>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}
        </div>

        {noteModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeModal}
                onClick={() => setNoteModalOpen(false)}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe notitie</p>
                <h2>Notitie toevoegen</h2>
              </div>

              <label>
                Titel
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Bijv. Oppassen tijdens optillen"
                />
              </label>

              <label>
                Notitie
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Schrijf hier de observatie of opmerking..."
                />
              </label>

              <div className={styles.formGrid}>
                <label>
                  Aangemaakt door
                  <input
                    type="text"
                    value={noteCreatedBy}
                    onChange={(e) => setNoteCreatedBy(e.target.value)}
                    placeholder="Bijv. Dr. Kingen"
                  />
                </label>

                <label>
                  Rol
                  <select
                    value={noteRole}
                    onChange={(e) => setNoteRole(e.target.value)}
                  >
                    <option value="asiel">Dierenasiel</option>
                    <option value="dierenarts">Dierenarts</option>
                  </select>
                </label>
              </div>

              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={visibleToFoster}
                  onChange={(e) => setVisibleToFoster(e.target.checked)}
                />
                Zichtbaar maken voor pleeggezin
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setNoteModalOpen(false)}
                >
                  Annuleren
                </button>

                <button
                  type="button"
                  className={styles.saveButton}
                  disabled={savingNote}
                  onClick={handleCreateNote}
                >
                  {savingNote ? "Opslaan..." : "Notitie opslaan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {medicationModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeModal}
                onClick={() => setMedicationModalOpen(false)}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe medicatie</p>
                <h2>Medicatie toevoegen</h2>
              </div>

              <label>
                Naam medicatie
                <input
                  type="text"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  placeholder="Bijv. Metacam"
                />
              </label>

              <div className={styles.formGrid}>
                <label>
                  Dosering
                  <input
                    type="text"
                    value={medicationDosage}
                    onChange={(e) => setMedicationDosage(e.target.value)}
                    placeholder="Bijv. 0,5 ml"
                  />
                </label>

                <label>
                  Frequentie
                  <input
                    type="text"
                    value={medicationFrequency}
                    onChange={(e) => setMedicationFrequency(e.target.value)}
                    placeholder="Bijv. 1x per dag"
                  />
                </label>
              </div>

              <div className={styles.formGrid}>
                <label>
                  Startdatum
                  <input
                    type="date"
                    value={medicationStartDate}
                    onChange={(e) => setMedicationStartDate(e.target.value)}
                  />
                </label>

                <label>
                  Einddatum
                  <input
                    type="date"
                    value={medicationEndDate}
                    onChange={(e) => setMedicationEndDate(e.target.value)}
                  />
                </label>
              </div>

              <label>
                Instructies
                <textarea
                  value={medicationInstructions}
                  onChange={(e) => setMedicationInstructions(e.target.value)}
                  placeholder="Bijv. Toedienen na het eten. Goed schudden voor gebruik."
                />
              </label>

              <div className={styles.formGrid}>
                <label>
                  Toegevoegd door
                  <input
                    type="text"
                    value={medicationCreatedBy}
                    onChange={(e) => setMedicationCreatedBy(e.target.value)}
                    placeholder="Bijv. Dr. Kingen"
                  />
                </label>

                <label>
                  Rol
                  <select
                    value={medicationRole}
                    onChange={(e) => setMedicationRole(e.target.value)}
                  >
                    <option value="asiel">Dierenasiel</option>
                    <option value="dierenarts">Dierenarts</option>
                  </select>
                </label>
              </div>

              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={medicationVisibleToFoster}
                  onChange={(e) =>
                    setMedicationVisibleToFoster(e.target.checked)
                  }
                />
                Zichtbaar maken voor pleeggezin en notificatie sturen
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setMedicationModalOpen(false)}
                >
                  Annuleren
                </button>

                <button
                  type="button"
                  className={styles.saveButton}
                  disabled={savingMedication}
                  onClick={handleCreateMedication}
                >
                  {savingMedication ? "Opslaan..." : "Medicatie opslaan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {medicalModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeModal}
                onClick={() => setMedicalModalOpen(false)}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuw medisch verslag</p>
                <h2>Medisch verslag toevoegen</h2>
              </div>

              <label>
                Titel
                <input
                  type="text"
                  value={medicalTitle}
                  onChange={(e) => setMedicalTitle(e.target.value)}
                  placeholder="Bijv. Algemene check-up"
                />
              </label>

              <div className={styles.formGrid}>
                <label>
                  Datum consult
                  <input
                    type="date"
                    value={medicalDate}
                    onChange={(e) => setMedicalDate(e.target.value)}
                  />
                </label>

                <label>
                  Uitgevoerd door
                  <input
                    type="text"
                    value={medicalCreatedBy}
                    onChange={(e) => setMedicalCreatedBy(e.target.value)}
                    placeholder="Bijv. Dr. Kingen"
                  />
                </label>
              </div>

              <label>
                Rol
                <select
                  value={medicalRole}
                  onChange={(e) => setMedicalRole(e.target.value)}
                >
                  <option value="dierenarts">Dierenarts</option>
                  <option value="asiel">Dierenasiel</option>
                </select>
              </label>

              <label>
                Reden van bezoek
                <textarea
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  placeholder="Bijv. jaarlijkse controle, hoesten, wondcontrole..."
                />
              </label>

              <label>
                Onderzoek / observatie
                <textarea
                  value={examination}
                  onChange={(e) => setExamination(e.target.value)}
                  placeholder="Wat werd onderzocht of opgemerkt?"
                />
              </label>

              <label>
                Diagnose / conclusie
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Bijv. geen afwijkingen, lichte ontsteking..."
                />
              </label>

              <label>
                Uitgevoerde handeling
                <textarea
                  value={performedAction}
                  onChange={(e) => setPerformedAction(e.target.value)}
                  placeholder="Bijv. wonde gereinigd, oren gecontroleerd..."
                />
              </label>

              <label>
                Vaccinatie / test / procedure
                <textarea
                  value={vaccinationOrProcedure}
                  onChange={(e) => setVaccinationOrProcedure(e.target.value)}
                  placeholder="Bijv. DHP-vaccin toegediend, bloedafname..."
                />
              </label>

              <label>
                Advies voor opvolging
                <textarea
                  value={followUpAdvice}
                  onChange={(e) => setFollowUpAdvice(e.target.value)}
                  placeholder="Bijv. opnieuw controleren binnen 7 dagen..."
                />
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setMedicalModalOpen(false)}
                >
                  Annuleren
                </button>

                <button
                  type="button"
                  className={styles.saveButton}
                  disabled={savingMedicalRecord}
                  onClick={handleCreateMedicalRecord}
                >
                  {savingMedicalRecord
                    ? "Opslaan..."
                    : "Medisch verslag opslaan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {appointmentModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeModal}
                onClick={() => setAppointmentModalOpen(false)}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe afspraak</p>
                <h2>Afspraak voorstellen</h2>
              </div>

              <label>
                Titel
                <input
                  type="text"
                  value={appointmentTitle}
                  onChange={(e) => setAppointmentTitle(e.target.value)}
                  placeholder="Bijv. Intakegesprek"
                />
              </label>

              <div className={styles.formGrid}>
                <label>
                  Datum
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                </label>

                <label>
                  Type afspraak
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  >
                    <option value="intake">Intakegesprek</option>
                    <option value="opvolging">Opvolging</option>
                    <option value="dierenarts">Dierenarts</option>
                    <option value="medicatie">Medicatie</option>
                    <option value="terugbrengmoment">Terugbrengmoment</option>
                    <option value="algemeen">Algemeen</option>
                  </select>
                </label>
              </div>

              <div className={styles.formGrid}>
                <label>
                  Startuur
                  <input
                    type="time"
                    value={appointmentStartTime}
                    onChange={(e) => setAppointmentStartTime(e.target.value)}
                  />
                </label>

                <label>
                  Einduur
                  <input
                    type="time"
                    value={appointmentEndTime}
                    onChange={(e) => setAppointmentEndTime(e.target.value)}
                  />
                </label>
              </div>

              <label>
                Locatie
                <input
                  type="text"
                  value={appointmentLocation}
                  onChange={(e) => setAppointmentLocation(e.target.value)}
                  placeholder="Bijv. Dierenasiel Mechelen"
                />
              </label>

              <label>
                Aangemaakt door
                <input
                  type="text"
                  value={appointmentCreatedBy}
                  onChange={(e) => setAppointmentCreatedBy(e.target.value)}
                  placeholder="Bijv. Dierenasiel Mechelen of Dr. Kingen"
                />
              </label>

              <label>
                Beschrijving
                <textarea
                  value={appointmentDescription}
                  onChange={(e) => setAppointmentDescription(e.target.value)}
                  placeholder="Bijv. Kennismaking met het dier en praktische afspraken overlopen..."
                />
              </label>

              <div className={styles.infoNotice}>
                Deze afspraak wordt naar het pleeggezin gestuurd. De afspraak
                staat op “wachten op goedkeuring” tot de user bevestigt.
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setAppointmentModalOpen(false)}
                >
                  Annuleren
                </button>

                <button
                  type="button"
                  className={styles.saveButton}
                  disabled={savingAppointment}
                  onClick={handleCreateAppointment}
                >
                  {savingAppointment ? "Opslaan..." : "Afspraak voorstellen"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AsielLayout>
  );
}