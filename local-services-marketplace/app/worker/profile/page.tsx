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
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Worker Credential & Availability
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          Verified trade certifications and live dispatch queue controls.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 border-2 border-teal-600 flex items-center justify-center font-black text-primary text-xl shadow-inner">
              RS
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-bold text-lg text-slate-900">{worker.fullName}</h2>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Verified Master Technician</span>
                </div>
              </div>
              <div className="text-xs text-text-muted font-mono mt-0.5">@{worker.username}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <div className="flex items-center justify-center gap-1 font-black text-amber-600 text-base">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                <span>{worker.ratingAvg}</span>
              </div>
              <div className="text-[10px] text-amber-800 font-medium">48 reviews</div>
            </div>
          </div>
        </div>

        {/* Online / Offline Availability Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 bg-slate-50/60 p-4 rounded-2xl">
          <div>
            <div className="font-bold text-xs sm:text-sm text-slate-800">
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
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isAvailable ? 'Status: Online' : 'Status: Offline'}</span>
          </button>
        </div>
      </div>

      {/* Details Grid (2 columns on tablet/desktop) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">Registry Credentials & Contact</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-primary" /> Primary Trade:
            </span>
            <span className="font-bold text-slate-800">{worker.skillType}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> Field Experience:
            </span>
            <span className="font-bold text-slate-800">{worker.experienceYears} Years</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-primary" /> Contact Mobile:
            </span>
            <span className="font-mono text-slate-800 font-bold">{worker.phone}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" /> Collective Status:
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs capitalize">
              {worker.verificationStatus}
            </span>
          </div>

          <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <span className="text-text-muted flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" /> Base Dispatch Address:
            </span>
            <span className="text-slate-800 font-medium text-right">{worker.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
