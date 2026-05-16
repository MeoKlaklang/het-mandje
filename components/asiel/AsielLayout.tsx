"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logoutUser } from "@/lib/auth/logout";
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

  const handleLogout = async () => {
    await logoutUser();
    router.push("/asielen/login");
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <main className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link href="/home" className={styles.logoLink}>
          <Image
            src="/images/logo.png"
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
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Zoek een dier, chipnummer, adoptant"
            />
            <span>⌕</span>
          </div>

          <div className={styles.topActions}>
            <button type="button" className={styles.notificationButton}>
              ♧
            </button>

            <div className={styles.profile}>
              <div className={styles.avatar}>👤</div>
              <span>{shelter?.name || "Dierenasiel"}</span>
            </div>
          </div>
        </header>

        <div className={styles.pageContent}>{children}</div>
      </section>
    </main>
  );
}