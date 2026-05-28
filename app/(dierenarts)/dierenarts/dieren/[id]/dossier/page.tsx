"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DierenartsLayout from "@/components/dierenarts/DierenartsLayout";
import { createClient } from "@/lib/supabase/client";

import {
  getDierenartsAnimalDossier,
  DierenartsAnimalDossier,
} from "@/lib/dierenarts/getDierenartsAnimalDossier";

import {
  getDierenartsAnimalMedicalRecords,
  DierenartsAnimalMedicalRecord,
} from "@/lib/dierenarts/getDierenartsAnimalMedicalRecords";

import { createDierenartsAnimalMedicalRecord } from "@/lib/dierenarts/createDierenartsAnimalMedicalRecord";

import {
  getDierenartsAnimalMedications,
  DierenartsAnimalMedication,
} from "@/lib/dierenarts/getDierenartsAnimalMedications";

import { createDierenartsAnimalMedication } from "@/lib/dierenarts/createDierenartsAnimalMedication";

import {
  getDierenartsAnimalNotes,
  DierenartsAnimalNote,
} from "@/lib/dierenarts/getDierenartsAnimalNotes";

import { createDierenartsAnimalNote } from "@/lib/dierenarts/createDierenartsAnimalNote";

import styles from "./dossier.module.css";

type Tab = "overzicht" | "medisch" | "behandeling" | "afspraken" | "notities";

type DierenartsAppointment = {
  id: string;
  animal_id: string | null;
  shelter_id: string | null;
  foster_id: string | null;
  veterinarian_id: string | null;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  status: string | null;
  approval_status: string | null;
  location: string | null;
  response_message: string | null;
  appointment_type: string | null;
  created_by: string | null;
};

function yesNo(value: boolean | null) {
  if (value === true) return "Ja";
  if (value === false) return "Nee";
  return "Onbekend";
}

function valueOrDash(value: string | null | undefined) {
  return value && value.trim() ? value : "Niet ingevuld";
}

function formatDate(date: string | null | undefined) {
  if (!date) return "Niet ingevuld";

  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return "Niet ingevuld";

  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function todayInputDate() {
  return new Date().toISOString().split("T")[0];
}

function getFosterName(animal: DierenartsAnimalDossier) {
  const profile = animal.fosterApplication?.fosterProfile;

  if (!profile) return "Geen pleeggezin gekoppeld";

  const firstName = profile.first_name || "";
  const lastName = profile.last_name || "";

  return `${firstName} ${lastName}`.trim() || "Pleeggezin zonder naam";
}

function getAppointmentStatusLabel(status: string | null | undefined) {
  if (status === "confirmed") return "Bevestigd";
  if (status === "declined") return "Geweigerd";
  if (status === "cancelled") return "Geannuleerd";
  return "In afwachting";
}

function getAppointmentStatusClass(status: string | null | undefined) {
  if (status === "confirmed") return styles.confirmedBadge;

  if (status === "declined" || status === "cancelled") {
    return styles.declinedBadge;
  }

  return styles.pendingBadge;
}

function combineDateAndTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export default function DierenartsAnimalDossierPage() {
  const params = useParams<{ id: string }>();
  const supabase = createClient();

  const [animal, setAnimal] = useState<DierenartsAnimalDossier | null>(null);

  const [medicalRecords, setMedicalRecords] = useState<
    DierenartsAnimalMedicalRecord[]
  >([]);

  const [medications, setMedications] = useState<
    DierenartsAnimalMedication[]
  >([]);

  const [notes, setNotes] = useState<DierenartsAnimalNote[]>([]);
  const [appointments, setAppointments] = useState<DierenartsAppointment[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("overzicht");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [medicalModalOpen, setMedicalModalOpen] = useState(false);
  const [savingMedicalRecord, setSavingMedicalRecord] = useState(false);

  const [medicalTitle, setMedicalTitle] = useState("");
  const [medicalDate, setMedicalDate] = useState(todayInputDate());
  const [medicalCreatedBy, setMedicalCreatedBy] = useState("");
  const [medicalRole, setMedicalRole] = useState("dierenarts");
  const [visitReason, setVisitReason] = useState("");
  const [examination, setExamination] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [performedAction, setPerformedAction] = useState("");
  const [vaccinationOrProcedure, setVaccinationOrProcedure] = useState("");
  const [followUpAdvice, setFollowUpAdvice] = useState("");

  const [medicationModalOpen, setMedicationModalOpen] = useState(false);
  const [savingMedication, setSavingMedication] = useState(false);

  const [medicationName, setMedicationName] = useState("");
  const [medicationDosage, setMedicationDosage] = useState("");
  const [medicationFrequency, setMedicationFrequency] = useState("");
  const [medicationStartDate, setMedicationStartDate] = useState("");
  const [medicationEndDate, setMedicationEndDate] = useState("");
  const [medicationInstructions, setMedicationInstructions] = useState("");
  const [medicationCreatedBy, setMedicationCreatedBy] = useState("");
  const [medicationRole, setMedicationRole] = useState("dierenarts");
  const [medicationVisibleToFoster, setMedicationVisibleToFoster] =
    useState(true);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCreatedBy, setNoteCreatedBy] = useState("");
  const [noteRole, setNoteRole] = useState("dierenarts");
  const [noteVisibleToFoster, setNoteVisibleToFoster] = useState(false);

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [savingAppointment, setSavingAppointment] = useState(false);

  const [appointmentTitle, setAppointmentTitle] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(todayInputDate());
  const [appointmentStartTime, setAppointmentStartTime] = useState("09:00");
  const [appointmentEndTime, setAppointmentEndTime] = useState("09:30");
  const [appointmentType, setAppointmentType] = useState("controle");
  const [appointmentLocation, setAppointmentLocation] = useState("");
  const [appointmentDescription, setAppointmentDescription] = useState("");

  async function loadAppointments() {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        animal_id,
        shelter_id,
        foster_id,
        veterinarian_id,
        title,
        description,
        start_at,
        end_at,
        status,
        approval_status,
        location,
        response_message,
        appointment_type,
        created_by
      `
      )
      .eq("animal_id", params.id)
      .order("start_at", { ascending: false });

    if (error) {
      console.error("Fout bij ophalen afspraken:", error);
      setAppointments([]);
      return;
    }

    setAppointments((data || []) as DierenartsAppointment[]);
  }

  async function loadDossier() {
    setLoading(true);
    setErrorMessage("");

    const dossierResult = await getDierenartsAnimalDossier(params.id);

    if (dossierResult.error) {
      setErrorMessage(dossierResult.error);
    }

    setAnimal(dossierResult.data);

    const medicalRecordsResult = await getDierenartsAnimalMedicalRecords(
      params.id
    );

    if (medicalRecordsResult.error) {
      console.error(medicalRecordsResult.error);
    }

    setMedicalRecords(medicalRecordsResult.records || []);

    const medicationsResult = await getDierenartsAnimalMedications(params.id);

    if (medicationsResult.error) {
      console.error(medicationsResult.error);
    }

    setMedications(medicationsResult.medications || []);

    const notesResult = await getDierenartsAnimalNotes(params.id);

    if (notesResult.error) {
      console.error(notesResult.error);
    }

    setNotes(notesResult.notes || []);

    await loadAppointments();

    setLoading(false);
  }

  useEffect(() => {
    if (params.id) {
      loadDossier();
    }
  }, [params.id]);

  const resetMedicalForm = () => {
    setMedicalTitle("");
    setMedicalDate(todayInputDate());
    setMedicalCreatedBy("");
    setMedicalRole("dierenarts");
    setVisitReason("");
    setExamination("");
    setDiagnosis("");
    setPerformedAction("");
    setVaccinationOrProcedure("");
    setFollowUpAdvice("");
  };

  const resetMedicationForm = () => {
    setMedicationName("");
    setMedicationDosage("");
    setMedicationFrequency("");
    setMedicationStartDate("");
    setMedicationEndDate("");
    setMedicationInstructions("");
    setMedicationCreatedBy("");
    setMedicationRole("dierenarts");
    setMedicationVisibleToFoster(true);
  };

  const resetNoteForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setNoteCreatedBy("");
    setNoteRole("dierenarts");
    setNoteVisibleToFoster(false);
  };

  const resetAppointmentForm = () => {
    setAppointmentTitle("");
    setAppointmentDate(todayInputDate());
    setAppointmentStartTime("09:00");
    setAppointmentEndTime("09:30");
    setAppointmentType("controle");
    setAppointmentLocation("");
    setAppointmentDescription("");
  };

  const handleCreateMedicalRecord = async () => {
    if (!medicalTitle.trim()) {
      alert("Vul een titel in voor het medisch verslag.");
      return;
    }

    setSavingMedicalRecord(true);

    const result = await createDierenartsAnimalMedicalRecord({
      animalId: params.id,
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

    resetMedicalForm();
    setMedicalModalOpen(false);

    const medicalRecordsResult = await getDierenartsAnimalMedicalRecords(
      params.id
    );

    setMedicalRecords(medicalRecordsResult.records || []);
  };

  const handleCreateMedication = async () => {
    if (!medicationName.trim()) {
      alert("Vul de naam van de medicatie in.");
      return;
    }

    setSavingMedication(true);

    const result = await createDierenartsAnimalMedication({
      animalId: params.id,
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

    resetMedicationForm();
    setMedicationModalOpen(false);

    const medicationsResult = await getDierenartsAnimalMedications(params.id);
    setMedications(medicationsResult.medications || []);
  };

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) {
      alert("Vul een titel in voor de notitie.");
      return;
    }

    if (!noteContent.trim()) {
      alert("Vul een notitie in.");
      return;
    }

    setSavingNote(true);

    const result = await createDierenartsAnimalNote({
      animalId: params.id,
      title: noteTitle,
      content: noteContent,
      createdByName: noteCreatedBy,
      createdByRole: noteRole,
      visibleToFoster: noteVisibleToFoster,
    });

    setSavingNote(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    resetNoteForm();
    setNoteModalOpen(false);

    const notesResult = await getDierenartsAnimalNotes(params.id);
    setNotes(notesResult.notes || []);
  };

  const handleCreateAppointment = async () => {
    if (!animal) return;

    if (!appointmentTitle.trim()) {
      alert("Vul een titel in voor de afspraak.");
      return;
    }

    if (!appointmentDate || !appointmentStartTime || !appointmentEndTime) {
      alert("Vul een datum, startuur en einduur in.");
      return;
    }

    const startAt = combineDateAndTime(appointmentDate, appointmentStartTime);
    const endAt = combineDateAndTime(appointmentDate, appointmentEndTime);

    if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      alert("Het einduur moet later zijn dan het startuur.");
      return;
    }

    setSavingAppointment(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSavingAppointment(false);
      alert("Je bent niet ingelogd.");
      return;
    }

    const animalData = animal as any;

    const shelterId =
      animalData.shelter_id || animalData.shelter?.id || null;

    const fosterId =
      animalData.fosterApplication?.foster_id ||
      animalData.fosterApplication?.user_id ||
      animalData.fosterApplication?.fosterProfile?.id ||
      null;

    const { error } = await supabase.from("appointments").insert({
      animal_id: params.id,
      shelter_id: shelterId,
      foster_id: fosterId,
      veterinarian_id: user.id,
      title: appointmentTitle.trim(),
      description: appointmentDescription.trim() || null,
      start_at: startAt,
      end_at: endAt,
      status: "pending",
      approval_status: "pending",
      location: appointmentLocation.trim() || null,
      appointment_type: appointmentType || "controle",
      created_by: "dierenarts",
      response_message: null,
    });

    setSavingAppointment(false);

    if (error) {
      alert(error.message);
      return;
    }

    resetAppointmentForm();
    setAppointmentModalOpen(false);
    setActiveTab("afspraken");

    await loadAppointments();
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

  if (!animal) {
    return (
      <DierenartsLayout>
        <main className={styles.page}>
          <section className={styles.messageCard}>
            <h1>Dossier niet gevonden</h1>
            <p>{errorMessage || "Dit dier kon niet geladen worden."}</p>

            <button type="button" onClick={() => window.history.back()}>
              Terug
            </button>
          </section>
        </main>
      </DierenartsLayout>
    );
  }

  const sortedMedicalRecords = [...medicalRecords].sort((a, b) => {
    const dateA = new Date(a.record_date || a.created_at || 0).getTime();
    const dateB = new Date(b.record_date || b.created_at || 0).getTime();

    return dateB - dateA;
  });

  const sortedMedications = [...medications].sort((a, b) => {
    const dateA = new Date(a.created_at || a.start_date || 0).getTime();
    const dateB = new Date(b.created_at || b.start_date || 0).getTime();

    return dateB - dateA;
  });

  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();

    return dateB - dateA;
  });

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.start_at || 0).getTime();
    const dateB = new Date(b.start_at || 0).getTime();

    return dateB - dateA;
  });

  const latestMedicalRecord = sortedMedicalRecords[0];

  return (
    <DierenartsLayout>
      <main className={styles.page}>
        <div className={styles.wrapper}>
          <div className={styles.topLine}>
            <Link href="/dierenarts/dashboard" className={styles.backLink}>
              ← Terug naar dashboard
            </Link>

            <div className={styles.topActions}>
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
              <p className={styles.label}>Dierendossier</p>

              <div className={styles.titleRow}>
                <div>
                  <h1>{animal.name}</h1>
                  <p>
                    {valueOrDash(animal.breed)} · {valueOrDash(animal.age)} ·{" "}
                    {valueOrDash(animal.gender)}
                  </p>
                </div>

                <span className={styles.statusPill}>
                  {valueOrDash(animal.status)}
                </span>
              </div>

              <div className={styles.compactTags}>
                {animal.vaccinated && <span>Gevaccineerd</span>}
                {animal.neutered && <span>Gecastreerd</span>}
                {animal.house_trained && <span>Zindelijk</span>}
                {animal.needs_medication && <span>Medicatie nodig</span>}

                {!animal.vaccinated &&
                  !animal.neutered &&
                  !animal.house_trained &&
                  !animal.needs_medication && <span>Geen tags ingevuld</span>}
              </div>

              <div className={styles.heroMeta}>
                <p>
                  <strong>Chipnummer</strong>
                  <span>{valueOrDash(animal.chip_number)}</span>
                </p>

                <p>
                  <strong>Kleur / vacht</strong>
                  <span>{valueOrDash(animal.coat_color)}</span>
                </p>

                <p>
                  <strong>Toegevoegd</strong>
                  <span>{formatDate(animal.created_at)}</span>
                </p>
              </div>
            </div>

            <aside className={styles.heroFoster}>
              <h2>Huidig pleeggezin</h2>

              {animal.fosterApplication?.fosterProfile ? (
                <>
                  <div className={styles.personMini}>
                    <div className={styles.avatar}>👤</div>

                    <div>
                      <h3>{getFosterName(animal)}</h3>
                      <p>
                        {valueOrDash(
                          animal.fosterApplication.fosterProfile.postal_code
                        )}{" "}
                        {valueOrDash(
                          animal.fosterApplication.fosterProfile.city
                        )}
                      </p>
                    </div>
                  </div>

                  <div className={styles.fosterSmallInfo}>
                    <p>
                      <strong>Opvangperiode</strong>
                      <span>
                        {formatDate(animal.fosterApplication.start_date)} -{" "}
                        {formatDate(animal.fosterApplication.end_date)}
                      </span>
                    </p>

                    <p>
                      <strong>Status</strong>
                      <span>{valueOrDash(animal.fosterApplication.status)}</span>
                    </p>

                    <p>
                      <strong>Contact</strong>
                      <span>
                        {animal.fosterApplication.fosterProfile.email ||
                          animal.fosterApplication.fosterProfile.phone ||
                          "Niet ingevuld"}
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                <p className={styles.emptyText}>
                  Dit dier heeft momenteel geen gekoppeld pleeggezin.
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
              className={activeTab === "behandeling" ? styles.activeTab : ""}
              onClick={() => setActiveTab("behandeling")}
            >
              Behandeling
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
                  <h2>Basisinformatie</h2>
                </div>

                <div className={styles.summaryGrid}>
                  <div>
                    <strong>Soort</strong>
                    <span>{valueOrDash(animal.species)}</span>
                  </div>

                  <div>
                    <strong>Ras</strong>
                    <span>{valueOrDash(animal.breed)}</span>
                  </div>

                  <div>
                    <strong>Geslacht</strong>
                    <span>{valueOrDash(animal.gender)}</span>
                  </div>

                  <div>
                    <strong>Leeftijd</strong>
                    <span>{valueOrDash(animal.age)}</span>
                  </div>

                  <div>
                    <strong>Gevaccineerd</strong>
                    <span>{yesNo(animal.vaccinated)}</span>
                  </div>

                  <div>
                    <strong>Gecastreerd</strong>
                    <span>{yesNo(animal.neutered)}</span>
                  </div>
                </div>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Medische aandachtspunten</h2>
                </div>

                <div className={styles.textBlock}>
                  <h3>Medische notities</h3>
                  <p>{valueOrDash(animal.medical_notes)}</p>
                </div>

                <div className={styles.textBlock}>
                  <h3>Speciale noden</h3>
                  <p>{valueOrDash(animal.special_needs)}</p>
                </div>

                <div className={styles.textBlock}>
                  <h3>Heeft medicatie nodig?</h3>
                  <p>{yesNo(animal.needs_medication)}</p>
                </div>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Gedrag</h2>
                </div>

                <div className={styles.textBlock}>
                  <h3>Gedragsnotities</h3>
                  <p>{valueOrDash(animal.behavior_notes)}</p>
                </div>

                <div className={styles.textBlock}>
                  <h3>Temperament</h3>
                  <p>{valueOrDash(animal.temperament)}</p>
                </div>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Gekoppeld asiel</h2>
                </div>

                <div className={styles.infoRows}>
                  <p>
                    <strong>Naam asiel</strong>
                    <span>{valueOrDash(animal.shelter?.name)}</span>
                  </p>

                  <p>
                    <strong>Gemeente</strong>
                    <span>{valueOrDash(animal.shelter?.city)}</span>
                  </p>
                </div>
              </article>

              <article className={styles.cardWide}>
                <div className={styles.cardHeader}>
                  <h2>Beschrijving</h2>
                </div>

                <div className={styles.textBlock}>
                  <h3>Korte omschrijving</h3>
                  <p>{valueOrDash(animal.short_description)}</p>
                </div>

                <div className={styles.textBlock}>
                  <h3>Volledige beschrijving</h3>
                  <p>{valueOrDash(animal.description)}</p>
                </div>
              </article>
            </section>
          )}

          {activeTab === "medisch" && (
            <section className={styles.tabGrid}>
              <article className={styles.cardWide}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2>Medisch dossier</h2>
                    <p className={styles.cardSubtitle}>
                      Overzicht van onderzoeken, diagnoses, behandelingen en
                      medische opvolgingen.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMedicalModalOpen(true)}
                  >
                    + Medisch verslag toevoegen
                  </button>
                </div>

                <div className={styles.medicalOverviewGrid}>
                  <div className={styles.medicalSummaryCard}>
                    <span>Verslagen</span>
                    <strong>{sortedMedicalRecords.length}</strong>
                    <p>Medische updates in dit dossier.</p>
                  </div>

                  <div className={styles.medicalSummaryCard}>
                    <span>Laatste update</span>
                    <strong>
                      {latestMedicalRecord
                        ? formatDate(
                            latestMedicalRecord.record_date ||
                              latestMedicalRecord.created_at
                          )
                        : "Geen"}
                    </strong>
                    <p>Meest recente medische registratie.</p>
                  </div>

                  <div className={styles.medicalSummaryCard}>
                    <span>Medicatie</span>
                    <strong>{sortedMedications.length}</strong>
                    <p>Toegevoegde medicatie voor dit dier.</p>
                  </div>
                </div>

                {sortedMedicalRecords.length === 0 ? (
                  <div className={styles.emptyBox}>
                    Nog geen medische verslagen voor dit dier.
                  </div>
                ) : (
                  <div className={styles.medicalRecordTimeline}>
                    {sortedMedicalRecords.map((record) => (
                      <details
                        key={record.id}
                        className={styles.medicalRecordCard}
                      >
                        <summary className={styles.medicalRecordSummary}>
                          <span className={styles.medicalDot}></span>

                          <div className={styles.medicalSummaryContent}>
                            <div className={styles.medicalSummaryTop}>
                              <div>
                                <h3>{record.title}</h3>

                                <p>
                                  {formatDate(
                                    record.record_date || record.created_at
                                  )}{" "}
                                  · {record.created_by_name || "Dierenarts"}
                                </p>
                              </div>

                              <span className={styles.medicalBadge}>
                                {record.created_by_role || "dierenarts"}
                              </span>
                            </div>

                            <div className={styles.medicalQuickInfo}>
                              <p>
                                <strong>Reden bezoek</strong>
                                <span>{valueOrDash(record.visit_reason)}</span>
                              </p>

                              <p>
                                <strong>Diagnose</strong>
                                <span>{valueOrDash(record.diagnosis)}</span>
                              </p>

                              <p>
                                <strong>Opvolging</strong>
                                <span>
                                  {valueOrDash(record.follow_up_advice)}
                                </span>
                              </p>
                            </div>
                          </div>
                        </summary>

                        <div className={styles.medicalRecordDetails}>
                          <div>
                            <strong>Reden van bezoek</strong>
                            <p>{valueOrDash(record.visit_reason)}</p>
                          </div>

                          <div>
                            <strong>Onderzoek / observatie</strong>
                            <p>{valueOrDash(record.examination)}</p>
                          </div>

                          <div>
                            <strong>Diagnose / conclusie</strong>
                            <p>{valueOrDash(record.diagnosis)}</p>
                          </div>

                          <div>
                            <strong>Uitgevoerde handeling</strong>
                            <p>{valueOrDash(record.performed_action)}</p>
                          </div>

                          <div>
                            <strong>Vaccinatie / procedure</strong>
                            <p>
                              {valueOrDash(record.vaccination_or_procedure)}
                            </p>
                          </div>

                          <div>
                            <strong>Advies voor opvolging</strong>
                            <p>{valueOrDash(record.follow_up_advice)}</p>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}

          {activeTab === "behandeling" && (
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

                {sortedMedications.length === 0 ? (
                  <div className={styles.emptyBox}>
                    Nog geen medicatie toegevoegd voor dit dier.
                  </div>
                ) : (
                  <div className={styles.medicationList}>
                    {sortedMedications.map((medication) => (
                      <article
                        key={medication.id}
                        className={styles.medicationItem}
                      >
                        <div className={styles.medicationTop}>
                          <div>
                            <h3>{medication.name}</h3>

                            <p>
                              {medication.created_by_name || "Dierenarts"} ·{" "}
                              {medication.created_by_role || "dierenarts"} ·{" "}
                              {formatDate(medication.created_at)}
                            </p>
                          </div>

                          {medication.visible_to_foster && (
                            <span className={styles.visibleBadge}>
                              Zichtbaar voor pleeggezin
                            </span>
                          )}
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

                        <p className={styles.medicationInstructions}>
                          {medication.instructions ||
                            "Geen instructies ingevuld."}
                        </p>
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
                  <div>
                    <h2>Afspraken</h2>
                    <p className={styles.cardSubtitle}>
                      Overzicht van alle afspraken rond dit dier.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAppointmentModalOpen(true)}
                  >
                    + Afspraak maken
                  </button>
                </div>

                {sortedAppointments.length === 0 ? (
                  <div className={styles.emptyBox}>
                    Er zijn nog geen afspraken gepland voor dit dier.
                  </div>
                ) : (
                  <div className={styles.appointmentList}>
                    {sortedAppointments.map((appointment) => (
                      <article
                        key={appointment.id}
                        className={styles.appointmentItem}
                      >
                        <div className={styles.appointmentTop}>
                          <div>
                            <span>{formatDateTime(appointment.start_at)}</span>

                            <h3>
                              {appointment.title || "Afspraak zonder titel"}
                            </h3>

                            {appointment.description && (
                              <p className={styles.appointmentDetail}>
                                {appointment.description}
                              </p>
                            )}

                            {appointment.location && (
                              <p className={styles.appointmentDetail}>
                                Locatie: {appointment.location}
                              </p>
                            )}

                            {appointment.appointment_type && (
                              <p className={styles.appointmentDetail}>
                                Type: {appointment.appointment_type}
                              </p>
                            )}
                          </div>

                          <strong
                            className={getAppointmentStatusClass(
                              appointment.approval_status ||
                                appointment.status
                            )}
                          >
                            {getAppointmentStatusLabel(
                              appointment.approval_status ||
                                appointment.status
                            )}
                          </strong>
                        </div>

                        {appointment.response_message && (
                          <p className={styles.appointmentResponse}>
                            {appointment.response_message}
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

                {sortedNotes.length === 0 ? (
                  <div className={styles.emptyBox}>
                    Nog geen notities toegevoegd voor dit dier.
                  </div>
                ) : (
                  <div className={styles.notesList}>
                    {sortedNotes.map((note) => (
                      <article key={note.id} className={styles.noteItem}>
                        <div className={styles.noteTop}>
                          <div>
                            <h3>{note.title}</h3>

                            <p>
                              {note.created_by_name || "Dierenarts"} ·{" "}
                              {note.created_by_role || "dierenarts"} ·{" "}
                              {formatDate(note.created_at)}
                            </p>
                          </div>

                          {note.visible_to_foster ? (
                            <span className={styles.visibleBadge}>
                              Zichtbaar voor pleeggezin
                            </span>
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
                <h2>Afspraak maken</h2>
              </div>

              <label>
                Titel
                <input
                  type="text"
                  value={appointmentTitle}
                  onChange={(e) => setAppointmentTitle(e.target.value)}
                  placeholder="Bijv. Controle afspraak"
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
                    <option value="controle">Controle</option>
                    <option value="vaccinatie">Vaccinatie</option>
                    <option value="behandeling">Behandeling</option>
                    <option value="consultatie">Consultatie</option>
                    <option value="opvolging">Opvolging</option>
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
                  placeholder="Bijv. Dierenartspraktijk Mechelen"
                />
              </label>

              <label>
                Beschrijving
                <textarea
                  value={appointmentDescription}
                  onChange={(e) => setAppointmentDescription(e.target.value)}
                  placeholder="Extra info voor het pleeggezin of asiel..."
                />
              </label>

              <div className={styles.infoNotice}>
                De afspraak wordt gekoppeld aan dit dier en komt in het
                afsprakenoverzicht terecht. De status staat eerst op “in
                afwachting”.
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
                  {savingAppointment ? "Opslaan..." : "Afspraak opslaan"}
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
                  <option value="assistent">Assistent</option>
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
                  placeholder="Bijv. lichte oorontsteking, geen afwijkingen..."
                />
              </label>

              <label>
                Uitgevoerde handeling
                <textarea
                  value={performedAction}
                  onChange={(e) => setPerformedAction(e.target.value)}
                  placeholder="Bijv. oor gereinigd, wond verzorgd, bloed afgenomen..."
                />
              </label>

              <label>
                Vaccinatie / procedure / dosering
                <textarea
                  value={vaccinationOrProcedure}
                  onChange={(e) => setVaccinationOrProcedure(e.target.value)}
                  placeholder="Bijv. vaccin Nobivac DHP, 1 dosis subcutaan..."
                />
              </label>

              <label>
                Advies voor opvolging
                <textarea
                  value={followUpAdvice}
                  onChange={(e) => setFollowUpAdvice(e.target.value)}
                  placeholder="Bijv. controle binnen 7 dagen, medicatie afmaken..."
                />
              </label>

              <div className={styles.infoNotice}>
                Dit medisch verslag is bedoeld voor dierenarts en dierenasiel.
                Het pleeggezin krijgt hiervan geen aparte melding.
              </div>

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
                  {savingMedicalRecord ? "Opslaan..." : "Verslag opslaan"}
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
                    <option value="dierenarts">Dierenarts</option>
                    <option value="assistent">Assistent</option>
                    <option value="asiel">Dierenasiel</option>
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
                    <option value="dierenarts">Dierenarts</option>
                    <option value="assistent">Assistent</option>
                    <option value="asiel">Dierenasiel</option>
                  </select>
                </label>
              </div>

              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={noteVisibleToFoster}
                  onChange={(e) => setNoteVisibleToFoster(e.target.checked)}
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
      </main>
    </DierenartsLayout>
  );
}