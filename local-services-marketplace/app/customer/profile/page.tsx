'use client';

import React, { useState } from 'react';
import { User, MapPin, Phone, Mail, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CustomerProfilePage() {
  const [fullName, setFullName] = useState('Priya Verma');
  const [phone, setPhone] = useState('+91 98765 43220');
  const [address, setAddress] = useState('Flat 402, Sunshine Heights, Connaught Place, New Delhi');
  const [email] = useState('priya.verma@example.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Customer Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          Manage your primary dispatch address and verified contact details.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-secondary flex items-center justify-center font-black text-amber-700 text-xl shadow-inner">
            PV
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">{fullName}</h2>
            <div className="text-xs text-text-muted font-mono">{email}</div>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>Verified Consumer Member</span>
            </div>
          </div>
        </div>

        <div className="text-center sm:text-right text-xs text-text-muted">
          <div className="font-semibold text-slate-700">Member since</div>
          <div>August 2024</div>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile and default dispatch address updated successfully.</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">Dispatch & Account Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase font-bold text-text-muted mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-text-muted mb-1">
              Contact Mobile
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-secondary font-mono transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase font-bold text-text-muted mb-1">
            Email Address (Supabase Authenticated)
          </label>
          <input
            type="email"
            disabled
            value={email}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-500 bg-slate-50 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase font-bold text-text-muted mb-1">
            Default Service Address (PostGIS Centerpoint)
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-secondary hover:bg-secondary-hover text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}
