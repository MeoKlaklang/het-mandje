"use client";



import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAnimalById } from "@/lib/animals/getAnimalById";
import type { AnimalDetail } from "@/lib/animals/getAnimalById";
import styles from "./dier-detail.module.css";
import { createAnimalApplication } from "@/lib/animals/createAnimalApplication";


function formatAddress(animal: AnimalDetail) {
	const shelter = animal.shelters;

	if (!shelter) {
		return [animal.postal_code, animal.city].filter(Boolean).join(" ");
	}

	return [shelter.street, shelter.house_number, shelter.postal_code, shelter.city].filter(Boolean).join(" ");
}

function getGenderIcon(gender: string | null) {
	if (!gender) return "⚪";

	if (gender.toLowerCase() === "mannelijk") return "♂";
	if (gender.toLowerCase() === "vrouwelijk") return "♀";

	return "⚪";
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

export default function DierDetailPage() {
	const params = useParams<{ id: string }>();
	const animalId = params.id;

	const [animal, setAnimal] = useState<AnimalDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [applicationLoading, setApplicationLoading] = useState(false);

	useEffect(() => {
		async function loadAnimal() {
			if (!animalId) {
				setLoading(false);
				return;
			}

			const { animal } = await getAnimalById(animalId);

			setAnimal(animal);
			setLoading(false);
		}

		loadAnimal();
	}, [animalId]);

	const images = useMemo(() => {
		if (!animal) return [];

		const extraImages = [...(animal.animal_images || [])].sort((a, b) => Number(a.image_order || 0) - Number(b.image_order || 0)).map((image) => image.image_url);
		const allImages = extraImages?.length ? extraImages : [animal.image_url || "/images/dog3.jpg"];

		return allImages;
	}, [animal]);

	const handleApply = async () => {
		if (!animal) return;

		setApplicationLoading(true);

		const result = await createAnimalApplication({
			animalId: animal.id,
			shelterId: animal.shelters?.id || null,
			message: `Ik heb interesse om ${animal.name} tijdelijk op te vangen.`,
			startDate: animal.available_from,
			endDate: animal.available_until,
		});

		setApplicationLoading(false);

		if (!result.success) {
			alert(result.error);
			return;
		}

		alert("Je interesse werd doorgestuurd naar het dierenasiel!");
	};

	if (loading) {
		return (
			<main className={styles.page}>
				<p>Dier wordt geladen...</p>
			</main>
		);
	}

	if (!animal) {
		return (
			<main className={styles.page}>
				<p>Dit dier werd niet gevonden.</p>
			</main>
		);
	}

	const shelter = animal.shelters;
	const nights = getNights(animal.available_from, animal.available_until);

	const baseDate = animal.available_from ? new Date(animal.available_from) : new Date();

	const calendarDays = buildCalendarDays(baseDate);

	const startDate = animal.available_from ? new Date(animal.available_from) : null;

	const endDate = animal.available_until ? new Date(animal.available_until) : null;

	const qualities = [
		getBooleanLabel(animal.vaccinated, "Gevaccineerd"),
		getBooleanLabel(animal.neutered, "Gecastreerd"),
		getBooleanLabel(animal.can_live_with_cats, "Kan bij katten?"),
		getBooleanLabel(animal.can_live_with_children, "Kan bij kinderen?"),
		getBooleanLabel(animal.can_be_home_alone, "Kan alleen thuis zijn?"),
		getBooleanLabel(animal.can_live_with_dogs, "Kan bij honden?"),
	];

	return (
		<main className={styles.page}>
			<div className={styles.container}>
				<section className={styles.leftColumn}>
					<Link href="/dieren/resultaten" className={styles.backLink}>
						⟵ Terug naar overzicht
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
								<p>{formatAddress(animal)}</p>
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

					<section className={styles.descriptionSection}>
						<h2>Uitgebreide info</h2>

						<p>{animal.description || "Er is nog geen uitgebreide beschrijving beschikbaar voor dit dier."}</p>

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

						<button type="button" className={styles.interestButton} onClick={handleApply} disabled={applicationLoading}>
							{applicationLoading ? "Aanvraag verzenden..." : "Interesse"}
						</button>
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

						<button type="button" className={styles.offerButton} onClick={handleApply} disabled={applicationLoading}>
							{applicationLoading ? "Aanvraag verzenden..." : "Bied een warm thuis"}
						</button>
					</div>

					<div className={styles.shelterImage}>
						<img src={shelter?.image_url || "/images/dog3.jpg"} alt={shelter?.name || "Dierenasiel"} />
					</div>

					<div className={styles.contactCard}>
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
					</div>
				</aside>
			</div>
		</main>
	);
}
