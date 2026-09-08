'use client';

import React, { useState } from 'react';
import { User, Star, ShieldCheck, Phone, MapPin, Power } from 'lucide-react';

export default function WorkerProfilePage() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [worker] = useState({
    fullName: 'Ramesh Sharma',
    username: 'ramesh_elec',
    phone: '+91 98765 43210',
    address: 'Sector 14, Delhi',
    skillType: 'Electrician',
    experienceYears: 7,
    ratingAvg: 4.9,
    verificationStatus: 'verified',
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Worker Profile</h2>
        <p className="text-xs text-text-muted">Collective credentials and availability</p>
      </div>

      {/* Profile Header Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-100 border-2 border-teal-500 flex items-center justify-center font-black text-primary text-base">
              RS
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">{worker.fullName}</div>
              <div className="text-xs text-text-muted font-mono">@{worker.username}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 font-black text-amber-500 text-sm">
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
              <span>{worker.ratingAvg}</span>
            </div>
            <div className="text-[10px] text-text-muted">48 reviews</div>
          </div>
        </div>

        {/* Verification Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Verified Cooperative Member</span>
        </div>

        {/* Online / Offline Availability Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <div className="font-bold text-xs text-slate-800">Dispatch Availability</div>
            <div className="text-[10px] text-text-muted">
              {isAvailable ? 'Receiving gig requests' : 'Offline / Unavailable'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
              isAvailable
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isAvailable ? 'Online' : 'Offline'}</span>
          </button>
        </div>
      </div>

      {/* Details List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-text-muted">Primary Craft</span>
          <span className="font-bold text-slate-800">{worker.skillType}</span>
        </div>

        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-text-muted">Field Experience</span>
          <span className="font-bold text-slate-800">{worker.experienceYears} Years</span>
        </div>

        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-text-muted">Mobile Contact</span>
          <span className="font-mono text-slate-800">{worker.phone}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-muted">Registered Address</span>
          <span className="text-slate-800 font-medium">{worker.address}</span>
        </div>
      </div>
    </div>
  );
}

