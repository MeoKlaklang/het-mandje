"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

import { loginUser } from "@/lib/auth/login";

export default function LoginPage() {
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

    setLoading(false);

    if (error) {
      alert("E-mail of wachtwoord is niet correct.");
      return;
    }

    router.push("/home");
  };

  return (
    <main className={styles.loginPage}>
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
            Log in op
            <br />
            Het Mandje.
          </h1>

          <p className={styles.introText}>
            Meld je aan om je aanvragen, opvangdieren, afspraken en updates
            verder op te volgen.
          </p>

          <form className={styles.form} onSubmit={handleLogin}>
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

            <label className={styles.field}>
              <span>Wachtwoord</span>

              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <button
                  type="button"
                  className={styles.showButton}
                  onClick={() => setShowPassword((current) => !current)}
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
              {loading ? "Bezig..." : "Inloggen"}
            </button>
          </form>

          <p className={styles.registerText}>
            Heb je nog geen account?{" "}
            <Link href="/register">Meld je hier aan</Link>
          </p>
        </div>
      </section>

      <section className={styles.rightSide}>
        <div className={styles.imageCard}>
          <Image
            src="/images/labrador in mand.jpg"
            alt="labrador in een mandje"
            fill
            className={styles.sideImage}
            priority
          />
        </div>
      </section>
    </main>
  );
}