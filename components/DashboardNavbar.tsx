"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./DashboardNavbar.module.css";

import { getCurrentProfile } from "@/lib/auth/getProfile";
import { logoutUser } from "@/lib/auth/logout";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar_url?: string | null;
  image_url?: string | null;
};

function getProfileImage(profile: Profile | null) {
  return profile?.avatar_url || profile?.image_url || "";
}

export default function DashboardNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { profile } = await getCurrentProfile();
      setProfile(profile);
    }

    loadProfile();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/home");
    router.refresh();
  };

  const profileImage = getProfileImage(profile);

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <Link href="/home">
          <Image
            src="/images/final-logo.png"
            alt="Het Mandje logo"
            width={110}
            height={80}
            className={styles.logo}
          />
        </Link>

        <div className={styles.rightActions}>
          <Link href="/dieren" className={styles.searchButton}>
            Zoek een dier
          </Link>

          <div className={styles.userMenu} ref={menuRef}>
            <button
              type="button"
              className={styles.userButton}
              onClick={() => setDropdownOpen((current) => !current)}
              aria-expanded={dropdownOpen}
              aria-label="Profielmenu openen"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profielfoto"
                  className={styles.avatarImage}
                />
              ) : (
                <span className={styles.avatar}>👤</span>
              )}

              <strong className={styles.userName}>
                {profile?.first_name || "Profiel"}
              </strong>

              <span
                className={`${styles.chevron} ${
                  dropdownOpen ? styles.chevronOpen : ""
                }`}
              >
                ▾
              </span>
            </button>

            {dropdownOpen && (
              <div className={styles.userDropdown}>
                <div className={styles.dropdownHeader}>
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profielfoto"
                      className={styles.dropdownAvatarImage}
                    />
                  ) : (
                    <span className={styles.dropdownAvatar}>👤</span>
                  )}

                  <div>
                    <strong>
                      {profile?.first_name || "Profiel"}{" "}
                      {profile?.last_name || ""}
                    </strong>

                    <p>{profile?.role || "Pleeggezin"}</p>
                  </div>
                </div>

                <div className={styles.dropdownLinks}>
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/mijn-dieren"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Mijn dieren
                  </Link>

                  <Link
                    href="/kalender"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Mijn kalender
                  </Link>

                  <Link
                    href="/profiel"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profiel
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.logoutLink}
                >
                  Uitloggen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className={styles.navLinks}>
        <Link
          href="/dashboard"
          className={pathname === "/dashboard" ? styles.active : ""}
        >
          Dashboard
        </Link>

        <Link
          href="/mijn-dieren"
          className={pathname === "/mijn-dieren" ? styles.active : ""}
        >
          Mijn dieren
        </Link>

        <Link
          href="/kalender"
          className={pathname === "/kalender" ? styles.active : ""}
        >
          Mijn kalender
        </Link>

        <Link
          href="/profiel"
          className={pathname === "/profiel" ? styles.active : ""}
        >
          Profiel
        </Link>
      </nav>
    </header>
  );
}