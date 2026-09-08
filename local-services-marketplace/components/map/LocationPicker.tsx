'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialRadiusKm?: number;
  onLocationChange: (lat: number, lng: number, radiusKm: number) => void;
  showRadius?: boolean;
}

// Dynamically import Leaflet components with ssr: false
const LeafletMap = dynamic(
  async () => {
    const L = await import('leaflet');
    const { MapContainer, TileLayer, Marker, Circle, useMapEvents } = await import('react-leaflet');

    // Fix default marker icon missing in bundled Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
      useMapEvents({
        click(e) {
          onPick(e.latlng.lat, e.latlng.lng);
        },
      });
      return null;
    }

    return function InnerMap({
      lat,
      lng,
      radiusKm,
      showRadius,
      onPick,
    }: {
      lat: number;
      lng: number;
      radiusKm: number;
      showRadius?: boolean;
      onPick: (lat: number, lng: number) => void;
    }) {
      return (
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full rounded-xl z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} />
          {showRadius && (
            <Circle
              center={[lat, lng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: '#0F766E', fillColor: '#0F766E', fillOpacity: 0.2 }}
            />
          )}
          <MapClickHandler onPick={onPick} />
        </MapContainer>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl text-text-muted text-sm animate-pulse">
        Loading OpenStreetMap...
      </div>
    ),
  }
);

export function LocationPicker({
  initialLat = 28.6139,
  initialLng = 77.2090,
  initialRadiusKm = 5,
  onLocationChange,
  showRadius = true,
}: LocationPickerProps) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [radiusKm, setRadiusKm] = useState(initialRadiusKm);

  const handlePick = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    onLocationChange(newLat, newLng, radiusKm);
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
    onLocationChange(lat, lng, newRadius);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full h-64 relative rounded-xl border border-slate-200 overflow-hidden shadow-inner">
        <LeafletMap
          lat={lat}
          lng={lng}
          radiusKm={radiusKm}
          showRadius={showRadius}
          onPick={handlePick}
        />
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-xs space-y-2">
        <div className="flex justify-between items-center font-medium">
          <span className="text-text-muted">Selected Coordinates</span>
          <span className="font-mono text-slate-800">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>

        {showRadius && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-text-muted font-medium">Service Radius</span>
              <span className="font-bold text-primary">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={radiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
}

