"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logoutUser } from "@/lib/auth/logout";
import {
  searchAsielRecords,
  AsielSearchResult,
} from "@/lib/asiel/searchAsielRecords";
import styles from "./AsielLayout.module.css";

type Shelter = {
  id: string;
  name: string;
};

export default function AsielLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [shelter, setShelter] = useState<Shelter | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<AsielSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadShelter() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/asielen/login");
        return;
      }

      const { data } = await supabase
        .from("shelters")
        .select("id, name")
        .eq("owner_id", user.id)
        .single();

      if (data) {
        setShelter(data);
      }
    }

    loadShelter();
  }, [router, supabase]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        setSearchOpen(false);
        return;
      }

      setSearchLoading(true);

      const { results, error } = await searchAsielRecords(searchTerm);

      if (error) {
        console.error("Fout bij zoeken:", error);
        setSearchResults([]);
      } else {
        setSearchResults(results);
        setSearchOpen(true);
      }

      setSearchLoading(false);
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logoutUser();
    setMobileMenuOpen(false);
    router.push("/asielen/login");
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleGoToResult = (result: AsielSearchResult) => {
    setSearchTerm(
      result.fosterName
        ? `${result.animalName} - ${result.fosterName}`
        : result.animalName
    );

    setSearchOpen(false);
    router.push(result.href);
  };

  return (
    <main className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link href="/asiel/dashboard" className={styles.logoLink}>
          <Image
            src="/images/final-logo.png"
            alt="Het Mandje logo"
            width={90}
            height={65}
            className={styles.logo}
          />
        </Link>

        <nav className={styles.nav}>
          <p>MENU</p>

          <Link
            href="/asiel/dashboard"
            className={isActive("/asiel/dashboard") ? styles.active : ""}
          >
            Dashboard
          </Link>

          <Link
            href="/asiel/agenda"
            className={isActive("/asiel/agenda") ? styles.active : ""}
          >
            Agenda
          </Link>

          <Link
            href="/asiel/taken"
            className={isActive("/asiel/taken") ? styles.active : ""}
          >
            Task
          </Link>

          <Link
            href="/asiel/dieren/nieuw"
            className={isActive("/asiel/dieren/nieuw") ? styles.active : ""}
          >
            + Nieuw dier
          </Link>

          <p>GENERAL</p>

          <Link
            href="/asiel/settings"
            className={isActive("/asiel/settings") ? styles.active : ""}
          >
            Settings
          </Link>

          <Link
            href="/asiel/help"
            className={isActive("/asiel/help") ? styles.active : ""}
          >
            Help
          </Link>

          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <section className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.searchWrapper}>
            <div className={styles.searchBar}>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setSearchOpen(true);
                }}
                placeholder="Zoek een dier, eigenaar of chipnummer"
              />
              <span>⌕</span>
            </div>

            {searchOpen && (
              <div className={styles.searchDropdown}>
                {searchLoading ? (
                  <div className={styles.searchEmpty}>Zoeken...</div>
                ) : searchResults.length === 0 ? (
                  <div className={styles.searchEmpty}>
                    Geen resultaten gevonden.
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <button
                      key={result.animalId}
                      type="button"
                      className={styles.searchResult}
                      onClick={() => handleGoToResult(result)}
                    >
                      <img
                        src={result.imageUrl || "/images/dog3.jpg"}
                        alt={result.animalName}
                      />

                      <div>
                        <h3>
                          {result.animalName}
                          {result.fosterName ? ` - ${result.fosterName}` : ""}
                        </h3>

                        <p>
                          {result.breed || result.species}
                          {result.city ? ` · ${result.city}` : ""}
                        </p>

                        <span>{result.status || "status onbekend"}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className={styles.topActions}>
            <button type="button" className={styles.notificationButton}></button>

            <div className={styles.profile}>
              <div className={styles.avatar}>👤</div>
              <span>{shelter?.name || "Dierenasiel"}</span>
            </div>
          </div>

          <button
            type="button"
            className={`${styles.hamburger} ${
              mobileMenuOpen ? styles.hamburgerOpen : ""
            }`}
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label="Menu openen"
            aria-expanded={mobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {mobileMenuOpen && (
            <div className={styles.mobileMenu}>
              <div className={styles.mobileHeader}>
                <strong>{shelter?.name || "Dierenasiel"}</strong>
                <small>Asiel platform</small>
              </div>

              <div className={styles.mobileDivider}></div>

              <Link
                href="/asiel/dashboard"
                onClick={closeMobileMenu}
                className={isActive("/asiel/dashboard") ? styles.active : ""}
              >
                Dashboard
              </Link>

              <Link
                href="/asiel/agenda"
                onClick={closeMobileMenu}
                className={isActive("/asiel/agenda") ? styles.active : ""}
              >
                Agenda
              </Link>

              <Link
                href="/asiel/taken"
                onClick={closeMobileMenu}
                className={isActive("/asiel/taken") ? styles.active : ""}
              >
                Task
              </Link>

              <Link
                href="/asiel/dieren/nieuw"
                onClick={closeMobileMenu}
                className={isActive("/asiel/dieren/nieuw") ? styles.active : ""}
              >
                + Nieuw dier
              </Link>

              <div className={styles.mobileDivider}></div>

              <Link
                href="/asiel/settings"
                onClick={closeMobileMenu}
                className={isActive("/asiel/settings") ? styles.active : ""}
              >
                Settings
              </Link>

              <Link
                href="/asiel/help"
                onClick={closeMobileMenu}
                className={isActive("/asiel/help") ? styles.active : ""}
              >
                Help
              </Link>

              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </header>

        <div className={styles.pageContent}>{children}</div>
      </section>
    </main>
  );
}