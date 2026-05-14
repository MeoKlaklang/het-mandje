"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getMyAnimalApplications, MyAnimalApplication } from "@/lib/animals/getMyAnimalApplications";
import styles from "./mijn-dieren.module.css";

function getGenderIcon(gender: string | null) {
	if (!gender) return "⚪";

	if (gender.toLowerCase() === "mannelijk") return "♂";
	if (gender.toLowerCase() === "vrouwelijk") return "♀";

	return "⚪";
}

function getNights(startDate: string | null, endDate: string | null) {
	if (!startDate || !endDate) return null;

	const start = new Date(startDate);
	const end = new Date(endDate);

	const diff = end.getTime() - start.getTime();
	const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));

	return nights > 0 ? nights : null;
}

function getStatusLabel(status: string | null) {
	if (status === "goedgekeurd") return "✓ Goedgekeurd";
	if (status === "afgewezen") return "× Niet goedgekeurd";
	return "⏳ In afwachting";
}

function getStatusClass(status: string | null) {
	if (status === "goedgekeurd") return styles.statusApproved;
	if (status === "afgewezen") return styles.statusRejected;
	return styles.statusPending;
}

export default function MijnDierenPage() {
	const [applications, setApplications] = useState<MyAnimalApplication[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadApplications() {
			const { applications } = await getMyAnimalApplications();

			setApplications(applications);
			setLoading(false);
		}

		loadApplications();
	}, []);

	return (
		<>
			<DashboardNavbar />

			<main className={styles.page}>
				{loading ? (
					<p className={styles.loadingText}>Je dieren worden geladen...</p>
				) : applications.length === 0 ? (
					<section className={styles.emptyState}>
						<h1>Je hebt nog geen dieren gekozen.</h1>
						<p>Bekijk welke dieren tijdelijk opvang zoeken en toon interesse in een dier dat bij jou past.</p>

						<Link href="/dieren" className={styles.emptyButton}>
							Zoek een dier
						</Link>
					</section>
				) : (
					<section className={styles.grid}>
						{applications.map((application) => {
							const animal = application.animals;

							if (!animal) return null;

							const nights = getNights(application.start_date, application.end_date);

							return (
								<article key={application.id} className={styles.card}>
									<Link href={`/mijn-dieren/${application.id}`} className={styles.imageLink}>
										<img src={animal.image_url || "/images/dog3.jpg"} alt={animal.name} className={styles.image} />

										<div className={styles.tagsTop}>
											<span className={styles.greenTag}>🗓 {nights ? `${nights} dagen verblijf` : animal.expected_duration || "Verblijf onbekend"}</span>

											<span className={`${styles.statusTag} ${getStatusClass(application.status)}`}>{getStatusLabel(application.status)}</span>
										</div>

										<div className={styles.infoBottom}>
											{animal.age && <span>{animal.age}</span>}
											<span>{getGenderIcon(animal.gender)}</span>
										</div>
									</Link>

									<div className={styles.cardText}>
										<h2>{animal.name}</h2>
										<p className={styles.breed}>{animal.breed || animal.species}</p>

										<p className={styles.description}>{animal.short_description || animal.description}</p>
									</div>
								</article>
							);
						})}
					</section>
				)}
			</main>
		</>
	);
}
