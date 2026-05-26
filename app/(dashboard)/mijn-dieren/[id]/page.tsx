"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createClient } from "@/lib/supabase/client";
import { getMyAnimalApplicationById, MyAnimalApplicationDetail } from "@/lib/animals/getMyAnimalApplicationById";
import styles from "./mijn-dier-detail.module.css";

function getGenderIcon(gender: string | null) {
	if (!gender) return "⚪";
	if (gender.toLowerCase() === "mannelijk") return "♂";
	if (gender.toLowerCase() === "vrouwelijk") return "♀";
	return "⚪";
}

function formatAddress(application: MyAnimalApplicationDetail) {
	const animal = application.animals;
	const shelter = animal?.shelters;

	if (!animal) return "";

	if (!shelter) {
		return [animal.postal_code, animal.city].filter(Boolean).join(" ");
	}

	return [shelter.street, shelter.house_number, shelter.postal_code, shelter.city].filter(Boolean).join(" ");
}

function getStatusLabel(status: string | null) {
	if (status === "goedgekeurd") return "Goedgekeurd";
	if (status === "afgewezen") return "Niet goedgekeurd";
	return "In afwachting";
}

function getStatusIcon(status: string | null) {
	if (status === "goedgekeurd") return "✓";
	if (status === "afgewezen") return "×";
	return "⏳";
}

function getStatusText(status: string | null, animalName: string) {
	if (status === "goedgekeurd") {
		return `Je aanvraag is goedgekeurd. Je mag ${animalName} tijdelijk opvangen en updates opvolgen.`;
	}

	if (status === "afgewezen") {
		return `Deze aanvraag werd niet goedgekeurd. Het dierenasiel zoekt een andere match voor ${animalName}.`;
	}

	return `Het dierenasiel bekijkt momenteel of ${animalName} goed bij jouw situatie past.`;
}

function getStatusClass(status: string | null) {
	if (status === "goedgekeurd") return styles.statusApprovedCard;
	if (status === "afgewezen") return styles.statusRejectedCard;
	return styles.statusPendingCard;
}

function getBooleanLabel(value: boolean | null, label: string) {
	return {
		label,
		active: value === true,
	};
}

function getNights(start: string | null, end: string | null) {
	if (!start || !end) return null;

	const startDate = new Date(start);
	const endDate = new Date(end);
	const diff = endDate.getTime() - startDate.getTime();
	const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));

	return nights > 0 ? nights : null;
}

function formatShortDate(date: string | null) {
	if (!date) return "";

	return new Date(date).toLocaleDateString("nl-BE", {
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
	});
}

function todayDateKey() {
	return new Date().toISOString().split("T")[0];
}

function isSameDay(a: Date, b: Date) {
	return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function isBetween(date: Date, start: Date, end: Date) {
	const current = new Date(date);
	current.setHours(0, 0, 0, 0);

	const startCopy = new Date(start);
	startCopy.setHours(0, 0, 0, 0);

	const endCopy = new Date(end);
	endCopy.setHours(0, 0, 0, 0);

	return current >= startCopy && current <= endCopy;
}

function buildCalendarDays(currentMonth: Date) {
	const year = currentMonth.getFullYear();
	const month = currentMonth.getMonth();

	const firstDay = new Date(year, month, 1);
	const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

	const calendarStart = new Date(firstDay);
	calendarStart.setDate(firstDay.getDate() - startOffset);

	return Array.from({ length: 35 }).map((_, index) => {
		const date = new Date(calendarStart);
		date.setDate(calendarStart.getDate() + index);
		return date;
	});
}

function formatMonth(date: Date) {
	return date.toLocaleDateString("nl-BE", {
		month: "long",
		year: "numeric",
	});
}

export default function MijnDierDetailPage() {
	const params = useParams<{ id: string }>();
	const applicationId = params.id;
	const supabase = createClient();

	const [application, setApplication] = useState<MyAnimalApplicationDetail | null>(null);

	const [loading, setLoading] = useState(true);
	const [calendarMonth, setCalendarMonth] = useState(new Date());

	const [noteModalOpen, setNoteModalOpen] = useState(false);
	const [noteTitle, setNoteTitle] = useState("");
	const [noteContent, setNoteContent] = useState("");
	const [noteSaving, setNoteSaving] = useState(false);

	const [givenMedicationIds, setGivenMedicationIds] = useState<string[]>([]);
	const [medicationSavingId, setMedicationSavingId] = useState<string | null>(null);

	async function loadMedicationAdministrations(medicationIds: string[]) {
		if (medicationIds.length === 0) return;

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) return;

		const { data, error } = await supabase.from("medication_administrations").select("medication_id").eq("user_id", user.id).eq("given_on", todayDateKey()).in("medication_id", medicationIds);

		if (error) {
			console.error("Fout bij ophalen medicatie-afvinkingen:", error);
			return;
		}

		setGivenMedicationIds((data || []).map((item) => item.medication_id));
	}

	async function loadApplication() {
		setLoading(true);

		const { application } = await getMyAnimalApplicationById(applicationId);

		setApplication(application);

		const animal = application?.animals;
		const startDate = application?.start_date || animal?.available_from || null;

		if (startDate) {
			setCalendarMonth(new Date(startDate));
		}

		setLoading(false);

		if (application?.animal_medications?.length) {
			await loadMedicationAdministrations(application.animal_medications.map((medication) => medication.id));
		}
	}

	useEffect(() => {
		loadApplication();
	}, [applicationId]);

	const images = useMemo(() => {
		if (!application?.animals) return [];

		const animal = application.animals;

		const extraImages = [...(animal.animal_images || [])].sort((a, b) => Number(a.image_order || 0) - Number(b.image_order || 0)).map((image) => image.image_url);

		return extraImages.length ? extraImages : [animal.image_url || "/images/dog3.jpg"];
	}, [application]);

	const visibleNotes = useMemo(() => {
		return (application?.animal_notes || []).slice(0, 3);
	}, [application]);

	const visibleMedications = useMemo(() => {
		return (application?.animal_medications || []).slice(0, 3);
	}, [application]);

	const calendarDays = useMemo(() => {
		return buildCalendarDays(calendarMonth);
	}, [calendarMonth]);

	const previousMonth = () => {
		setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
	};

	const nextMonth = () => {
		setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
	};

	const handleCreateNote = async () => {
		if (!application?.animals) return;

		if (!noteTitle.trim()) {
			alert("Vul een titel in.");
			return;
		}

		if (!noteContent.trim()) {
			alert("Schrijf eerst een notitie.");
			return;
		}

		if (application.status !== "goedgekeurd") {
			alert("Je kan pas een notitie toevoegen wanneer je aanvraag is goedgekeurd.");
			return;
		}

		setNoteSaving(true);

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			setNoteSaving(false);
			alert("Je bent niet ingelogd.");
			return;
		}

		const { error } = await supabase.from("animal_notes").insert({
			animal_id: application.animals.id,
			application_id: application.id,
			created_by: user.id,
			created_by_name: "Pleeggezin",
			created_by_role: "pleeggezin",
			title: noteTitle,
			content: noteContent,
			visible_to_foster: true,
		});

		setNoteSaving(false);

		if (error) {
			alert(error.message);
			return;
		}

		setNoteTitle("");
		setNoteContent("");
		setNoteModalOpen(false);

		await loadApplication();
	};

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
			const { error } = await supabase.from("medication_administrations").delete().eq("user_id", user.id).eq("medication_id", medicationId).eq("given_on", todayDateKey());

			setMedicationSavingId(null);

			if (error) {
				alert(error.message);
				return;
			}

			setGivenMedicationIds((current) => current.filter((id) => id !== medicationId));

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
					<p>Dier wordt geladen...</p>
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
	const shelter = animal.shelters;

	const startDate = application.start_date ? new Date(application.start_date) : animal.available_from ? new Date(animal.available_from) : null;

	const endDate = application.end_date ? new Date(application.end_date) : animal.available_until ? new Date(animal.available_until) : null;

	const nights = getNights(application.start_date || animal.available_from, application.end_date || animal.available_until);

	const qualities = [
		getBooleanLabel(animal.vaccinated, "Gevaccineerd"),
		getBooleanLabel(animal.neutered, "Gecastreerd"),
		getBooleanLabel(animal.can_live_with_cats, "Kan bij katten?"),
		getBooleanLabel(animal.can_live_with_children, "Kan bij kinderen?"),
		getBooleanLabel(animal.can_be_home_alone, "Kan alleen thuis zijn?"),
		getBooleanLabel(animal.can_live_with_dogs, "Kan bij honden?"),
	];

	return (
		<>
			<DashboardNavbar />

			<main className={styles.page}>
				<div className={styles.container}>
					<section className={styles.leftColumn}>
						<Link href="/mijn-dieren" className={styles.backLink}>
							⟵ Terug naar mijn dieren
						</Link>

						<div className={styles.gallery}>
							<div className={styles.largeImage}>
								<img src={images[0] || "/images/dog3.jpg"} alt={animal.name} />

								<div className={`${styles.statusOverlay} ${getStatusClass(application.status)}`}>
									<span>{getStatusIcon(application.status)}</span>
									{getStatusLabel(application.status)}
								</div>
							</div>

							<div className={styles.wideImage}>
								<img src={images[1] || images[0] || "/images/dog3.jpg"} alt="" />
							</div>

							<div className={styles.smallImage}>
								<img src={images[2] || images[0] || "/images/dog3.jpg"} alt="" />
							</div>

							<div className={styles.smallImage}>
								<img src={images[3] || images[0] || "/images/dog3.jpg"} alt="" />
							</div>
						</div>

						<h1>{animal.name}</h1>

						<p className={styles.shelterName}>{shelter?.name || "Dierenasiel onbekend"}</p>

						<div className={`${styles.statusCard} ${getStatusClass(application.status)}`}>
							<div className={styles.statusIcon}>{getStatusIcon(application.status)}</div>

							<div>
								<span>Aanvraagstatus</span>
								<h2>{getStatusLabel(application.status)}</h2>
								<p>{getStatusText(application.status, animal.name)}</p>
							</div>
						</div>

						<section className={styles.infoSection}>
							<h2>Algemeen</h2>

							<div className={styles.infoGrid}>
								<div className={styles.infoItem}>
									<span className={styles.blueIcon}>{getGenderIcon(animal.gender)}</span>
									<p>{animal.gender || "Onbekend"}</p>
								</div>

								<div className={styles.infoItem}>
									<span className={styles.pinkIcon}>🎂</span>
									<p>{animal.age || "Onbekend"}</p>
								</div>

								<div className={styles.infoItemWide}>
									<span className={styles.redIcon}>📍</span>
									<p>{formatAddress(application)}</p>
								</div>

								<div className={styles.infoItem}>
									<span className={styles.greenIcon}>🐾</span>
									<p>{animal.breed || animal.species}</p>
								</div>

								<div className={styles.infoItem}>
									<span className={styles.yellowIcon}>↗</span>
									<p>{animal.size || "Onbekend"}</p>
								</div>
							</div>

							<div className={styles.qualitiesGrid}>
								{qualities.map((quality) => (
									<div key={quality.label} className={styles.qualityItem}>
										<span>{quality.active ? "✓" : "×"}</span>
										<p>{quality.label}</p>
									</div>
								))}
							</div>
						</section>

						<section className={styles.notesSection}>
							<div className={styles.sectionHeader}>
								<h2>Notities</h2>

								{(application.animal_notes || []).length > 3 && <Link href={`/mijn-dieren/${application.id}/notities`}>Bekijk alle notities</Link>}
							</div>

							{visibleNotes.length === 0 ? (
								<p className={styles.emptyText}>Nog geen notities.</p>
							) : (
								<div className={styles.notesList}>
									{visibleNotes.map((note) => (
										<article key={note.id} className={styles.noteCard}>
											<div className={styles.noteDate}>{formatShortDate((note as any).created_at)}</div>

											<h3>{note.title}</h3>
											<p>{note.content}</p>
											<strong>{note.created_by_name || "Onbekend"}</strong>
										</article>
									))}
								</div>
							)}

							{application.status === "goedgekeurd" && (
								<button type="button" className={styles.addNoteFloating} onClick={() => setNoteModalOpen(true)} aria-label="Notitie toevoegen">
									+
								</button>
							)}
						</section>

						<section className={styles.medicationSection}>
							<div className={styles.sectionHeader}>
								<h2>Medicatie</h2>

								{(application.animal_medications || []).length > 3 && <Link href={`/mijn-dieren/${application.id}/medicatie`}>Bekijk alle medicatie</Link>}
							</div>

							{visibleMedications.length === 0 ? (
								<p className={styles.emptyText}>Geen medicatie toegevoegd.</p>
							) : (
								<div className={styles.medicationList}>
									{visibleMedications.map((medication) => {
										const isGiven = givenMedicationIds.includes(medication.id);

										return (
											<article key={medication.id} className={`${styles.medicationCard} ${isGiven ? styles.medicationGiven : ""}`}>
												<div className={styles.medicationDate}>{formatShortDate(medication.start_date) || formatShortDate((medication as any).created_at)}</div>

												<div className={styles.medicationTitleRow}>
													<label className={styles.bigMedicationCheck}>
														<input type="checkbox" checked={isGiven} disabled={medicationSavingId === medication.id} onChange={() => handleToggleMedicationGiven(medication.id)} />
														<span></span>
													</label>

													<h3>{medication.name}</h3>
												</div>

												<ul className={styles.medicationBullets}>
													{medication.dosage && (
														<li>
															<strong>Dosering:</strong> {medication.dosage}
														</li>
													)}

													{(medication as any).frequency && (
														<li>
															<strong>Frequentie:</strong> {(medication as any).frequency}
														</li>
													)}

													{medication.instructions && (
														<li>
															<strong>Toediening:</strong> {medication.instructions}
														</li>
													)}
												</ul>
											</article>
										);
									})}
								</div>
							)}
						</section>
					</section>

					<aside className={styles.rightColumn}>
						<div className={styles.calendarCard}>
							<div className={styles.calendarHeader}>
								<button type="button" onClick={previousMonth}>
									‹
								</button>

								<span>{formatMonth(calendarMonth)}</span>

								<button type="button" onClick={nextMonth}>
									›
								</button>
							</div>

							<div className={styles.weekDays}>
								<span>Ma</span>
								<span>Di</span>
								<span>Wo</span>
								<span>Do</span>
								<span>Vr</span>
								<span>Za</span>
								<span>Zo</span>
							</div>

							<div className={styles.calendarDays}>
								{calendarDays.map((day) => {
									const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();

									const inRange = startDate && endDate && isBetween(day, startDate, endDate);

									const isStart = startDate && isSameDay(day, startDate);
									const isEnd = endDate && isSameDay(day, endDate);
									const isToday = isSameDay(day, new Date());

									return (
										<span key={day.toISOString()} className={[!isCurrentMonth ? styles.mutedDay : "", inRange ? styles.rangeDay : "", isStart || isEnd ? styles.activeDay : "", isToday ? styles.todayDay : ""].join(" ")}>
											{day.getDate()}
										</span>
									);
								})}
							</div>

							<div className={styles.stayInfo}>{nights ? `${nights} nachten verblijf` : animal.expected_duration}</div>
						</div>

						<section className={styles.descriptionCard}>
							<h2>Uitgebreide info</h2>

							<p>{animal.description || "Er is nog geen uitgebreide beschrijving beschikbaar."}</p>

							{animal.medical_notes && (
								<p>
									<strong>Medische info:</strong> {animal.medical_notes}
								</p>
							)}

							{animal.behavior_notes && (
								<p>
									<strong>Gedrag:</strong> {animal.behavior_notes}
								</p>
							)}
						</section>

						<section className={styles.contactCard}>
							<h2>Contact</h2>

							<p className={styles.contactName}>{shelter?.name || "Dierenasiel onbekend"}</p>

							{shelter?.phone && (
								<p>
									<span>📞</span>
									{shelter.phone}
								</p>
							)}

							{shelter?.email && (
								<p>
									<span>✉️</span>
									{shelter.email}
								</p>
							)}

							{shelter?.website && (
								<p>
									<span>🌐</span>
									{shelter.website}
								</p>
							)}

							<button type="button" className={styles.contactButton}>
								Contact opnemen
							</button>
						</section>
					</aside>
				</div>

				{noteModalOpen && (
					<div className={styles.modalOverlay}>
						<div className={styles.noteModal}>
							<button type="button" className={styles.closeModal} onClick={() => setNoteModalOpen(false)}>
								×
							</button>

							<div className={styles.modalHeader}>
								<p>Nieuwe notitie</p>
								<h2>Notitie toevoegen</h2>
							</div>

							<label>
								Titel
								<input type="text" value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} placeholder="Bijv. Eten en drinken" />
							</label>

							<label>
								Notitie
								<textarea value={noteContent} onChange={(event) => setNoteContent(event.target.value)} placeholder="Schrijf hier je observatie..." />
							</label>

							<div className={styles.modalActions}>
								<button type="button" className={styles.cancelButton} onClick={() => setNoteModalOpen(false)}>
									Annuleren
								</button>

								<button type="button" className={styles.saveButton} disabled={noteSaving} onClick={handleCreateNote}>
									{noteSaving ? "Opslaan..." : "Notitie opslaan"}
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</>
	);
}
