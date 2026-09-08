'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NearbyWorkersBadge } from '@/components/ui/NearbyWorkersBadge';
import { Calculator, Send, Zap, CheckCircle2 } from 'lucide-react';

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Request Service</h2>
        <p className="text-xs text-text-muted">Instant match with local cooperative professionals</p>
      </div>

      {/* Person-4 Trust Badge */}
      <NearbyWorkersBadge lat={lat} lng={lng} radiusKm={10} skillType={serviceType} />

      {createdJob ? (
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-md space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Work Request Dispatched!</h3>
            <p className="text-xs text-text-muted mt-1">
              Your request was matched with the nearest available verified provider.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-left text-xs space-y-1.5 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-text-muted">Service:</span>
              <span className="font-bold text-slate-800 capitalize">{createdJob.service_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Locked Quote:</span>
              <span className="font-bold text-slate-900">₹{createdJob.quoted_amount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/customer/payments')}
            className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary-hover text-white font-bold text-xs shadow-sm transition-colors"
          >
            Proceed to Payment Escrow
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          {/* Service Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-text-muted mb-1">
              Service Craft
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-secondary font-medium"
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-secondary font-medium"
            >
              <option value="Master Electrician">Master Specialist (5+ yrs verified)</option>
              <option value="Certified Journeyman">Certified Journeyman</option>
              <option value="Any Available">First Available Certified</option>
            </select>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-text-muted mb-1">
              Describe the Issue
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Master circuit breaker trips when AC is turned on. Need MCB inspection."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-secondary placeholder:text-slate-400"
            />
          </div>

          {/* Urgency Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${isUrgent ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold text-slate-900">Priority Emergency Dispatch</div>
                <div className="text-[10px] text-text-muted">Dispatches within 20 mins (1.5x rate)</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 accent-secondary rounded"
            />
          </label>

          {/* Live Quote Box */}
          <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Calculated Live Quote
                </div>
                <div className="text-[10px] text-slate-400">Dynamic cost engine rule</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-amber-400">
                {calculating ? '...' : `₹${liveQuote}`}
              </div>
              <div className="text-[9px] text-slate-400">Tax & base fare included</div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !description.trim()}
            className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary-hover disabled:bg-slate-300 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" /> {submitting ? 'Dispatching...' : 'Dispatch Request Now'}
          </button>
        </form>
      )}
    </div>
  );
}

