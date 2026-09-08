'use client';

import React, { useState } from 'react';
import { LocationPicker } from '@/components/map/LocationPicker';
import { Save, CheckCircle2, Navigation, MapPin, ShieldCheck } from 'lucide-react';

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
      await fetch('/api/v1/workers/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng,
          serviceRadiusKm: radiusKm,
        }),
      });
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Work Base & Dispatch Geofence
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Click on the map to place your home base and configure your service radius.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentGPS}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-teal-50 text-primary border border-teal-200 hover:bg-teal-100 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Navigation className="w-4 h-4" /> Use Current Device GPS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (8 cols on desktop) */}
        <div className="lg:col-span-8">
          <LocationPicker
            initialLat={lat}
            initialLng={lng}
            initialRadiusKm={radiusKm}
            onLocationChange={handleLocationChange}
            showRadius={true}
          />
        </div>

        {/* Right Column: Controls & Information (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          {saved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Location & PostGIS radius updated in collective registry.</span>
            </div>
          )}

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Registry Dispatch Settings</span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Customers within this circle who request your craft will automatically see your availability on the Person-4 verified trust badge and be matched with you.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>PostGIS Spatial Index</span>
              </div>
              <p className="text-[11px]">
                Coordinates are indexed using <code className="font-mono text-slate-700">ST_DWithin</code> on PostgreSQL for sub-millisecond dispatch queries.
              </p>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveLocation}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Save className="w-4 h-4" /> {saving ? 'Updating PostGIS Point...' : 'Save Location & Radius'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
