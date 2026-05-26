"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "./dierenarts-login.module.css";

export default function DierenartsLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Vul je e-mailadres en wachtwoord in.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      setErrorMessage(error?.message || "Inloggen is niet gelukt.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      setLoading(false);
      setErrorMessage("Je profiel kon niet gevonden worden.");
      return;
    }

    if (profile.role !== "dierenarts") {
      await supabase.auth.signOut();
      setLoading(false);
      setErrorMessage("Dit account is geen dierenartsaccount.");
      return;
    }

    router.push("/dierenarts/dashboard");
    router.refresh();
  };

  return (
    <main className={styles.page}>
      <section className={styles.imagePanel}>
        <Link href="/" className={styles.logo}>
          Het mandje
        </Link>

        <div className={styles.imageText}>
          <h1>Welkom terug</h1>
          <span>
            Beheer afspraken, medische dossiers en opvolgingen van dieren in
            samenwerking met het asiel.
          </span>
        </div>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p>Inloggen</p>
            <h2>Welkom terug, dierenarts</h2>
            <span>
              Nog geen account?{" "}
              <Link href="/dierenarts/register">Registreer hier</Link>
            </span>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
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
                placeholder="Je wachtwoord"
              />
            </label>

            {errorMessage && (
              <p className={styles.errorMessage}>{errorMessage}</p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Inloggen..." : "Inloggen"}
            </button>
          </form>

          <Link href="/" className={styles.backLink}>
            ← Terug naar home
          </Link>
        </div>
      </section>
    </main>
  );
}