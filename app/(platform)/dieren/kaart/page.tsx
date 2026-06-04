"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAnimals, Animal } from "@/lib/animals/getAnimals";
import { getShelterLocations, ShelterLocation } from "@/lib/shelters/getShelterLocations";
import styles from "./kaart.module.css";

const AnimalsMap = dynamic(() => import("@/components/animals/AnimalsMap"), {
	ssr: false,
});

function getAgeCategory(age: string | null) {
	if (!age) return "";

	const lowerAge = age.toLowerCase();

	if (lowerAge.includes("maand") || lowerAge.includes("puppy") || lowerAge.includes("kitten")) {
		return "jong";
	}

	const numberMatch = lowerAge.match(/\d+/);
	const number = numberMatch ? Number(numberMatch[0]) : null;

	if (number !== null && number <= 1) return "jong";
	if (number !== null && number >= 8) return "senior";

	return "volwassen";
}

function isDateRangeValid(startDate: string, endDate: string) {
	if (!startDate || !endDate) return true;
	return endDate >= startDate;
}

function normalizeShelterLocation(shelter: ShelterLocation) {
	const data = shelter as any;

	return {
		id: String(data.id),
		name: data.name || "Dierenasiel",
		street: data.street || null,
		house_number: data.house_number || null,
		postal_code: data.postal_code || null,
		city: data.city || null,
		latitude: data.latitude,
		longitude: data.longitude,
		source: data.source || data.type || data.origin || null,
		is_demo: data.is_demo ?? null,
		created_via_platform: data.created_via_platform ?? null,
	};
}

function getAnimalShelterId(animal: Animal) {
	return animal.shelters?.id || null;
}

function DierenKaartContent() {
	const searchParams = useSearchParams();

	const [animals, setAnimals] = useState<Animal[]>([]);
	const [shelterLocations, setShelterLocations] = useState<ShelterLocation[]>([]);
	const [loading, setLoading] = useState(true);
	const [likedAnimals, setLikedAnimals] = useState<string[]>([]);

	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [filtersOpen, setFiltersOpen] = useState(false);

	const [mapSearch, setMapSearch] = useState("");
	const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);

	const [locationFilter, setLocationFilter] = useState(searchParams.get("locatie") || "");
	const [startDateFilter, setStartDateFilter] = useState(searchParams.get("start") || "");
	const [endDateFilter, setEndDateFilter] = useState(searchParams.get("eind") || "");
	const [speciesFilter, setSpeciesFilter] = useState(searchParams.get("soort") || "");
	const [genderFilter, setGenderFilter] = useState("");
	const [ageFilter, setAgeFilter] = useState("");
	const [sizeFilter, setSizeFilter] = useState("");

	useEffect(() => {
		async function loadMapData() {
			const [animalResult, shelterResult] = await Promise.all([getAnimals(), getShelterLocations()]);

			setAnimals(animalResult.animals || []);
			setShelterLocations(shelterResult.shelterLocations || []);
			setLoading(false);
		}

		loadMapData();
	}, []);

	useEffect(() => {
		const savedLikes = localStorage.getItem("likedAnimals");

		if (savedLikes) {
			setLikedAnimals(JSON.parse(savedLikes));
		}
	}, []);

	const toggleLike = (event: React.MouseEvent<HTMLButtonElement>, animalId: string) => {
		event.preventDefault();
		event.stopPropagation();

		setLikedAnimals((currentLikes) => {
			const updatedLikes = currentLikes.includes(animalId) ? currentLikes.filter((id) => id !== animalId) : [...currentLikes, animalId];

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
			const search = locationFilter.toLowerCase();

			result = result.filter((animal) => {
				const animalCity = animal.city?.toLowerCase() || "";
				const animalPostalCode = animal.postal_code || "";
				const shelterCity = animal.shelters?.city?.toLowerCase() || "";
				const shelterPostalCode = animal.shelters?.postal_code || "";

				return animalCity.includes(search) || animalPostalCode.includes(search) || shelterCity.includes(search) || shelterPostalCode.includes(search);
			});
		}

		if (isDateRangeValid(startDateFilter, endDateFilter)) {
			if (startDateFilter) {
				result = result.filter((animal) => {
					if (!animal.available_until) return true;
					return animal.available_until >= startDateFilter;
				});
			}

			if (endDateFilter) {
				result = result.filter((animal) => {
					if (!animal.available_from) return true;
					return animal.available_from <= endDateFilter;
				});
			}
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

		if (mapSearch.trim()) {
			const search = mapSearch.trim().toLowerCase();

			result = result.filter((animal) => {
				const animalName = animal.name.toLowerCase();
				const breed = animal.breed?.toLowerCase() || "";
				const shelterName = animal.shelters?.name?.toLowerCase() || "";
				const shelterCity = animal.shelters?.city?.toLowerCase() || "";

				return animalName.includes(search) || breed.includes(search) || shelterName.includes(search) || shelterCity.includes(search);
			});
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
	}, [animals, likedAnimals, speciesFilter, locationFilter, startDateFilter, endDateFilter, genderFilter, ageFilter, sizeFilter, mapSearch]);

	const animalCountByShelterId = useMemo(() => {
		const counts: Record<string, number> = {};

		filteredAnimals.forEach((animal) => {
			const shelterId = getAnimalShelterId(animal);

			if (!shelterId) return;

			counts[shelterId] = (counts[shelterId] || 0) + 1;
		});

		return counts;
	}, [filteredAnimals]);

	const sheltersOnMap = useMemo(() => {
		const shelterMap = new Map<string, any>();

		shelterLocations.forEach((shelter) => {
			const normalized = normalizeShelterLocation(shelter);

			if (normalized.latitude === null || normalized.longitude === null) return;
			if (normalized.latitude === undefined || normalized.longitude === undefined) return;

			shelterMap.set(normalized.id, normalized);
		});

		filteredAnimals.forEach((animal) => {
			const shelter = animal.shelters;

			if (!shelter?.id || !shelter.latitude || !shelter.longitude) return;

			if (!shelterMap.has(shelter.id)) {
				shelterMap.set(shelter.id, {
					id: shelter.id,
					name: shelter.name,
					street: shelter.street,
					house_number: shelter.house_number,
					postal_code: shelter.postal_code,
					city: shelter.city,
					latitude: shelter.latitude,
					longitude: shelter.longitude,
					source: "platform",
					created_via_platform: true,
					is_demo: false,
				});
			}
		});

		let result = Array.from(shelterMap.values());

		if (mapSearch.trim() || locationFilter.trim()) {
			const search = (mapSearch || locationFilter).trim().toLowerCase();

			result = result.filter((shelter) => {
				const name = shelter.name?.toLowerCase() || "";
				const city = shelter.city?.toLowerCase() || "";
				const postalCode = shelter.postal_code || "";
				const street = shelter.street?.toLowerCase() || "";

				return name.includes(search) || city.includes(search) || postalCode.includes(search) || street.includes(search);
			});
		}

		return result;
	}, [shelterLocations, filteredAnimals, mapSearch, locationFilter]);

	const selectedShelter = useMemo(() => {
		if (!selectedShelterId) return null;

		return sheltersOnMap.find((shelter) => shelter.id === selectedShelterId) || null;
	}, [selectedShelterId, sheltersOnMap]);

	const visibleAnimals = useMemo(() => {
		if (!selectedShelterId) return filteredAnimals;

		return filteredAnimals.filter((animal) => getAnimalShelterId(animal) === selectedShelterId);
	}, [filteredAnimals, selectedShelterId]);

	const resetFilters = () => {
		setLocationFilter("");
		setStartDateFilter("");
		setEndDateFilter("");
		setSpeciesFilter("");
		setGenderFilter("");
		setAgeFilter("");
		setSizeFilter("");
		setSelectedShelterId(null);
	};

	const handleSelectShelter = (shelterId: string) => {
		setSelectedShelterId(shelterId);
		setSidebarOpen(true);
	};

	return (
		<main className={`${styles.page} ${!sidebarOpen ? styles.sidebarClosedPage : ""}`}>
			<aside className={`${styles.sidebar} ${!sidebarOpen ? styles.closed : ""}`}>
				<div className={styles.sidebarTop}>
					<Link href="/dieren/resultaten" className={styles.backText}>
						⟵ Terug naar overzicht
					</Link>

					<button type="button" className={styles.closeSidebar} onClick={() => setSidebarOpen((current) => !current)} aria-label={sidebarOpen ? "Dierenlijst sluiten" : "Dierenlijst openen"}>
						‹
					</button>
				</div>

				<div className={styles.topActions}>
					<button type="button" className={styles.filterButton} onClick={() => setFiltersOpen((current) => !current)}>
						⤴ Filters
					</button>
				</div>

				{selectedShelter && (
					<div className={styles.selectedShelterBox}>
						<span>Geselecteerd asiel</span>

						<h2>{selectedShelter.name}</h2>

						<p>{[selectedShelter.postal_code, selectedShelter.city].filter(Boolean).join(" ")}</p>
					</div>
				)}

				{filtersOpen && (
					<div className={styles.filterPanel}>
						<label>
							Locatie
							<input type="text" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Postcode of stad" />
						</label>

						<div className={styles.dateGroup}>
							<label>
								Startdatum
								<input
									type="date"
									value={startDateFilter}
									onChange={(event) => {
										setStartDateFilter(event.target.value);

										if (endDateFilter && event.target.value > endDateFilter) {
											setEndDateFilter("");
										}
									}}
								/>
							</label>

							<label>
								Einddatum
								<input type="date" value={endDateFilter} min={startDateFilter || undefined} onChange={(event) => setEndDateFilter(event.target.value)} />
							</label>
						</div>

						<label>
							Ik zoek een
							<select value={speciesFilter} onChange={(event) => setSpeciesFilter(event.target.value)}>
								<option value="">Maakt niet uit</option>
								<option value="hond">Hond</option>
								<option value="kat">Kat</option>
								<option value="allebei">Hond en kat</option>
							</select>
						</label>

						<label>
							Geslacht
							<select value={genderFilter} onChange={(event) => setGenderFilter(event.target.value)}>
								<option value="">Maakt niet uit</option>
								<option value="mannelijk">Mannelijk</option>
								<option value="vrouwelijk">Vrouwelijk</option>
							</select>
						</label>

						<label>
							Leeftijd
							<select value={ageFilter} onChange={(event) => setAgeFilter(event.target.value)}>
								<option value="">Maakt niet uit</option>
								<option value="jong">Puppy / kitten</option>
								<option value="volwassen">Volwassen</option>
								<option value="senior">Senior</option>
							</select>
						</label>

						<label>
							Formaat
							<select value={sizeFilter} onChange={(event) => setSizeFilter(event.target.value)}>
								<option value="">Maakt niet uit</option>
								<option value="klein">Klein</option>
								<option value="middel">Middel</option>
								<option value="groot">Groot</option>
							</select>
						</label>

						<button type="button" className={styles.resetButton} onClick={resetFilters}>
							Filters wissen
						</button>
					</div>
				)}

				{loading ? (
					<p className={styles.loadingText}>Dieren worden geladen...</p>
				) : selectedShelter && visibleAnimals.length === 0 ? (
					<div className={styles.emptyShelterBox}>
						<h2>Geen dieren beschikbaar</h2>

						<p>Dit asiel staat op de kaart als erkend of demo-asiel. Er zijn momenteel geen dieren van dit asiel beschikbaar via Het Mandje.</p>
					</div>
				) : visibleAnimals.length === 0 ? (
					<p className={styles.loadingText}>Geen dieren gevonden.</p>
				) : (
					<div className={styles.cards}>
						{visibleAnimals.map((animal, index) => {
							const isLiked = likedAnimals.includes(animal.id);

							return (
								<Link key={animal.id} href={`/dieren/${animal.id}`} className={styles.card}>
									<img src={animal.image_url || "/images/dog3.jpg"} alt={animal.name} className={styles.animalImage} />

									<div className={styles.cardContent}>
										<div className={styles.cardHeader}>
											<h2>
												{index + 1}. {animal.name}
											</h2>

											<button type="button" className={isLiked ? `${styles.heartButton} ${styles.liked}` : styles.heartButton} onClick={(event) => toggleLike(event, animal.id)} aria-label="Dier opslaan">
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

			{!sidebarOpen && (
				<button type="button" className={styles.openSidebar} onClick={() => setSidebarOpen(true)} aria-label="Dierenlijst openen">
					›
				</button>
			)}

			<section className={styles.mapSection}>
				<div className={styles.mapSearch}>
					<span>⌕</span>

					<input
						type="text"
						value={mapSearch}
						onChange={(event) => {
							setMapSearch(event.target.value);
							setSelectedShelterId(null);
						}}
						placeholder="Zoeken op kaart"
					/>
				</div>

				<AnimalsMap animals={filteredAnimals} shelterLocations={sheltersOnMap} selectedShelterId={selectedShelterId} animalCountByShelterId={animalCountByShelterId} onSelectShelter={handleSelectShelter} />
			</section>
		</main>
	);
}

export default function DierenKaartPage() {
	return (
		<Suspense
			fallback={
				<main className={styles.page}>
					<p className={styles.loadingText}>Kaart wordt geladen...</p>
				</main>
			}
		>
			<DierenKaartContent />
		</Suspense>
	);
}
