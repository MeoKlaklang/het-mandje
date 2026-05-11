"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createClient } from "@/lib/supabase/client";
import {
  getCalendarData,
  Appointment,
  Reminder,
} from "@/lib/calendar/getCalendarData";
import { createReminder } from "@/lib/calendar/createReminder";
import styles from "./kalender.module.css";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

const WEEK_DAYS = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
];

function getMonday(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);

  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("nl-BE", {
    month: "long",
    year: "numeric",
  });
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export default function KalenderPage() {
  const supabase = createClient();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [appointmentDescription, setAppointmentDescription] = useState("");

  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDescription, setReminderDescription] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderPriority, setReminderPriority] = useState<
    "normal" | "important"
  >("normal");

  const [loading, setLoading] = useState(false);

  const weekStart = getMonday(selectedDate);

  const weekDays = WEEK_DAYS.map((day, index) => ({
    name: day,
    date: addDays(weekStart, index),
  }));

  const monthDays = getDaysInMonth(selectedDate);
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const loadCalendar = async () => {
    const data = await getCalendarData();
    setAppointments(data.appointments);
    setReminders(data.reminders);
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  const handlePreviousWeek = () => {
    setSelectedDate(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    setSelectedDate(addDays(selectedDate, 7));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const handleCreateAppointment = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Je moet ingelogd zijn.");
      setLoading(false);
      return;
    }

    const startAt = new Date(`${appointmentDate}T${appointmentTime}`);
    const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

    const { error } = await supabase.from("appointments").insert({
      foster_id: user.id,
      veterinarian_id: null,
      animal_id: null,
      title: appointmentReason,
      description: appointmentDescription,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      status: "pending",
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Er ging iets mis bij het maken van je afspraak.");
      return;
    }

    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentReason("");
    setAppointmentDescription("");
    setAppointmentModalOpen(false);

    await loadCalendar();
  };

  const handleCreateReminder = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);

    const result = await createReminder({
      title: reminderTitle,
      description: reminderDescription,
      dueAt: reminderDate,
      priority: reminderPriority,
    });

    setLoading(false);

    if (!result.success) {
      alert("Er ging iets mis bij het maken van je herinnering.");
      return;
    }

    setReminderTitle("");
    setReminderDescription("");
    setReminderDate("");
    setReminderPriority("normal");
    setReminderModalOpen(false);

    await loadCalendar();
  };

  const getAppointmentStyle = (appointment: Appointment) => {
    const start = new Date(appointment.start_at);
    const end = new Date(appointment.end_at);

    const dayIndex = weekDays.findIndex((day) => isSameDay(day.date, start));

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const duration = Math.max(endHour - startHour, 0.5);

    const rowHeight = 70;
    const top = (startHour - 7) * rowHeight;
    const height = duration * rowHeight;

    return {
      left: `calc(60px + ((100% - 60px) / 7) * ${dayIndex} + 8px)`,
      top: `${top}px`,
      width: `calc((100% - 60px) / 7 - 16px)`,
      height: `${height}px`,
    };
  };

  const visibleAppointments = appointments.filter((appointment) => {
    const start = new Date(appointment.start_at);
    return weekDays.some((day) => isSameDay(day.date, start));
  });

  return (
    <>
      <DashboardNavbar />

      <main className={styles.page}>
        <div className={styles.layout}>
          <section className={styles.calendarSection}>
            <div className={styles.calendarHeader}>
              <div className={styles.monthNavigation}>
                <h1>{formatMonthYear(selectedDate)}</h1>

                <div className={styles.navButtons}>
                  <button type="button" onClick={handlePreviousWeek}>
                    ‹
                  </button>

                  <button
                    type="button"
                    className={styles.todayButton}
                    onClick={handleToday}
                  >
                    Vandaag
                  </button>

                  <button type="button" onClick={handleNextWeek}>
                    ›
                  </button>
                </div>
              </div>

              <button
                type="button"
                className={styles.createButton}
                onClick={() => setAppointmentModalOpen(true)}
              >
                + maak afspraak met dierenarts
              </button>
            </div>

            <div className={styles.calendarGrid}>
              <div className={styles.dayHeaders}>
                {weekDays.map((day) => (
                  <span key={day.name}>
                    {day.name}
                    <small>{day.date.getDate()}</small>
                  </span>
                ))}
              </div>

              <div className={styles.calendarBody}>
                {HOURS.map((hour) => (
                  <div key={hour} className={styles.hourRow}>
                    <span className={styles.hourLabel}>{hour}:00</span>
                  </div>
                ))}

                {visibleAppointments.map((appointment) => {
                  const start = new Date(appointment.start_at);
                  const end = new Date(appointment.end_at);

                  return (
                    <div
                      key={appointment.id}
                      className={
                        appointment.status === "confirmed"
                          ? styles.appointment
                          : styles.pendingAppointment
                      }
                      style={getAppointmentStyle(appointment)}
                    >
                      <div className={styles.appointmentStatus}>
                        {appointment.status === "confirmed" ? "✓" : "⏳"}
                      </div>

                      <p className={styles.appointmentLabel}>
                        {appointment.status === "confirmed"
                          ? "Afspraak bevestigd"
                          : "In afwachting"}
                      </p>

                      <h3>{appointment.title}</h3>

                      <p className={styles.appointmentTime}>
                        {start.toLocaleTimeString("nl-BE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {end.toLocaleTimeString("nl-BE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className={styles.sidebar}>
            <div className={styles.miniCalendar}>
              <div className={styles.miniCalendarHeader}>
                <button type="button" onClick={handlePreviousMonth}>
                  ‹
                </button>

                <h2>{formatMonthYear(selectedDate)}</h2>

                <button type="button" onClick={handleNextMonth}>
                  ›
                </button>
              </div>

              <div className={styles.miniWeekDays}>
                <span>MA</span>
                <span>DI</span>
                <span>WO</span>
                <span>DO</span>
                <span>VR</span>
                <span>ZA</span>
                <span>ZO</span>
              </div>

              <div className={styles.miniDays}>
                {Array.from({ length: monthDays }).map((_, index) => {
                  const dayDate = new Date(currentYear, currentMonth, index + 1);
                  const today = new Date();

                  const hasAppointment = appointments.some((appointment) =>
                    isSameDay(new Date(appointment.start_at), dayDate)
                  );

                  const isActive = isSameDay(dayDate, selectedDate);
                  const isToday = isSameDay(dayDate, today);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedDate(dayDate)}
                      className={isActive || isToday ? styles.activeDay : ""}
                    >
                      <span>{index + 1}</span>

                      {hasAppointment && (
                        <span
                          className={`${styles.eventDot} ${
                            isActive || isToday ? styles.eventDotActive : ""
                          }`}
                        ></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.remindersSection}>
              <div className={styles.remindersHeader}>
                <h2>Herinneringen</h2>
                <button type="button">View all</button>
              </div>

              <div className={styles.remindersList}>
                {reminders.length === 0 ? (
                  <div className={styles.reminderCard}>
                    <h3>Geen herinneringen</h3>
                    <p>Je hebt momenteel geen herinneringen.</p>
                  </div>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={
                        reminder.priority === "important"
                          ? styles.importantReminder
                          : styles.reminderCard
                      }
                    >
                      <h3>{reminder.title}</h3>

                      {reminder.priority === "important" && (
                        <p className={styles.importantText}>Belangrijk!</p>
                      )}

                      <p>{reminder.description}</p>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                className={styles.addReminder}
                onClick={() => setReminderModalOpen(true)}
              >
                +
              </button>
            </div>
          </aside>
        </div>

        {appointmentModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setAppointmentModalOpen(false)}
              >
                ×
              </button>

              <h2>Maak afspraak met dierenarts</h2>

              <form
                onSubmit={handleCreateAppointment}
                className={styles.modalForm}
              >
                <label>
                  Datum
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Tijd
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Reden van afspraak
                  <select
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    required
                  >
                    <option value="">Kies een reden</option>
                    <option value="Controle">Controle</option>
                    <option value="Vaccinatie">Vaccinatie</option>
                    <option value="Castratie / sterilisatie">
                      Castratie / sterilisatie
                    </option>
                    <option value="Medicatie">Medicatie</option>
                    <option value="Spoed of bezorgdheid">
                      Spoed of bezorgdheid
                    </option>
                    <option value="Andere reden">Andere reden</option>
                  </select>
                </label>

                <label>
                  Extra opmerking
                  <textarea
                    value={appointmentDescription}
                    onChange={(e) => setAppointmentDescription(e.target.value)}
                    placeholder="Schrijf hier extra informatie voor de dierenarts..."
                  />
                </label>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? "Afspraak maken..." : "Maak afspraak"}
                </button>
              </form>
            </div>
          </div>
        )}

        {reminderModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setReminderModalOpen(false)}
              >
                ×
              </button>

              <h2>Maak herinnering</h2>

              <form onSubmit={handleCreateReminder} className={styles.modalForm}>
                <label>
                  Titel
                  <input
                    type="text"
                    value={reminderTitle}
                    onChange={(e) => setReminderTitle(e.target.value)}
                    placeholder="Bijvoorbeeld: Medicatie geven"
                    required
                  />
                </label>

                <label>
                  Beschrijving
                  <textarea
                    value={reminderDescription}
                    onChange={(e) => setReminderDescription(e.target.value)}
                    placeholder="Schrijf hier wat je moet onthouden..."
                    required
                  />
                </label>

                <label>
                  Datum en tijd
                  <input
                    type="datetime-local"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    required
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

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? "Herinnering maken..." : "Maak herinnering"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}