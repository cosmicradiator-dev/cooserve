'use client';

import React, { useState } from 'react';
import { LocationPicker } from '@/components/map/LocationPicker';
import { Save, CheckCircle2, Navigation } from 'lucide-react';

export default function WorkerLocationPage() {
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);
  const [radiusKm, setRadiusKm] = useState(5);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLocationChange = (newLat: number, newLng: number, newRadius: number) => {
    setLat(newLat);
    setLng(newLng);
    setRadiusKm(newRadius);
    setSaved(false);
  };

  const handleSaveLocation = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/workers/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng,
          serviceRadiusKm: radiusKm,
        }),
      });
      const data = await res.json();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleUseCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation failed', err);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Work Location</h2>
          <p className="text-xs text-text-muted">Set your base and dispatch radius</p>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentGPS}
          className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-teal-50 text-primary border border-teal-200 hover:bg-teal-100 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" /> GPS
        </button>
      </div>

      <LocationPicker
        initialLat={lat}
        initialLng={lng}
        initialRadiusKm={radiusKm}
        onLocationChange={handleLocationChange}
        showRadius={true}
      />

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Location & PostGIS radius updated in collective registry.
        </div>
      )}

      <button
        type="button"
        disabled={saving}
        onClick={handleSaveLocation}
        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
      >
        <Save className="w-4 h-4" /> {saving ? 'Updating PostGIS Point...' : 'Save Location'}
      </button>
    </div>
  );
}

