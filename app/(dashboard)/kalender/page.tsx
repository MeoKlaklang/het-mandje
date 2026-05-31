"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  getCalendarData,
  Appointment,
  Reminder,
} from "@/lib/calendar/getCalendarData";
import { createReminder } from "@/lib/calendar/createReminder";
import { updateReminderTodoStatus } from "@/lib/calendar/updateReminderTodoStatus";
import { respondToAppointment } from "@/lib/calendar/respondToAppointment";
import {
  getUserFosterAnimals,
  UserFosterAnimal,
} from "@/lib/calendar/getUserFosterAnimals";
import { createUserAppointmentRequest } from "@/lib/calendar/createUserAppointmentRequest";
import styles from "./kalender.module.css";

const hours = Array.from({ length: 14 }, (_, index) => index + 7);
const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

type AppointmentTarget = "shelter" | "veterinarian";

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

function formatInputDate(date: Date) {
  return date.toISOString().split("T")[0];
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
  if (status === "pending_user_approval") return "Wacht op jouw goedkeuring";
  if (status === "pending_shelter_approval")
    return "Wacht op goedkeuring asiel";
  if (status === "pending_veterinarian_approval")
    return "Wacht op goedkeuring dierenarts";
  if (status === "confirmed") return "Bevestigd";
  if (status === "declined") return "Geweigerd";
  if (status === "new_time_requested") return "Nieuw voorstel verzonden";
  return "Bevestigd";
}

function getApprovalClass(status: string | null) {
  if (status === "pending_user_approval") return styles.pendingStatus;
  if (status === "pending_shelter_approval") return styles.pendingStatus;
  if (status === "pending_veterinarian_approval") return styles.pendingStatus;
  if (status === "declined") return styles.declinedStatus;
  if (status === "new_time_requested") return styles.requestStatus;
  return styles.confirmedStatus;
}

function shouldShowAppointmentForUser(appointment: Appointment) {
  if (appointment.approval_status === "declined") return false;
  if (appointment.status === "cancelled") return false;

  return true;
}

function getDisplayStartAt(appointment: Appointment) {
  if (
    appointment.approval_status === "new_time_requested" &&
    appointment.proposed_new_start_at
  ) {
    return appointment.proposed_new_start_at;
  }

  return appointment.start_at;
}

function getDisplayEndAt(appointment: Appointment) {
  if (
    appointment.approval_status === "new_time_requested" &&
    appointment.proposed_new_end_at
  ) {
    return appointment.proposed_new_end_at;
  }

  return appointment.end_at;
}

function formatProposalDate(startAt: string | null, endAt: string | null) {
  if (!startAt || !endAt) return "Geen nieuw voorstel gevonden";

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

function isTodoCompleted(reminder: Reminder) {
  return reminder.status === "done";
}

function shouldShowTodo(reminder: Reminder) {
  if (!isTodoCompleted(reminder)) return true;

  if (!reminder.completed_at) return true;

  const completedAt = new Date(reminder.completed_at).getTime();
  const now = new Date().getTime();
  const hoursPassed = (now - completedAt) / 1000 / 60 / 60;

  return hoursPassed < 24;
}

function sortTodos(a: Reminder, b: Reminder) {
  const aDone = isTodoCompleted(a);
  const bDone = isTodoCompleted(b);

  if (!aDone && bDone) return -1;
  if (aDone && !bDone) return 1;

  return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
}

function formatTodoDate(date: string | null) {
  if (!date) return "Geen datum";

  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "short",
  });
}

function getAppointmentAnimal(appointment: Appointment) {
  const animal = Array.isArray(appointment.animals)
    ? appointment.animals[0]
    : appointment.animals;

  return animal || null;
}

function getAppointmentShelter(appointment: Appointment) {
  const shelter = Array.isArray(appointment.shelters)
    ? appointment.shelters[0]
    : appointment.shelters;

  return shelter || null;
}

export default function KalenderPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [fosterAnimals, setFosterAnimals] = useState<UserFosterAnimal[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [loading, setLoading] = useState(true);

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [savingAppointment, setSavingAppointment] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const [responding, setResponding] = useState(false);

  const [selectedFosterAnimal, setSelectedFosterAnimal] =
    useState<UserFosterAnimal | null>(null);

  const [appointmentDate, setAppointmentDate] = useState(
    formatInputDate(new Date())
  );
  const [appointmentStartTime, setAppointmentStartTime] = useState("09:00");
  const [appointmentEndTime, setAppointmentEndTime] = useState("10:00");
  const [appointmentType, setAppointmentType] = useState("algemeen");
  const [appointmentTarget, setAppointmentTarget] =
    useState<AppointmentTarget>("shelter");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [appointmentDescription, setAppointmentDescription] = useState("");

  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDescription, setReminderDescription] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderPriority, setReminderPriority] = useState<
    "normal" | "important"
  >("normal");

  const [responseMessage, setResponseMessage] = useState("");
  const [proposalDate, setProposalDate] = useState("");
  const [proposalStartTime, setProposalStartTime] = useState("09:00");
  const [proposalEndTime, setProposalEndTime] = useState("10:00");

  async function loadCalendar() {
    setLoading(true);

    const [calendarData, animalData] = await Promise.all([
      getCalendarData(),
      getUserFosterAnimals(),
    ]);

    setAppointments(calendarData.appointments);
    setReminders(calendarData.reminders);
    setFosterAnimals(animalData.animals);

    setLoading(false);
  }

  useEffect(() => {
    loadCalendar();
  }, []);

  const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [weekStart]);

  const calendarDays = useMemo(() => {
    return getCalendarDays(calendarMonth);
  }, [calendarMonth]);

  const visibleAppointments = useMemo(() => {
    return appointments.filter(shouldShowAppointmentForUser);
  }, [appointments]);

  const visibleTodos = useMemo(() => {
    return reminders.filter(shouldShowTodo).sort(sortTodos);
  }, [reminders]);

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

  const resetAppointmentForm = () => {
    setSelectedFosterAnimal(null);
    setAppointmentDate(formatInputDate(new Date()));
    setAppointmentStartTime("09:00");
    setAppointmentEndTime("10:00");
    setAppointmentType("algemeen");
    setAppointmentTarget("shelter");
    setAppointmentReason("");
    setAppointmentDescription("");
  };

  const handleCreateAppointment = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!selectedFosterAnimal) {
      alert("Kies eerst voor welk dier je een afspraak wilt maken.");
      return;
    }

    if (!appointmentReason.trim()) {
      alert("Vul een reden of titel in.");
      return;
    }

    if (!appointmentDate || !appointmentStartTime || !appointmentEndTime) {
      alert("Vul datum, startuur en einduur in.");
      return;
    }

    setSavingAppointment(true);

    const result = await createUserAppointmentRequest({
      animalId: selectedFosterAnimal.animalId,
      shelterId: selectedFosterAnimal.shelterId,
      title: appointmentReason,
      description: appointmentDescription,
      date: appointmentDate,
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      appointmentType,
      appointmentTarget,
    });

    setSavingAppointment(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    resetAppointmentForm();
    setAppointmentModalOpen(false);

    await loadCalendar();
  };

  const handleCreateReminder = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!reminderTitle.trim() || !reminderDate) {
      alert("Vul een titel en datum in.");
      return;
    }

    setSavingReminder(true);

    const result = await createReminder({
      title: reminderTitle,
      description: reminderDescription,
      dueAt: reminderDate,
      priority: reminderPriority,
    });

    setSavingReminder(false);

    if (!result.success) {
      alert("Er ging iets mis bij het maken van je todo.");
      return;
    }

    setReminderTitle("");
    setReminderDescription("");
    setReminderDate("");
    setReminderPriority("normal");
    setReminderModalOpen(false);

    await loadCalendar();
  };

  const handleToggleTodo = async (reminder: Reminder) => {
    const completed = !isTodoCompleted(reminder);

    const result = await updateReminderTodoStatus({
      reminderId: reminder.id,
      completed,
    });

    if (!result.success) {
      alert(result.error || "Todo kon niet aangepast worden.");
      return;
    }

    await loadCalendar();
  };

  const handleAppointmentResponse = async (
    action: "confirmed" | "declined" | "new_time_requested"
  ) => {
    if (!selectedAppointment) return;

    setResponding(true);

    const result = await respondToAppointment({
      appointmentId: selectedAppointment.id,
      action,
      responseMessage,
      proposedNewDate: proposalDate,
      proposedNewStartTime: proposalStartTime,
      proposedNewEndTime: proposalEndTime,
    });

    setResponding(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    setResponseMessage("");
    setProposalDate("");
    setProposalStartTime("09:00");
    setProposalEndTime("10:00");
    setSelectedAppointment(null);

    await loadCalendar();
  };

  return (
    <>
      <DashboardNavbar />

      <main className={styles.page}>
        <div className={styles.wrapper}>
          <section className={styles.header}>
            <div>
              <h1>Kalender</h1>
              <p>
                Bekijk je afspraken, voorgestelde momenten en persoonlijke
                todo’s.
              </p>
            </div>

            <button
              type="button"
              className={styles.createButton}
              onClick={() => setAppointmentModalOpen(true)}
            >
              + Nieuwe afspraak
            </button>
          </section>

          {loading ? (
            <section className={styles.messageCard}>
              <h2>Kalender wordt geladen...</h2>
              <p>We halen je afspraken en todo’s op.</p>
            </section>
          ) : (
            <section className={styles.calendarLayout}>
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
                    const dayAppointments = visibleAppointments.filter(
                      (appointment) =>
                        sameDay(new Date(getDisplayStartAt(appointment)), day)
                    );

                    return (
                      <div key={day.toISOString()} className={styles.dayColumn}>
                        {hours.map((hour) => (
                          <div key={hour} className={styles.hourLine}></div>
                        ))}

                        {dayAppointments.map((appointment) => {
                          const animal = getAppointmentAnimal(appointment);
                          const shelter = getAppointmentShelter(appointment);

                          return (
                            <button
                              key={appointment.id}
                              type="button"
                              className={styles.appointmentBlock}
                              style={{
                                top: `${getAppointmentTop(
                                  getDisplayStartAt(appointment)
                                )}px`,
                                height: `${getAppointmentHeight(
                                  getDisplayStartAt(appointment),
                                  getDisplayEndAt(appointment)
                                )}px`,
                              }}
                              onClick={() =>
                                setSelectedAppointment(appointment)
                              }
                            >
                              <span className={styles.appointmentTime}>
                                {formatTime(getDisplayStartAt(appointment))} -{" "}
                                {formatTime(getDisplayEndAt(appointment))}
                              </span>

                              <strong>{appointment.title}</strong>

                              <p>
                                {animal?.name ||
                                  shelter?.name ||
                                  "Persoonlijke afspraak"}
                              </p>

                              <span
                                className={`${styles.statusDot} ${getApprovalClass(
                                  appointment.approval_status
                                )}`}
                              ></span>
                            </button>
                          );
                        })}
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
                      const hasAppointment = visibleAppointments.some(
                        (appointment) =>
                          sameDay(
                            new Date(getDisplayStartAt(appointment)),
                            day
                          )
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
                            setAppointmentDate(formatInputDate(day));
                          }}
                        >
                          {day.getDate()}
                          {hasAppointment && <span></span>}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className={styles.todoCard}>
                  <div className={styles.todoHeader}>
                    <div>
                      <h2>To do</h2>
                      <p>Persoonlijke taken en herinneringen.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReminderModalOpen(true)}
                    >
                      + Toevoegen
                    </button>
                  </div>

                  {visibleTodos.length === 0 ? (
                    <div className={styles.emptyToday}>
                      Geen todo’s gepland.
                    </div>
                  ) : (
                    <div className={styles.todoList}>
                      {visibleTodos.map((todo) => {
                        const completed = isTodoCompleted(todo);

                        return (
                          <article
                            key={todo.id}
                            className={`${styles.todoItem} ${
                              completed ? styles.todoItemDone : ""
                            }`}
                          >
                            <button
                              type="button"
                              className={`${styles.todoCheck} ${
                                completed ? styles.todoCheckDone : ""
                              }`}
                              onClick={() => handleToggleTodo(todo)}
                              aria-label="Todo afvinken"
                            >
                              {completed ? "✓" : ""}
                            </button>

                            <div>
                              <div className={styles.todoTitleRow}>
                                <h3>{todo.title}</h3>

                                {todo.priority === "important" && (
                                  <span className={styles.todoPriority}>
                                    Belangrijk
                                  </span>
                                )}
                              </div>

                              {todo.description && <p>{todo.description}</p>}

                              <small>{formatTodoDate(todo.due_at)}</small>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </aside>
            </section>
          )}
        </div>

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

              {(() => {
                const animal = getAppointmentAnimal(selectedAppointment);

                if (!animal) return null;

                return (
                  <div className={styles.detailAnimal}>
                    <img
                      src={animal.image_url || "/images/dog3.jpg"}
                      alt={animal.name}
                    />

                    <div>
                      <h3>{animal.name}</h3>
                      <p>{animal.breed || animal.species || "Dier"}</p>
                    </div>
                  </div>
                );
              })()}

              <div className={styles.detailGrid}>
                <p>
                  <strong>Datum</strong>
                  <span>
                    {formatDate(getDisplayStartAt(selectedAppointment))}
                  </span>
                </p>

                <p>
                  <strong>Uur</strong>
                  <span>
                    {formatTime(getDisplayStartAt(selectedAppointment))} -{" "}
                    {formatTime(getDisplayEndAt(selectedAppointment))}
                  </span>
                </p>

                <p>
                  <strong>Aangemaakt door</strong>
                  <span>
                    {selectedAppointment.created_by ||
                      getAppointmentShelter(selectedAppointment)?.name ||
                      "Onbekend"}
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

              {selectedAppointment.approval_status ===
                "pending_user_approval" && (
                <div className={styles.responseBox}>
                  <h3>Reageer op deze afspraak</h3>

                  <label>
                    Bericht optioneel
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder="Bijv. Dat past voor mij, tot dan!"
                    />
                  </label>

                  <div className={styles.responseActions}>
                    <button
                      type="button"
                      className={styles.declineButton}
                      disabled={responding}
                      onClick={() => handleAppointmentResponse("declined")}
                    >
                      Weigeren
                    </button>

                    <button
                      type="button"
                      className={styles.confirmButton}
                      disabled={responding}
                      onClick={() => handleAppointmentResponse("confirmed")}
                    >
                      Bevestigen
                    </button>
                  </div>

                  <div className={styles.proposalBox}>
                    <h4>Nieuwe datum voorstellen</h4>

                    <div className={styles.formGrid}>
                      <label>
                        Datum
                        <input
                          type="date"
                          value={proposalDate}
                          onChange={(e) => setProposalDate(e.target.value)}
                        />
                      </label>

                      <label>
                        Startuur
                        <input
                          type="time"
                          value={proposalStartTime}
                          onChange={(e) =>
                            setProposalStartTime(e.target.value)
                          }
                        />
                      </label>
                    </div>

                    <label>
                      Einduur
                      <input
                        type="time"
                        value={proposalEndTime}
                        onChange={(e) => setProposalEndTime(e.target.value)}
                      />
                    </label>

                    <button
                      type="button"
                      className={styles.proposalButton}
                      disabled={responding}
                      onClick={() =>
                        handleAppointmentResponse("new_time_requested")
                      }
                    >
                      Nieuw voorstel verzenden
                    </button>
                  </div>
                </div>
              )}

              {selectedAppointment.approval_status ===
                "pending_shelter_approval" && (
                <div className={styles.proposalWaitingBox}>
                  <h3>Afspraak aangevraagd</h3>

                  <p>
                    Je hebt deze afspraak aangevraagd bij het dierenasiel.
                    Wacht tot het asiel je voorstel goedkeurt of weigert.
                  </p>

                  <div className={styles.proposalDateBox}>
                    <strong>Voorgesteld moment</strong>
                    <span>
                      {formatDate(selectedAppointment.start_at)} ·{" "}
                      {formatTime(selectedAppointment.start_at)} -{" "}
                      {formatTime(selectedAppointment.end_at)}
                    </span>
                  </div>
                </div>
              )}

              {selectedAppointment.approval_status ===
                "pending_veterinarian_approval" && (
                <div className={styles.proposalWaitingBox}>
                  <h3>Dierenartsafspraak aangevraagd</h3>

                  <p>
                    Je hebt deze afspraak aangevraagd bij de dierenarts. Wacht
                    tot de dierenarts je voorstel goedkeurt of weigert.
                  </p>

                  <div className={styles.proposalDateBox}>
                    <strong>Voorgesteld moment</strong>
                    <span>
                      {formatDate(selectedAppointment.start_at)} ·{" "}
                      {formatTime(selectedAppointment.start_at)} -{" "}
                      {formatTime(selectedAppointment.end_at)}
                    </span>
                  </div>
                </div>
              )}

              {selectedAppointment.approval_status ===
                "new_time_requested" && (
                <div className={styles.proposalWaitingBox}>
                  <h3>Nieuw voorstel verzonden</h3>

                  <p>
                    Je hebt een nieuwe datum voorgesteld voor deze afspraak. De
                    andere partij moet dit voorstel nog goedkeuren.
                  </p>

                  <div className={styles.proposalDateBox}>
                    <strong>Jouw voorgestelde moment</strong>
                    <span>
                      {formatProposalDate(
                        selectedAppointment.proposed_new_start_at,
                        selectedAppointment.proposed_new_end_at
                      )}
                    </span>
                  </div>
                </div>
              )}

              {selectedAppointment.response_message && (
                <div className={styles.detailResponse}>
                  <strong>Jouw reactie</strong>
                  <p>{selectedAppointment.response_message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {appointmentModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeModal}
                onClick={() => {
                  resetAppointmentForm();
                  setAppointmentModalOpen(false);
                }}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe afspraak</p>
                <h2>Afspraak aanvragen</h2>
              </div>

              <form onSubmit={handleCreateAppointment} className={styles.form}>
                <label>
                  Voor welk dier?
                  <select
                    value={selectedFosterAnimal?.animalId || ""}
                    onChange={(e) => {
                      const animal =
                        fosterAnimals.find(
                          (item) => item.animalId === e.target.value
                        ) || null;

                      setSelectedFosterAnimal(animal);
                    }}
                  >
                    <option value="">Kies een opvangdier</option>

                    {fosterAnimals.map((animal) => (
                      <option key={animal.animalId} value={animal.animalId}>
                        {animal.animalName}
                        {animal.shelterName
                          ? ` — ${animal.shelterName}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedFosterAnimal && (
                  <div className={styles.selectedAnimalBox}>
                    <img
                      src={
                        selectedFosterAnimal.animalImageUrl ||
                        "/images/dog3.jpg"
                      }
                      alt={selectedFosterAnimal.animalName}
                    />

                    <div>
                      <h3>{selectedFosterAnimal.animalName}</h3>
                      <p>
                        {selectedFosterAnimal.animalBreed ||
                          selectedFosterAnimal.animalSpecies ||
                          "Dier"}
                      </p>

                      <span>
                        Wordt gestuurd naar:{" "}
                        {appointmentTarget === "veterinarian"
                          ? "Dierenarts van het gekoppelde asiel"
                          : selectedFosterAnimal.shelterName || "Dierenasiel"}
                      </span>
                    </div>
                  </div>
                )}

                <label>
                  Afspraak aanvragen bij
                  <select
                    value={appointmentTarget}
                    onChange={(e) =>
                      setAppointmentTarget(e.target.value as AppointmentTarget)
                    }
                  >
                    <option value="shelter">Dierenasiel</option>
                    <option value="veterinarian">Dierenarts</option>
                  </select>
                </label>

                <label>
                  Titel / reden
                  <input
                    type="text"
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    placeholder={
                      appointmentTarget === "veterinarian"
                        ? "Bijv. Controle, vaccinatie of medisch advies"
                        : "Bijv. Vraag over verzorging"
                    }
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
                      <option value="algemeen">Algemeen</option>
                      <option value="opvolging">Opvolging</option>
                      <option value="verzorging">Verzorging</option>
                      <option value="medicatie">Medicatie</option>
                      <option value="controle">Controle</option>
                      <option value="vaccinatie">Vaccinatie</option>
                      <option value="dierenarts">Dierenarts</option>
                      <option value="terugbrengmoment">Terugbrengmoment</option>
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
                  Beschrijving
                  <textarea
                    value={appointmentDescription}
                    onChange={(e) => setAppointmentDescription(e.target.value)}
                    placeholder="Extra informatie over je afspraak..."
                  />
                </label>

                <div className={styles.infoNotice}>
                  {appointmentTarget === "veterinarian"
                    ? "Deze afspraak wordt als verzoek naar de dierenarts gestuurd. De dierenarts moet je voorstel eerst goedkeuren."
                    : "Deze afspraak wordt als verzoek naar het dierenasiel gestuurd. Het asiel moet je voorstel eerst goedkeuren."}
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                      resetAppointmentForm();
                      setAppointmentModalOpen(false);
                    }}
                  >
                    Annuleren
                  </button>

                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={savingAppointment}
                  >
                    {savingAppointment ? "Verzenden..." : "Afspraak aanvragen"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {reminderModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeModal}
                onClick={() => setReminderModalOpen(false)}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <p>Nieuwe todo</p>
                <h2>Todo toevoegen</h2>
              </div>

              <form onSubmit={handleCreateReminder} className={styles.form}>
                <label>
                  Titel
                  <input
                    type="text"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    placeholder="Bijv. Medicatie geven"
                  />
                </label>

                <label>
                  Datum
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                  />
                </label>

                <label>
                  Prioriteit
                  <select
                    value={reminderPriority}
                    onChange={(e) =>
                      setReminderPriority(
                        e.target.value as "normal" | "important"
                      )
                    }
                  >
                    <option value="normal">Normaal</option>
                    <option value="important">Belangrijk</option>
                  </select>
                </label>

                <label>
                  Beschrijving
                  <textarea
                    value={reminderDescription}
                    onChange={(e) => setReminderDescription(e.target.value)}
                    placeholder="Extra info over deze todo..."
                  />
                </label>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setReminderModalOpen(false)}
                  >
                    Annuleren
                  </button>

                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={savingReminder}
                  >
                    {savingReminder ? "Opslaan..." : "Todo opslaan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}