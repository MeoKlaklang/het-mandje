"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Animal } from "@/lib/animals/getAnimals";

type ShelterMarker = {
  id: string;
  name: string;
  street?: string | null;
  house_number?: string | null;
  postal_code?: string | null;
  city?: string | null;
  latitude: number | null;
  longitude: number | null;
  source?: string | null;
  type?: string | null;
  origin?: string | null;
  is_demo?: boolean | null;
  created_via_platform?: boolean | null;
};

type AnimalsMapProps = {
  animals: Animal[];
  shelterLocations: ShelterMarker[];
  selectedShelterId?: string | null;
  animalCountByShelterId?: Record<string, number>;
  onSelectShelter?: (shelterId: string) => void;
};

function isPlatformShelter(shelter: ShelterMarker) {
  const source = (
    shelter.source ||
    shelter.type ||
    shelter.origin ||
    ""
  ).toLowerCase();

  return (
    shelter.created_via_platform === true ||
    shelter.is_demo === false ||
    source.includes("platform") ||
    source.includes("website") ||
    source.includes("eigen")
  );
}

function createShelterIcon({
  isPlatform,
  isSelected,
}: {
  isPlatform: boolean;
  isSelected: boolean;
}) {
  const color = isPlatform ? "#3f8f4d" : "#df963f";
  const size = isSelected ? 25 : 17;
  const border = isSelected ? 4 : 2;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: ${border}px solid white;
        border-radius: 999px;
        box-shadow: ${
          isSelected
            ? "0 0 0 6px rgba(223,150,63,0.22), 0 6px 18px rgba(0,0,0,0.35)"
            : "0 2px 7px rgba(0,0,0,0.25)"
        };
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function AnimalsMap({
  shelterLocations,
  selectedShelterId,
  animalCountByShelterId = {},
  onSelectShelter,
}: AnimalsMapProps) {
  const sheltersWithLocation = shelterLocations.filter(
    (shelter) =>
      shelter.latitude !== null &&
      shelter.longitude !== null &&
      shelter.latitude !== undefined &&
      shelter.longitude !== undefined
  );

  const center: [number, number] =
    sheltersWithLocation.length > 0
      ? [
          Number(sheltersWithLocation[0].latitude),
          Number(sheltersWithLocation[0].longitude),
        ]
      : [51.0259, 4.4776];

  return (
    <MapContainer
      center={center}
      zoom={10}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {sheltersWithLocation.map((shelter) => {
        const isSelected = shelter.id === selectedShelterId;
        const isPlatform = isPlatformShelter(shelter);
        const animalCount = animalCountByShelterId[shelter.id] || 0;

        return (
          <Marker
            key={shelter.id}
            position={[Number(shelter.latitude), Number(shelter.longitude)]}
            icon={createShelterIcon({ isPlatform, isSelected })}
            eventHandlers={{
              click: () => {
                onSelectShelter?.(shelter.id);
              },
            }}
          >
            <Popup>
              <strong>{shelter.name}</strong>
              <br />

              {[shelter.postal_code, shelter.city].filter(Boolean).join(" ")}
              <br />

              {animalCount > 0
                ? `${animalCount} dier${animalCount === 1 ? "" : "en"} beschikbaar`
                : "Geen dieren beschikbaar"}
              <br />

              <span>
                {isPlatform
                  ? "Aangemaakt via Het Mandje"
                  : "Erkend demo-asiel"}
              </span>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}