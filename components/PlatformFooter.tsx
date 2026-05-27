import Link from "next/link";
import styles from "./PlatformFooter.module.css";

export default function PlatformFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <h2>Het Mandje</h2>

          <p>
            Een warm platform dat pleeggezinnen, dierenasielen en dierenartsen
            samenbrengt om tijdelijke opvang overzichtelijker te maken.
          </p>
        </div>

        <div className={styles.linkGroup}>
          <h3>Platform</h3>

          <Link href="/dieren">Dieren zoeken</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/mijn-dieren">Mijn dieren</Link>
          <Link href="/kalender">Mijn kalender</Link>
        </div>

        <div className={styles.linkGroup}>
          <h3>Info</h3>

          <Link href="/hoe-werkt-opvang">Hoe werkt opvang?</Link>
          <Link href="/pleeggezin">Voor pleeggezinnen</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2026 Het Mandje. Alle rechten voorbehouden.</p>
      </div>
    </footer>
  );
}