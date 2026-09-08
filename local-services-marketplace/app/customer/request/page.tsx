'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NearbyWorkersBadge } from '@/components/ui/NearbyWorkersBadge';
import { Calculator, Send, Zap, CheckCircle2, Shield, Info, ArrowRight } from 'lucide-react';

export default function CustomerRequestPage() {
  const router = useRouter();

  const [serviceType, setServiceType] = useState('electrician');
  const [workerTypeRequested, setWorkerTypeRequested] = useState('Master Electrician');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [lat] = useState(28.6139);
  const [lng] = useState(77.2090);

  // Live Quote calculation state
  const [liveQuote, setLiveQuote] = useState<number>(245);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdJob, setCreatedJob] = useState<any | null>(null);

  // Re-calculate live quote whenever parameters change
  useEffect(() => {
    let active = true;
    setCalculating(true);

    const baseFare = 100;
    const perKm = 12;
    const distanceKm = 5;
    const expFare = 2 * 5;
    const urgency = isUrgent ? 1.5 : 1.0;
    const serviceMult = serviceType === 'electrician' ? 1.1 : 1.0;

    const calc = Math.round((baseFare + distanceKm * perKm + expFare) * urgency * serviceMult);

    const timer = setTimeout(() => {
      if (active) {
        setLiveQuote(calc);
        setCalculating(false);
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [serviceType, isUrgent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '00000000-0000-0000-0000-000000000005',
          'x-user-role': 'customer',
        },
        body: JSON.stringify({
          serviceType,
          workerTypeRequested,
          description,
          lat,
          lng,
          isUrgent,
        }),
      });

      const json = await res.json();
      if (json.data) {
        setCreatedJob(json.data.job);
      } else {
        // Fallback demo job
        setCreatedJob({
          id: 'mock-job-' + Date.now(),
          quoted_amount: liveQuote,
          service_type: serviceType,
          description,
        });
      }
    } catch {
      setCreatedJob({
        id: 'mock-job-' + Date.now(),
        quoted_amount: liveQuote,
        service_type: serviceType,
        description,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Request Cooperative Service
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          Deterministic match with verified community trade professionals within your geofence.
        </p>
      </div>

      {createdJob ? (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200 shadow-lg space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Work Request Dispatched!</h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1.5 max-w-md mx-auto">
              Your task has been sent to nearby verified cooperative technicians with zero platform commission.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl text-left text-xs sm:text-sm space-y-2 border border-slate-200/80 max-w-md mx-auto">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Requested Service:</span>
              <span className="font-bold text-slate-800 capitalize">{createdJob.service_type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Estimated Base Distance:</span>
              <span className="font-semibold text-slate-700">~2.4 km</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="font-medium text-text-muted">Locked Transparent Fare:</span>
              <span className="text-base font-black text-emerald-700">₹{createdJob.quoted_amount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/customer/payments')}
            className="w-full max-w-md mx-auto py-3 rounded-xl bg-secondary hover:bg-secondary-hover text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Escrow Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form Column (7 cols on desktop) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4"
          >
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800">Job Specifications</h2>
              <p className="text-[11px] text-text-muted">Enter details for the matching technician</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Service Dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-text-muted mb-1">
                  Service Craft
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-secondary font-medium transition-colors"
                >
                  <option value="electrician">Electrician (Wiring, Fuse, Inverters)</option>
                  <option value="plumber">Plumber (Pipes, Taps, Leakages)</option>
                  <option value="carpenter">Carpenter (Furniture, Locks, Woodwork)</option>
                  <option value="painter">Painter (Interior, Waterproofing)</option>
                  <option value="appliance_repair">Appliance Repair (AC, Refrigerator)</option>
                </select>
              </div>

              {/* Worker Type Requested */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-text-muted mb-1">
                  Provider Tier
                </label>
                <select
                  value={workerTypeRequested}
                  onChange={(e) => setWorkerTypeRequested(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-secondary font-medium transition-colors"
                >
                  <option value="Master Electrician">Master Specialist (5+ yrs verified)</option>
                  <option value="Certified Journeyman">Certified Journeyman</option>
                  <option value="Any Available">First Available Certified</option>
                </select>
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-text-muted mb-1">
                Describe the Problem & Requirements
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Master circuit breaker trips whenever the AC turns on. Need MCB inspection and load testing."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-secondary placeholder:text-slate-400 transition-colors"
              />
            </div>

            {/* Urgency Toggle */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 cursor-pointer hover:bg-amber-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                  <Zap className={`w-4 h-4 ${isUrgent ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Priority Emergency Dispatch</div>
                  <div className="text-[10px] text-text-muted">Dispatches within 20 mins (1.5x surge rate for worker)</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 accent-secondary rounded cursor-pointer"
              />
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !description.trim()}
              className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary-hover disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" /> {submitting ? 'Dispatching to Nearest Worker...' : 'Dispatch Request Now'}
            </button>
          </form>

          {/* Sidebar Column: Trust Badge & Live Calculated Quote (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            {/* Person-4 Trust Badge */}
            <NearbyWorkersBadge lat={lat} lng={lng} radiusKm={10} skillType={serviceType} />

            {/* Live Quote Card */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Transparent Live Quote
                  </span>
                </div>
                <span className="text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-2 py-0.5 rounded">
                  Zero Take-Rate
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black text-amber-400 font-mono">
                    {calculating ? '...' : `₹${liveQuote}`}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Fixed guaranteed price</div>
                </div>
                <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                  <div>Base Fare: ₹100</div>
                  <div>Travel allowance: ₹60</div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl text-[11px] text-slate-300 space-y-1.5 border border-slate-700/60">
                <div className="flex items-center gap-1.5 font-semibold text-teal-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Fair Trade Cooperative Promise</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Unlike traditional aggregator apps charging 25-30% commissions, this entire quote goes directly into the worker's earnings escrow upon job sign-off.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
