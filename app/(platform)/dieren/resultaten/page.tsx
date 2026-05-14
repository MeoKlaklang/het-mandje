"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAnimals, Animal } from "@/lib/animals/getAnimals";
import styles from "./resultaten.module.css";

function getAgeCategory(age: string | null) {
	if (!age) return "";

	const lowerAge = age.toLowerCase();

	if (lowerAge.includes("maand") || lowerAge.includes("puppy") || lowerAge.includes("kitten")) {
		return "jong";
	}

	const numberMatch = lowerAge.match(/\d+/);
	const number = numberMatch ? Number(numberMatch[0]) : null;

	if (number !== null && number <= 1) {
		return "jong";
	}

	if (number !== null && number >= 8) {
		return "senior";
	}

	return "volwassen";
}

function getGenderIcon(gender: string | null) {
	if (!gender) return "Onbekend";

	if (gender.toLowerCase() === "mannelijk") return "♂";
	if (gender.toLowerCase() === "vrouwelijk") return "♀";

	return gender;
}

export default function DierenResultatenPage() {
	const searchParams = useSearchParams();

	const initialSoort = searchParams.get("soort") || "";
	const initialLocatie = searchParams.get("locatie") || "";
	const initialDatum = searchParams.get("datum") || "";

	const [animals, setAnimals] = useState<Animal[]>([]);
	const [loading, setLoading] = useState(true);

	const [locationFilter, setLocationFilter] = useState(initialLocatie);
	const [startDateFilter, setStartDateFilter] = useState(initialDatum);
	const [endDateFilter, setEndDateFilter] = useState("");
	const [speciesFilter, setSpeciesFilter] = useState(initialSoort);
	const [genderFilter, setGenderFilter] = useState("");
	const [ageFilter, setAgeFilter] = useState("");
	const [sizeFilter, setSizeFilter] = useState("");

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
			let updatedLikes: string[];

			if (currentLikes.includes(animalId)) {
				updatedLikes = currentLikes.filter((id) => id !== animalId);
			} else {
				updatedLikes = [...currentLikes, animalId];
			}

			localStorage.setItem("likedAnimals", JSON.stringify(updatedLikes));

			return updatedLikes;
		});
	};

	const filteredAnimals = useMemo(() => {
		let result = [...animals];

		if (speciesFilter && speciesFilter !== "allebei") {
			result = result.filter((animal) => animal.species === speciesFilter);
		}

		if (locationFilter) {
			result = result.filter((animal) => {
				const city = animal.city?.toLowerCase() || "";
				const postalCode = animal.postal_code || "";
				const search = locationFilter.toLowerCase();

				return city.includes(search) || postalCode.includes(search);
			});
		}

		if (genderFilter) {
			result = result.filter((animal) => animal.gender === genderFilter);
		}

		if (ageFilter) {
			result = result.filter((animal) => getAgeCategory(animal.age) === ageFilter);
		}

		if (sizeFilter) {
			result = result.filter((animal) => animal.size === sizeFilter);
		}

		result.sort((a, b) => {
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

		return result;
	}, [animals, speciesFilter, locationFilter, genderFilter, ageFilter, sizeFilter, likedAnimals]);

	return (
		<main className={styles.page}>
			<div className={styles.layout}>
				<aside className={styles.filters}>
					<div className={styles.mapBox}>
						<Link href="/dieren/kaart">Toon op kaart</Link>
					</div>

					<label>
						Locatie
						<input type="text" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder="Postcode of stad" />
					</label>

					<div className={styles.dateGroup}>
						<label>
							Startdatum
							<input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} />
						</label>

						<label>
							Einddatum
							<input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} />
						</label>
					</div>

					<label>
						Ik zoek een
						<select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)}>
							<option value="">Maakt niet uit</option>
							<option value="hond">Hond</option>
							<option value="kat">Kat</option>
							<option value="allebei">Hond en kat</option>
						</select>
					</label>

					<label>
						Geslacht
						<select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
							<option value="">Maakt niet uit</option>
							<option value="mannelijk">Mannelijk</option>
							<option value="vrouwelijk">Vrouwelijk</option>
						</select>
					</label>

					<label>
						Leeftijd
						<select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
							<option value="">Maakt niet uit</option>
							<option value="jong">Puppy / kitten</option>
							<option value="volwassen">Volwassen</option>
							<option value="senior">Senior</option>
						</select>
					</label>

					<label>
						Formaat
						<select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)}>
							<option value="">Maakt niet uit</option>
							<option value="klein">Klein</option>
							<option value="middel">Middel</option>
							<option value="groot">Groot</option>
						</select>
					</label>
				</aside>

				<section className={styles.results}>
					<div className={styles.resultsHeader}>
						<p>Volgorde: Dringend ↓</p>
					</div>

					{loading ? (
						<p className={styles.emptyText}>Dieren worden geladen...</p>
					) : filteredAnimals.length === 0 ? (
						<p className={styles.emptyText}>Geen dieren gevonden met deze filters.</p>
					) : (
						<div className={styles.cards}>
							{filteredAnimals.map((animal, index) => {
								const isLiked = likedAnimals.includes(animal.id);

								return (
									<Link key={animal.id} href={`/dieren/${animal.id}`} className={styles.card}>
										<img src={animal.image_url || "/images/dog3.jpg"} alt={animal.name} className={styles.animalImage} />

										<div className={styles.cardContent}>
											<div className={styles.cardTop}>
												<div>
													<h2>
														{index + 1}. {animal.name}
													</h2>

													<p className={styles.breed}>{animal.breed || animal.species}</p>
												</div>

												<button type="button" className={isLiked ? `${styles.heartButton} ${styles.liked}` : styles.heartButton} onClick={(e) => toggleLike(e, animal.id)} aria-label="Dier opslaan">
													♥
												</button>
											</div>

											<p className={styles.description}>{animal.short_description || animal.description}</p>

											<div className={styles.tags}>
												{animal.expected_duration && <span className={styles.greenTag}>{animal.expected_duration}</span>}

												{animal.care_level && <span className={styles.blueTag}>{animal.care_level}</span>}
											</div>
										</div>

										<div className={styles.cardInfo}>
											{animal.age && (
												<span title="Leeftijd" className={styles.infoBadge}>
													{animal.age}
												</span>
											)}

											{animal.gender && (
												<span title="Geslacht" className={styles.infoBadge}>
													{getGenderIcon(animal.gender)}
												</span>
											)}
										</div>
									</Link>
								);
							})}
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
