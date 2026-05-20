"use client";

import { useEffect, useMemo, useState } from "react";
import AsielLayout from "@/components/asiel/AsielLayout";
import {
  getShelterAgendaData,
  ShelterAgendaAppointment,
} from "@/lib/asiel/getShelterAgendaData";
import { createShelterAppointment } from "@/lib/asiel/createShelterAppointment";
import {
  getShelterAnimalsForSelect,
  ShelterAnimalOption,
} from "@/lib/asiel/getShelterAnimalsForSelect";
import { deleteShelterAppointment } from "@/lib/asiel/deleteShelterAppointment";
import { respondToAppointmentProposal } from "@/lib/asiel/respondToAppointmentProposal";
import { respondToUserAppointmentRequest } from "@/lib/asiel/respondToUserAppointmentRequest";
import styles from "./asiel-agenda.module.css";

const hours = Array.from({ length: 14 }, (_, index) => index + 7);
const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function startOfWeek(date: Date) {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  newDate.setDate(newDate.getDate() + diff);
  newDate.setHours(0, 0, 0, 0);

  return newDate;
}

function addDays(date: Date, amount: number) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + amount);
  return newDate;
}

function sameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("nl-BE", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(date: string | null) {
  if (!date) return "Onbekend";

  return new Date(date).toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAppointmentTop(startAt: string) {
  const start = new Date(startAt);
  const minutes = start.getHours() * 60 + start.getMinutes();
  const startMinutes = 7 * 60;

  return minutes - startMinutes;
}

function getAppointmentHeight(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const diff = (end.getTime() - start.getTime()) / 1000 / 60;

  return Math.max(diff, 42);
}

function formatInputDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function getCalendarDays(currentMonth: Date) {
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const start = startOfWeek(firstDay);
  return Array.from({ length: 35 }, (_, index) => addDays(start, index));
}

function formatApprovalStatus(status: string | null) {
  if (status === "pending_user_approval") return "Wacht op goedkeuring user";
  if (status === "pending_shelter_approval") return "Wacht op goedkeuring asiel";
  if (status === "confirmed") return "Bevestigd";
  if (status === "declined") return "Geweigerd";
  if (status === "new_time_requested") return "Nieuw voorstel";
  return "Bevestigd";
}

function getApprovalClass(status: string | null) {
  if (status === "pending_user_approval") return styles.pendingStatus;
  if (status === "pending_shelter_approval") return styles.pendingStatus;
  if (status === "declined") return styles.declinedStatus;
  if (status === "new_time_requested") return styles.requestStatus;
  return styles.confirmedStatus;
}

function formatProposalDate(startAt: string | null, endAt: string | null) {
  if (!startAt || !endAt) return "Geen voorstel gevonden";

  const start = new Date(startAt);
  const end = new Date(endAt);

  const date = start.toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const startTime = start.toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = end.toLocaleTimeString("nl-BE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} van ${startTime} tot ${endTime}`;
}

export default function AsielAgendaPage() {
  const [appointments, setAppointments] = useState<ShelterAgendaAppointment[]>(
    []
  );
  const [animals, setAnimals] = useState<ShelterAnimalOption[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<ShelterAgendaAppointment | null>(null);

  const [saving, setSaving] = useState(false);
  const [appointmentActionLoading, setAppointmentActionLoading] =
    useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(formatInputDate(new Date()));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [appointmentType, setAppointmentType] = useState("algemeen");
  const [createdBy, setCreatedBy] = useState("");

  const [animalSearch, setAnimalSearch] = useState("");
  const [selectedAnimal, setSelectedAnimal] =
    useState<ShelterAnimalOption | null>(null);

  async function loadAgenda() {
    setLoading(true);

    const [agendaResult, animalsResult] = await Promise.all([
      getShelterAgendaData(),
      getShelterAnimalsForSelect(),
    ]);

    if (agendaResult.error) {
      setErrorMessage(agendaResult.error);
    } else if (animalsResult.error) {
      setErrorMessage(animalsResult.error);
    } else {
      setErrorMessage("");
    }

    setAppointments(agendaResult.appointments);
    setAnimals(animalsResult.animals);
    setLoading(false);
  }

  useEffect(() => {
    loadAgenda();
  }, []);

  const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [weekStart]);

  const calendarDays = useMemo(() => {
    return getCalendarDays(calendarMonth);
  }, [calendarMonth]);

  const filteredAnimals = useMemo(() => {
    const query = animalSearch.trim().toLowerCase();

    if (!query) return animals.slice(0, 5);

    return animals
      .filter((animal) => {
        const name = animal.name.toLowerCase();
        const breed = animal.breed?.toLowerCase() || "";
        const species = animal.species.toLowerCase();

        return (
          name.includes(query) ||
          breed.includes(query) ||
          species.includes(query)
        );
      })
      .slice(0, 5);
  }, [animalSearch, animals]);

  const todayAppointments = appointments.filter((appointment) =>
    sameDay(new Date(appointment.start_at), new Date())
  );

  const handleCreateAppointment = async () => {
    if (!title.trim()) {
      alert("Geef je afspraak een titel.");
      return;
    }

    if (!date || !startTime || !endTime) {
      alert("Vul datum, startuur en einduur in.");
      return;
    }

    setSaving(true);

    const result = await createShelterAppointment({
      title,
      description,
      date,
      startTime,
      endTime,
      animalId: selectedAnimal?.id || "",
      appointmentType,
      createdBy,
    });

    setSaving(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setTitle("");
    setDescription("");
    setDate(formatInputDate(new Date()));
    setStartTime("09:00");
    setEndTime("10:00");
    setAppointmentType("algemeen");
    setCreatedBy("");
    setAnimalSearch("");
    setSelectedAnimal(null);
    setModalOpen(false);

    await loadAgenda();
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    const confirmed = confirm(
      "Weet je zeker dat je deze afspraak wilt verwijderen?"
    );

    if (!confirmed) return;

    setAppointmentActionLoading(true);

    const result = await deleteShelterAppointment(selectedAppointment.id);

    setAppointmentActionLoading(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setSelectedAppointment(null);
    await loadAgenda();
  };

  const handleProposalResponse = async (
    action: "accept_proposal" | "decline_proposal"
  ) => {
    if (!selectedAppointment) return;

    const confirmed = confirm(
      action === "accept_proposal"
        ? "Wil je het nieuwe datumvoorstel accepteren?"
        : "Wil je het nieuwe datumvoorstel weigeren?"
    );

    if (!confirmed) return;

    setAppointmentActionLoading(true);

    const result = await respondToAppointmentProposal({
      appointmentId: selectedAppointment.id,
      action,
    });

    setAppointmentActionLoading(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setSelectedAppointment(null);
    await loadAgenda();
  };

  const handleUserRequestResponse = async (
    action: "accept_request" | "decline_request"
  ) => {
    if (!selectedAppointment) return;

    const confirmed = confirm(
      action === "accept_request"
        ? "Wil je deze afspraakaanvraag goedkeuren?"
        : "Wil je deze afspraakaanvraag weigeren?"
    );

    if (!confirmed) return;

    setAppointmentActionLoading(true);

    const result = await respondToUserAppointmentRequest({
      appointmentId: selectedAppointment.id,
      action,
    });

    setAppointmentActionLoading(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setSelectedAppointment(null);
    await loadAgenda();
  };

  const previousWeek = () => {
    setCurrentDate((date) => addDays(date, -7));
  };

  const nextWeek = () => {
    setCurrentDate((date) => addDays(date, 7));
  };

  const previousMonth = () => {
    setCalendarMonth(
      (date) => new Date(date.getFullYear(), date.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCalendarMonth(
      (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1)
    );
  };

  return (
    <AsielLayout>
      <main className={styles.page}>
        <div className={styles.wrapper}>
          <section className={styles.header}>
            <div>
              <h1>Agenda</h1>
              <p>
                Plan intakegesprekken, dierenartsafspraken en opvolgingen voor
                jouw dierenasiel.
              </p>
            </div>

            <button
              type="button"
              className={styles.createButton}
              onClick={() => setModalOpen(true)}
            >
              + Nieuwe afspraak
            </button>
          </section>

          {loading ? (
            <section className={styles.messageCard}>
              <h2>Agenda wordt geladen...</h2>
              <p>We halen de afspraken van je dierenasiel op.</p>
            </section>
          ) : errorMessage ? (
            <section className={styles.messageCard}>
              <h2>Er ging iets mis</h2>
              <p>{errorMessage}</p>
            </section>
          ) : (
            <section className={styles.agendaLayout}>
              <div className={styles.weekPanel}>
                <div className={styles.weekTop}>
                  <button type="button" onClick={previousWeek}>
                    ‹
                  </button>

                  <h2>
                    Week van{" "}
                    {weekStart.toLocaleDateString("nl-BE", {
                      day: "2-digit",
                      month: "long",
                    })}
                  </h2>

                  <button type="button" onClick={nextWeek}>
                    ›
                  </button>
                </div>

                <div className={styles.weekGrid}>
                  <div className={styles.emptyCorner}></div>

                  {days.map((day, index) => (
                    <div
                      key={day.toISOString()}
                      className={`${styles.dayHeader} ${
                        sameDay(day, new Date()) ? styles.todayHeader : ""
                      }`}
                    >
                      <span>{weekDays[index]}</span>
                      <strong>{day.getDate()}</strong>
                    </div>
                  ))}

                  <div className={styles.timeColumn}>
                    {hours.map((hour) => (
                      <div key={hour} className={styles.timeSlot}>
                        {String(hour).padStart(2, "0")}:00
                      </div>
                    ))}
                  </div>

                  {days.map((day) => {
                    const dayAppointments = appointments.filter((appointment) =>
                      sameDay(new Date(appointment.start_at), day)
                    );

                    return (
                      <div key={day.toISOString()} className={styles.dayColumn}>
                        {hours.map((hour) => (
                          <div key={hour} className={styles.hourLine}></div>
                        ))}

                        {dayAppointments.map((appointment) => (
                          <button
                            key={appointment.id}
                            type="button"
                            className={styles.appointmentBlock}
                            style={{
                              top: `${getAppointmentTop(
                                appointment.start_at
                              )}px`,
                              height: `${getAppointmentHeight(
                                appointment.start_at,
                                appointment.end_at
                              )}px`,
                            }}
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <span className={styles.appointmentTime}>
                              {formatTime(appointment.start_at)} -{" "}
                              {formatTime(appointment.end_at)}
                            </span>

                            <strong>{appointment.title}</strong>

                            {appointment.animals && (
                              <p>{appointment.animals.name}</p>
                            )}

                            <span
                              className={`${styles.statusDot} ${getApprovalClass(
                                appointment.approval_status
                              )}`}
                            ></span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              <aside className={styles.sidePanel}>
                <section className={styles.miniCalendar}>
                  <div className={styles.calendarTop}>
                    <button type="button" onClick={previousMonth}>
                      ‹
                    </button>

                    <h2>{formatMonth(calendarMonth)}</h2>

                    <button type="button" onClick={nextMonth}>
                      ›
                    </button>
                  </div>

                  <div className={styles.calendarDaysHeader}>
                    <span>Ma</span>
                    <span>Di</span>
                    <span>Wo</span>
                    <span>Do</span>
                    <span>Vr</span>
                    <span>Za</span>
                    <span>Zo</span>
                  </div>

                  <div className={styles.calendarGrid}>
                    {calendarDays.map((day) => {
                      const hasAppointment = appointments.some((appointment) =>
                        sameDay(new Date(appointment.start_at), day)
                      );

                      const isCurrentMonth =
                        day.getMonth() === calendarMonth.getMonth();

                      return (
                        <button
                          type="button"
                          key={day.toISOString()}
                          className={`${styles.calendarDay} ${
                            sameDay(day, new Date()) ? styles.todayDay : ""
                          } ${!isCurrentMonth ? styles.otherMonth : ""}`}
                          onClick={() => {
                            setCurrentDate(day);
                            setDate(formatInputDate(day));
                          }}
                        >
                          {day.getDate()}
                          {hasAppointment && <span></span>}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className={styles.todayCard}>
                  <h2>Afspraken vandaag</h2>

                  {todayAppointments.length === 0 ? (
                    <div className={styles.emptyToday}>
                      Geen afspraken vandaag.
                    </div>
                  ) : (
                    <div className={styles.todayList}>
                      {todayAppointments.map((appointment) => (
                        <button
                          key={appointment.id}
                          type="button"
                          className={styles.todayItem}
                          onClick={() => setSelectedAppointment(appointment)}
                        >
                          <span>{formatTime(appointment.start_at)}</span>

                          <div>
                            <h3>{appointment.title}</h3>
                            <p>
                              {appointment.animals?.name ||
                                appointment.appointment_type ||
                                "Algemeen"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              </aside>
            </section>
          )}
        </div>

        {modalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeModal}
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe afspraak</p>
                <h2>Plan een afspraak</h2>
              </div>

              <label>
                Titel
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bijv. Intakegesprek pleeggezin"
                />
              </label>

              <label>
                Koppel aan dier
                <input
                  type="text"
                  value={animalSearch}
                  onChange={(e) => {
                    setAnimalSearch(e.target.value);
                    setSelectedAnimal(null);
                  }}
                  placeholder="Zoek op naam, ras of soort..."
                />
              </label>

              {selectedAnimal ? (
                <div className={styles.selectedAnimalBox}>
                  <img
                    src={selectedAnimal.image_url || "/images/dog3.jpg"}
                    alt={selectedAnimal.name}
                  />

                  <div>
                    <h3>{selectedAnimal.name}</h3>
                    <p>
                      {selectedAnimal.breed || selectedAnimal.species} ·{" "}
                      {selectedAnimal.species}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnimal(null);
                      setAnimalSearch("");
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className={styles.animalResults}>
                  {filteredAnimals.length === 0 ? (
                    <p>Geen dieren gevonden.</p>
                  ) : (
                    filteredAnimals.map((animal) => (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => {
                          setSelectedAnimal(animal);
                          setAnimalSearch(animal.name);
                        }}
                      >
                        <img
                          src={animal.image_url || "/images/dog3.jpg"}
                          alt={animal.name}
                        />

                        <span>
                          <strong>{animal.name}</strong>
                          {animal.breed || animal.species}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              <div className={styles.formGrid}>
                <label>
                  Datum
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>

                <label>
                  Type afspraak
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  >
                    <option value="algemeen">Algemeen</option>
                    <option value="intake">Intake</option>
                    <option value="dierenarts">Dierenarts</option>
                    <option value="opvolging">Opvolging</option>
                    <option value="medicatie">Medicatie</option>
                    <option value="ophaling">Ophaling / terugbrengen</option>
                  </select>
                </label>
              </div>

              <div className={styles.formGrid}>
                <label>
                  Startuur
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </label>

                <label>
                  Einduur
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </label>
              </div>

              <label>
                Aangemaakt door
                <input
                  type="text"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  placeholder="Bijv. Emma of Dr. Kingen"
                />
              </label>

              <label>
                Beschrijving
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Extra informatie over deze afspraak..."
                />
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setModalOpen(false)}
                >
                  Annuleren
                </button>

                <button
                  type="button"
                  className={styles.saveButton}
                  disabled={saving}
                  onClick={handleCreateAppointment}
                >
                  {saving ? "Opslaan..." : "Afspraak opslaan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedAppointment && (
          <div className={styles.modalOverlay}>
            <div className={styles.detailModal}>
              <button
                type="button"
                className={styles.closeModal}
                onClick={() => setSelectedAppointment(null)}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Afspraak details</p>
                <h2>{selectedAppointment.title}</h2>
              </div>

              <div className={styles.detailStatusRow}>
                <span
                  className={`${styles.detailStatusBadge} ${getApprovalClass(
                    selectedAppointment.approval_status
                  )}`}
                >
                  {formatApprovalStatus(selectedAppointment.approval_status)}
                </span>
              </div>

              {selectedAppointment.animals && (
                <div className={styles.detailAnimal}>
                  <img
                    src={
                      selectedAppointment.animals.image_url ||
                      "/images/dog3.jpg"
                    }
                    alt={selectedAppointment.animals.name}
                  />

                  <div>
                    <h3>{selectedAppointment.animals.name}</h3>
                    <p>
                      {selectedAppointment.animals.breed ||
                        selectedAppointment.animals.species ||
                        "Dier"}
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.detailGrid}>
                <p>
                  <strong>Datum</strong>
                  <span>{formatDate(selectedAppointment.start_at)}</span>
                </p>

                <p>
                  <strong>Uur</strong>
                  <span>
                    {formatTime(selectedAppointment.start_at)} -{" "}
                    {formatTime(selectedAppointment.end_at)}
                  </span>
                </p>

                <p>
                  <strong>Type</strong>
                  <span>
                    {selectedAppointment.appointment_type || "Algemeen"}
                  </span>
                </p>

                <p>
                  <strong>Aangemaakt door</strong>
                  <span>{selectedAppointment.created_by || "Asielteam"}</span>
                </p>

                <p>
                  <strong>Pleeggezin</strong>
                  <span>
                    {selectedAppointment.fosterProfile
                      ? `${selectedAppointment.fosterProfile.first_name || ""} ${
                          selectedAppointment.fosterProfile.last_name || ""
                        }`.trim()
                      : "Geen pleeggezin gekoppeld"}
                  </span>
                </p>

                <p>
                  <strong>Locatie</strong>
                  <span>{selectedAppointment.location || "Niet ingevuld"}</span>
                </p>
              </div>

              {selectedAppointment.description && (
                <div className={styles.detailText}>
                  <strong>Beschrijving</strong>
                  <p>{selectedAppointment.description}</p>
                </div>
              )}

              {selectedAppointment.response_message && (
                <div className={styles.detailResponse}>
                  <strong>Reactie pleeggezin</strong>
                  <p>{selectedAppointment.response_message}</p>
                </div>
              )}

              {selectedAppointment.approval_status ===
                "pending_shelter_approval" && (
                <div className={styles.shelterApprovalPanel}>
                  <strong>Afspraakaanvraag van pleeggezin</strong>

                  <p>
                    Het pleeggezin heeft deze afspraak aangevraagd. Keur de
                    afspraak goed als het moment past, of weiger als het niet
                    lukt.
                  </p>

                  <div className={styles.proposalActions}>
                    <button
                      type="button"
                      className={styles.declineProposalButton}
                      disabled={appointmentActionLoading}
                      onClick={() =>
                        handleUserRequestResponse("decline_request")
                      }
                    >
                      {appointmentActionLoading
                        ? "Bezig..."
                        : "Afspraak weigeren"}
                    </button>

                    <button
                      type="button"
                      className={styles.acceptProposalButton}
                      disabled={appointmentActionLoading}
                      onClick={() =>
                        handleUserRequestResponse("accept_request")
                      }
                    >
                      {appointmentActionLoading
                        ? "Bezig..."
                        : "Afspraak goedkeuren"}
                    </button>
                  </div>
                </div>
              )}

              {selectedAppointment.approval_status === "new_time_requested" && (
                <div className={styles.proposalPanel}>
                  <strong>Nieuw datumvoorstel van pleeggezin</strong>

                  <p>
                    {formatProposalDate(
                      selectedAppointment.proposed_new_start_at,
                      selectedAppointment.proposed_new_end_at
                    )}
                  </p>

                  <div className={styles.proposalActions}>
                    <button
                      type="button"
                      className={styles.declineProposalButton}
                      disabled={appointmentActionLoading}
                      onClick={() => handleProposalResponse("decline_proposal")}
                    >
                      {appointmentActionLoading
                        ? "Bezig..."
                        : "Voorstel weigeren"}
                    </button>

                    <button
                      type="button"
                      className={styles.acceptProposalButton}
                      disabled={appointmentActionLoading}
                      onClick={() => handleProposalResponse("accept_proposal")}
                    >
                      {appointmentActionLoading
                        ? "Bezig..."
                        : "Voorstel accepteren"}
                    </button>
                  </div>
                </div>
              )}

              {selectedAppointment.approval_status === "declined" && (
                <div className={styles.deletePanel}>
                  <p>
                    Deze afspraak werd geweigerd. Je kan de afspraak verwijderen
                    uit de agenda.
                  </p>

                  <button
                    type="button"
                    disabled={appointmentActionLoading}
                    onClick={handleDeleteAppointment}
                  >
                    {appointmentActionLoading
                      ? "Verwijderen..."
                      : "Afspraak verwijderen"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </AsielLayout>
  );
}