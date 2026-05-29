"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAnimals, Animal } from "@/lib/animals/getAnimals";
import {
  getShelterLocations,
  ShelterLocation,
} from "@/lib/shelters/getShelterLocations";
import styles from "./kaart.module.css";

const AnimalsMap = dynamic(() => import("@/components/animals/AnimalsMap"), {
  ssr: false,
});

function getAgeCategory(age: string | null) {
  if (!age) return "";

  const lowerAge = age.toLowerCase();

  if (
    lowerAge.includes("maand") ||
    lowerAge.includes("puppy") ||
    lowerAge.includes("kitten")
  ) {
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

function DierenKaartContent() {
  const searchParams = useSearchParams();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [shelterLocations, setShelterLocations] = useState<ShelterLocation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [likedAnimals, setLikedAnimals] = useState<string[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [mapSearch, setMapSearch] = useState("");

  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("locatie") || ""
  );
  const [startDateFilter, setStartDateFilter] = useState(
    searchParams.get("start") || ""
  );
  const [endDateFilter, setEndDateFilter] = useState(
    searchParams.get("eind") || ""
  );
  const [speciesFilter, setSpeciesFilter] = useState(
    searchParams.get("soort") || ""
  );
  const [genderFilter, setGenderFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");

  useEffect(() => {
    async function loadMapData() {
      const [animalResult, shelterResult] = await Promise.all([
        getAnimals(),
        getShelterLocations(),
      ]);

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

  const toggleLike = (
    e: React.MouseEvent<HTMLButtonElement>,
    animalId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setLikedAnimals((currentLikes) => {
      const updatedLikes = currentLikes.includes(animalId)
        ? currentLikes.filter((id) => id !== animalId)
        : [...currentLikes, animalId];

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

        return (
          animalCity.includes(search) ||
          animalPostalCode.includes(search) ||
          shelterCity.includes(search) ||
          shelterPostalCode.includes(search)
        );
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
      result = result.filter(
        (animal) => getAgeCategory(animal.age) === ageFilter
      );
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

        return (
          animalName.includes(search) ||
          breed.includes(search) ||
          shelterName.includes(search) ||
          shelterCity.includes(search)
        );
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
  }, [
    animals,
    likedAnimals,
    speciesFilter,
    locationFilter,
    startDateFilter,
    endDateFilter,
    genderFilter,
    ageFilter,
    sizeFilter,
    mapSearch,
  ]);

  const filteredShelterLocations = useMemo(() => {
    if (!mapSearch.trim() && !locationFilter.trim()) {
      return shelterLocations;
    }

    const search = (mapSearch || locationFilter).trim().toLowerCase();

    return shelterLocations.filter((shelter) => {
      const name = shelter.name?.toLowerCase() || "";
      const city = shelter.city?.toLowerCase() || "";
      const postalCode = shelter.postal_code || "";
      const street = shelter.street?.toLowerCase() || "";

      return (
        name.includes(search) ||
        city.includes(search) ||
        postalCode.includes(search) ||
        street.includes(search)
      );
    });
  }, [shelterLocations, mapSearch, locationFilter]);

  const resetFilters = () => {
    setLocationFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setSpeciesFilter("");
    setGenderFilter("");
    setAgeFilter("");
    setSizeFilter("");
  };

  return (
    <main
      className={`${styles.page} ${
        !sidebarOpen ? styles.sidebarClosedPage : ""
      }`}
    >
      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.closed : ""}`}>
        <div className={styles.sidebarTop}>
          <Link href="/dieren/resultaten" className={styles.backText}>
            ⟵ Terug naar overzicht
          </Link>

          <button
            type="button"
            className={styles.closeSidebar}
            onClick={() => setSidebarOpen(false)}
            aria-label="Dierenlijst sluiten"
          >
            ‹
          </button>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.filterButton}
            onClick={() => setFiltersOpen((current) => !current)}
          >
            ⤴ Filters
          </button>
        </div>

        {filtersOpen && (
          <div className={styles.filterPanel}>
            <label>
              Locatie
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Postcode of stad"
              />
            </label>

            <div className={styles.dateGroup}>
              <label>
                Startdatum
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => {
                    setStartDateFilter(e.target.value);

                    if (endDateFilter && e.target.value > endDateFilter) {
                      setEndDateFilter("");
                    }
                  }}
                />
              </label>

              <label>
                Einddatum
                <input
                  type="date"
                  value={endDateFilter}
                  min={startDateFilter || undefined}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </label>
            </div>

            <label>
              Ik zoek een
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
              >
                <option value="">Maakt niet uit</option>
                <option value="hond">Hond</option>
                <option value="kat">Kat</option>
                <option value="allebei">Hond en kat</option>
              </select>
            </label>

            <label>
              Geslacht
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="">Maakt niet uit</option>
                <option value="mannelijk">Mannelijk</option>
                <option value="vrouwelijk">Vrouwelijk</option>
              </select>
            </label>

            <label>
              Leeftijd
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
              >
                <option value="">Maakt niet uit</option>
                <option value="jong">Puppy / kitten</option>
                <option value="volwassen">Volwassen</option>
                <option value="senior">Senior</option>
              </select>
            </label>

            <label>
              Formaat
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
              >
                <option value="">Maakt niet uit</option>
                <option value="klein">Klein</option>
                <option value="middel">Middel</option>
                <option value="groot">Groot</option>
              </select>
            </label>

            <button
              type="button"
              className={styles.resetButton}
              onClick={resetFilters}
            >
              Filters wissen
            </button>
          </div>
        )}

        {loading ? (
          <p className={styles.loadingText}>Dieren worden geladen...</p>
        ) : filteredAnimals.length === 0 ? (
          <p className={styles.loadingText}>Geen dieren gevonden.</p>
        ) : (
          <div className={styles.cards}>
            {filteredAnimals.map((animal, index) => {
              const isLiked = likedAnimals.includes(animal.id);

              return (
                <Link
                  key={animal.id}
                  href={`/dieren/${animal.id}`}
                  className={styles.card}
                >
                  <img
                    src={animal.image_url || "/images/dog3.jpg"}
                    alt={animal.name}
                    className={styles.animalImage}
                  />

                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h2>
                        {index + 1}. {animal.name}
                      </h2>

                      <button
                        type="button"
                        className={
                          isLiked
                            ? `${styles.heartButton} ${styles.liked}`
                            : styles.heartButton
                        }
                        onClick={(e) => toggleLike(e, animal.id)}
                        aria-label="Dier opslaan"
                      >
                        ♥
                      </button>
                    </div>

                    <p className={styles.breed}>
                      {animal.breed || animal.species}
                    </p>

                    <p className={styles.description}>
                      {animal.short_description || animal.description}
                    </p>

                    <div className={styles.tags}>
                      {animal.expected_duration && (
                        <span className={styles.greenTag}>
                          {animal.expected_duration}
                        </span>
                      )}

                      {animal.care_level && (
                        <span className={styles.blueTag}>
                          {animal.care_level}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </aside>

      {!sidebarOpen && (
        <button
          type="button"
          className={styles.openSidebar}
          onClick={() => setSidebarOpen(true)}
          aria-label="Dierenlijst openen"
        >
          ›
        </button>
      )}

      <section className={styles.mapSection}>
        <div className={styles.mapSearch}>
          <span>⌕</span>

          <input
            type="text"
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder="Zoeken op kaart"
          />
        </div>

        <AnimalsMap
          animals={filteredAnimals}
          shelterLocations={filteredShelterLocations}
        />
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