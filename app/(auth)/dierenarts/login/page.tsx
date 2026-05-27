"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import styles from "./dierenarts-login.module.css";

export default function DierenartsLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      setErrorMessage("E-mail of wachtwoord is niet correct.");
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
      setErrorMessage("Dit account heeft geen toegang tot het dierenartsplatform.");
      return;
    }

    setLoading(false);
    router.push("/dierenarts/dashboard");
    router.refresh();
  };

  return (
    <main className={styles.page}>
      <section className={styles.leftSide}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.backButton}
        >
          ← Ga terug
        </button>

        <div className={styles.formWrapper}>

          <h1 className={styles.title}>
            Welkom terug,
            <br />
            dierenarts.
          </h1>

          <p className={styles.intro}>
            Log in om afspraken, medische dossiers, behandelingen en opvolgingen
            van dieren eenvoudig te beheren.
          </p>

          <form onSubmit={handleLogin} className={styles.form}>
            <label className={styles.field}>
              <span>E-mail</span>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="naam@praktijk.be"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Wachtwoord</span>

              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Je wachtwoord"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className={styles.showButton}
                >
                  {showPassword ? "Verberg" : "Tonen"}
                </button>
              </div>
            </label>

            <Link href="/wachtwoord-vergeten" className={styles.forgotLink}>
              Wachtwoord vergeten?
            </Link>

            {errorMessage && (
              <p className={styles.errorMessage}>{errorMessage}</p>
            )}

            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? "Inloggen..." : "Inloggen"}
            </button>
          </form>

          <p className={styles.registerText}>
            Nog geen dierenartsaccount?{" "}
            <Link href="/dierenarts/register">Registreer hier</Link>
          </p>
        </div>
      </section>

      <section className={styles.rightSide}>
        <div className={styles.imageCard}>
          <Image
            src="/images/dierenarts.jpg"
            alt="Dierenarts"
            fill
            className={styles.sideImage}
            priority
          />
        </div>
      </section>
    </main>
  );
}