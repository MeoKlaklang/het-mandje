"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dieren.module.css";

export default function DierenPage() {
  const router = useRouter();

  const [animalType, setAnimalType] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (animalType) params.set("soort", animalType);
    if (location) params.set("locatie", location);
    if (date) params.set("datum", date);

    router.push(`/dieren/resultaten?${params.toString()}`);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.overlay}></div>

        <div className={styles.content}>
          <h1>
            Ontdek welk dier vandaag jouw
            <br />
            warmte kan gebruiken.
          </h1>

          <p>
            In jouw buurt wachten dieren op een tijdelijk, veilig plekje om even
            op adem te komen.
          </p>

          <form className={styles.searchBox} onSubmit={handleSearch}>
            <label className={styles.searchItem}>
              <span>Ik zoek</span>

              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
              >
                <option value="">een hond / kat</option>
                <option value="hond">Hond</option>
                <option value="kat">Kat</option>
              </select>
            </label>

            <label className={styles.searchItem}>
              <span>In de buurt van</span>

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Voor je postcode of straat in"
              />
            </label>

            <label className={styles.searchItem}>
              <span>Op</span>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <button type="submit" className={styles.searchButton}>
              Vind een dier
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}