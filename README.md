# Het Mandje

Het Mandje is een webplatform dat pleeggezinnen, dierenasielen en dierenartsen samenbrengt om tijdelijke opvang voor dieren overzichtelijker te maken. Het platform helpt dierenasielen om dieren tijdelijk onder te brengen bij pleeggezinnen, terwijl dierenartsen medische opvolging, medicatie en afspraken kunnen beheren.

## Doel van het project

Het doel van Het Mandje is om de samenwerking tussen pleeggezinnen, dierenasielen en dierenartsen te vereenvoudigen. Door alle informatie rond dieren, aanvragen, afspraken, notities en medische dossiers op één centrale plaats te verzamelen, wordt tijdelijke opvang duidelijker, veiliger en beter opgevolgd.

## Gebruikersrollen

### Pleeggezin / gebruiker

Pleeggezinnen kunnen dieren zoeken, dieren bekijken op een kaart, een opvangaanvraag doen, hun aanvragen opvolgen, afspraken accepteren of weigeren, notities toevoegen en medicatie opvolgen.

**demo login voor pleeggezin**
email: demouser@test.com
wachtwoord: demo123456

### Dierenasiel

Dierenasielen kunnen dieren toevoegen, beheren en aanpassen. Ze kunnen opvangaanvragen bekijken, dieren koppelen aan pleeggezinnen, afspraken maken en informatie rond het dier opvolgen.

**demo login voor dierenasiel**
email: demoasiel@test.com
wachtwoord: demo123456


### Dierenarts

Dierenartsen kunnen dieren opzoeken, medische dossiers aanvullen, medicatie toevoegen, notities bekijken en afspraken maken met het gekoppelde pleeggezin.

**demo login voor dierenarts**
email: a@a.com
wachtwoord: alyssa123456

## Gebruikte technologieën

* Next.js
* React
* TypeScript
* Supabase
* Supabase Auth
* Supabase Storage
* CSS Modules
* Leaflet
* Vercel

## Belangrijkste functies

* Registratie en login voor verschillende rollen
* Rolgebaseerde dashboards
* Dieren zoeken en filteren
* Dieren bekijken op een interactieve kaart
* Opvangaanvragen maken en opvolgen
* Afspraken maken, accepteren en weigeren
* Notities toevoegen en bekijken
* Medicatie opvolgen
* Medisch dossier beheren
* Profielfoto’s en dierenfoto’s uploaden
* Online deployment via Vercel

## Project lokaal starten

Installeer eerst de dependencies:

```bash
npm install
```

Maak daarna een `.env.local` bestand aan in de hoofdmap van het project.

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Start daarna de development server:

```bash
npm run dev
```

Open de website in je browser:

```txt
http://localhost:3000
```

## Build testen

Voor deployment kan je controleren of het project correct buildt:

```bash
npm run build
```

Als de build zonder errors lukt, is het project klaar om online te plaatsen.

## Deployment

Het project is gedeployed  via Vercel. Supabase blijft gebruikt worden voor de database, authenticatie en opslag van bestanden.

https://het-mandje-9jn2.vercel.app/home 

## Projectstructuur

De belangrijkste code bevindt zich in de `app` folder. Hier worden de pagina’s en routes opgebouwd met de Next.js App Router.

De componenten staan in de `components` folder. Hier zitten onder andere de navigatie, dashboards, kaartcomponenten en herbruikbare interface-elementen.

De Supabase functies en database-logica staan in de `lib` folder.

## Auteur
Siriyakorn Klaklang
Final Work — Het Mandje

## BRONNEN

**YouTube tutorial**
https://www.youtube.com/watch?v=kyphLGnSz6Q&t=3877s
Gebruikt als extra uitleg voor Next.js en de projectstructuur.

**YouTube tutorial**
https://www.youtube.com/watch?v=xnOwOBYaA3w
Gebruikt als extra uitleg voor Supabase, backend en praktische implementatie.

**Next.js documentatie**
https://nextjs.org/docs
Gebruikt als basisframework voor de website.

**Next.js App Router**
https://nextjs.org/docs/app
Gebruikt om pagina’s te maken met `app/`, `page.tsx` en layouts.

**Next.js Server & Client Components**
https://nextjs.org/docs/app/getting-started/server-and-client-components
Gebruikt om te begrijpen wanneer `"use client"` nodig is voor interactieve pagina’s.

**Next.js Environment Variables**
https://nextjs.org/docs/pages/guides/environment-variables
Gebruikt om Supabase URL’s en keys veilig te gebruiken via `.env.local`.

**React documentatie**
https://react.dev/
Gebruikt om componenten te bouwen voor pagina’s, cards, formulieren en dashboards.

**React useState**
https://react.dev/reference/react/useState
Gebruikt om state te beheren voor formulieren, tabs, filters, modals en de kalender.

**React useEffect**
https://react.dev/reference/react/useEffect
Gebruikt om data op te halen wanneer een pagina opent, zoals dieren, afspraken en profielen.

**Supabase documentatie**
https://supabase.com/docs
Gebruikt als backend voor database, authenticatie en opslag.

**Supabase Auth**
https://supabase.com/docs/guides/auth
Gebruikt voor login en registratie van users, asielen en dierenartsen.

**Supabase JavaScript Client**
https://supabase.com/docs/reference/javascript/introduction
Gebruikt om data op te halen, toe te voegen, aan te passen en te verwijderen via code.

**Supabase Row Level Security**
https://supabase.com/docs/guides/database/postgres/row-level-security
Gebruikt voor beveiliging, zodat elke rol alleen de juiste data kan zien.

**Supabase Storage**
https://supabase.com/docs/guides/storage
Gebruikt om foto’s te uploaden voor dieren en profielfoto’s.

**Vercel Next.js Deployment**
https://vercel.com/docs/frameworks/full-stack/nextjs
Gebruikt om de website online te zetten en te deployen.

**React Leaflet documentatie**
https://react-leaflet.js.org/docs/start-introduction/
Gebruikt om een kaartcomponent te bouwen in React.

**Leaflet documentatie**
https://leafletjs.com/reference.html
Gebruikt voor markers, popups en kaartinteractie.

**Medium artikel over React Leaflet in Next.js**
https://medium.com/@mohdkhan.mk99/how-to-integrate-maps-on-your-web-pages-using-react-leaflet-on-next-js-05f645d23caf
Gebruikt als extra hulp om React Leaflet te integreren in een Next.js-project.

**ChatGPT gedeeld gesprek**
https://chatgpt.com/share/6a215825-a224-83eb-9e75-4c34a5746b3c
Gebruikt als ondersteuning bij het bouwen, debuggen en verbeteren van de website “Het Mandje” met Next.js en Supabase.



