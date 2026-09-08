'use client';

import React, { useState } from 'react';
import { User, MapPin, Phone, Mail, Save, CheckCircle2 } from 'lucide-react';

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Customer Profile</h2>
        <p className="text-xs text-text-muted">Primary dispatch address & contact details</p>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-secondary flex items-center justify-center font-black text-amber-700 text-base">
          PV
        </div>
        <div>
          <div className="font-bold text-sm text-slate-900">{fullName}</div>
          <div className="text-xs text-text-muted font-mono">Consumer Member</div>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Profile and dispatch address updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div>
          <label className="block text-[11px] uppercase font-bold text-text-muted mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-secondary"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase font-bold text-text-muted mb-1">
            Email (Supabase Auth ID)
          </label>
          <input
            type="email"
            disabled
            value={email}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-500 bg-slate-50 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase font-bold text-text-muted mb-1">
            Contact Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-secondary font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase font-bold text-text-muted mb-1">
            Default Service Address
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-secondary"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary-hover text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Details
        </button>
      </form>
    </div>
  );
}

