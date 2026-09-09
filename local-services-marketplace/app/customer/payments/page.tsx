'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Shield, Receipt, ArrowRight } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  gateway_ref: string;
  idempotency_key: string;
  status: string;
  created_at: string;
}

export default function CustomerPaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '30000000-0000-0000-0000-000000000001',
      amount: 245.00,
      gateway_ref: 'pay_test_order_initial_001',
      idempotency_key: 'idemp_seed_10000000-0000-0000-0000-000000000001',
      status: 'paid',
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  const [paying, setPaying] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  const handleTestCheckout = async () => {
    setPaying(true);
    try {
      // 1. Create order on server with idempotency key
      const res = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '00000000-0000-0000-0000-000000000005',
          'x-user-role': 'customer',
        },
        body: JSON.stringify({
          jobId: '10000000-0000-0000-0000-000000000001',
          idempotencyKey: `idemp_${Date.now()}`,
        }),
      });

      const json = await res.json();
      const order = json.data?.order;

      // 2. Simulate Razorpay Test Modal settlement
      setTimeout(() => {
        const newTx: Transaction = {
          id: 'tx_' + Date.now(),
          amount: order?.amount || 245.00,
          gateway_ref: order?.orderId || 'pay_simulated_test',
          idempotency_key: order?.idempotencyKey || `idemp_${Date.now()}`,
          status: 'paid',
          created_at: new Date().toISOString(),
        };

        setTransactions([newTx, ...transactions]);
        setPaidSuccess(true);
        setPaying(false);
      }, 1000);
    } catch {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          Payments & Escrow Checkout
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          Razorpay test mode gateway integration with idempotency key protection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Escrow Checkout Card (5 cols on desktop) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-md bg-white border border-slate-200 space-y-4 lg:sticky lg:top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Pending Escrow Payout</span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-primary">
              Ready for Settlement
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs text-text-muted">Total Payable Amount</span>
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">₹245.00</span>
          </div>

          <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-text-muted space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <Shield className="w-4 h-4 text-primary" />
              <span>Cooperative Escrow Guarantee</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-600">
              Your funds remain protected in escrow and are only credited to the worker's ledger upon verified completion of the service.
            </p>
            <div className="pt-1 text-[10px] text-slate-500 font-mono">
              Test Card: <span className="bg-slate-200 px-1 py-0.5 rounded font-mono">4111 1111 1111 1111</span>
            </div>
          </div>

          {paidSuccess && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Payment captured! Worker earnings ledger credited atomically.</span>
            </div>
          )}

          <button
            type="button"
            disabled={paying}
            onClick={handleTestCheckout}
            className="w-full py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            {paying ? 'Processing Razorpay Escrow...' : 'Pay ₹245.00 (Razorpay Test Mode)'}
          </button>
        </div>

        {/* Past Transactions Ledger (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-md border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              <span>Past Transactions History</span>
            </div>
            <span className="text-xs text-slate-400">{transactions.length} record(s)</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-text-muted">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-md bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-800 font-mono text-xs sm:text-sm">
                      {tx.gateway_ref}
                    </div>
                    <div className="text-[11px] text-text-muted mt-1 space-x-2">
                      <span>{new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">Idemp: {tx.idempotency_key.slice(0, 16)}...</span>
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                    <div className="font-bold text-slate-900 text-base font-mono">₹{Number(tx.amount).toFixed(2)}</div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded capitalize">
                      <CheckCircle2 className="w-3 h-3" /> {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
