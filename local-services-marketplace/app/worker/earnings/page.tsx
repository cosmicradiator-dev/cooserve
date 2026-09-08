'use client';

import React, { useState } from 'react';
import { Wallet, TrendingUp, Calendar, CheckCircle, ShieldCheck, ArrowUpRight, DollarSign } from 'lucide-react';

interface EarningItem {
  id: string;
  amount: number;
  earned_at: string;
  service_requests?: {
    service_type: string;
    description: string;
  };
}

export default function WorkerEarningsPage() {
  const [totalAmount] = useState(245.00);
  const [earnings] = useState<EarningItem[]>([
    {
      id: '20000000-0000-0000-0000-000000000001',
      amount: 245.00,
      earned_at: new Date(Date.now() - 172800000).toISOString(),
      service_requests: {
        service_type: 'electrician',
        description: 'Fix main distribution board circuit breaker tripping',
      },
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Earnings & Cooperative Ledger
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          100% transparent cooperative payout distribution with zero intermediary take-rate.
        </p>
      </div>

      {/* Main Responsive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Earnings Card */}
        <div className="sm:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-teal-200 tracking-wider">
                Total Net Earnings (YTD)
              </span>
              <span className="p-2 rounded-xl bg-white/10 text-teal-200">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black mt-2 font-mono">
              ₹{totalAmount.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-teal-200 mt-4 pt-4 border-t border-teal-600/50 font-medium">
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>0% platform take-rate deduction • 100% worker retention</span>
          </div>
        </div>

        {/* Quick KPI Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase font-bold text-text-muted">Settled Jobs</div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
              {earnings.length}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Instant Escrow Clearance</span>
          </div>
        </div>
      </div>

      {/* Payout History Ledger */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Settled Payout Records ({earnings.length})
          </h2>
          <span className="text-xs text-text-muted">Direct UPI / Bank Transfer</span>
        </div>

        {earnings.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted">
            No completed jobs or payouts recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {earnings.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm sm:text-base">
                    {item.service_requests?.description || 'Service job payout'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="capitalize font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      {item.service_requests?.service_type || 'General'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.earned_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                  <div className="text-base sm:text-lg font-black text-emerald-700 font-mono">
                    +₹{Number(item.amount).toFixed(2)}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                    <CheckCircle className="w-3 h-3" /> Fully Settled
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
