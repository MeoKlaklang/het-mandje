"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createClient } from "@/lib/supabase/client";
import { deleteAccount } from "@/lib/auth/deleteAccount";
import styles from "./profiel.module.css";

export default function ProfielPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"about" | "address">("about");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birth, setBirth] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("België");

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "first_name, last_name, birth, street, house_number, postal_code, city, country"
        )
        .eq("id", user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setBirth(profile.birth || "");
        setStreet(profile.street || "");
        setHouseNumber(profile.house_number || "");
        setPostalCode(profile.postal_code || "");
        setCity(profile.city || "");
        setCountry(profile.country || "België");
      }
    }

    loadProfile();
  }, [router, supabase]);

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        birth,
      })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      alert("Er ging iets mis bij het opslaan.");
      return;
    }

    alert("Profiel opgeslagen!");
  };

  const handleSaveAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        street,
        house_number: houseNumber,
        postal_code: postalCode,
        city,
        country,
      })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      alert("Er ging iets mis bij het opslaan van je adres.");
      return;
    }

    alert("Adres opgeslagen!");
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Weet je zeker dat je je profiel wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      await deleteAccount();

      router.push("/home");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Er ging iets mis bij het verwijderen van je profiel.");
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <DashboardNavbar />

      <main className={styles.page}>
        <aside className={styles.sidebar}>
          <h2>Mijn profiel</h2>

          <div className={styles.sidebarLinks}>
            <button
              type="button"
              className={activeTab === "about" ? styles.active : ""}
              onClick={() => setActiveTab("about")}
            >
              Over mezelf
            </button>

            <button
              type="button"
              className={activeTab === "address" ? styles.active : ""}
              onClick={() => setActiveTab("address")}
            >
              Mijn adres
            </button>

            <button type="button">Telefoon verificatie</button>
          </div>
        </aside>

        {activeTab === "about" && (
          <section className={styles.formCard}>
            <h1>Jouw info</h1>

            <form onSubmit={handleSaveProfile} className={styles.form}>
              <label>
                Voornaam
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>

              <label>
                Achternaam
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>

              <label>
                Geboortedatum
                <input
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                />
              </label>

              <label>
                E-mail
                <input type="email" value={email} disabled />
              </label>

              <div className={styles.photoBox}>
                <p>Profielfoto</p>

                <div className={styles.avatar}>
                  <span className={styles.head}></span>
                  <span className={styles.body}></span>
                  <span className={styles.edit}>✎</span>
                </div>

                <p className={styles.photoText}>
                  Je profielfoto is het eerste wat mensen van je zien. Kies een
                  vriendelijke, duidelijke en goed belichte foto waarop je recht
                  in de camera kijkt.
                </p>
              </div>

              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? "Opslaan..." : "Opslaan"}
              </button>
            </form>

            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Verwijderen..." : "Profiel verwijderen"}
            </button>
          </section>
        )}

        {activeTab === "address" && (
          <section className={styles.formCard}>
            <h1>Adres</h1>

            <form onSubmit={handleSaveAddress} className={styles.form}>
              <div className={styles.addressGrid}>
                <label className={styles.wideInput}>
                  Straat
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Bijvoorbeeld: Kerkstraat"
                  />
                </label>

                <label>
                  Huisnummer
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="12A"
                  />
                </label>

                <label>
                  Postcode
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="2000"
                  />
                </label>

                <label>
                  Gemeente / stad
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Antwerpen"
                  />
                </label>

                <label className={styles.wideInput}>
                  Land
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </label>
              </div>

              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? "Opslaan..." : "Adres opslaan"}
              </button>
            </form>
          </section>
        )}
      </main>
    </>
  );
}