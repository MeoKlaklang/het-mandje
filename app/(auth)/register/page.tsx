"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./register.module.css";

import InputField from "@/components/InputField";
import { registerUser } from "@/lib/auth/register";

export default function RegisterPage() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [birthDate, setBirthDate] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const router = useRouter();

	const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const { error } = await registerUser({
			email,
			password,
			firstName,
			lastName,
			birthDate,
		});

		if (error) {
			alert(error.message);
			return;
		}

		router.push("/aanmelding");
	};

	return (
		<main className={styles.registerPage}>
			<section className={styles.leftSide}>
				<Link href="/">
					<Image src="/images/LOGO.png" alt="Het mandje logo" width={95} height={70} className={styles.logo} />
				</Link>

				<div className={styles.formWrapper}>
					<h2 className={styles.title}>
						Voor we starten:
						<br />
						wie mogen we verwelkomen?
					</h2>

					<div className={styles.avatarWrapper}>
						<div className={styles.avatar}>
							<div className={styles.avatarHead}></div>
							<div className={styles.avatarBody}></div>
						</div>

						<button type="button" className={styles.editAvatar}>
							✎
						</button>
					</div>

					<form className={styles.form} onSubmit={handleRegister}>
						<InputField label="Voornaam" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />

						<InputField label="Achternaam" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />

						<InputField label="Geboortedatum" id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />

						<InputField label="E-mail" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

						<InputField label="Wachtwoord" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

						<button type="submit" className={styles.saveButton}>
							Account opslaan
						</button>
					</form>

					<p className={styles.loginText}>
						Al een account? <Link href="/login">Log je hier aan</Link>
					</p>
				</div>
			</section>

			<section className={styles.rightSide}>
				<div className={styles.imagePlaceholder}>
					<span className={styles.sun}></span>

					<svg viewBox="0 0 160 120" className={styles.placeholderIcon}>
						<path d="M0 80 L42 38 L78 92 L126 54 L160 88" />
					</svg>
				</div>
			</section>
		</main>
	);
}
