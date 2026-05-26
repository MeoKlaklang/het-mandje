"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Animal } from "@/lib/animals/getAnimals";

type AnimalsMapProps = {
  animals: Animal[];
};

const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      background: #df963f;
      border: 3px solid white;
      border-radius: 999px;
      box-shadow: 0 3px 9px rgba(31, 19, 13, 0.28);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

export default function AnimalsMap({ animals }: AnimalsMapProps) {
  const animalsWithLocation = animals.filter(
    (animal) =>
      animal.shelters?.latitude !== null &&
      animal.shelters?.longitude !== null &&
      animal.shelters?.latitude !== undefined &&
      animal.shelters?.longitude !== undefined
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

      {animalsWithLocation.map((animal, index) => (
        <Marker
          key={animal.id}
          position={[
            Number(animal.shelters?.latitude),
            Number(animal.shelters?.longitude),
          ]}
          icon={markerIcon}
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