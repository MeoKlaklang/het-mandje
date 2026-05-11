"use client";

import { useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./DashboardNavbar.module.css";

import { getCurrentProfile } from "@/lib/auth/getProfile";
import { logoutUser } from "@/lib/auth/logout";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
};

export default function DashboardNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { profile } = await getCurrentProfile();
      setProfile(profile);
    }

    loadProfile();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/home");
    router.refresh();
  };

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <Link href="/home">
          <Image
            src="/images/logo.png"
            alt="Het Mandje logo"
            width={110}
            height={80}
            className={styles.logo}
          />
        </Link>

        <div className={styles.rightActions}>
          <Link href="/dieren" className={styles.searchButton}>
            Zoek een dier
          </Link>

          <div className={styles.userMenu}>
            <div className={styles.avatar}>
              <span>👤</span>
            </div>

            <span className={styles.userName}>
              {profile?.first_name || "Profiel"} ▼
            </span>

            <div className={styles.userDropdown}>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/mijn-dieren">Mijn dieren</Link>
              <Link href="/kalender">Mijn kalender</Link>
              <Link href="/profiel">Profiel</Link>

              <button
                type="button"
                onClick={handleLogout}
                className={styles.logoutLink}
              >
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className={styles.navLinks}>
        <Link
          href="/dashboard"
          className={pathname === "/dashboard" ? styles.active : ""}
        >
          Dashboard
        </Link>

        <Link
          href="/mijn-dieren"
          className={pathname === "/mijn-dieren" ? styles.active : ""}
        >
          Mijn dieren
        </Link>

        <Link
          href="/kalender"
          className={pathname === "/kalender" ? styles.active : ""}
        >
          Mijn kalender
        </Link>

        <Link
          href="/profiel"
          className={pathname === "/profiel" ? styles.active : ""}
        >
          Profiel
        </Link>
      </nav>
    </header>
  );
}