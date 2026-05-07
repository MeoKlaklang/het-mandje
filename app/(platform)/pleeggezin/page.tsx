import styles from "./pleeggezin.module.css";

export default function Pleeggezin() {
  return (
    <main className={styles.container}>
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1>
            Een tijdelijk thuis maakt
            <br />
            een wereld van verschil
          </h1>

          <p>
            Pleeggezin worden klinkt misschien groot, maar eigenlijk draait het om
            één ding: <span>een dier even rust, liefde en veiligheid geven.</span>
            <br />
            Wij begeleiden je stap voor stap, je staat er nooit alleen voor.
          </p>
        </div>

        <div className={styles.heroImage}>
          <span>Victor, 12 jaar</span>
        </div>
      </section>

      <section className={styles.importanceSection}>
        <h2>Waarom jij belangrijk bent voor ons!</h2>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Jij geeft dieren een veilige tussenstop</h3>
            <p>
              Een asiel is vaak druk en luid. In een pleeggezin kan een dier eindelijk ademhalen: rust, routine en een warme zetel (of mandje). Die veilige tussenstop maakt een wereld van verschil voor hun herstel, gedrag en vertrouwen in mensen.
            </p>
            <span>01</span>
          </div>

          <div className={styles.card}>
            <h3>Jij maakt plaats voor dieren die nú hulp nodig hebben</h3>
            <p>
              Elke pleegplek is letterlijk extra ademruimte. Wanneer jij tijdelijk opvangt, komt er in het asiel een plek vrij voor een dier dat net binnenkomt: gevonden, afgestaan, gewond of dringend op zoek naar bescherming. Zo help je niet één dier, maar eigenlijk twee.
            </p>
            <span>02</span>
          </div>

          <div className={styles.card}>
            <h3>Jij helpt mee aan een betere match voor altijd</h3>
            <p>
             In een thuisomgeving leren we een dier pas écht kennen: wat het nodig heeft, waar het blij van wordt, en wat het lastig vindt. Dankzij jouw observaties kunnen we veel beter inschatten welk “voor altijd” gezin past. En dat betekent: minder stress, minder terugkeer, meer gelukkige eindes.
            </p>
            <span>03</span>
          </div>
        </div>
      </section>

      {/* TASKS SECTION */}
<section className={styles.tasksSection}>

  <h2>Wat jouw taken zijn als opvanggezin</h2>

  <div className={styles.tasksGrid}>

    {/* CARD 1 */}
    <div className={styles.taskCard}>
      <h3>Een veilige rustige plek bieden</h3>

      <p>
        In jouw huis kan een dier even “landen”. Weg van drukte, met stilte,
        warmte en tijd om te wennen.
      </p>

      <p>
        Vooral dieren die angstig zijn, ouder zijn of net een operatie achter de
        rug hebben, bloeien hier vaak het snelst van open.
      </p>
    </div>

    {/* CARD 2 */}
    <div className={styles.taskCard}>
      <h3>Basis zorg geven</h3>

      <p>
        Jij zorgt voor de dagelijkse basis: eten, drinken, hygiëne en een
        wandeling of kattenbakmomentje.
      </p>

      <p>
        Soms komt er tijdelijk iets extra bij, zoals medicatie of een rustige
        herstelplek ideaal voor dieren in herstel of pups/kittens die nog wat
        extra zorg nodig hebben.
      </p>
    </div>

    {/* CARD 3 */}
    <div className={styles.taskCard}>
      <h3>Structuur brengen</h3>

      <p>
        Een vaste routine geeft dieren houvast: vaste uren, vaste plekjes,
        vaste gewoontes. Dat verlaagt stress en maakt hen zekerder.
      </p>

      <p>
        Dit is superbelangrijk voor dieren die nog moeten leren hoe thuisleven
        werkt (ja, ook wat een stofzuiger is).
      </p>
    </div>

    {/* CARD 4 */}
    <div className={styles.taskCard}>
      <h3>Observeren en updates sturen</h3>

      <p>
        Jij ziet het echte verhaal: hoe eet het dier, hoe slaapt het, wat doet
        het bij prikkels, hoe is de energie?
      </p>

      <p>
        Met jouw updates (en af en toe een foto) kunnen wij beter opvolgen en
        sneller de juiste match vinden voor een warme “voor altijd” thuis.
      </p>
    </div>

  </div>

  <button className={styles.tasksButton}>
    AANMELDEN ALS OPVANGGEZIN
  </button>

</section>

{/* FAQ SECTION */}
<section className={styles.faqSection}>

  <h2>FAQ</h2>

  <div className={styles.faqList}>

    <details className={styles.faqItem}>
      <summary>Kan ik opvanggezin worden als ik al een dier heb?</summary>

      <p>
        Ja, in veel gevallen kan dat perfect. We bekijken samen welk dier goed
        zou passen bij jouw situatie en huisdieren.
      </p>
    </details>

    <details className={styles.faqItem}>
      <summary>Wat als ik me hecht?</summary>

      <p>
        Dat gebeurt heel vaak. Het betekent vooral dat het dier zich veilig
        voelde bij jou. We begeleiden je hier stap voor stap in.
      </p>
    </details>

    <details className={styles.faqItem}>
      <summary>Wat als het niet klikt of te zwaar wordt?</summary>

      <p>
        Je staat er nooit alleen voor. Samen zoeken we altijd naar een oplossing
        die goed voelt voor jou én het dier.
      </p>
    </details>

    <details className={styles.faqItem}>
      <summary>Mag ik kiezen welk dier ik opvang?</summary>

      <p>
        Ja. We stellen dieren voor, maar jij beslist altijd zelf waar jij je
        comfortabel bij voelt.
      </p>
    </details>

    <details className={styles.faqItem}>
      <summary>Wat kost het mij?</summary>

      <p>
        Medische kosten worden meestal gedragen door het asiel. Jij biedt vooral
        tijd, rust en een warme plek.
      </p>
    </details>

    <details className={styles.faqItem}>
      <summary>Moet ik ervaring hebben met dieren?</summary>

      <p>
        Nee. Liefde, geduld en een veilige omgeving zijn het belangrijkste.
        We begeleiden je in alles.
      </p>
    </details>

  </div>

</section>
    </main>
  );
}