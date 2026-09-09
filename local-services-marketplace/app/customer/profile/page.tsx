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
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          Customer Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          Manage your primary dispatch address and verified contact details.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-5 sm:p-6 rounded-md bg-white border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-primary text-lg">
            PV
          </div>
          <div>
            <h2 className="font-semibold text-lg text-slate-900">{fullName}</h2>
            <div className="text-xs text-text-muted font-mono">{email}</div>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-primary text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Consumer Member</span>
            </div>
          </div>
        </div>

        <div className="text-center sm:text-right text-xs text-text-muted">
          <div className="font-medium text-slate-700">Member since</div>
          <div>August 2024</div>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium rounded-md flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile and default dispatch address updated successfully.</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white p-5 sm:p-6 rounded-md border border-slate-200 space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">Dispatch & Account Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase font-medium text-text-muted mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase font-medium text-text-muted mb-1">
              Contact Mobile
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase font-medium text-text-muted mb-1">
            Email Address (Supabase Authenticated)
          </label>
          <input
            type="email"
            disabled
            value={email}
            className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs sm:text-sm text-slate-500 bg-slate-50 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase font-medium text-text-muted mb-1">
            Default Service Address (PostGIS Centerpoint)
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}
