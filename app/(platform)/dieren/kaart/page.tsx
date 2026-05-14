"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getAnimals, Animal } from "@/lib/animals/getAnimals";
import styles from "./kaart.module.css";
const AnimalsMap = dynamic(() => import("@/components/animals/AnimalsMap"), {
	ssr: false,
});

export default function DierenKaartPage() {
	const [animals, setAnimals] = useState<Animal[]>([]);
	const [loading, setLoading] = useState(true);
	const [likedAnimals, setLikedAnimals] = useState<string[]>([]);

	useEffect(() => {
		async function loadAnimals() {
			const { animals } = await getAnimals();

			setAnimals(animals);
			setLoading(false);
		}

		loadAnimals();
	}, []);

	useEffect(() => {
		const savedLikes = localStorage.getItem("likedAnimals");

		if (savedLikes) {
			setLikedAnimals(JSON.parse(savedLikes));
		}
	}, []);

	const toggleLike = (e: React.MouseEvent<HTMLButtonElement>, animalId: string) => {
		e.preventDefault();
		e.stopPropagation();

		setLikedAnimals((currentLikes) => {
			const updatedLikes = currentLikes.includes(animalId) ? currentLikes.filter((id) => id !== animalId) : [...currentLikes, animalId];

			localStorage.setItem("likedAnimals", JSON.stringify(updatedLikes));

			return updatedLikes;
		});
	};

	const sortedAnimals = useMemo(() => {
		return [...animals].sort((a, b) => {
			const aLiked = likedAnimals.includes(a.id);
			const bLiked = likedAnimals.includes(b.id);

			if (aLiked && !bLiked) return -1;
			if (!aLiked && bLiked) return 1;

			if (a.care_level === "dringend" && b.care_level !== "dringend") {
				return -1;
			}

			if (a.care_level !== "dringend" && b.care_level === "dringend") {
				return 1;
			}

			return 0;
		});
	}, [animals, likedAnimals]);

	return (
		<main className={styles.page}>
			<aside className={styles.sidebar}>
				<div className={styles.topActions}>
					<Link href="/dieren/resultaten" className={styles.backLink}>
						←
					</Link>

					<button type="button" className={styles.filterButton}>
						Filters
					</button>
				</div>

				{loading ? (
					<p className={styles.loadingText}>Dieren worden geladen...</p>
				) : (
					<div className={styles.cards}>
						{sortedAnimals.map((animal, index) => {
							const isLiked = likedAnimals.includes(animal.id);

							return (
								<Link key={animal.id} href={`/dieren/${animal.id}`} className={styles.card}>
									<img src={animal.image_url || "/images/dog3.jpg"} alt={animal.name} className={styles.animalImage} />

									<div className={styles.cardContent}>
										<div className={styles.cardHeader}>
											<h2>
												{index + 1}. {animal.name}
											</h2>

											<button type="button" className={isLiked ? `${styles.heartButton} ${styles.liked}` : styles.heartButton} onClick={(e) => toggleLike(e, animal.id)}>
												♥
											</button>
										</div>

										<p className={styles.breed}>{animal.breed || animal.species}</p>

										<p className={styles.description}>{animal.short_description || animal.description}</p>

										<div className={styles.tags}>
											{animal.expected_duration && <span className={styles.greenTag}>{animal.expected_duration}</span>}

											{animal.care_level && <span className={styles.blueTag}>{animal.care_level}</span>}
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</aside>

			<section className={styles.mapSection}>
				<div className={styles.mapSearch}>
					<span>⌕</span>
					<button type="button">Zoeken op kaart</button>
				</div>

				<AnimalsMap animals={sortedAnimals} />
			</section>
		</main>
	);
}
