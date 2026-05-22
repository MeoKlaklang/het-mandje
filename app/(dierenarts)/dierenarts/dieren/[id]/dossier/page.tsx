"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DierenartsLayout from "@/components/dierenarts/DierenartsLayout";
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

export default function DierenartsAnimalDossierPage() {
  const params = useParams<{ id: string }>();

  const [animal, setAnimal] = useState<DierenartsAnimalDossier | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<
    DierenartsAnimalMedicalRecord[]
  >([]);
  const [medications, setMedications] = useState<
    DierenartsAnimalMedication[]
  >([]);
  const [notes, setNotes] = useState<DierenartsAnimalNote[]>([]);

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

  return (
    <DierenartsLayout>
      <main className={styles.page}>
        <div className={styles.wrapper}>
          <div className={styles.topLine}>
            <Link href="/dierenarts/dashboard" className={styles.backLink}>
              ← Terug naar dashboard
            </Link>

            <div className={styles.topActions}>
              <button type="button">+ Afspraak maken</button>
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
                    Nog geen medische verslagen voor dit dier.
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
                              {formatDate(
                                record.record_date || record.created_at
                              )}{" "}
                              · {record.created_by_name || "Dierenarts"} ·{" "}
                              {record.created_by_role || "dierenarts"}
                            </p>
                          </div>

                          <span>Intern dossier</span>
                        </div>

                        <div className={styles.medicalRecordContent}>
                          <div>
                            <strong>Reden van bezoek</strong>
                            <p>{record.visit_reason || "Niet ingevuld"}</p>
                          </div>

                          <div>
                            <strong>Onderzoek / observatie</strong>
                            <p>{record.examination || "Niet ingevuld"}</p>
                          </div>

                          <div>
                            <strong>Diagnose / conclusie</strong>
                            <p>{record.diagnosis || "Niet ingevuld"}</p>
                          </div>

                          <div>
                            <strong>Uitgevoerde handeling</strong>
                            <p>
                              {record.performed_action || "Niet ingevuld"}
                            </p>
                          </div>

                          <div>
                            <strong>Vaccinatie / procedure</strong>
                            <p>
                              {record.vaccination_or_procedure ||
                                "Niet ingevuld"}
                            </p>
                          </div>

                          <div>
                            <strong>Advies voor opvolging</strong>
                            <p>
                              {record.follow_up_advice || "Niet ingevuld"}
                            </p>
                          </div>
                        </div>
                      </article>
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

                {medications.length === 0 ? (
                  <div className={styles.emptyBox}>
                    Nog geen medicatie toegevoegd voor dit dier.
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
                    Nog geen notities toegevoegd voor dit dier.
                  </div>
                ) : (
                  <div className={styles.notesList}>
                    {notes.map((note) => (
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

          {activeTab === "afspraken" && (
            <section className={styles.messageCard}>
              <h1>Afspraken</h1>
              <p>
                Deze tab bouwen we hierna. Hier kan de dierenarts afspraken
                voorstellen aan het pleeggezin.
              </p>
            </section>
          )}
        </div>

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