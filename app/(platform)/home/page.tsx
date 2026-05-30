import Link from "next/link";
import styles from "./Home.module.css";

export default function Home() {
	return (
		<main className={styles.container}>
			{/* HERO */}
			<section className={styles.hero}>
				<img src="/images/dog3.jpg" alt="2 katten, knuffelen" className={styles.heroImage} />

				<div className={styles.heroContent}>
					<img src="/images/touw.png" alt="" className={styles.ropeImage} />

					<p className={styles.heroText}>Met tijdelijke opvang geef je dieren een kans om te herstellen. Jij zorgt voor warmte, wij zorgen dat je nooit alleen staat.</p>

					<div className={styles.buttons}>
						<Link href="/dieren">
							<button className={styles.secondaryBtn}>Vind jouw dier</button>
						</Link>

						<Link href="/hoe-werkt-opvang">
							<button className={styles.primaryBtn}>Ontdek hoe het werkt</button>
						</Link>
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
					<div className={styles.cardImage}>
						<img src="/images/girl in shelter.jpg" alt="" />
					</div>

					<div className={styles.cardContent}>
						<p>
							ONTDEK WAT EEN OPVANGGEZIN DOET
							<br />
							EN HOE JIJ EEN VERSCHIL KAN MAKEN
						</p>

						<Link href="/pleeggezin" className={styles.cardLink}>
							<span>Lees meer</span>
						</Link>
					</div>
				</div>

				<div className={styles.card}>
					<div className={styles.cardImage}>
						<img src="/images/2 dogs in een mand.jpg" alt="" />
					</div>

					<div className={styles.cardContent}>
						<p>
							BIED EEN TIJDELIJK WARM THUIS AAN
							<br />
							JE LIEVELINGSDIER!
						</p>

						<Link href="/register" className={styles.cardLink}>
							<span>Word opvanggezin</span>
						</Link>
					</div>
				</div>

				<div className={styles.card}>
					<div className={styles.cardImage}>
						<img src="/images/leo in basket.jpg" alt="" />
					</div>

					<div className={styles.cardContent}>
						<p>
							DE TAKEN VAN EEN OPVANGGEZIN?
							<br />
							HEEL SIMPEL: LIEFDE
						</p>

						<Link href="/hoe-werkt-opvang" className={styles.cardLink}>
							<span>Meer informatie</span>
						</Link>
					</div>
				</div>
			</section>

			{/* TESTIMONIAL */}
			<section className={styles.testimonialSection}>
				<div className={styles.testimonialText}>
					<h2>Een ervaring die ons hart heeft geraakt</h2>

					<p>“We dachten dat we maar een klein beetje konden helpen, maar voor het dier betekende het alles.”</p>

					<p>Toen we ons aanmeldden als pleeggezin, hadden we geen idee wat we precies konden verwachten. We wilden gewoon graag iets doen voor dieren die het moeilijk hebben.</p>

					<p>Het is ongelooflijk hoeveel een veilige plek kan doen. Het asiel en de dierenarts begeleidden ons heel goed. Via Het Mandje hadden we altijd duidelijke info en wisten we wat we moesten doen.</p>

					<p>
						Het leukste moment? Toen ons opvangdiertje klaar was om naar zijn nieuwe thuis te vertrekken. Het was een beetje afscheid nemen, maar vooral dankbaar zijn dat we hem dat duwtje vooruit konden geven. We zouden het zo opnieuw doen, het
						geeft ontzettend veel voldoening.”
					</p>

					<p className={styles.testimonialName}>Marte, pleeggezin sinds 2024</p>

					<div className={styles.smallImageWrapper}>
						<div className={styles.smallPlaceholder}>
							<img src="/images/cat home.jpg" alt="" />
						</div>

						<Link href="/pleeggezin#faq">
							<button className={styles.faqButton}>Veelgestelde vragen</button>
						</Link>
					</div>
				</div>

				<div className={styles.largePlaceholder}>
					<img src="/images/2 katten knuffelen.jpg" alt="" />

					<div className={styles.photoLabel}>Balou en Lola, 1 maand</div>

					<img src="/images/touw.png" alt="" className={styles.largeRopeImage} />
				</div>
			</section>

			{/* NEWSLETTER */}
			<section className={styles.newsletterSection}>
				<div className={styles.newsletterImage}>
					<img src="/images/kleine-hond-in-mand.jpg" alt="" />
				</div>

				<div className={styles.newsletterContent}>
					<h2>Nieuwsbrief Het Mandje</h2>

					<p>Wil jij weten welke dieren momenteel opvang nodig hebben, hoe je zelf kunt helpen of welke mooie verhalen er ontstaan dankzij pleeggezinnen?</p>

					<p>Schrijf je in voor onze nieuwsbrief en ontvang regelmatig een warm berichtje vol updates, tips en inspirerende verhalen.</p>

					<form className={styles.newsletterForm}>
						<input type="email" placeholder="E-mailadres" />
						<button type="submit">MIS NIETS</button>
					</form>
				</div>
			</section>
		</main>
	);
}