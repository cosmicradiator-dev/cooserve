'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

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
  const [totalAmount, setTotalAmount] = useState(245.00);
  const [earnings, setEarnings] = useState<EarningItem[]>([
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
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Earnings Ledger</h2>
        <p className="text-xs text-text-muted">100% transparent cooperative payout distribution</p>
      </div>

      {/* Main Stats Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 text-white shadow-md relative overflow-hidden">
        <div className="text-xs uppercase font-bold text-teal-200 tracking-wider">
          Total Net Earnings
        </div>
        <div className="text-3xl font-black mt-1">₹{totalAmount.toFixed(2)}</div>
        <div className="flex items-center gap-1.5 text-xs text-teal-200 mt-3 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Zero platform take-rate deduction</span>
        </div>
      </div>

      {/* Payout History List */}
      <div>
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Settled Jobs ({earnings.length})
        </div>

        {earnings.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-text-muted">
            No completed jobs or payouts recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {earnings.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="font-bold text-xs text-slate-800 line-clamp-1">
                    {item.service_requests?.description || 'Service job payout'}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted">
                    <span className="capitalize font-semibold text-teal-700">
                      {item.service_requests?.service_type || 'General'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.earned_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-700">
                    +₹{Number(item.amount).toFixed(2)}
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    <CheckCircle className="w-2.5 h-2.5" /> Settled
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

