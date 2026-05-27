"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./register.module.css";

import { registerUser } from "@/lib/auth/register";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { error } = await registerUser({
      email,
      password,
      firstName,
      lastName,
      birthDate,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/aanmelding");
  };

  return (
    <main className={styles.registerPage}>
      <section className={styles.leftSide}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
        >
          ← Ga terug
        </button>

        <div className={styles.formWrapper}>

          <h1 className={styles.title}>
           Welkom!
          </h1>

          <p className={styles.introText}>
            Maak een account aan om dieren te ontdekken, een opvangaanvraag te
            starten en later je opvangdier op te volgen.
          </p>

          <form className={styles.form} onSubmit={handleRegister}>
            <label className={styles.field}>
              <span>Voornaam</span>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </label>

            <label className={styles.field}>
              <span>Achternaam</span>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </label>

            <label className={styles.field}>
              <span>Geboortedatum</span>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                required
              />
            </label>

            <label className={styles.field}>
              <span>E-mail</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Wachtwoord</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />
            </label>

            <button type="submit" className={styles.saveButton}>
              Account aanmaken
            </button>
          </form>

          <p className={styles.loginText}>
            Al een account? <Link href="/login">Log je hier aan</Link>
          </p>
        </div>
      </section>

      <section className={styles.rightSide}>
        <div className={styles.imageCard}>
          <Image
            src="/images/kitten in mandje.jpg"
            alt="Kat in een mandje.png"
            fill
            className={styles.sideImage}
            priority
          />
        </div>
      </section>
    </main>
  );
}