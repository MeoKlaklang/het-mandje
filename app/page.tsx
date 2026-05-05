import styles from "./Home.module.css";

export default function Home() {
  return (
    <main className={styles.container}>

      {/* HERO */}
      <section className={styles.hero}>
        
        <img
          src="/images/dog3.jpg"
          alt="dog"
          className={styles.heroImage}
        />

        <div className={styles.heroContent}>
          <p className={styles.heroText}>
            Met tijdelijke opvang geef je dieren een kans om te herstellen.
            Jij zorgt voor warmte, wij zorgen dat je nooit alleen staat.
          </p>

          <div className={styles.buttons}>
            <button className={styles.secondaryBtn}>Vind jouw dier</button>
            <button className={styles.primaryBtn}>
              Ontdek hoe het werkt
            </button>
          </div>
        </div>

        <h1 className={styles.heroTitle}>
          Geef een dier even
          <br />
          ademruimte, liefde en rust.
        </h1>
      </section>

      {/* CARDS */}
      <section className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardImage}></div>
          <p>ONTDEK WAT EEN OPVANGGEZIN DOET</p>
          <span>Lees meer</span>
        </div>

        <div className={styles.card}>
          <div className={styles.cardImage}></div>
          <p>BIED EEN TIJDELIJK THUIS AAN</p>
          <span>Word opvanggezin</span>
        </div>

        <div className={styles.card}>
          <div className={styles.cardImage}></div>
          <p>DE TAKEN VAN EEN OPVANGGEZIN</p>
          <span>Meer info</span>
        </div>
      </section>

    </main>
  );
}