"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./asiel-dashboard.module.css";

const animals = [
  {
    id: 1,
    name: "Demon",
    breed: "Siberische Husky",
    age: "9 jaar",
    status: "beschikbaar",
    date: "Toegevoegd 18 mei 2024",
    image: "/images/dog3.jpg",
  },
  {
    id: 2,
    name: "Demon",
    breed: "Siberische Husky",
    age: "9 jaar",
    status: "beschikbaar",
    date: "Toegevoegd 15 mei 2024",
    image: "/images/dog3.jpg",
  },
  {
    id: 3,
    name: "Demon",
    breed: "Siberische Husky",
    age: "9 jaar",
    status: "beschikbaar",
    date: "Toegevoegd 10 mei 2024",
    image: "/images/dog3.jpg",
  },
  {
    id: 4,
    name: "Demon",
    breed: "Siberische Husky",
    age: "9 jaar",
    status: "beschikbaar",
    date: "Toegevoegd 10 mei 2024",
    image: "/images/dog3.jpg",
  },
];

const agendaItems = [
  {
    time: "09:30",
    title: "Intake gesprek - Familie Vermeulen",
  },
  {
    time: "11:00",
    title: "Consultatie volgen",
  },
];

const tasks = [
  "Quarantaine ruimte schoonmaken van de katten",
  "Quarantaine ruimte schoonmaken van de katten",
  "Quarantaine ruimte schoonmaken van de katten",
];

export default function AsielDashboardPage() {
  return (
    <main className={styles.page}>
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

          <Link href="/asiel/dashboard" className={styles.active}>
            Dashboard
          </Link>

          <Link href="/asiel/agenda">Agenda</Link>
          <Link href="/asiel/taken">Task</Link>
          <Link href="/asiel/dieren/nieuw">+ Nieuw dier</Link>

          <p>GENERAL</p>

          <Link href="/asiel/settings">Settings</Link>
          <Link href="/asiel/help">Help</Link>
          <Link href="/asielen/login">Logout</Link>
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
              <span>Tail Shelter</span>
            </div>
          </div>
        </header>

        <div className={styles.dashboardContent}>
          <section className={styles.welcome}>
            <h1>Welkom, Tail Shelter!</h1>
            <p>Dit is wat er vandaag speelt in het asiel.</p>
          </section>

          <section className={styles.statsGrid}>
            <article className={styles.statCard}>
              <p>Totaal dieren</p>
              <h2>120</h2>
              <span>70 honden &nbsp;&nbsp; 40 katten</span>

              <Link href="/asiel/dieren">
                Bekijk alle dieren <span>→</span>
              </Link>
            </article>

            <article className={styles.statCard}>
              <p>Beschikbaar voor adoptie</p>
              <h2>105</h2>
              <span>76 honden &nbsp;&nbsp; 49 katten</span>

              <Link href="/asiel/dieren">
                Bekijk beschikbaar <span>→</span>
              </Link>
            </article>

            <article className={styles.statCard}>
              <p>Aanvragen</p>
              <h2>2</h2>

              <Link href="/asiel/aanvragen">
                Bekijk <span>→</span>
              </Link>
            </article>
          </section>

          <section className={styles.mainGrid}>
            <div className={styles.leftColumn}>
              <article className={styles.animalOverview}>
                <div className={styles.cardHeader}>
                  <h2>Dierenoverzicht</h2>
                </div>

                <div className={styles.tabs}>
                  <button type="button" className={styles.activeTab}>
                    Recent toegevoegd
                  </button>
                  <button type="button">Beschikbaar</button>
                  <button type="button">Intake</button>
                  <button type="button">Niet beschikbaar</button>
                </div>

                <div className={styles.animalList}>
                  {animals.map((animal) => (
                    <Link
                      key={animal.id}
                      href="/asiel/dieren"
                      className={styles.animalRow}
                    >
                      <img src={animal.image} alt={animal.name} />

                      <div>
                        <h3>{animal.name}</h3>
                        <p>{animal.breed}</p>
                      </div>

                      <span>{animal.age}</span>

                      <span className={styles.statusPill}>
                        Beschikbaar
                      </span>

                      <small>{animal.date}</small>
                    </Link>
                  ))}
                </div>

                <Link href="/asiel/dieren" className={styles.viewAll}>
                  Bekijk alle dieren <span>→</span>
                </Link>
              </article>

              <article className={styles.quickActions}>
                <h2>Snelle acties</h2>

                <div className={styles.actionButtons}>
                  <Link href="/asiel/dieren/nieuw">
                    <span>🐾</span>
                    Nieuw dier toevoegen
                  </Link>

                  <Link href="/asiel/dieren">
                    <span>⌕</span>
                    Dier zoeken
                  </Link>
                </div>
              </article>
            </div>

            <aside className={styles.rightColumn}>
              <article className={styles.sideCard}>
                <div className={styles.sideHeader}>
                  <h2>Agenda vandaag</h2>
                  <Link href="/asiel/agenda">Bekijk volledige agenda</Link>
                </div>

                <div className={styles.agendaList}>
                  {agendaItems.map((item) => (
                    <div key={item.time} className={styles.agendaItem}>
                      <span>{item.time}</span>
                      <p>{item.title}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className={styles.sideCard}>
                <div className={styles.sideHeader}>
                  <h2>Taken</h2>
                  <Link href="/asiel/taken">Bekijk alle taken</Link>
                </div>

                <div className={styles.taskList}>
                  {tasks.map((task, index) => (
                    <label key={index} className={styles.taskItem}>
                      <input type="checkbox" />
                      <span>{task}</span>
                    </label>
                  ))}
                </div>

                <button type="button" className={styles.addTaskButton}>
                  + Nieuwe taak toevoegen
                </button>
              </article>

              <article className={styles.notificationCard}>
                <h2>Recente Notificatie</h2>
                <p>Nieuwe aanvraag voor <strong>demon</strong></p>
              </article>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}