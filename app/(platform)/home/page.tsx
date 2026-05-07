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

    <div className={styles.cardContent}>
      <p>
        ONTDEK WAT EEN OPVANGGEZIN DOET
        <br />
        EN HOE JIJ EEN VERSCHIL KAN MAKEN
      </p>

      <span>Lees meer</span>
    </div>
  </div>

  <div className={styles.card}>
    <div className={styles.cardImage}></div>

    <div className={styles.cardContent}>
      <p>
        BIED EEN TIJDELIJK WARM THUIS AAN
        <br />
        JE LIEVELINGSDIER!
      </p>

      <span>Word opvanggezin</span>
    </div>
  </div>

  <div className={styles.card}>
    <div className={styles.cardImage}></div>

    <div className={styles.cardContent}>
      <p>
        DE TAKEN VAN EEN OPVANGGEZIN?
        <br />
        HEEL SIMPEL: LIEFDE
      </p>

      <span>Meer informatie</span>
    </div>
  </div>

</section>

{/* TESTIMONIAL */}
<section className={styles.testimonialSection}>
  <div className={styles.testimonialText}>
    <h2>Een ervaring die ons hart heeft geraakt</h2>

    <p>
      “We dachten dat we maar een klein beetje konden helpen, maar voor het dier
      betekende het alles.”
    </p>

    <p>
      Toen we ons aanmeldden als pleeggezin, hadden we geen idee wat we precies
      konden verwachten. We wilden gewoon graag iets doen voor dieren die het
      moeilijk hebben.
    </p>

    <p>
      Het is ongelooflijk hoeveel een veilige plek kan doen. Het asiel en de
      dierenarts begeleidden ons heel goed. Via Het Mandje hadden we altijd
      duidelijke info en wisten we wat we moesten doen.
    </p>

    <p>Het leukste moment? Toen ons opvangdiertje klaar was om naar zijn nieuwe thuis te vertrekken. Het was een beetje afscheid nemen, maar vooral dankbaar zijn dat we hem dat duwtje vooruit konden geven. We zouden het zo opnieuw doen, het geeft ontzettend veel voldoening.”</p>

    <p className={styles.testimonialName}>
      Marte, pleeggezin sinds 2024
    </p>

    <div className={styles.smallImageWrapper}>
      <div className={styles.smallPlaceholder}></div>
      <button className={styles.faqButton}>Veelgestelde vragen</button>
    </div>
  </div>

  <div className={styles.largePlaceholder}></div>
</section>

{/* NEWSLETTER */}
<section className={styles.newsletterSection}>
  <div className={styles.newsletterImage}></div>

  <div className={styles.newsletterContent}>
    <h2>Nieuwsbrief Het Mandje</h2>

    <p>
      Wil jij weten welke dieren momenteel opvang nodig hebben, hoe je zelf kunt
      helpen of welke mooie verhalen er ontstaan dankzij pleeggezinnen?
    </p>

    <p>
      Schrijf je in voor onze nieuwsbrief en ontvang regelmatig een warm berichtje
      vol updates, tips en inspirerende verhalen.
    </p>

    <form className={styles.newsletterForm}>
      <input type="email" placeholder="E-mailadres" />
      <button type="submit">MIS NIETS</button>
    </form>
  </div>
</section>

    </main>
  );
}