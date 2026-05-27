"use client";

import { useEffect, useRef, useState } from "react";
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
  avatar_url?: string | null;
  image_url?: string | null;
};

function getProfileImage(profile: Profile | null) {
  return profile?.avatar_url || profile?.image_url || "";
}

export default function Navbar() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
        setUserDropdownOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
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
    setProfile(null);
    setUserDropdownOpen(false);
    router.push("/home");
    router.refresh();
  };

  const isLoggedIn = !!profile;
  const profileImage = getProfileImage(profile);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/home">
          <Image
            src="/images/logo.png"
            alt="Het Mandje logo"
            width={200}
            height={150}
          />
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
              <Link href="/dierenarts/login">Voor dierenartsen</Link>
            </div>
          </div>
        )}

      </div>

      <div>
        {!isLoggedIn ? (
          <Link href="/login" className={styles.button}>
            Word opvanggezin
          </Link>
        ) : (
          <div className={styles.userMenu} ref={menuRef}>
            <button
              type="button"
              className={styles.userButton}
              onClick={() => setUserDropdownOpen((current) => !current)}
              aria-expanded={userDropdownOpen}
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
                  userDropdownOpen ? styles.chevronOpen : ""
                }`}
              >
                ▾
              </span>
            </button>

            {userDropdownOpen && (
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
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/mijn-dieren"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    Mijn dieren
                  </Link>

                  <Link
                    href="/kalender"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    Kalender
                  </Link>

                  <Link
                    href="/profiel"
                    onClick={() => setUserDropdownOpen(false)}
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
        )}
      </div>
    </nav>
  );
}