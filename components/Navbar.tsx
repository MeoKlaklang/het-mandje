import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

export default function Navbar() {
	return (
		<nav className={styles.navbar}>
			<div className={styles.logo}>
				<Link href="/">
					<Image src="/images/logo.png" alt="Het Mandje logo" width={200} height={60} />
				</Link>
			</div>

			<div className={styles.links}>
				<Link href="/hoe-werkt-opvang">Hoe werkt opvang?</Link>
				<Link href="/dieren">Dieren zoeken</Link>
				<Link href="/pleeggezin">Pleeggezin worden</Link>

				<div className={styles.dropdown}>
					<span>Voor partners ▾</span>
					<div className={styles.dropdownContent}>
						<Link href="/asielen">Voor asielen</Link>
						<Link href="/dierenartsen">Voor dierenartsen</Link>
					</div>
				</div>

				<Link href="/contact">Contact</Link>
			</div>

			<div>
				<Link href="/pleeggezin" className={styles.button}>
					Word opvanggezin
				</Link>
			</div>
		</nav>
	);
}
