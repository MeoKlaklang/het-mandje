"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./DashboardNavbar.module.css";

export default function DashboardNavbar() {
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
            <div className={styles.avatar}>👤</div>
            <span>Meo</span>
            <span>⌄</span>
          </div>
        </div>
      </div>

      <nav className={styles.navLinks}>
        <Link href="/dashboard/dashboard" className={styles.active}>
          Dashboard
        </Link>
        <Link href="/mijn-dieren">Mijn dieren</Link>
        <Link href="/kalender">Mijn kalender</Link>
        <Link href="/profiel">Profiel</Link>
      </nav>
    </header>
  );
}