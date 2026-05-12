"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getAnimals, Animal } from "@/lib/animals/getAnimals";
import styles from "./resultaten.module.css";

export default function DierenResultatenPage() {
  const searchParams = useSearchParams();

  const soort = searchParams.get("soort") || "";
  const locatie = searchParams.get("locatie") || "";
  const datum = searchParams.get("datum") || "";

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  const [genderFilter, setGenderFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");

  useEffect(() => {
    async function loadAnimals() {
      const { animals } = await getAnimals();

      setAnimals(animals);
      setLoading(false);
    }

    loadAnimals();
  }, []);

  useEffect(() => {
    let result = [...animals];

    if (soort) {
      result = result.filter((animal) => animal.species === soort);
    }

    if (locatie) {
      result = result.filter((animal) => {
        const city = animal.city?.toLowerCase() || "";
        const postalCode = animal.postal_code || "";
        const search = locatie.toLowerCase();

        return city.includes(search) || postalCode.includes(search);
      });
    }

    if (genderFilter) {
      result = result.filter((animal) => animal.gender === genderFilter);
    }

    if (ageFilter) {
      result = result.filter((animal) => animal.age === ageFilter);
    }

    if (sizeFilter) {
      result = result.filter((animal) => animal.size === sizeFilter);
    }

    setFilteredAnimals(result);
  }, [animals, soort, locatie, genderFilter, ageFilter, sizeFilter]);

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.filters}>
          <div className={styles.mapBox}>
            <button type="button">Toon op kaart</button>
          </div>

          <label>
            Locatie
            <input
              type="text"
              value={locatie || "3190 Boortmeerbeek, Belgium"}
              readOnly
            />
          </label>

          <label>
            Datum
            <input type="date" value={datum} readOnly />
          </label>

          <label>
            Ik zoek een
            <input
              type="text"
              value={soort || "Maakt niet uit"}
              readOnly
            />
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
              <option value="1 jaar">1 jaar</option>
              <option value="2 jaar">2 jaar</option>
              <option value="4 jaar">4 jaar</option>
              <option value="7 jaar">7 jaar</option>
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
        </aside>

        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <p>Volgorde: Dringend ↓</p>
          </div>

          {loading ? (
            <p className={styles.emptyText}>Dieren worden geladen...</p>
          ) : filteredAnimals.length === 0 ? (
            <p className={styles.emptyText}>
              Geen dieren gevonden met deze filters.
            </p>
          ) : (
            <div className={styles.cards}>
              {filteredAnimals.map((animal, index) => (
                <article key={animal.id} className={styles.card}>
                  <img
                    src={animal.image_url || "/images/dog3.jpg"}
                    alt={animal.name}
                    className={styles.animalImage}
                  />

                  <div className={styles.cardContent}>
                    <div className={styles.cardTop}>
                      <div>
                        <h2>
                          {index + 1}. {animal.name}
                        </h2>
                        <p className={styles.breed}>{animal.breed}</p>
                      </div>

                      <button type="button" className={styles.heartButton}>
                        ♥
                      </button>
                    </div>

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

                  <div className={styles.cardIcons}>
                    <span>↗</span>
                    <span>📍</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}