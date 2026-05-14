"use client";

import { useState } from "react";
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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        <Link href="/home" className={styles.logoLink}>
          <Image
            src="/images/logo.png"
            alt="Het Mandje logo"
            width={110}
            height={80}
            className={styles.logo}
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

        <div className={styles.formWrapper}>
          <h1>Welkom</h1>

          <p className={styles.intro}>
            Log in om dieren, aanvragen en opvolgingen van jouw dierenasiel te
            beheren. Zo blijft elke opvang duidelijk en veilig opgevolgd.
          </p>

          <form onSubmit={handleLogin} className={styles.form}>
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Wachtwoord
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
            Heb je nog geen account?{" "}
            <Link href="/asielen/register">Meld je hier aan</Link>
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