"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  getSheltersForVeterinarian,
  ShelterOption,
} from "@/lib/veterinarian/getSheltersForVeterinarian";
import styles from "./dierenarts-register.module.css";

export default function DierenartsRegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [shelters, setShelters] = useState<ShelterOption[]>([]);
  const [shelterSearch, setShelterSearch] = useState("");
  const [selectedShelterId, setSelectedShelterId] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [practiceName, setPracticeName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState("");

  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingShelters, setLoadingShelters] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadShelters() {
      const result = await getSheltersForVeterinarian();

      if (result.error) {
        setErrorMessage(result.error);
      }

      setShelters(result.shelters);
      setLoadingShelters(false);
    }

    loadShelters();
  }, []);

  const filteredShelters = useMemo(() => {
    const query = shelterSearch.trim().toLowerCase();

    if (!query) return shelters.slice(0, 6);

    return shelters
      .filter((shelter) => {
        const name = shelter.name.toLowerCase();
        const cityName = shelter.city?.toLowerCase() || "";

        return name.includes(query) || cityName.includes(query);
      })
      .slice(0, 6);
  }, [shelterSearch, shelters]);

  const selectedShelter = shelters.find(
    (shelter) => shelter.id === selectedShelterId
  );

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setErrorMessage("Vul je naam, e-mail en wachtwoord in.");
      return;
    }

    if (!selectedShelterId) {
      setErrorMessage("Kies met welk dierenasiel je samenwerkt.");
      return;
    }

    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
      }
    );

    if (signUpError || !signUpData.user) {
      setLoading(false);
      setErrorMessage(
        signUpError?.message || "Account kon niet aangemaakt worden."
      );
      return;
    }

    const userId = signUpData.user.id;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      role: "dierenarts",
      onboarding_completed: true,
    });

    if (profileError) {
      setLoading(false);
      setErrorMessage(profileError.message);
      return;
    }

    const { error: veterinarianError } = await supabase
      .from("veterinarians")
      .insert({
        user_id: userId,
        shelter_id: selectedShelterId,
        first_name: firstName,
        last_name: lastName,
        email,
        practice_name: practiceName || null,
        license_number: licenseNumber || null,
        phone: phone || null,
        street: street || null,
        house_number: houseNumber || null,
        postal_code: postalCode || null,
        city: city || null,
        country: "België",
      });

    if (veterinarianError) {
      setLoading(false);
      setErrorMessage(veterinarianError.message);
      return;
    }

    router.push("/dierenarts/dashboard");
    router.refresh();
  };

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.logoLink}>
          <span className={styles.logoText}>Het mandje</span>
        </Link>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.push("/")}
        >
          <span>‹</span>
          Terug naar home
        </button>
      </div>

      <div className={styles.wrapper}>
        <section className={styles.intro}>
          <p className={styles.label}>Dierenartsenplatform</p>
          <h1>Maak je dierenartsenaccount aan</h1>
          <p>
            Koppel je praktijk aan een dierenasiel en beheer medische dossiers,
            medicatie en afspraken centraal binnen Het Mandje.
          </p>
        </section>

        <form onSubmit={handleRegister} className={styles.formCard}>
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>1</span>
              <div>
                <h2>Persoonlijke gegevens</h2>
                <p>Deze gegevens gebruiken we voor je account.</p>
              </div>
            </div>

            <div className={styles.gridTwo}>
              <label>
                Voornaam
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Voornaam"
                />
              </label>

              <label>
                Achternaam
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Achternaam"
                />
              </label>
            </div>

            <div className={styles.gridTwo}>
              <label>
                E-mailadres
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@praktijk.be"
                />
              </label>

              <label>
                Wachtwoord
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minstens 6 tekens"
                />
              </label>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>2</span>
              <div>
                <h2>Praktijkgegevens</h2>
                <p>Vul de informatie van je dierenartspraktijk in.</p>
              </div>
            </div>

            <label>
              Praktijknaam
              <input
                type="text"
                value={practiceName}
                onChange={(e) => setPracticeName(e.target.value)}
                placeholder="Bijv. Dierenartspraktijk Kingen"
              />
            </label>

            <div className={styles.gridTwo}>
              <label>
                Dierenartsnummer
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Erkenningsnummer"
                />
              </label>

              <label>
                Telefoonnummer
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+32 ..."
                />
              </label>
            </div>

            <div className={styles.gridTwo}>
              <label>
                Straat
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Straat"
                />
              </label>

              <label>
                Huisnummer
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="12"
                />
              </label>
            </div>

            <div className={styles.gridTwo}>
              <label>
                Postcode
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="2800"
                />
              </label>

              <label>
                Gemeente
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mechelen"
                />
              </label>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>3</span>
              <div>
                <h2>Samenwerking</h2>
                <p>Kies met welk dierenasiel je samenwerkt.</p>
              </div>
            </div>

            <label>
              Dierenasiel zoeken
              <input
                type="text"
                value={shelterSearch}
                onChange={(e) => {
                  setShelterSearch(e.target.value);
                  setSelectedShelterId("");
                }}
                placeholder={
                  loadingShelters
                    ? "Dierenasielen laden..."
                    : "Zoek op naam of gemeente"
                }
              />
            </label>

            {selectedShelter ? (
              <div className={styles.selectedShelter}>
                <div>
                  <strong>{selectedShelter.name}</strong>
                  <span>{selectedShelter.city || "Gemeente onbekend"}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedShelterId("");
                    setShelterSearch("");
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className={styles.shelterResults}>
                {filteredShelters.length === 0 ? (
                  <p>Geen dierenasielen gevonden.</p>
                ) : (
                  filteredShelters.map((shelter) => (
                    <button
                      key={shelter.id}
                      type="button"
                      onClick={() => {
                        setSelectedShelterId(shelter.id);
                        setShelterSearch(shelter.name);
                      }}
                    >
                      <strong>{shelter.name}</strong>
                      <span>{shelter.city || "Gemeente onbekend"}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </section>

          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

          <div className={styles.actions}>
            <p>
              Heb je al een account?{" "}
              <Link href="/dierenarts/login">Log in</Link>
            </p>

            <button type="submit" disabled={loading}>
              {loading ? "Account maken..." : "Account aanmaken"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}