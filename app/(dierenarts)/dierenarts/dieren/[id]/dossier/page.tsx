"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DierenartsLayout from "@/components/dierenarts/DierenartsLayout";

import {
  getDierenartsAnimalDossier,
  DierenartsAnimalDossier,
} from "@/lib/dierenarts/getDierenartsAnimalDossier";

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

import { createDierenartsAnimalAppointmentRequest } from "@/lib/dierenarts/createDierenartsAnimalAppointmentRequest";

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

function appointmentBadgeClass(status: string | null) {
  if (status === "pending_user_approval" || status === "new_time_requested") {
    return styles.pendingBadge;
  }

  if (status === "declined") return styles.declinedBadge;

  return styles.confirmedBadge;
}

function booleanText(value: boolean | null) {
  return value ? "Ja" : "Nee";
}

function getFosterName(dossier: DierenartsAnimalDossier | null) {
  const profile = dossier?.fosterApplication?.fosterProfile;

  if (!profile) return "Geen pleeggezin gekoppeld";

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  return fullName || "Pleeggezin zonder naam";
}

export default function DierenartsAnimalDossierPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const animalId = params.id;

  const [dossier, setDossier] = useState<DierenartsAnimalDossier | null>(null);
  const [notes, setNotes] = useState<AnimalNote[]>([]);
  const [medications, setMedications] = useState<AnimalMedication[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<AnimalMedicalRecord[]>([]);

  const [activeTab, setActiveTab] = useState<DossierTab>("overzicht");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCreatedBy, setNoteCreatedBy] = useState("");
  const [noteRole, setNoteRole] = useState("dierenarts");
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
  const [medicationRole, setMedicationRole] = useState("dierenarts");
  const [medicationVisibleToFoster, setMedicationVisibleToFoster] = useState(true);

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
  const [appointmentType, setAppointmentType] = useState("dierenarts");
  const [appointmentLocation, setAppointmentLocation] = useState("");
  const [appointmentCreatedBy, setAppointmentCreatedBy] = useState("");

  async function loadDossier() {
    setLoading(true);

    const [
      dossierResult,
      notesResult,
      medicationsResult,
      medicalRecordsResult,
    ] = await Promise.all([
      getDierenartsAnimalDossier(animalId),
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

    setDossier(dossierResult.data || null);
    setNotes(notesResult.notes || []);
    setMedications(medicationsResult.medications || []);
    setMedicalRecords(medicalRecordsResult.records || []);
    setLoading(false);
  }

  useEffect(() => {
    loadDossier();
  }, [animalId]);

  const recentActivities = useMemo<ActivityItem[]>(() => {
    const appointmentActivities: ActivityItem[] = (dossier?.appointments || []).map(
      (appointment) => ({
        id: `appointment-${appointment.id}`,
        title: `Afspraak: ${appointment.title}`,
        date: appointment.start_at,
      })
    );

    const noteActivities: ActivityItem[] = (notes || []).map((note) => ({
      id: `note-${note.id}`,
      title: `Notitie: ${note.title}`,
      date: note.created_at,
    }));

    const medicationActivities: ActivityItem[] = (medications || []).map(
      (medication) => ({
        id: `medication-${medication.id}`,
        title: `Medicatie toegevoegd: ${medication.name}`,
        date: medication.created_at,
      })
    );

    const medicalActivities: ActivityItem[] = (medicalRecords || []).map(
      (record) => ({
        id: `medical-${record.id}`,
        title: `Medisch verslag: ${record.title}`,
        date: record.record_date || record.created_at,
      })
    );

    const animalCreatedActivity: ActivityItem[] = dossier?.created_at
      ? [
          {
            id: "animal-created",
            title: "Dossier aangemaakt",
            date: dossier.created_at,
          },
        ]
      : [];

    const fosterActivity: ActivityItem[] = dossier?.fosterApplication?.start_date
      ? [
          {
            id: "foster-linked",
            title: "Pleeggezin gekoppeld",
            date: dossier.fosterApplication.start_date,
          },
        ]
      : [];

    return [
      ...animalCreatedActivity,
      ...fosterActivity,
      ...appointmentActivities,
      ...noteActivities,
      ...medicationActivities,
      ...medicalActivities,
    ]
      .filter((activity) => activity.date)
      .sort(
        (a, b) =>
          new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
      )
      .slice(0, 4);
  }, [dossier, notes, medications, medicalRecords]);

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
    setNoteRole("dierenarts");
    setVisibleToFoster(false);
    setNoteModalOpen(false);

    const { notes: newNotes } = await getAnimalNotes(animalId);
    setNotes(newNotes || []);
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
    setMedicationRole("dierenarts");
    setMedicationVisibleToFoster(true);
    setMedicationModalOpen(false);

    const { medications: newMedications } = await getAnimalMedications(animalId);
    setMedications(newMedications || []);
  };

  const handleCreateMedicalRecord = async () => {
    if (!medicalTitle.trim() || !medicalDate) {
      alert("Vul een titel en datum in.");
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
    setMedicalRecords(newRecords || []);
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

    const result = await createDierenartsAnimalAppointmentRequest({
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
    setAppointmentType("dierenarts");
    setAppointmentLocation("");
    setAppointmentCreatedBy("");
    setAppointmentModalOpen(false);

    const { data } = await getDierenartsAnimalDossier(animalId);
    if (data) setDossier(data);
  };

  if (loading) {
    return (
      <DierenartsLayout>
        <main className={styles.page}>
          <section className={styles.messageCard}>
            <h1>Dossier wordt geladen...</h1>
            <p>We halen de gegevens van dit dier op.</p>
          </section>
        </main>
      </DierenartsLayout>
    );
  }

  if (errorMessage || !dossier) {
    return (
      <DierenartsLayout>
        <main className={styles.page}>
          <section className={styles.messageCard}>
            <h1>Dossier niet gevonden</h1>
            <p>{errorMessage || "Dit dier kon niet geladen worden."}</p>
            <button type="button" onClick={() => router.push("/dierenarts/dashboard")}>
              Terug naar dashboard
            </button>
          </section>
        </main>
      </DierenartsLayout>
    );
  }

  const fosterProfile = dossier.fosterApplication?.fosterProfile || null;

  return (
    <DierenartsLayout>
      <main className={styles.page}>
        <div className={styles.wrapper}>
          <div className={styles.topLine}>
            <Link href="/dierenarts/dashboard" className={styles.backLink}>
              ← Terug naar dashboard
            </Link>

            <div className={styles.topActions}>
              <button type="button" onClick={() => setAppointmentModalOpen(true)}>
                + Afspraak maken
              </button>
            </div>
          </div>

          <section className={styles.dossierHero}>
            <img
              src={dossier.image_url || "/images/dog3.jpg"}
              alt={dossier.name}
              className={styles.heroImage}
            />

            <div className={styles.heroMain}>
              <p className={styles.label}>Dierendossier</p>

              <div className={styles.titleRow}>
                <div>
                  <h1>{dossier.name}</h1>
                  <p>
                    {dossier.breed || dossier.species} · {dossier.gender || "Onbekend"}
                  </p>
                </div>

                <span className={styles.statusPill}>{formatStatus(dossier.status)}</span>
              </div>

              <div className={styles.compactTags}>
                <span>{dossier.species}</span>
                {dossier.care_level && <span>Zorgniveau: {dossier.care_level}</span>}
                {dossier.needs_medication && <span>Medicatie nodig</span>}
                {dossier.vaccinated && <span>Gevaccineerd</span>}
              </div>

              <div className={styles.heroMeta}>
                <p>
                  <strong>Leeftijd</strong>
                  <span>{dossier.age || "Onbekend"}</span>
                </p>
                <p>
                  <strong>Gewicht</strong>
                  <span>{dossier.weight || "Onbekend"}</span>
                </p>
                <p>
                  <strong>Chipnummer</strong>
                  <span>{dossier.chip_number || "Niet ingevuld"}</span>
                </p>
              </div>
            </div>

            <aside className={styles.heroFoster}>
              <h2>Pleeggezin</h2>

              {fosterProfile ? (
                <>
                  <div className={styles.personMini}>
                    <div className={styles.avatar}>👤</div>
                    <div>
                      <h3>{getFosterName(dossier)}</h3>
                      <p>{fosterProfile.city || "Gemeente onbekend"}</p>
                    </div>
                  </div>

                  <div className={styles.fosterSmallInfo}>
                    <p>
                      <strong>E-mail</strong>
                      <span>{fosterProfile.email || "Niet ingevuld"}</span>
                    </p>
                    <p>
                      <strong>Telefoon</strong>
                      <span>{fosterProfile.phone || "Niet ingevuld"}</span>
                    </p>
                    <p>
                      <strong>Start opvang</strong>
                      <span>{formatDate(dossier.fosterApplication?.start_date || null)}</span>
                    </p>
                  </div>
                </>
              ) : (
                <p className={styles.emptyText}>
                  Er is momenteel geen pleeggezin gekoppeld aan dit dier.
                </p>
              )}
            </aside>
          </section>

          <nav className={styles.tabs}>
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
          </nav>

          {activeTab === "overzicht" && (
            <section className={styles.tabGrid}>
              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Basisinformatie</h2>
                </div>

                <div className={styles.summaryGrid}>
                  <div>
                    <strong>Soort</strong>
                    <span>{dossier.species}</span>
                  </div>
                  <div>
                    <strong>Ras</strong>
                    <span>{dossier.breed || "Onbekend"}</span>
                  </div>
                  <div>
                    <strong>Geboortedatum</strong>
                    <span>{formatDate(dossier.birth_date)}</span>
                  </div>
                  <div>
                    <strong>Paspoort</strong>
                    <span>{dossier.passport_number || "Niet ingevuld"}</span>
                  </div>
                </div>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Gezondheid</h2>
                </div>

                <div className={styles.summaryGrid}>
                  <div>
                    <strong>Gevaccineerd</strong>
                    <span>{booleanText(dossier.vaccinated)}</span>
                  </div>
                  <div>
                    <strong>Gecastreerd</strong>
                    <span>{booleanText(dossier.neutered)}</span>
                  </div>
                  <div>
                    <strong>Medicatie nodig</strong>
                    <span>{booleanText(dossier.needs_medication)}</span>
                  </div>
                  <div>
                    <strong>Zorgniveau</strong>
                    <span>{dossier.care_level || "Normaal"}</span>
                  </div>
                </div>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Beschrijving</h2>
                </div>

                <div className={styles.textBlock}>
                  <h3>Korte beschrijving</h3>
                  <p>{dossier.short_description || "Geen korte beschrijving."}</p>
                </div>

                <div className={styles.textBlock}>
                  <h3>Gedrag</h3>
                  <p>{dossier.behavior_notes || "Geen gedragsnotities."}</p>
                </div>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Recente activiteiten</h2>
                </div>

                {recentActivities.length === 0 ? (
                  <div className={styles.emptyBox}>Nog geen recente activiteiten.</div>
                ) : (
                  <div className={styles.timeline}>
                    {recentActivities.map((activity) => (
                      <div key={activity.id}>
                        <span></span>
                        <p>{activity.title}</p>
                        <small>{formatDateTime(activity.date)}</small>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}

          {activeTab === "medisch" && (
            <section className={styles.tabGrid}>
              <article className={styles.cardWide}>
                <div className={styles.cardHeader}>
                  <h2>Medisch dossier</h2>
                  <button type="button" onClick={() => setMedicalModalOpen(true)}>
                    + Medisch verslag
                  </button>
                </div>

                {medicalRecords.length === 0 ? (
                  <div className={styles.emptyBox}>Nog geen medische verslagen.</div>
                ) : (
                  <div className={styles.medicationList}>
                    {medicalRecords.map((record) => (
                      <article key={record.id} className={styles.medicationItem}>
                        <div className={styles.medicationTop}>
                          <div>
                            <h3>{record.title}</h3>
                            <p>
                              {formatDate(record.record_date)} · {record.created_by_name || "Onbekend"} · {record.created_by_role || "dierenarts"}
                            </p>
                          </div>
                        </div>

                        <div className={styles.medicationMeta}>
                          <p>
                            <strong>Reden bezoek</strong>
                            <span>{record.visit_reason || "Niet ingevuld"}</span>
                          </p>
                          <p>
                            <strong>Onderzoek</strong>
                            <span>{record.examination || "Niet ingevuld"}</span>
                          </p>
                          <p>
                            <strong>Diagnose</strong>
                            <span>{record.diagnosis || "Niet ingevuld"}</span>
                          </p>
                          <p>
                            <strong>Actie</strong>
                            <span>{record.performed_action || "Niet ingevuld"}</span>
                          </p>
                        </div>

                        {record.follow_up_advice && (
                          <p className={styles.medicationInstructions}>{record.follow_up_advice}</p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}

          {activeTab === "behandelingen" && (
            <section className={styles.tabGrid}>
              <article className={styles.cardWide}>
                <div className={styles.cardHeader}>
                  <h2>Behandelingen en medicatie</h2>
                  <button type="button" onClick={() => setMedicationModalOpen(true)}>
                    + Medicatie toevoegen
                  </button>
                </div>

                {medications.length === 0 ? (
                  <div className={styles.emptyBox}>Nog geen behandelingen toegevoegd.</div>
                ) : (
                  <div className={styles.medicationList}>
                    {medications.map((medication) => (
                      <article key={medication.id} className={styles.medicationItem}>
                        <div className={styles.medicationTop}>
                          <div>
                            <h3>{medication.name}</h3>
                            <p>
                              {medication.created_by_name || "Onbekend"} · {medication.created_by_role || "dierenarts"} · {formatDate(medication.created_at)}
                            </p>
                          </div>

                          {medication.visible_to_foster ? (
                            <span className={styles.visibleBadge}>Zichtbaar</span>
                          ) : (
                            <span className={styles.privateBadge}>Intern</span>
                          )}
                        </div>

                        <div className={styles.medicationMeta}>
                          <p>
                            <strong>Dosering</strong>
                            <span>{medication.dosage || "Niet ingevuld"}</span>
                          </p>
                          <p>
                            <strong>Frequentie</strong>
                            <span>{medication.frequency || "Niet ingevuld"}</span>
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
                          <p className={styles.medicationInstructions}>{medication.instructions}</p>
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
                  <button type="button" onClick={() => setAppointmentModalOpen(true)}>
                    + Afspraak maken
                  </button>
                </div>

                {(dossier.appointments || []).length === 0 ? (
                  <div className={styles.emptyBox}>Nog geen dierenartsafspraken.</div>
                ) : (
                  <div className={styles.appointmentList}>
                    {(dossier.appointments || []).map((appointment) => (
                      <article key={appointment.id} className={styles.appointmentItem}>
                        <div className={styles.appointmentTop}>
                          <span>{formatDateTime(appointment.start_at)}</span>
                          <strong className={appointmentBadgeClass(appointment.approval_status)}>
                            {formatAppointmentStatus(appointment.approval_status)}
                          </strong>
                        </div>

                        <h3>{appointment.title}</h3>
                        <p>{appointment.appointment_type || "dierenarts"}</p>

                        {appointment.description && (
                          <p className={styles.appointmentDetail}>{appointment.description}</p>
                        )}

                        {appointment.response_message && (
                          <p className={styles.appointmentResponse}>{appointment.response_message}</p>
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
                    + Notitie
                  </button>
                </div>

                {notes.length === 0 ? (
                  <div className={styles.emptyBox}>Nog geen notities toegevoegd.</div>
                ) : (
                  <div className={styles.notesList}>
                    {notes.map((note) => (
                      <article key={note.id} className={styles.noteItem}>
                        <div className={styles.noteTop}>
                          <div>
                            <h3>{note.title}</h3>
                            <p>
                              {note.created_by_name || "Onbekend"} · {note.created_by_role || "dierenarts"} · {formatDate(note.created_at)}
                            </p>
                          </div>

                          {note.visible_to_foster ? (
                            <span className={styles.visibleBadge}>Zichtbaar</span>
                          ) : (
                            <span className={styles.privateBadge}>Intern</span>
                          )}
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
              <button type="button" className={styles.closeModal} onClick={() => setNoteModalOpen(false)}>
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe notitie</p>
                <h2>Notitie toevoegen</h2>
              </div>

              <label>
                Titel
                <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} />
              </label>

              <label>
                Aangemaakt door
                <input value={noteCreatedBy} onChange={(e) => setNoteCreatedBy(e.target.value)} placeholder="Bijv. Dr. Kingen" />
              </label>

              <label>
                Rol
                <select value={noteRole} onChange={(e) => setNoteRole(e.target.value)}>
                  <option value="dierenarts">Dierenarts</option>
                  <option value="asiel">Asiel</option>
                </select>
              </label>

              <label>
                Inhoud
                <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
              </label>

              <label className={styles.checkLabel}>
                <input type="checkbox" checked={visibleToFoster} onChange={(e) => setVisibleToFoster(e.target.checked)} />
                Zichtbaar voor pleeggezin
              </label>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setNoteModalOpen(false)}>
                  Annuleren
                </button>
                <button type="button" className={styles.saveButton} disabled={savingNote} onClick={handleCreateNote}>
                  {savingNote ? "Opslaan..." : "Notitie opslaan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {medicationModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button type="button" className={styles.closeModal} onClick={() => setMedicationModalOpen(false)}>
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe behandeling</p>
                <h2>Medicatie toevoegen</h2>
              </div>

              <label>
                Naam medicatie
                <input value={medicationName} onChange={(e) => setMedicationName(e.target.value)} />
              </label>

              <div className={styles.formGrid}>
                <label>
                  Dosering
                  <input value={medicationDosage} onChange={(e) => setMedicationDosage(e.target.value)} />
                </label>
                <label>
                  Frequentie
                  <input value={medicationFrequency} onChange={(e) => setMedicationFrequency(e.target.value)} />
                </label>
              </div>

              <div className={styles.formGrid}>
                <label>
                  Startdatum
                  <input type="date" value={medicationStartDate} onChange={(e) => setMedicationStartDate(e.target.value)} />
                </label>
                <label>
                  Einddatum
                  <input type="date" value={medicationEndDate} onChange={(e) => setMedicationEndDate(e.target.value)} />
                </label>
              </div>

              <label>
                Aangemaakt door
                <input value={medicationCreatedBy} onChange={(e) => setMedicationCreatedBy(e.target.value)} placeholder="Bijv. Dr. Kingen" />
              </label>

              <label>
                Instructies
                <textarea value={medicationInstructions} onChange={(e) => setMedicationInstructions(e.target.value)} />
              </label>

              <label className={styles.checkLabel}>
                <input type="checkbox" checked={medicationVisibleToFoster} onChange={(e) => setMedicationVisibleToFoster(e.target.checked)} />
                Zichtbaar voor pleeggezin
              </label>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setMedicationModalOpen(false)}>
                  Annuleren
                </button>
                <button type="button" className={styles.saveButton} disabled={savingMedication} onClick={handleCreateMedication}>
                  {savingMedication ? "Opslaan..." : "Medicatie opslaan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {medicalModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button type="button" className={styles.closeModal} onClick={() => setMedicalModalOpen(false)}>
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Medisch dossier</p>
                <h2>Medisch verslag toevoegen</h2>
              </div>

              <label>
                Titel
                <input value={medicalTitle} onChange={(e) => setMedicalTitle(e.target.value)} />
              </label>

              <div className={styles.formGrid}>
                <label>
                  Datum
                  <input type="date" value={medicalDate} onChange={(e) => setMedicalDate(e.target.value)} />
                </label>
                <label>
                  Aangemaakt door
                  <input value={medicalCreatedBy} onChange={(e) => setMedicalCreatedBy(e.target.value)} placeholder="Bijv. Dr. Kingen" />
                </label>
              </div>

              <label>
                Reden bezoek
                <textarea value={visitReason} onChange={(e) => setVisitReason(e.target.value)} />
              </label>

              <label>
                Onderzoek
                <textarea value={examination} onChange={(e) => setExamination(e.target.value)} />
              </label>

              <label>
                Diagnose
                <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
              </label>

              <label>
                Uitgevoerde actie / behandeling
                <textarea value={performedAction} onChange={(e) => setPerformedAction(e.target.value)} />
              </label>

              <label>
                Vaccinatie of procedure
                <textarea value={vaccinationOrProcedure} onChange={(e) => setVaccinationOrProcedure(e.target.value)} />
              </label>

              <label>
                Opvolgadvies
                <textarea value={followUpAdvice} onChange={(e) => setFollowUpAdvice(e.target.value)} />
              </label>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setMedicalModalOpen(false)}>
                  Annuleren
                </button>
                <button type="button" className={styles.saveButton} disabled={savingMedicalRecord} onClick={handleCreateMedicalRecord}>
                  {savingMedicalRecord ? "Opslaan..." : "Verslag opslaan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {appointmentModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button type="button" className={styles.closeModal} onClick={() => setAppointmentModalOpen(false)}>
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe afspraak</p>
                <h2>Afspraak voorstellen</h2>
              </div>

              <label>
                Titel
                <input value={appointmentTitle} onChange={(e) => setAppointmentTitle(e.target.value)} placeholder="Bijv. Controleafspraak" />
              </label>

              <div className={styles.formGrid}>
                <label>
                  Datum
                  <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
                </label>
                <label>
                  Type afspraak
                  <select value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)}>
                    <option value="dierenarts">Dierenarts</option>
                    <option value="controle">Controle</option>
                    <option value="vaccinatie">Vaccinatie</option>
                    <option value="opvolging">Opvolging</option>
                  </select>
                </label>
              </div>

              <div className={styles.formGrid}>
                <label>
                  Startuur
                  <input type="time" value={appointmentStartTime} onChange={(e) => setAppointmentStartTime(e.target.value)} />
                </label>
                <label>
                  Einduur
                  <input type="time" value={appointmentEndTime} onChange={(e) => setAppointmentEndTime(e.target.value)} />
                </label>
              </div>

              <label>
                Locatie
                <input value={appointmentLocation} onChange={(e) => setAppointmentLocation(e.target.value)} />
              </label>

              <label>
                Aangemaakt door
                <input value={appointmentCreatedBy} onChange={(e) => setAppointmentCreatedBy(e.target.value)} placeholder="Bijv. Dr. Kingen" />
              </label>

              <label>
                Beschrijving
                <textarea value={appointmentDescription} onChange={(e) => setAppointmentDescription(e.target.value)} />
              </label>

              <div className={styles.infoNotice}>
                Deze afspraak wordt naar het pleeggezin gestuurd en wacht op goedkeuring.
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setAppointmentModalOpen(false)}>
                  Annuleren
                </button>
                <button type="button" className={styles.saveButton} disabled={savingAppointment} onClick={handleCreateAppointment}>
                  {savingAppointment ? "Verzenden..." : "Afspraak verzenden"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DierenartsLayout>
  );
}
    