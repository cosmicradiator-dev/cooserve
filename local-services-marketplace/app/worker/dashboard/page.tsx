'use client';

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CheckCircle, Play, AlertCircle, Phone } from 'lucide-react';

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
      const res = await fetch(`/api/v1/jobs/${activeJob.id}/status`, {
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
      <div className="flex items-center justify-center h-48 text-xs text-text-muted">
        Loading active assignments...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Active Assignment</h2>
        <p className="text-xs text-text-muted">Direct dispatch from the cooperative queue</p>
      </div>

      {activeJob ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Status Header Bar */}
          <div className="bg-teal-50 border-b border-teal-100 px-4 py-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
              {activeJob.service_type}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
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

          <div className="p-4 space-y-3.5">
            {/* Description */}
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{activeJob.description}</h3>
              <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Sector 14, Delhi • Approx 2.4 km away</span>
              </div>
            </div>

            {/* Briefing Card */}
            {activeJob.briefing && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dispatcher Briefing</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{activeJob.briefing}</p>
              </div>
            )}

            {/* Customer Contact */}
            {activeJob.customer && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] text-text-muted uppercase font-semibold">Customer</div>
                  <div className="font-bold text-slate-800">{activeJob.customer.full_name}</div>
                </div>
                {activeJob.customer.phone && (
                  <a
                    href={`tel:${activeJob.customer.phone}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 text-white font-medium text-[11px] shadow-sm hover:bg-teal-700 transition-colors"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                )}
              </div>
            )}

            {/* Compensation */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-text-muted">Guaranteed Payout</span>
              <span className="text-base font-black text-slate-900">₹{activeJob.quoted_amount}</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              {activeJob.status === 'assigned' && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusChange('in_progress')}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" /> Start Job (On-Site)
                </button>
              )}

              {activeJob.status === 'in_progress' && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleStatusChange('completed')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Completed & Settle
                </button>
              )}

              {activeJob.status === 'completed' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-medium">
                  🎉 Job marked completed. Earnings credited to your ledger.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="font-bold text-sm text-slate-800">No active assignment</div>
          <p className="text-xs text-text-muted">
            You are currently online. When a customer nearby requests your skill, it will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

