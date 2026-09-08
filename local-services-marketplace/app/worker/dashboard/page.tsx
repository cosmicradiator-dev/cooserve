'use client';

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CheckCircle, Play, AlertCircle, Phone, ShieldCheck, DollarSign } from 'lucide-react';

interface Job {
  id: string;
  service_type: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  briefing: string | null;
  quoted_amount: number;
  customer?: { full_name: string; phone?: string };
}

export default function WorkerDashboard() {
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Mock initial demo job for immediate rich UI preview
  const demoJob: Job = {
    id: '10000000-0000-0000-0000-000000000001',
    service_type: 'electrician',
    description: 'Fix main distribution board circuit breaker tripping',
    status: 'assigned',
    briefing: 'Carry 32A MCB replacement and digital multimeter. Building B, 3rd floor.',
    quoted_amount: 245.00,
    customer: { full_name: 'Priya Verma', phone: '+91 98765 43220' },
  };

  useEffect(() => {
    // In real flow, fetch from /api/v1/jobs
    setTimeout(() => {
      setActiveJob(demoJob);
      setLoading(false);
    }, 300);
  }, []);

  const handleStatusChange = async (newStatus: 'in_progress' | 'completed') => {
    if (!activeJob) return;
    setUpdating(true);
    try {
      // Call API
      await fetch(`/api/v1/jobs/${activeJob.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      // Update locally
      setActiveJob({ ...activeJob, status: newStatus });
    } catch {
      setActiveJob({ ...activeJob, status: newStatus });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-text-muted">
        Loading active assignments...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Worker Dispatch Console
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Direct real-time job assignments from the cooperative dispatch queue.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online & Receiving Gigs</span>
        </div>
      </div>

      {activeJob ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Job Description, Briefing, Customer Contact (7 cols on desktop) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Status Header Bar */}
            <div className="bg-teal-50/80 border-b border-teal-100 px-6 py-3.5 flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                {activeJob.service_type} Assignment
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                  activeJob.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeJob.status === 'in_progress'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {activeJob.status.replace('_', ' ')}
              </span>
            </div>

            <div className="p-6 space-y-5">
              {/* Description */}
              <div>
                <h2 className="font-bold text-slate-900 text-base sm:text-lg">
                  {activeJob.description}
                </h2>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted mt-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>Sector 14, Connaught Place, Delhi • Approx 2.4 km away</span>
                </div>
              </div>

              {/* Briefing Card */}
              {activeJob.briefing && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Dispatcher Technical Briefing</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed pl-6">{activeJob.briefing}</p>
                </div>
              )}

              {/* Customer Contact Card */}
              {activeJob.customer && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm">
                  <div>
                    <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                      Client Contact
                    </div>
                    <div className="font-bold text-slate-800 text-sm sm:text-base mt-0.5">
                      {activeJob.customer.full_name}
                    </div>
                  </div>
                  {activeJob.customer.phone && (
                    <a
                      href={`tel:${activeJob.customer.phone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm hover:bg-teal-700 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Customer
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Compensation & Actions (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div>
                <div className="text-xs uppercase font-bold text-text-muted">
                  Guaranteed Take-Home Payout
                </div>
                <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
                  ₹{activeJob.quoted_amount.toFixed(2)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% credited to your earnings upon completion</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {activeJob.status === 'assigned' && (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange('in_progress')}
                    className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" /> Start Job (On-Site)
                  </button>
                )}

                {activeJob.status === 'in_progress' && (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange('completed')}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark Completed & Settle
                  </button>
                )}

                {activeJob.status === 'completed' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs sm:text-sm text-emerald-800 font-semibold space-y-1">
                    <div>🎉 Job marked completed!</div>
                    <div className="text-[11px] text-emerald-700 font-normal">
                      Funds have been transferred to your Earnings Ledger.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="font-bold text-base text-slate-800">No active assignment</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            You are currently online. When a customer nearby requests your skill, it will appear here instantly.
          </p>
        </div>
      )}
    </div>
  );
}
