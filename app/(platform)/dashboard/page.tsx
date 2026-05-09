import Link from "next/link";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <main className={styles.dashboard}>
      <nav className={styles.tabs}>
        <Link href="/dashboard" className={styles.active}>Dashboard</Link>
        <Link href="/mijn-dieren">Mijn dieren</Link>
        <Link href="/kalender">Mijn kalender</Link>
        <Link href="/profiel">Profiel</Link>
      </nav>

      <section className={styles.statusBox}>
        <h1>Je aanmelding wordt nagekeken.</h1>
        <p>
          Voor vertrouwen en veiligheid op ons platform:{" "}
          <Link href="/profiel">Voltooi je profiel en vul onderstaande gegevens in</Link>
        </p>

        <div className={styles.steps}>
          <div className={styles.stepItem}>
            <div className={styles.circle}>☎</div>
            <span>Verifieer je telefoonnummer</span>
          </div>

          <div className={styles.line}></div>

          <div className={styles.stepItem}>
            <div className={styles.circle}>▧</div>
            <span>Voeg een foto toe</span>
          </div>

          <div className={styles.line}></div>

          <div className={styles.stepItem}>
            <div className={styles.circle}>⌂</div>
            <span>Voeg je adres toe</span>
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h2>Notificatie</h2>
          <div className={styles.whiteBox}>Alles is in orde, nog een fijne dag!</div>
        </div>

        <div className={styles.card}>
          <h2>Actie vereist</h2>
          <div className={styles.outlineBox}>
            Voeg een leuke profielfoto van jezelf toe.
            <br />
            zo weten wij wie je bent!
            <br />
            <Link href="/profiel">Nu bijwerken</Link>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Mijn dieren</h2>
          <div className={styles.outlineBox}>
            Nog geen dier toegewezen
            <br />
            Je kan alvast dieren bekijken die op zoek zijn naar een tijdelijk thuis.
            <br />
            <Link href="/dieren">Vind een dier</Link>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Je historie</h2>
          <div className={styles.whiteBox}>Alles is in orde, nog een fijne dag!</div>
        </div>
      </section>
    </main>
  );
}