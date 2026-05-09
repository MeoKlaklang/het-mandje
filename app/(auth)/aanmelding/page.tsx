"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./aanmelding.module.css";

import { saveApplication } from "@/lib/auth/saveApplication";

const questions = [
  {
    id: "opvang_duur",
    title: "Welke opvangperiode past het best bij jou?",
    options: [
      "Enkele dagen",
      "1 tot 2 weken",
      "Enkele maanden",
      "Langer dan 6 maanden",
      "Ik weet het nog niet",
      "Afhankelijk van mijn agenda",
    ],
  },
  {
    id: "woning_type",
    title: "In wat voor woning woon je?",
    options: [
      "Appartement met tuin",
      "Appartement zonder tuin",
      "Huis met tuin",
      "Huis zonder tuin",
      "Boerderij of landelijke woning",
      "Andere woonsituatie",
    ],
  },
  {
    id: "huishouden",
    title: "Met wie woon je samen?",
    options: [
      "Alleen",
      "Met partner",
      "Met gezin",
      "Met hond(en)",
      "Met kat(ten)",
      "Met meerdere huisdieren",
    ],
  },
  {
    id: "kinderen",
    title: "Zijn er kinderen in huis?",
    options: [
      "Nee",
      "Ja, 0 tot 3 jaar",
      "Ja, 4 tot 10 jaar",
      "Ja, 11 tot 17 jaar",
      "Ja, 18 jaar of ouder",
      "Kinderen komen soms op bezoek",
    ],
  },
  {
    id: "tijd_thuis",
    title: "Hoe vaak ben je gemiddeld thuis?",
    options: [
      "Bijna nooit",
      "Vooral in het weekend",
      "Elke avond na werk of school",
      "Ik werk soms van thuis",
      "Ik werk meestal van thuis",
      "Ik ben bijna altijd thuis",
    ],
  },
  {
    id: "motivatie",
    title: "Waarom wil je pleeggezin worden?",
    options: [
      "Ik wil dieren in nood helpen",
      "Ik heb ruimte en tijd",
      "Ik hou veel van dieren",
      "Ik wil tijdelijk opvang bieden",
      "Ik wil eerst ervaring opdoen",
      "Meerdere redenen",
    ],
  },
  {
    id: "ervaring_dieren",
    title: "Hoeveel ervaring heb je met dieren?",
    options: [
      "Geen ervaring",
      "Een beetje ervaring",
      "Ik heb vroeger dieren gehad",
      "Ik heb nu dieren thuis",
      "Ik heb ervaring met opvangdieren",
      "Ik werk of studeer met dieren",
    ],
  },
];

export default function AanmeldingPage() {
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const question = questions[currentQuestion];
  const selectedAnswer = answers[question.id];

  const handleSelect = (option: string) => {
    setAnswers({
      ...answers,
      [question.id]: option,
    });
  };

  const handleNext = async () => {
    if (!selectedAnswer) {
      alert("Kies eerst een antwoord.");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    setLoading(true);

    const { error } = await saveApplication(answers);

    setLoading(false);

    if (error) {
      alert("Er ging iets mis bij het opslaan van je antwoorden.");
      console.error(error);
      return;
    }

    setIsFinished(true);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <main className={styles.page}>
      <div className={styles.wrapper}>
        <h1 className={styles.pageTitle}>Aanmelding pleeggezin</h1>

        <div className={styles.progressBar}>
          <div className={`${styles.progressStep} ${styles.activeStep}`}>1</div>
          <span>Aanmelden</span>

          <div className={styles.progressLine}>
            {questions.map((_, index) => (
              <span
                key={index}
                className={
                  index <= currentQuestion || isFinished
                    ? styles.activeDot
                    : styles.dot
                }
              />
            ))}
          </div>

          <div
            className={`${styles.progressStep} ${
              isFinished ? styles.activeStep : ""
            }`}
          >
            2
          </div>
          <span>Controleren</span>

          <div className={styles.progressStep}>3</div>
          <span>Beoordeling</span>

          <div className={styles.progressStep}>4</div>
          <span>Je bent pleeggezin!</span>
        </div>

        {isFinished ? (
          <section className={styles.thankYou}>
            <h2>Dank je wel voor je aanmelding</h2>

            <p>
              We hebben je gegevens goed ontvangen.
              <br />
              Ons team bekijkt je aanvraag zorgvuldig en neemt binnenkort contact
              met je op.
              <br />
              Dat doen we niet om te twijfelen, maar om ervoor te zorgen dat elke
              opvang een veilige en fijne ervaring is voor jou én voor het dier.
              <br />
              Tot snel!
            </p>

            <div className={styles.checkCircle}>
              <span>✓</span>
            </div>

            <button
              type="button"
              className={styles.nextButton}
              onClick={handleGoToDashboard}
            >
              Naar mijn dashboard
            </button>
          </section>
        ) : (
          <section className={styles.questionBlock}>
            <p className={styles.step}>Vraag {currentQuestion + 1}</p>

            <h2 className={styles.title}>{question.title}</h2>

            <div className={styles.optionsGrid}>
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.optionCard} ${
                    selectedAnswer === option ? styles.selected : ""
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className={styles.buttons}>
              {currentQuestion > 0 && (
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={handleBack}
                >
                  Terug
                </button>
              )}

              <button
                type="button"
                className={styles.nextButton}
                onClick={handleNext}
                disabled={loading}
              >
                {loading
                  ? "Opslaan..."
                  : currentQuestion === questions.length - 1
                  ? "Aanmelding afronden"
                  : "Volgende"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}