"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { registerShelter } from "@/lib/auth/registerShelter";
import styles from "./asielen-register.module.css";

export default function AsielenRegisterPage() {
  const router = useRouter();

  const [shelterName, setShelterName] = useState("");
  const [recognitionNumber, setRecognitionNumber] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [shelterPhone, setShelterPhone] = useState("");
  const [website, setWebsite] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [accountEmail, setAccountEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [animalTypes, setAnimalTypes] = useState("");
  const [description, setDescription] = useState("");
  const [accepted, setAccepted] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!shelterName || !street || !houseNumber || !postalCode || !city) {
      alert("Vul eerst de belangrijkste gegevens van het dierenasiel in.");
      return;
    }

    if (!latitude || !longitude) {
      alert(
        "Vul latitude en longitude in zodat het dierenasiel op de kaart verschijnt."
      );
      return;
    }

    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);

    if (Number.isNaN(latitudeNumber) || Number.isNaN(longitudeNumber)) {
      alert("Latitude en longitude moeten geldige nummers zijn.");
      return;
    }

    if (!contactFirstName || !contactLastName || !contactEmail) {
      alert("Vul de gegevens van de contactpersoon in.");
      return;
    }

    if (!accountEmail || !password || !confirmPassword) {
      alert("Vul je accountgegevens volledig in.");
      return;
    }

    if (password !== confirmPassword) {
      alert("De wachtwoorden komen niet overeen.");
      return;
    }

    if (!animalTypes) {
      alert("Kies welke dieren jullie opvangen.");
      return;
    }

    if (!accepted) {
      alert("Bevestig dat je bevoegd bent om dit dierenasiel te registreren.");
      return;
    }

    setLoading(true);

    const result = await registerShelter({
      shelterName,
      recognitionNumber,
      street,
      houseNumber,
      postalCode,
      city,
      shelterPhone,
      website,

      latitude,
      longitude,

      contactFirstName,
      contactLastName,
      contactRole,
      contactEmail,
      contactPhone,

      accountEmail,
      password,
      animalTypes,
      description,
    });

    setLoading(false);

    if (!result.success) {
      alert(result.error || "Er ging iets mis bij het registreren.");
      return;
    }

    alert(
      "Je dierenasiel werd geregistreerd en toegevoegd aan de kaart. Je kan nu inloggen."
    );

    router.push("/auth/login");
  };

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/home" className={styles.logoLink}>
          <Image
            src="/images/LOGO.png"
            alt="Het Mandje logo"
            width={120}
            height={85}
            className={styles.logo}
            priority
          />
        </Link>

        <button
          type="button"
          onClick={() => router.back()}
          className={styles.backButton}
        >
          <span>‹</span>
          Ga terug
        </button>
      </div>

      <section className={styles.wrapper}>
        <div className={styles.intro}>
          <p className={styles.label}>Voor partners</p>

          <h1>
            Meld je dierenasiel
            <br />
            aan bij Het Mandje
          </h1>

          <p>
            Maak een partneraccount aan om dieren toe te voegen, aanvragen van
            pleeggezinnen op te volgen en zorginformatie overzichtelijk te
            bewaren.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formCard}>
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>01</span>

              <div>
                <h2>Gegevens van het dierenasiel</h2>
                <p>Deze informatie gebruiken we voor je profiel en de kaart.</p>
              </div>
            </div>

            <label className={styles.full}>
              Naam dierenasiel
              <input
                type="text"
                value={shelterName}
                onChange={(e) => setShelterName(e.target.value)}
                placeholder="Bijvoorbeeld: Dierenasiel Mechelen"
              />
            </label>

            <label className={styles.full}>
              Erkenningsnummer / ondernemingsnummer
              <input
                type="text"
                value={recognitionNumber}
                onChange={(e) => setRecognitionNumber(e.target.value)}
                placeholder="Optioneel"
              />
            </label>

            <div className={styles.gridTwo}>
              <label>
                Straat
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Bijv. Moorstraat"
                />
              </label>

              <label>
                Huisnummer
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="Bijv. 2"
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
                  placeholder="Bijv. 2550"
                />
              </label>

              <label>
                Stad / gemeente
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bijv. Kontich"
                />
              </label>
            </div>

            <div className={styles.gridTwo}>
              <label>
                Telefoonnummer
                <input
                  type="text"
                  value={shelterPhone}
                  onChange={(e) => setShelterPhone(e.target.value)}
                  placeholder="Bijv. 03 457 78 62"
                />
              </label>

              <label>
                Website
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>

            <div className={styles.gridTwo}>
              <label>
                Latitude
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Bijv. 51.1307"
                />
              </label>

              <label>
                Longitude
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Bijv. 4.4469"
                />
              </label>
            </div>

            <p className={styles.helperText}>
              Gebruik een punt in plaats van een komma. Bijvoorbeeld{" "}
              <strong>51.1307</strong> en <strong>4.4469</strong>. Deze
              coördinaten zorgen ervoor dat het asiel meteen op de kaart
              verschijnt.
            </p>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>02</span>

              <div>
                <h2>Contactpersoon</h2>
                <p>Wie beheert dit account binnen het dierenasiel?</p>
              </div>
            </div>

            <div className={styles.gridTwo}>
              <label>
                Voornaam
                <input
                  type="text"
                  value={contactFirstName}
                  onChange={(e) => setContactFirstName(e.target.value)}
                  placeholder="Bijv. Marte"
                />
              </label>

              <label>
                Achternaam
                <input
                  type="text"
                  value={contactLastName}
                  onChange={(e) => setContactLastName(e.target.value)}
                  placeholder="Bijv. Vermeulen"
                />
              </label>
            </div>

            <label className={styles.full}>
              Functie binnen het asiel
              <input
                type="text"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                placeholder="Bijvoorbeeld: beheerder, medewerker opvang..."
              />
            </label>

            <div className={styles.gridTwo}>
              <label>
                Werkmail
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);

                    if (!accountEmail) {
                      setAccountEmail(e.target.value);
                    }
                  }}
                  placeholder="naam@dierenasiel.be"
                />
              </label>

              <label>
                Telefoonnummer contactpersoon
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Bijv. 0470 00 00 00"
                />
              </label>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>03</span>

              <div>
                <h2>Partneraccount</h2>
                <p>Deze gegevens gebruik je later om in te loggen.</p>
              </div>
            </div>

            <label className={styles.full}>
              Login e-mail
              <input
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="login@dierenasiel.be"
              />
            </label>

            <div className={styles.gridTwo}>
              <label>
                Wachtwoord
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minstens 6 tekens"
                />
              </label>

              <label>
                Wachtwoord bevestigen
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Herhaal wachtwoord"
                />
              </label>
            </div>

            <label className={styles.full}>
              Welke dieren vangen jullie op?
              <select
                value={animalTypes}
                onChange={(e) => setAnimalTypes(e.target.value)}
              >
                <option value="">Kies een optie</option>
                <option value="honden">Honden</option>
                <option value="katten">Katten</option>
                <option value="honden_en_katten">Honden en katten</option>
                <option value="andere">Ook andere dieren</option>
              </select>
            </label>

            <label className={styles.full}>
              Korte beschrijving van het asiel
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vertel kort waar jullie asiel voor staat..."
              />
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />

              <span>
                Ik bevestig dat ik bevoegd ben om dit dierenasiel te
                registreren en dat mijn gegevens mogen worden nagekeken.
              </span>
            </label>
          </section>

          <div className={styles.actions}>
            <p>
              Al een partneraccount? <Link href="/auth/login">Log hier in</Link>
            </p>

            <button type="submit" disabled={loading}>
              {loading
                ? "Account wordt aangemaakt..."
                : "Dierenasiel registreren"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}