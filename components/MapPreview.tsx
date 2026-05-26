"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useRouter, useSearchParams } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapPreview.module.css";

type MarkerItem = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type MapPreviewProps = {
  markers: MarkerItem[];
};

const customIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 16px;
      height: 16px;
      background: #df963f;
      border: 2px solid white;
      border-radius: 999px;
      box-shadow: 0 2px 7px rgba(0,0,0,0.25);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function MapPreview({ markers }: MapPreviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const center: [number, number] =
    markers.length > 0
      ? [markers[0].latitude, markers[0].longitude]
      : [51.0259, 4.4775];

  const handleOpenMap = () => {
    const params = searchParams.toString();
    router.push(`/dieren/kaart${params ? `?${params}` : ""}`);
  };

  return (
    <div className={styles.mapPreview}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        className={styles.map}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={customIcon}
          />
        ))}
      </MapContainer>

      <div className={styles.mapOverlay}></div>

      <button
        type="button"
        className={styles.mapButton}
        onClick={handleOpenMap}
      >
        Toon op kaart
      </button>
    </div>
  );
}