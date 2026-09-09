'use client';

import React, { useState } from 'react';
import { User, Star, ShieldCheck, Phone, MapPin, Power, Wrench, Calendar, Award } from 'lucide-react';

export default function WorkerProfilePage() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [worker] = useState({
    fullName: 'Ramesh Sharma',
    username: 'ramesh_elec',
    phone: '+91 98765 43210',
    address: 'Sector 14, Connaught Place, New Delhi',
    skillType: 'Electrician',
    experienceYears: 7,
    ratingAvg: 4.9,
    verificationStatus: 'verified',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          Worker Credential & Availability
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          Verified trade certifications and live dispatch queue controls.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="p-5 sm:p-6 rounded-md bg-white border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-primary text-lg">
              RS
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-semibold text-lg text-slate-900">{worker.fullName}</h2>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-primary text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Master Technician</span>
                </div>
              </div>
              <div className="text-xs text-text-muted font-mono mt-0.5">@{worker.username}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1 font-bold text-slate-900 text-base">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                <span>{worker.ratingAvg}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">48 reviews</div>
            </div>
          </div>
        </div>

        {/* Online / Offline Availability Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 bg-slate-50 p-4 rounded-md">
          <div>
            <div className="font-medium text-xs sm:text-sm text-slate-900">
              Cooperative Dispatch Availability
            </div>
            <div className="text-xs text-text-muted">
              {isAvailable
                ? 'Active — Ready to accept nearby matching requests'
                : 'Offline — Paused from incoming dispatch notifications'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isAvailable ? 'Status: Online' : 'Status: Offline'}</span>
          </button>
        </div>
      </div>

      {/* Details Grid (2 columns on tablet/desktop) */}
      <div className="bg-white rounded-md border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">Registry Credentials & Contact</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-primary" /> Primary Trade:
            </span>
            <span className="font-medium text-slate-900">{worker.skillType}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> Field Experience:
            </span>
            <span className="font-medium text-slate-900">{worker.experienceYears} Years</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-primary" /> Contact Mobile:
            </span>
            <span className="font-mono text-slate-900 font-medium">{worker.phone}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" /> Collective Status:
            </span>
            <span className="font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs capitalize">
              {worker.verificationStatus}
            </span>
          </div>

          <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" /> Base Dispatch Address:
            </span>
            <span className="text-slate-900 font-medium text-right">{worker.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
