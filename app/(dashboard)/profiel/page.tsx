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

  const [activeTab, setActiveTab] = useState<"about" | "address" | "phone">(
    "about"
  );

  const [userId, setUserId] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birth, setBirth] = useState("");
  const [email, setEmail] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("België");

  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [phoneSaving, setPhoneSaving] = useState(false);
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

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(
          `
          first_name,
          last_name,
          birth,
          street,
          house_number,
          postal_code,
          city,
          country,
          avatar_url,
          phone
        `
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Fout bij ophalen profiel:", error);
        return;
      }

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setBirth(profile.birth || "");
        setStreet(profile.street || "");
        setHouseNumber(profile.house_number || "");
        setPostalCode(profile.postal_code || "");
        setCity(profile.city || "");
        setCountry(profile.country || "België");
        setAvatarUrl(profile.avatar_url || "");
        setPhone(profile.phone || "");
      }
    }

    loadProfile();
  }, [router, supabase]);

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !userId) return;

    if (!file.type.startsWith("image/")) {
      alert("Upload alleen een afbeelding.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("De afbeelding mag maximum 2MB zijn.");
      return;
    }

    setAvatarUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      setAvatarUploading(false);
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", userId);

    setAvatarUploading(false);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    setAvatarUrl(publicUrl);
    router.refresh();
    alert("Profielfoto opgeslagen!");
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId) return;

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
      alert(error.message);
      return;
    }

    router.refresh();
    alert("Profiel opgeslagen!");
  };

  const handleSaveAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId) return;

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
      alert(error.message);
      return;
    }

    alert("Adres opgeslagen!");
  };

  const handleSavePhone = async () => {
    if (!userId) return;

    if (!phone.trim()) {
      alert("Vul eerst je gsm-nummer in.");
      return;
    }

    setPhoneSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        phone,
      })
      .eq("id", userId);

    setPhoneSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Gsm-nummer opgeslagen!");
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

            <button
              type="button"
              className={activeTab === "phone" ? styles.active : ""}
              onClick={() => setActiveTab("phone")}
            >
              Gsm-nummer
            </button>
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
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </label>

              <label>
                Achternaam
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>

              <label>
                Geboortedatum
                <input
                  type="date"
                  value={birth}
                  onChange={(event) => setBirth(event.target.value)}
                />
              </label>

              <label>
                E-mail
                <input type="email" value={email} disabled />
              </label>

              <div className={styles.photoBox}>
                <p className={styles.photoTitle}>Profielfoto</p>

                <label className={styles.avatarUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />

                  <div className={styles.avatar}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profielfoto" />
                    ) : (
                      <>
                        <span className={styles.head}></span>
                        <span className={styles.body}></span>
                      </>
                    )}

                    <span className={styles.edit}>✎</span>
                  </div>
                </label>

                <p className={styles.photoText}>
                  Je profielfoto is het eerste wat mensen van je zien. Kies een
                  duidelijke en vriendelijke foto.
                </p>

                {avatarUploading && (
                  <p className={styles.statusText}>Foto wordt geüpload...</p>
                )}
              </div>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={loading}
              >
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
                    onChange={(event) => setStreet(event.target.value)}
                    placeholder="Bijvoorbeeld: Kerkstraat"
                  />
                </label>

                <label>
                  Huisnummer
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(event) => setHouseNumber(event.target.value)}
                    placeholder="12A"
                  />
                </label>

                <label>
                  Postcode
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    placeholder="2800"
                  />
                </label>

                <label>
                  Gemeente / stad
                  <input
                    type="text"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Mechelen"
                  />
                </label>

                <label className={styles.wideInput}>
                  Land
                  <input
                    type="text"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? "Opslaan..." : "Adres opslaan"}
              </button>
            </form>
          </section>
        )}

        {activeTab === "phone" && (
          <section className={styles.formCard}>
            <h1>Gsm-nummer</h1>

            <div className={styles.form}>
              <div className={styles.verifyBox}>
                <strong>Contactgegevens</strong>

                <p>
                  Voeg je gsm-nummer toe zodat het dierenasiel je sneller kan
                  bereiken bij dringende updates, afspraken of vragen over je
                  opvangdier.
                </p>
              </div>

              <label>
                Gsm-nummer
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Bijvoorbeeld +32470123456"
                />
              </label>

              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSavePhone}
                disabled={phoneSaving}
              >
                {phoneSaving ? "Opslaan..." : "Gsm-nummer opslaan"}
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}