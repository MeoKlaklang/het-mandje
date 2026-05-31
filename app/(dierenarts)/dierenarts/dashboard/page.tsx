"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DierenartsLayout from "@/components/dierenarts/DierenartsLayout";
import { getDierenartsDashboardData, DierenartsDashboardAppointment, DierenartsDashboardPatient, DierenartsDashboardProfile, DierenartsCalendarAppointment } from "@/lib/dierenarts/getDierenartsDashboardData";
import { getDierenartsTodos, DierenartsTodo } from "@/lib/dierenarts/getDierenartsTodos";
import { createDierenartsTodo } from "@/lib/dierenarts/createDierenartsTodo";
import { toggleDierenartsTodo } from "@/lib/dierenarts/toggleDierenartsTodo";
import styles from "./dashboard.module.css";

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
	return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
}

function getCalendarDays(currentMonth: Date) {
	const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

	const start = startOfWeek(firstDay);

	return Array.from({ length: 35 }, (_, index) => addDays(start, index));
}

function formatMonth(date: Date) {
	return date.toLocaleDateString("nl-BE", {
		month: "long",
		year: "numeric",
	});
}

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("nl-BE", {
		weekday: "long",
		day: "2-digit",
		month: "long",
	});
}

function formatTime(date: string) {
	return new Date(date).toLocaleTimeString("nl-BE", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function todayDate() {
	return new Date().toISOString().split("T")[0];
}

function getDoctorName(profile: DierenartsDashboardProfile | null) {
	if (!profile) return "Dierenarts";

	if (profile.last_name) return `Dr. ${profile.last_name}`;
	if (profile.first_name) return `Dr. ${profile.first_name}`;

	return "Dierenarts";
}

function getFosterName(appointment: DierenartsDashboardAppointment) {
	if (!appointment.fosterProfile) return "Pleeggezin onbekend";

	const firstName = appointment.fosterProfile.first_name || "";
	const lastName = appointment.fosterProfile.last_name || "";

	return `${firstName} ${lastName}`.trim() || "Pleeggezin onbekend";
}

export default function DierenartsDashboardPage() {
	const [profile, setProfile] = useState<DierenartsDashboardProfile | null>(null);
	const [todayAppointments, setTodayAppointments] = useState<DierenartsDashboardAppointment[]>([]);
	const [appointmentRequests, setAppointmentRequests] = useState<DierenartsDashboardAppointment[]>([]);
	const [calendarAppointments, setCalendarAppointments] = useState<DierenartsCalendarAppointment[]>([]);
	const [patients, setPatients] = useState<DierenartsDashboardPatient[]>([]);
	const [todos, setTodos] = useState<DierenartsTodo[]>([]);

	const [calendarMonth, setCalendarMonth] = useState(new Date());

	const [loading, setLoading] = useState(true);
	const [todoLoading, setTodoLoading] = useState(false);
	const [savingTodo, setSavingTodo] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const [todoModalOpen, setTodoModalOpen] = useState(false);
	const [todoTitle, setTodoTitle] = useState("");
	const [todoDescription, setTodoDescription] = useState("");
	const [todoDueDate, setTodoDueDate] = useState(todayDate());

	async function loadDashboard() {
		const [dashboardResult, todoResult] = await Promise.all([getDierenartsDashboardData(), getDierenartsTodos()]);

		setProfile(dashboardResult.profile);
		setTodayAppointments(dashboardResult.todayAppointments);
		setAppointmentRequests(dashboardResult.appointmentRequests);
		setCalendarAppointments(dashboardResult.calendarAppointments || []);
		setPatients(dashboardResult.patients);
		setTodos(todoResult.todos);

		setErrorMessage(dashboardResult.error || todoResult.error || "");
		setLoading(false);
	}

	async function reloadTodos() {
		setTodoLoading(true);

		const result = await getDierenartsTodos();

		if (result.error) {
			setErrorMessage(result.error);
		} else {
			setTodos(result.todos);
		}

		setTodoLoading(false);
	}

	useEffect(() => {
		loadDashboard();
	}, []);

	const calendarDays = useMemo(() => {
		return getCalendarDays(calendarMonth);
	}, [calendarMonth]);

	const previousMonth = () => {
		setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
	};

	const nextMonth = () => {
		setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
	};

	const handleCreateTodo = async () => {
		if (!todoTitle.trim()) {
			alert("Vul een titel in voor je todo.");
			return;
		}

		setSavingTodo(true);

		const result = await createDierenartsTodo({
			title: todoTitle,
			description: todoDescription,
			dueDate: todoDueDate,
		});

		setSavingTodo(false);

		if (!result.success) {
			alert(result.error);
			return;
		}

		setTodoTitle("");
		setTodoDescription("");
		setTodoDueDate(todayDate());
		setTodoModalOpen(false);

		await reloadTodos();
	};

	const handleToggleTodo = async (todo: DierenartsTodo) => {
		const result = await toggleDierenartsTodo(todo.id, !todo.is_done);

		if (!result.success) {
			alert(result.error);
			return;
		}

		setTodos((currentTodos) => currentTodos.map((item) => (item.id === todo.id ? { ...item, is_done: !item.is_done } : item)).sort((a, b) => Number(a.is_done) - Number(b.is_done)));
	};

	const today = new Date().toLocaleDateString("nl-BE", {
		weekday: "long",
		day: "2-digit",
		month: "long",
		year: "numeric",
	});

	return (
		<DierenartsLayout>
			<main className={styles.page}>
				{loading ? (
					<section className={styles.loadingCard}>
						<h1>Dashboard wordt geladen...</h1>
						<p>We halen je afspraken, patiënten en taken op.</p>
					</section>
				) : errorMessage ? (
					<section className={styles.loadingCard}>
						<h1>Er ging iets mis</h1>
						<p>{errorMessage}</p>
					</section>
				) : (
					<section className={styles.mainGrid}>
						<div className={styles.leftColumn}>
							<section className={styles.welcomeCard}>
								<div>
									<p className={styles.dateLabel}>{today}</p>
									<h1>
										Goedemorgen,
										<br />
										{getDoctorName(profile)}
									</h1>
								</div>
								<p>
									Er staan vandaag <strong>{todayAppointments.length} patiënten</strong> op de planning.
								</p>
								<Link href="/dierenarts/agenda" className={styles.agendaButton}>
									Bekijk agenda
								</Link>{" "}
							</section>

							<section className={styles.sectionBlock}>
								<div className={styles.sectionHeader}>
									<h2>Afspraak aanvragen</h2>
									<Link href="/dierenarts/agenda">Bekijk alles</Link>
								</div>

								{appointmentRequests.length === 0 ? (
									<div className={styles.emptyBox}>Er zijn momenteel geen nieuwe afspraakaanvragen.</div>
								) : (
									<div className={styles.requestGrid}>
										{appointmentRequests.slice(0, 3).map((request) => (
											<article key={request.id} className={styles.requestCard}>
												<div>
													<h3>{getFosterName(request)}</h3>
													<p>
														{request.description || request.title} · {request.animal?.name || "Dier onbekend"}
													</p>
												</div>

												<span>
													{formatDate(request.start_at)} om {formatTime(request.start_at)}
												</span>

												<div className={styles.requestActions}>
													<Link href="/dierenarts/agenda" className={styles.acceptButton}>
														Beoordelen
													</Link>

													<Link href="/dierenarts/agenda" className={styles.detailsButton}>
														Details
													</Link>
												</div>
											</article>
										))}
									</div>
								)}
							</section>

							<section className={styles.sectionBlock}>
								<div className={styles.sectionHeader}>
									<h2>Recente patiënten</h2>
									<Link href="/dierenarts/dieren">Bekijk alle dossiers</Link>
								</div>

								{patients.length === 0 ? (
									<div className={styles.emptyBox}>Er zijn nog geen patiënten gekoppeld aan dit dierenasiel.</div>
								) : (
									<div className={styles.patientList}>
										{patients.map((patient) => (
											<article key={patient.id} className={styles.patientItem}>
												<div className={styles.patientAvatar}>{patient.image_url ? <img src={patient.image_url} alt={patient.name} /> : patient.name.slice(0, 1)}</div>

												<div>
													<h3>{patient.name}</h3>
													<p>
														{patient.breed || patient.species || "Dier"} · {patient.status || "status onbekend"}
													</p>
												</div>

												<span>{patient.status || "Geen status"}</span>
											</article>
										))}
									</div>
								)}
							</section>
						</div>

						<aside className={styles.rightColumn}>
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
										const hasAppointment = calendarAppointments.some((appointment) => sameDay(new Date(appointment.start_at), day));

										const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();

										return (
											<button type="button" key={day.toISOString()} className={`${styles.calendarDay} ${sameDay(day, new Date()) ? styles.todayDay : ""} ${!isCurrentMonth ? styles.otherMonth : ""}`}>
												{day.getDate()}
												{hasAppointment && <span></span>}
											</button>
										);
									})}
								</div>
							</section>

							<section className={styles.todoCard}>
								<div className={styles.sectionHeader}>
									<h2>To do’s vandaag</h2>
									<button type="button" onClick={() => setTodoModalOpen(true)}>
										+ Toevoegen
									</button>
								</div>

								{todoLoading ? (
									<div className={styles.emptyBox}>Todo’s worden geladen...</div>
								) : todos.length === 0 ? (
									<div className={styles.emptyBox}>Geen todo’s voor vandaag.</div>
								) : (
									<div className={styles.todoList}>
										{todos.map((todo) => (
											<label key={todo.id} className={`${styles.todoItem} ${todo.is_done ? styles.todoDone : ""}`}>
												<input type="checkbox" checked={todo.is_done} onChange={() => handleToggleTodo(todo)} />

												<span>
													{todo.title}
													{todo.description && <small>{todo.description}</small>}
												</span>
											</label>
										))}
									</div>
								)}
							</section>
						</aside>
					</section>
				)}

				{todoModalOpen && (
					<div className={styles.modalOverlay}>
						<div className={styles.modal}>
							<button type="button" className={styles.closeModal} onClick={() => setTodoModalOpen(false)}>
								×
							</button>

							<div className={styles.modalHeader}>
								<p>Nieuwe taak</p>
								<h2>Todo toevoegen</h2>
							</div>

							<label>
								Titel
								<input type="text" value={todoTitle} onChange={(e) => setTodoTitle(e.target.value)} placeholder="Bijv. Dossier Demon aanvullen" />
							</label>

							<label>
								Datum
								<input type="date" value={todoDueDate} onChange={(e) => setTodoDueDate(e.target.value)} />
							</label>

							<label>
								Beschrijving
								<textarea value={todoDescription} onChange={(e) => setTodoDescription(e.target.value)} placeholder="Extra info over deze taak..." />
							</label>

							<div className={styles.modalActions}>
								<button type="button" className={styles.cancelButton} onClick={() => setTodoModalOpen(false)}>
									Annuleren
								</button>

								<button type="button" className={styles.saveButton} disabled={savingTodo} onClick={handleCreateTodo}>
									{savingTodo ? "Opslaan..." : "Todo opslaan"}
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</DierenartsLayout>
	);
}
