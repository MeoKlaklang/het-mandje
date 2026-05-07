import styles from "./hoe-werkt-opvang.module.css";

export default function HoeWerktOpvang() {
	return (
		<main className={styles.container}>
			{/* HERO */}
			<section className={styles.heroSection}>
				<div className={styles.heroContent}>
					<h1>
						Een tijdelijke thuis,
						<br />
						een groot verschil.
						<br />
						Zo werkt het.
					</h1>

					<p>Tijdelijke opvang klinkt misschien groot, maar eigenlijk draait het om één ding: een dier even de rust en liefde geven die het nodig heeft. Wij begeleiden je in elke stap.</p>

					<button>START</button>
				</div>

				<div className={styles.heroImage}></div>
			</section>

			{/* INFO BLOCKS */}
			<section className={styles.infoSection}>
				{/* LEFT */}
				<div className={styles.infoCard}>
					<div className={styles.smallImage}></div>

					<h2>Wat is tijdelijke opvang?</h2>

					<p>Tijdelijke opvang betekent dat je een dier voor een bepaalde periode een veilig thuis geeft.</p>

					<p>Soms gaat het om een paar dagen, soms wat langer net wat voor jou haalbaar is.</p>

					<p>Het doel? Het dier de kans geven om te herstellen, tot rust te komen of klaar te worden voor zijn nieuwe thuis.</p>
				</div>

				{/* MIDDLE IMAGE */}
				<div className={styles.middleImage}></div>

				{/* RIGHT */}
				<div className={styles.infoCard}>
					<h2>
						Voor wie is opvang
						<br />
						geschikt?
					</h2>

					<ul>
						<li>Voor gezinnen, koppels en alleenstaanden</li>
						<li>Je hoeft geen expert te zijn</li>
						<li>Ook met eigen huisdieren kan opvang</li>
						<li>Je kiest zelf wanneer je beschikbaar bent</li>
					</ul>

					<div className={styles.bottomImage}></div>
				</div>
			</section>

			{/* STEPS SECTION */}
			<section className={styles.stepsSection}>
				<h2>Hoe word je opvanggezin?</h2>

				<div className={styles.stepsGrid}>
					{/* STEP 1 */}
					<div className={styles.stepCard}>
						<div className={styles.stepContent}>
							<h3>Meld je interesse aan</h3>

							<p>Vul een korte vragenlijst in over jouw thuis, je tijd en je voorkeuren. Zo krijgen we een eerste beeld van welke dieren goed bij jou zouden passen. Je zet gewoon een vrijblijvende eerste stap.</p>
						</div>

						<span className={styles.stepNumber}>01</span>
					</div>

					{/* STEP 2 */}
					<div className={styles.stepCard}>
						<div className={styles.stepContent}>
							<h3>We leren je graag even kennen</h3>

							<p>Een medewerker van het asiel neemt persoonlijk contact met je op voor een rustig kennismakingsgesprek.</p>

							<p>Je krijgt uitleg over hoe opvang werkt en kunt al je vragen stellen, zonder enige verplichting.</p>
						</div>

						<span className={styles.stepNumber}>02</span>
					</div>

					{/* STEP 3 */}
					<div className={styles.stepCard}>
						<div className={styles.stepContent}>
							<h3>Vind een dier die bij jou past!</h3>

							<p>Op basis van jouw beschikbaarheid en voorkeuren stellen we dieren voor die opvang nodig hebben.</p>

							<p>Je kiest altijd zelf of je een dier wilt opvangen en wanneer dat voor jou haalbaar is.</p>
						</div>

						<span className={styles.stepNumber}>03</span>
					</div>

					{/* STEP 4 */}
					<div className={styles.stepCard}>
						<div className={styles.stepContent}>
							<h3>Start met opvangen (met begeleiding)</h3>

							<p>Je ontvangt alle info, medische gegevens en afspraken overzichtelijk via PetBridge.</p>

							<p>Het asiel en de dierenarts blijven bereikbaar voor advies, zodat je er nooit alleen voor staat.</p>
						</div>

						<span className={styles.stepNumber}>04</span>
					</div>
				</div>

				<button className={styles.ctaButton}>AANMELDEN ALS PLEEGGEZIN</button>
			</section>

			{/* BENEFITS SECTION */}
			<section className={styles.benefitsSection}>
				<h2>Wat krijg je van ons?</h2>

				<div className={styles.benefitsGrid}>
					{/* CARD 1 */}
					<div className={styles.benefitCard}>
						<div className={styles.benefitContent}>
							<h3>Duidelijke info over elk dier</h3>

							<p>Voor je start, krijg je een helder overzicht van het dier dat je opvangt: gedrag, gewoontes, medische geschiedenis, noden en wat het dier nodig heeft om zich goed te voelen.</p>
						</div>

						<span className={styles.benefitNumber}>01</span>
					</div>

					{/* CARD 2 */}
					<div className={styles.benefitCard}>
						<div className={styles.benefitContent}>
							<h3>Ondersteuning van het asiel</h3>

							<p>Het asiel blijft je vaste aanspreekpunt. Je kunt altijd bij hen terecht voor vragen, advies of hulp.</p>

							<p>Er wordt samen met jou bekeken wat haalbaar is en hoe we je het best kunnen ondersteunen.</p>
						</div>

						<span className={styles.benefitNumber}>02</span>
					</div>

					{/* CARD 3 */}
					<div className={styles.benefitCard}>
						<div className={styles.benefitContent}>
							<h3>Medische begeleiding door een dierenarts</h3>

							<p>Elke medische vraag of afspraak verloopt in overleg met een gekoppelde dierenarts.</p>

							<p>Je krijgt duidelijke richtlijnen, medicatieschema’s en opvolging zodat je nooit twijfelt over wat je moet doen.</p>
						</div>

						<span className={styles.benefitNumber}>03</span>
					</div>

					{/* CARD 4 */}
					<div className={styles.benefitCard}>
						<div className={styles.benefitContent}>
							<h3>Overzichtelijke afspraken en herinneringen</h3>

							<p>Via PetBridge zie je in één oogopslag alle afspraken, controles en belangrijke momenten.</p>

							<p>Je ontvangt automatische meldingen zodat je niets hoeft te onthouden.</p>
						</div>

						<span className={styles.benefitNumber}>04</span>
					</div>
				</div>
			</section>

			{/* DURATION SECTION */}
			<section className={styles.durationSection}>
				<div className={styles.durationContent}>
					<h2>Hoelang duurt opvang?</h2>

					<p>Elke opvang is uniek: elk dier heeft zijn eigen tempo, zijn eigen verhaal en soms net dat beetje extra tijd nodig om opnieuw tot rust te komen. Daarom verschilt de duur van opvang, maar meestal ziet het er zo uit:</p>

					<div className={styles.durationTextBlock}>
						<h3>Korte opvang: 3–10 dagen</h3>
						<p>Een veilige plek om even te landen, te herstellen of te wachten tot er ruimte is in het asiel.</p>
					</div>

					<div className={styles.durationTextBlock}>
						<h3>Gemiddelde opvang: 2–4 weken</h3>
						<p>Dat is de meest voorkomende periode. Het dier krijgt tijd om op te knappen, te groeien, aan te sterken of gewoon wat liefde te ontvangen.</p>
					</div>

					<div className={styles.durationTextBlock}>
						<h3>Langere opvang: 1–3 maanden</h3>
						<p>Voor dieren die net iets meer zorg of vertrouwen nodig hebben. Met een beetje geduld bloeien ze vaak helemaal open.</p>
					</div>

					<div className={styles.durationTextBlock}>
						<h3>Jij kiest wat bij jouw leven past</h3>
						<p>Of je nu af en toe tijd hebt of langere periodes beschikbaar bent: we passen ons aan jouw ritme aan. Samen zoeken we wat haalbaar is.</p>
					</div>
				</div>

				<div className={styles.durationImage}>
					<span>Maythe, 3 weken opvanggezin</span>
				</div>
			</section>

			{/* COST SECTION */}
			<section className={styles.costSection}>
				<h2>Wat kost opvang?</h2>

				<p className={styles.costIntro}>
					Opvangen bij Het mandje is een
					<span> warme vrijwillige daad, geen financiële verplichting.</span>
				</p>

				<div className={styles.costGrid}>
					{/* CARD 1 */}
					<div className={styles.costCard}>
						<div className={styles.costImage}></div>

						<div className={styles.costContent}>
							<h3>Het asiel zorgt voor alle medische kosten</h3>

							<p>Dierenartsbezoeken, medicatie, vaccinaties... alles wordt geregeld en vergoed. Jij hoeft nooit onverwachte medische kosten te dragen.</p>
						</div>
					</div>

					{/* CARD 2 */}
					<div className={styles.costCard}>
						<div className={styles.costImage}></div>

						<div className={styles.costContent}>
							<h3>Jij voorziet alleen de basiszorg</h3>

							<p>Een rustige plek, voeding, aandacht en een beetje liefde meer heeft een dier vaak niet nodig om zich beter te voelen. Sommige asielen geven zelfs voeding of materiaal mee.</p>
						</div>
					</div>

					{/* CARD 3 */}
					<div className={styles.costCard}>
						<div className={styles.costImage}></div>

						<div className={styles.costContent}>
							<h3>Geen onverwachte kosten, geen verplichtingen</h3>

							<p>Het enige wat echt telt, is de warmte die je geeft. Jouw tijd en zorg maken voor het dier het grootste verschil.</p>
						</div>
					</div>
				</div>

				<button className={styles.costButton}>AANMELDEN ALS PLEEGGEZIN</button>
			</section>
		</main>
	);
}
