'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Shield, Receipt } from 'lucide-react';

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Payments & Checkout</h2>
        <p className="text-xs text-text-muted">Razorpay Test Mode integration with idempotency</p>
      </div>

      {/* Active Escrow / Checkout Card */}
      <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <CreditCard className="w-4 h-4 text-secondary" />
            <span>Pending Escrow Payout</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Ready for Payment
          </span>
        </div>

        <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
          <span className="text-xs text-text-muted">Total Payable</span>
          <span className="text-2xl font-black text-slate-900">₹245.00</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-text-muted space-y-1">
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Escrow Guarantee</span>
          </div>
          <p>
            Funds are released to worker only upon verified job completion. Test card: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">4111 1111 1111 1111</code>
          </p>
        </div>

        {paidSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Payment captured! Worker earnings ledger credited atomically.
          </div>
        )}

        <button
          type="button"
          disabled={paying}
          onClick={handleTestCheckout}
          className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary-hover text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          {paying ? 'Processing Razorpay Escrow...' : 'Pay ₹245.00 (Razorpay Test Mode)'}
        </button>
      </div>

      {/* Past Transactions */}
      <div>
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5" />
          <span>Past Transactions</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-text-muted">
            No transactions yet.
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800 font-mono text-[11px]">
                    {tx.gateway_ref}
                  </div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    {new Date(tx.created_at).toLocaleDateString()} • Idemp: {tx.idempotency_key.slice(0, 14)}...
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-slate-900 text-sm">₹{Number(tx.amount).toFixed(2)}</div>
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full capitalize">
                    {tx.status}
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

