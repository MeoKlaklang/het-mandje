"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { searchDierenartsAnimals, DierenartsAnimalSearchResult } from "@/lib/dierenarts/searchDierenartsAnimals";
import styles from "./DierenartsLayout.module.css";

type DierenartsProfile = {
	first_name: string | null;
	last_name: string | null;
	practice_name: string | null;
};

export default function DierenartsLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const supabase = createClient();

	const [profile, setProfile] = useState<DierenartsProfile | null>(null);
	const [search, setSearch] = useState("");
	const [searchResults, setSearchResults] = useState<DierenartsAnimalSearchResult[]>([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		async function loadProfile() {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) return;

			const { data } = await supabase.from("veterinarians").select("first_name, last_name, practice_name").eq("user_id", user.id).single();

			setProfile(data);
		}

		loadProfile();
	}, [supabase]);

	useEffect(() => {
		const timeout = setTimeout(async () => {
			if (search.trim().length < 2) {
				setSearchResults([]);
				return;
			}

			setSearchLoading(true);

			const result = await searchDierenartsAnimals(search);

			setSearchResults(result.animals);
			setSearchLoading(false);
		}, 250);

		return () => clearTimeout(timeout);
	}, [search]);

	useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		setMobileMenuOpen(false);
		router.push("/dierenarts/login");
		router.refresh();
	};

	const isActive = (href: string) => pathname === href;

	const displayName = profile?.first_name || profile?.last_name ? `Dr. ${profile?.last_name || profile?.first_name}` : "Dierenarts";

	const openAnimal = (animalId: string) => {
		setSearch("");
		setSearchResults([]);
		router.push(`/dierenarts/dieren/${animalId}/dossier`);
	};

	return (
		<div className={styles.shell}>
			<aside className={styles.sidebar}>
				<Link href="/dierenarts/dashboard" className={styles.logo}>
					<img src="/images/final-logo.png" alt="Het Mandje" />
				</Link>

				<nav className={styles.nav}>
					<p>Menu</p>

					<Link href="/dierenarts/dashboard" className={isActive("/dierenarts/dashboard") ? styles.active : ""}>
						Dashboard
					</Link>

					<Link href="/dierenarts/agenda" className={isActive("/dierenarts/agenda") ? styles.active : ""}>
						Agenda
					</Link>

					<Link href="/dierenarts/taken" className={isActive("/dierenarts/taken") ? styles.active : ""}>
						Task
					</Link>

					<Link href="/dierenarts/dieren" className={isActive("/dierenarts/dieren") ? styles.active : ""}>
						Dieren
					</Link>
				</nav>

				<nav className={styles.nav}>
					<p>General</p>

					<Link href="/dierenarts/settings" className={isActive("/dierenarts/settings") ? styles.active : ""}>
						Settings
					</Link>

					<Link href="/dierenarts/help" className={isActive("/dierenarts/help") ? styles.active : ""}>
						Help
					</Link>

					<button type="button" onClick={handleLogout}>
						Logout
					</button>
				</nav>
			</aside>

			<div className={styles.content}>
				<header className={styles.topbar}>
					<div className={styles.searchWrapper}>
						<div className={styles.searchBox}>
							<input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Zoek dier op naam, ras of soort..." />
							<span>⌕</span>
						</div>

						{search.trim().length >= 2 && (
							<div className={styles.searchDropdown}>
								{searchLoading ? (
									<p className={styles.searchEmpty}>Zoeken...</p>
								) : searchResults.length === 0 ? (
									<p className={styles.searchEmpty}>Geen dieren gevonden.</p>
								) : (
									searchResults.map((animal) => (
										<button key={animal.id} type="button" onClick={() => openAnimal(animal.id)}>
											<img src={animal.image_url || "/images/dog3.jpg"} alt={animal.name} />

											<span>
												<strong>{animal.name}</strong>
												<small>
													{animal.breed || animal.species} · {animal.status || "status onbekend"}
												</small>
											</span>
										</button>
									))
								)}
							</div>
						)}
					</div>

					<div className={styles.profileArea}>
						<div className={styles.avatar}>
							<span>👤</span>
						</div>

						<strong>{displayName}</strong>
					</div>

					<button type="button" className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ""}`} onClick={() => setMobileMenuOpen((current) => !current)} aria-label="Menu openen" aria-expanded={mobileMenuOpen}>
						<span></span>
						<span></span>
						<span></span>
					</button>

					{mobileMenuOpen && (
						<div className={styles.mobileMenu}>
							<div className={styles.mobileHeader}>
								<strong>{displayName}</strong>
								<small>{profile?.practice_name || "Dierenarts platform"}</small>
							</div>

							<div className={styles.mobileDivider}></div>

							<Link href="/dierenarts/dashboard" className={isActive("/dierenarts/dashboard") ? styles.active : ""}>
								Dashboard
							</Link>

							<Link href="/dierenarts/agenda" className={isActive("/dierenarts/agenda") ? styles.active : ""}>
								Agenda
							</Link>

							<Link href="/dierenarts/taken" className={isActive("/dierenarts/taken") ? styles.active : ""}>
								Task
							</Link>

							<Link href="/dierenarts/dieren" className={isActive("/dierenarts/dieren") ? styles.active : ""}>
								Dieren
							</Link>

							<div className={styles.mobileDivider}></div>

							<Link href="/dierenarts/settings" className={isActive("/dierenarts/settings") ? styles.active : ""}>
								Settings
							</Link>

							<Link href="/dierenarts/help" className={isActive("/dierenarts/help") ? styles.active : ""}>
								Help
							</Link>

							<button type="button" onClick={handleLogout}>
								Logout
							</button>
						</div>
					)}
				</header>

				{children}
			</div>
		</div>
	);
}
