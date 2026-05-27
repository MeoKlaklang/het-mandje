"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { loginUser } from "@/lib/auth/login";
import { logoutUser } from "@/lib/auth/logout";
import { getCurrentProfile } from "@/lib/auth/getProfile";

import styles from "./asielen-login.module.css";

export default function AsielenLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const { error } = await loginUser({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      alert("E-mail of wachtwoord is niet correct.");
      return;
    }

    const { profile } = await getCurrentProfile();

    if (!profile || profile.role !== "dierenasiel") {
      await logoutUser();
      setLoading(false);
      alert("Dit account heeft geen toegang tot het dierenasielplatform.");
      return;
    }

    setLoading(false);
    router.push("/asiel/dashboard");
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
            dierenasiel.
          </h1>

          <p className={styles.intro}>
            Log in om dieren, aanvragen, afspraken en opvolgingen van jouw
            dierenasiel overzichtelijk te beheren.
          </p>

          <form onSubmit={handleLogin} className={styles.form}>
            <label className={styles.field}>
              <span>E-mail</span>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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

            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? "Inloggen..." : "Inloggen"}
            </button>
          </form>

          <p className={styles.registerText}>
            Nog geen asielaccount?{" "}
            <Link href="/asielen/register">Meld je hier aan</Link>
          </p>
        </div>
      </section>

      <section className={styles.rightSide}>
        <div className={styles.imageCard}>
          <Image
            src="/images/asiel.jpg"
            alt="Dierenasiel"
            fill
            className={styles.sideImage}
            priority
          />
        </div>
      </section>
    </main>
  );
}