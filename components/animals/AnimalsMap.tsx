"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Animal } from "@/lib/animals/getAnimals";
import { ShelterLocation } from "@/lib/shelters/getShelterLocations";

type AnimalsMapProps = {
  animals: Animal[];
  shelterLocations?: ShelterLocation[];
};

function createMarkerIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: ${color};
        border: 3px solid white;
        border-radius: 999px;
        box-shadow: 0 3px 9px rgba(31, 19, 13, 0.28);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

const animalMarkerIcon = createMarkerIcon("#df963f");
const shelterMarkerIcon = createMarkerIcon("#df963f");
const partnerShelterMarkerIcon = createMarkerIcon("#4f8f5f");

function normalizeWebsiteUrl(website: string | null) {
  if (!website) return null;

  const trimmedWebsite = website.trim();

  if (!trimmedWebsite) return null;

  if (
    trimmedWebsite.startsWith("http://") ||
    trimmedWebsite.startsWith("https://")
  ) {
    return trimmedWebsite;
  }

  return `https://${trimmedWebsite}`;
}

export default function AnimalsMap({
  animals,
  shelterLocations = [],
}: AnimalsMapProps) {
  const animalsWithLocation = animals.filter(
    (animal) =>
      animal.shelters?.latitude !== null &&
      animal.shelters?.longitude !== null &&
      animal.shelters?.latitude !== undefined &&
      animal.shelters?.longitude !== undefined
  );

  const sheltersWithLocation = shelterLocations.filter(
    (shelter) =>
      shelter.latitude !== null &&
      shelter.longitude !== null &&
      shelter.latitude !== undefined &&
      shelter.longitude !== undefined
  );

  return (
    <MapContainer
      center={[51.0259, 4.4776]}
      zoom={10}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {sheltersWithLocation.map((shelter) => {
        const isPartner = Boolean(shelter.is_platform_partner);

        const animalsForShelter = animals.filter(
          (animal) => animal.shelters?.id === shelter.linked_shelter_id
        );

        const websiteUrl = normalizeWebsiteUrl(shelter.website);

        return (
          <Marker
            key={`shelter-${shelter.id}`}
            position={[Number(shelter.latitude), Number(shelter.longitude)]}
            icon={isPartner ? partnerShelterMarkerIcon : shelterMarkerIcon}
          >
            <Popup>
              <strong>{shelter.name}</strong>
              <br />

              {shelter.street && (
                <>
                  {shelter.street} {shelter.house_number || ""}
                  <br />
                </>
              )}

              {shelter.postal_code || shelter.city ? (
                <>
                  {shelter.postal_code} {shelter.city}
                  <br />
                </>
              ) : null}

              {shelter.phone && (
                <>
                  Tel: {shelter.phone}
                  <br />
                </>
              )}

              <br />

              {isPartner ? (
                <>
                  <strong style={{ color: "#4f8f5f" }}>
                    Partner van Het Mandje
                  </strong>
                  <br />

                  {animalsForShelter.length > 0 ? (
                    <>
                      {animalsForShelter.length} dier
                      {animalsForShelter.length === 1 ? "" : "en"} beschikbaar
                      <br />
                    </>
                  ) : (
                    <>
                      Nog geen dieren beschikbaar
                      <br />
                    </>
                  )}
                </>
              ) : (
                <>
                  <strong style={{ color: "#df963f" }}>
                    Erkend dierenasiel
                  </strong>
                  <br />
                  Nog geen partner van Het Mandje
                  <br />
                </>
              )}

              {websiteUrl && (
                <>
                  <br />
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website bekijken
                  </a>
                </>
              )}
            </Popup>
          </Marker>
        );
      })}

      {animalsWithLocation.map((animal, index) => (
        <Marker
          key={`animal-${animal.id}`}
          position={[
            Number(animal.shelters?.latitude),
            Number(animal.shelters?.longitude),
          ]}
          icon={animalMarkerIcon}
        >
          <Popup>
            <strong>
              {index + 1}. {animal.name}
            </strong>
            <br />
            {animal.shelters?.name}
            <br />
            {animal.shelters?.city}
            <br />
            <Link href={`/dieren/${animal.id}`}>Bekijk dier</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}