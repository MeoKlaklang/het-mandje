"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
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
		return `Je aanvraag is goedgekeurd. Je mag ${animalName} tijdelijk opvangen en updates toevoegen.`;
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

function formatDate(date: string | null) {
	if (!date) return "";

	return new Date(date).toLocaleDateString("nl-BE", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
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

function buildCalendarDays(baseDate: Date) {
	const year = baseDate.getFullYear();
	const month = baseDate.getMonth();

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

export default function MijnDierDetailPage() {
	const params = useParams<{ id: string }>();
	const applicationId = params.id;

	const [application, setApplication] = useState<MyAnimalApplicationDetail | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadApplication() {
			const { application } = await getMyAnimalApplicationById(applicationId);

			setApplication(application);
			setLoading(false);
		}

		loadApplication();
	}, [applicationId]);

	const images = useMemo(() => {
		if (!application?.animals) return [];

		const animal = application.animals;

		const extraImages = [...(animal.animal_images || [])].sort((a, b) => Number(a.image_order || 0) - Number(b.image_order || 0)).map((image) => image.image_url);

		return extraImages.length ? extraImages : [animal.image_url || "/images/dog3.jpg"];
	}, [application]);

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

	const baseDate = startDate || new Date();
	const calendarDays = buildCalendarDays(baseDate);
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
							</div>

							<div className={styles.smallImage}>
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
							<h2>Notities</h2>

							{application.animal_notes.length === 0 ? (
								<p className={styles.emptyText}>Nog geen notities.</p>
							) : (
								<div className={styles.notesList}>
									{application.animal_notes.map((note) => (
										<article key={note.id} className={styles.noteCard}>
											<div>
												<h3>{note.title}</h3>
												<span>
													{note.created_by_name || "Onbekend"} · {note.created_by_role || "rol onbekend"}
												</span>
											</div>

											<p>{note.content}</p>
										</article>
									))}
								</div>
							)}
						</section>

						<section className={styles.medicationSection}>
							<h2>Medicatie</h2>

							{application.animal_medications.length === 0 ? (
								<p className={styles.emptyText}>Geen medicatie toegevoegd.</p>
							) : (
								<div className={styles.medicationList}>
									{application.animal_medications.map((medication) => (
										<article key={medication.id} className={styles.medicationCard}>
											<h3>{medication.name}</h3>

											{medication.dosage && <p>{medication.dosage}</p>}

											{medication.instructions && <p>{medication.instructions}</p>}

											{(medication.start_date || medication.end_date) && (
												<span>
													{formatDate(medication.start_date)} - {formatDate(medication.end_date)}
												</span>
											)}
										</article>
									))}
								</div>
							)}
						</section>
					</section>

					<aside className={styles.rightColumn}>
						<div className={styles.calendarCard}>
							<div className={styles.calendarHeader}>
								<span>
									{baseDate.toLocaleDateString("nl-BE", {
										month: "long",
										year: "numeric",
									})}
								</span>

								<div>
									<button type="button">‹</button>
									<button type="button">›</button>
								</div>
							</div>

							<div className={styles.weekDays}>
								<span>M</span>
								<span>D</span>
								<span>W</span>
								<span>D</span>
								<span>V</span>
								<span>Z</span>
								<span>Z</span>
							</div>

							<div className={styles.calendarDays}>
								{calendarDays.map((day) => {
									const isCurrentMonth = day.getMonth() === baseDate.getMonth();

									const inRange = startDate && endDate && isBetween(day, startDate, endDate);

									const isStart = startDate && isSameDay(day, startDate);
									const isEnd = endDate && isSameDay(day, endDate);

									return (
										<span key={day.toISOString()} className={[!isCurrentMonth ? styles.mutedDay : "", inRange ? styles.rangeDay : "", isStart || isEnd ? styles.activeDay : ""].join(" ")}>
											{day.getDate()}
										</span>
									);
								})}
							</div>

							<div className={styles.stayInfo}>{nights ? `${nights} nachten verblijf` : animal.expected_duration}</div>

							<button type="button" className={styles.updateButton} disabled={application.status !== "goedgekeurd"}>
								{application.status === "goedgekeurd" ? "Update toevoegen" : application.status === "afgewezen" ? "Aanvraag afgesloten" : "Wachten op goedkeuring"}
							</button>
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
			</main>
		</>
	);
}
