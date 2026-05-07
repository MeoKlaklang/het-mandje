"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

import InputField from "@/components/InputField";
import { loginUser } from "@/lib/auth/login";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        <Link href="/home">
          <Image
            src="/images/LOGO.png"
            alt="Het mandje logo"
            width={95}
            height={70}
            className={styles.logo}
          />
        </Link>

        <button
          type="button"
          onClick={() => router.back()}
          className={styles.backLink}
        >
          <span className={styles.backIcon}>‹</span>
          Ga terug
        </button>

        <div className={styles.formWrapper}>
          <h2 className={styles.title}>Welkom bij Petbridge</h2>

          <form className={styles.form} onSubmit={handleLogin}>
            <InputField
              label="E-mail"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className={styles.field}>
              <label htmlFor="password">Wachtwoord</label>

              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className={styles.showButton}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Verberg" : "Tonen"}
                </button>
              </div>

              <Link href="/wachtwoord-vergeten" className={styles.forgotLink}>
                Wachtwoord vergeten?
              </Link>
            </div>

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
        <div className={styles.imagePlaceholder}>
          <span className={styles.sun}></span>

          <svg viewBox="0 0 160 120" className={styles.placeholderIcon}>
            <path d="M0 80 L42 38 L78 92 L126 54 L160 88" />
          </svg>
        </div>
      </section>
    </main>
  );
}