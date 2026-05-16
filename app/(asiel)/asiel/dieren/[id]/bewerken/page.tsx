"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AsielLayout from "@/components/asiel/AsielLayout";
import styles from "../../nieuw/nieuw-dier.module.css";
import { updateAnimal } from "@/lib/asiel/updateAnimal";
import { getAnimalForEdit } from "@/lib/asiel/getAnimalForEdit";

type AnimalStatus = "concept" | "beschikbaar" | "gereserveerd" | "in_opvang" | "niet_beschikbaar";

export default function BewerkDierPage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const animalId = params.id;

	const [species, setSpecies] = useState<"hond" | "kat">("hond");
	const [name, setName] = useState("");
	const [breed, setBreed] = useState("");
	const [gender, setGender] = useState("");
	const [birthDate, setBirthDate] = useState("");
	const [age, setAge] = useState("");
	const [size, setSize] = useState("");
	const [weight, setWeight] = useState("");
	const [coatColor, setCoatColor] = useState("");
	const [specialNeeds, setSpecialNeeds] = useState("");

	const [origin, setOrigin] = useState("");
	const [intakeDate, setIntakeDate] = useState("");
	const [intakeReason, setIntakeReason] = useState("");
	const [intakeNotes, setIntakeNotes] = useState("");
	const [admittedBy, setAdmittedBy] = useState("");

	const [chipNumber, setChipNumber] = useState("");
	const [passportNumber, setPassportNumber] = useState("");

	const [imageUrl, setImageUrl] = useState("");

	const [shortDescription, setShortDescription] = useState("");
	const [description, setDescription] = useState("");
	const [behaviorNotes, setBehaviorNotes] = useState("");
	const [medicalNotes, setMedicalNotes] = useState("");
	const [temperament, setTemperament] = useState("");

	const [availableFrom, setAvailableFrom] = useState("");
	const [availableUntil, setAvailableUntil] = useState("");
	const [expectedDuration, setExpectedDuration] = useState("");
	const [careLevel, setCareLevel] = useState("normaal");
	const [status, setStatus] = useState<AnimalStatus>("concept");

	const [vaccinated, setVaccinated] = useState(false);
	const [neutered, setNeutered] = useState(false);
	const [canLiveWithCats, setCanLiveWithCats] = useState(false);
	const [canLiveWithDogs, setCanLiveWithDogs] = useState(false);
	const [canLiveWithChildren, setCanLiveWithChildren] = useState(false);
	const [canBeHomeAlone, setCanBeHomeAlone] = useState(false);
	const [houseTrained, setHouseTrained] = useState(false);
	const [needsMedication, setNeedsMedication] = useState(false);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		async function loadAnimal() {
			const { animal, error } = await getAnimalForEdit(animalId);

			if (error || !animal) {
				alert(error || "Dier kon niet geladen worden.");
				router.push("/asiel/dashboard");
				return;
			}

			setSpecies(animal.species || "hond");
			setName(animal.name || "");
			setBreed(animal.breed || "");
			setGender(animal.gender || "");
			setBirthDate(animal.birth_date || "");
			setAge(animal.age || "");
			setSize(animal.size || "");
			setWeight(animal.weight || "");
			setCoatColor(animal.coat_color || "");
			setSpecialNeeds(animal.special_needs || "");

			setOrigin(animal.origin || "");
			setIntakeDate(animal.intake_date || "");
			setIntakeReason(animal.intake_reason || "");
			setIntakeNotes(animal.intake_notes || "");
			setAdmittedBy(animal.admitted_by || "");

			setChipNumber(animal.chip_number || "");
			setPassportNumber(animal.passport_number || "");

			setImageUrl(animal.image_url || "");

			setShortDescription(animal.short_description || "");
			setDescription(animal.description || "");
			setBehaviorNotes(animal.behavior_notes || "");
			setMedicalNotes(animal.medical_notes || "");
			setTemperament(animal.temperament || "");

			setAvailableFrom(animal.available_from || "");
			setAvailableUntil(animal.available_until || "");
			setExpectedDuration(animal.expected_duration || "");
			setCareLevel(animal.care_level || "normaal");
			setStatus(animal.status || "concept");

			setVaccinated(Boolean(animal.vaccinated));
			setNeutered(Boolean(animal.neutered));
			setCanLiveWithCats(Boolean(animal.can_live_with_cats));
			setCanLiveWithDogs(Boolean(animal.can_live_with_dogs));
			setCanLiveWithChildren(Boolean(animal.can_live_with_children));
			setCanBeHomeAlone(Boolean(animal.can_be_home_alone));
			setHouseTrained(Boolean(animal.house_trained));
			setNeedsMedication(Boolean(animal.needs_medication));

			setLoading(false);
		}

		loadAnimal();
	}, [animalId, router]);

	const handleSave = async () => {
		if (!name || !species || !breed || !gender || !age || !size) {
			alert("Vul minstens naam, soort, ras, geslacht, leeftijd en grootte in.");
			return;
		}

		setSaving(true);

		const result = await updateAnimal({
			animalId,
			species,
			name,
			breed,
			gender,
			birthDate,
			age,
			size,
			weight,
			coatColor,
			specialNeeds,
			origin,
			intakeDate,
			intakeReason,
			intakeNotes,
			admittedBy,
			chipNumber,
			passportNumber,
			imageUrl,
			shortDescription,
			description,
			behaviorNotes,
			medicalNotes,
			temperament,
			availableFrom,
			availableUntil,
			expectedDuration,
			careLevel,
			status,
			vaccinated,
			neutered,
			canLiveWithCats,
			canLiveWithDogs,
			canLiveWithChildren,
			canBeHomeAlone,
			houseTrained,
			needsMedication,
		});

		setSaving(false);

		if (!result.success) {
			alert(result.error);
			return;
		}

		alert("Diergegevens werden opgeslagen.");
		router.push("/asiel/dashboard");
	};

	if (loading) {
		return (
			<AsielLayout>
				<main className={styles.page}>
					<div className={styles.wrapper}>
						<p>Dier wordt geladen...</p>
					</div>
				</main>
			</AsielLayout>
		);
	}

	return (
		<AsielLayout>
			<main className={styles.page}>
				<div className={styles.wrapper}>
					<div className={styles.topBar}>
						<div>
							<Link href="/asiel/dashboard" className={styles.backLink}>
								← Terug naar dashboard
							</Link>

							<h1>{name ? `${name} bewerken` : "Dier bewerken"}</h1>
							<p>Pas de gegevens van dit dier aan en sla je wijzigingen op.</p>
						</div>
					</div>

					<div className={styles.formLayout}>
						<section className={styles.leftColumn}>
							<div className={styles.card}>
								<h2>Basisgegevens</h2>

								<label>
									Soort
									<div className={styles.speciesToggle}>
										<button type="button" className={species === "hond" ? styles.activeSpecies : ""} onClick={() => setSpecies("hond")}>
											Hond
										</button>

										<button type="button" className={species === "kat" ? styles.activeSpecies : ""} onClick={() => setSpecies("kat")}>
											Kat
										</button>
									</div>
								</label>

								<label>
									Naam van het dier
									<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bijv. Luna" />
								</label>

								<label>
									Ras
									<input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Bijv. Golden Retriever" />
								</label>

								<div className={styles.gridThree}>
									<label>
										Geslacht
										<select value={gender} onChange={(e) => setGender(e.target.value)}>
											<option value="">Selecteer</option>
											<option value="mannelijk">Mannelijk</option>
											<option value="vrouwelijk">Vrouwelijk</option>
										</select>
									</label>

									<label>
										Geboortedatum
										<input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
									</label>

									<label>
										Leeftijd
										<input type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Bijv. 8 jaar" />
									</label>
								</div>

								<div className={styles.gridThree}>
									<label>
										Grootte
										<select value={size} onChange={(e) => setSize(e.target.value)}>
											<option value="">Selecteer</option>
											<option value="klein">Klein</option>
											<option value="middel">Middel</option>
											<option value="groot">Groot</option>
										</select>
									</label>

									<label>
										Gewicht
										<input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Bijv. 25kg" />
									</label>

									<label>
										Kleur / vacht
										<input type="text" value={coatColor} onChange={(e) => setCoatColor(e.target.value)} placeholder="Bijv. bruin, kort haar" />
									</label>
								</div>

								<label>
									Bijzonderheden
									<textarea value={specialNeeds} onChange={(e) => setSpecialNeeds(e.target.value)} placeholder="Bijv. rustig karakter, bang van harde geluiden..." />
								</label>
							</div>

							<div className={styles.card}>
								<h2>Opvanginformatie</h2>

								<div className={styles.gridTwo}>
									<label>
										Beschikbaar vanaf
										<input type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
									</label>

									<label>
										Beschikbaar tot
										<input type="date" value={availableUntil} onChange={(e) => setAvailableUntil(e.target.value)} />
									</label>
								</div>

								<div className={styles.gridTwo}>
									<label>
										Verwachte opvangduur
										<input type="text" value={expectedDuration} onChange={(e) => setExpectedDuration(e.target.value)} placeholder="Bijv. 4 weken verblijf" />
									</label>

									<label>
										Urgentie
										<select value={careLevel} onChange={(e) => setCareLevel(e.target.value)}>
											<option value="normaal">Normaal</option>
											<option value="dringend">Dringend</option>
											<option value="medisch">Medische opvolging</option>
										</select>
									</label>
								</div>

								<label>
									Korte beschrijving
									<textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Korte tekst voor in de dierenkaart..." />
								</label>

								<label>
									Uitgebreide beschrijving
									<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Vertel meer over het dier, karakter, noden en situatie..." />
								</label>
							</div>

							<div className={styles.card}>
								<h2>Herkomst & opname</h2>

								<div className={styles.gridTwo}>
									<label>
										Herkomst
										<input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Bijv. afstand, gevonden..." />
									</label>

									<label>
										Datum binnenkomst
										<input type="date" value={intakeDate} onChange={(e) => setIntakeDate(e.target.value)} />
									</label>
								</div>

								<label>
									Waarom is dit dier binnengebracht?
									<textarea value={intakeReason} onChange={(e) => setIntakeReason(e.target.value)} placeholder="Reden..." />
								</label>

								<div className={styles.gridTwo}>
									<label>
										Opgenomen door
										<input type="text" value={admittedBy} onChange={(e) => setAdmittedBy(e.target.value)} placeholder="Naam medewerker" />
									</label>

									<label>
										Extra notities
										<input type="text" value={intakeNotes} onChange={(e) => setIntakeNotes(e.target.value)} placeholder="Extra informatie..." />
									</label>
								</div>
							</div>
						</section>

						<section className={styles.rightColumn}>
							<div className={styles.card}>
								<h2>Status & publicatie</h2>

								<label>
									Status
									<select value={status} onChange={(e) => setStatus(e.target.value as AnimalStatus)}>
										<option value="concept">Concept</option>
										<option value="beschikbaar">Beschikbaar</option>
										<option value="gereserveerd">Gereserveerd</option>
										<option value="in_opvang">In opvang</option>
										<option value="niet_beschikbaar">Niet beschikbaar</option>
									</select>
								</label>
							</div>

							<div className={styles.card}>
								<h2>Identificatie</h2>

								<label>
									Chipnummer
									<input type="text" value={chipNumber} onChange={(e) => setChipNumber(e.target.value)} placeholder="Bijv. 981..." />
								</label>

								<label>
									Paspoortnummer
									<input type="text" value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} placeholder="Bijv. BE..." />
								</label>
							</div>

							<div className={styles.card}>
								<h2>Foto</h2>

								<label>
									Afbeelding URL
									<input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="/images/dog3.jpg" />
								</label>

								<div className={styles.uploadBox}>{imageUrl ? <img src={imageUrl} alt="Preview" /> : <p>Klik om foto’s te uploaden</p>}</div>
							</div>

							<div className={styles.card}>
								<h2>Gedrag & matching</h2>

								<label>
									Gedrag / temperament
									<select value={temperament} onChange={(e) => setTemperament(e.target.value)}>
										<option value="">Selecteer</option>
										<option value="rustig">Rustig</option>
										<option value="speels">Speels</option>
										<option value="angstig">Angstig</option>
										<option value="sociaal">Sociaal</option>
										<option value="zorg nodig">Heeft extra zorg nodig</option>
									</select>
								</label>

								<label>
									Gedragsinfo
									<textarea value={behaviorNotes} onChange={(e) => setBehaviorNotes(e.target.value)} placeholder="Bijv. kan moeilijk alleen zijn, schrikt snel..." />
								</label>

								<div className={styles.checkGrid}>
									<label>
										<input type="checkbox" checked={canLiveWithCats} onChange={(e) => setCanLiveWithCats(e.target.checked)} />
										Kan bij katten
									</label>

									<label>
										<input type="checkbox" checked={canLiveWithDogs} onChange={(e) => setCanLiveWithDogs(e.target.checked)} />
										Kan bij honden
									</label>

									<label>
										<input type="checkbox" checked={canLiveWithChildren} onChange={(e) => setCanLiveWithChildren(e.target.checked)} />
										Kan bij kinderen
									</label>

									<label>
										<input type="checkbox" checked={canBeHomeAlone} onChange={(e) => setCanBeHomeAlone(e.target.checked)} />
										Kan alleen thuis zijn
									</label>

									<label>
										<input type="checkbox" checked={houseTrained} onChange={(e) => setHouseTrained(e.target.checked)} />
										Zindelijk
									</label>
								</div>
							</div>

							<div className={styles.card}>
								<h2>Medische info</h2>

								<label>
									Medische aandachtspunten
									<textarea value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} placeholder="Bijv. operatie gepland, medicatie, controle nodig..." />
								</label>

								<div className={styles.checkGrid}>
									<label>
										<input type="checkbox" checked={vaccinated} onChange={(e) => setVaccinated(e.target.checked)} />
										Gevaccineerd
									</label>

									<label>
										<input type="checkbox" checked={neutered} onChange={(e) => setNeutered(e.target.checked)} />
										Gecastreerd / gesteriliseerd
									</label>

									<label>
										<input type="checkbox" checked={needsMedication} onChange={(e) => setNeedsMedication(e.target.checked)} />
										Heeft medicatie nodig
									</label>
								</div>
							</div>

							<div className={styles.actions}>
								<button type="button" className={styles.secondaryButton} disabled={saving} onClick={() => router.push("/asiel/dashboard")}>
									Annuleren
								</button>

								<button type="button" className={styles.primaryButton} disabled={saving} onClick={handleSave}>
									{saving ? "Opslaan..." : "Wijzigingen opslaan"}
								</button>
							</div>
						</section>
					</div>
				</div>
			</main>
		</AsielLayout>
	);
}
