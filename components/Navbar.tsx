"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

import { getCurrentProfile } from "@/lib/auth/getProfile";
import { logoutUser } from "@/lib/auth/logout";

type Profile = {
	id: string;
	first_name: string | null;
	last_name: string | null;
	role: string | null;
};

export default function Navbar() {
	const router = useRouter();
	const [profile, setProfile] = useState<Profile | null>(null);

	useEffect(() => {
		async function loadProfile() {
			const { profile } = await getCurrentProfile();
			setProfile(profile);
		}

		loadProfile();
	}, []);

	const handleLogout = async () => {
		await logoutUser();
		setProfile(null);
		router.push("/home");
		router.refresh();
	};

	const isLoggedIn = !!profile;

	return (
		<nav className={styles.navbar}>
			<div className={styles.logo}>
				<Link href="/home">
					<Image src="/images/logo.png" alt="Het Mandje logo" width={200} height={150} />
				</Link>
			</div>

			<div className={styles.links}>
				<Link href="/hoe-werkt-opvang">Hoe werkt opvang?</Link>
				<Link href="/dieren">Dieren zoeken</Link>
				<Link href="/pleeggezin">Voor pleeggezinnen</Link>

				{!isLoggedIn && (
					<div className={styles.dropdown}>
						<span>Voor partners ▾</span>
						<div className={styles.dropdownContent}>
							<Link href="/asielen/login">Voor asielen</Link>
							<Link href="/dierenartsen">Voor dierenartsen</Link>
						</div>
					</div>
				)}

				<Link href="/contact">Contact</Link>
			</div>

			<div>
				{!isLoggedIn ? (
					<Link href="/login" className={styles.button}>
						Word opvanggezin
					</Link>
				) : (
					<div className={styles.userMenu}>
						<div className={styles.avatar}>
							<span>👤</span>
						</div>

						<span className={styles.userName}>{profile.first_name || "Profiel"} ▼</span>

						<div className={styles.userDropdown}>
							<Link href="/dashboard">Dashboard</Link>
							<Link href="/mijn-dieren">Mijn dieren</Link>
							<Link href="/kalender">Kalender</Link>
							<Link href="/profiel">Profiel</Link>

							<button type="button" onClick={handleLogout} className={styles.logoutLink}>
								Uitloggen
							</button>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
