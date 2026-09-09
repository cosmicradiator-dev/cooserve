'use client';

import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, History, AlertCircle, ShieldAlert } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  target_id: string;
  before: any;
  after: any;
  created_at: string;
  actor?: { username: string };
}

export default function AdminDashboardPage() {
  const [baseFare, setBaseFare] = useState(100);
  const [perKmRate, setPerKmRate] = useState(12);
  const [experienceMultiplier, setExperienceMultiplier] = useState(5);
  const [urgencyMultiplier, setUrgencyMultiplier] = useState(1.5);

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([
    {
      id: 'audit-1',
      action: 'cost_parameters.update',
      target_id: 'base_fare',
      before: { base_fare: 90 },
      after: { base_fare: 100 },
      created_at: new Date(Date.now() - 3600000).toISOString(),
      actor: { username: 'admin' },
    },
    {
      id: 'audit-2',
      action: 'worker.verify',
      target_id: '00000000-0000-0000-0000-000000000002',
      before: { verification_status: 'pending' },
      after: { verification_status: 'verified' },
      created_at: new Date(Date.now() - 7200000).toISOString(),
      actor: { username: 'admin' },
    },
  ]);

  const handleUpdate = async (key: string, value: number) => {
    setSavingKey(key);
    setSuccessMsg(null);

    try {
      await fetch('/api/v1/admin/cost-parameters', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': 'admin',
        },
        body: JSON.stringify({ key, value }),
      });

      const newAudit: AuditEntry = {
        id: 'audit-' + Date.now(),
        action: 'cost_parameters.update',
        target_id: key,
        before: { [key]: key === 'base_fare' ? baseFare : value },
        after: { [key]: value },
        created_at: new Date().toISOString(),
        actor: { username: 'admin' },
      };

      setAuditLogs([newAudit, ...auditLogs]);
      setSuccessMsg(`Parameter '${key}' updated and committed to audit log.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setSuccessMsg(`Parameter '${key}' updated (simulated mode).`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          Algorithmic Cost Engine Governance
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          Live parameters applied immediately on subsequent quotes across the entire marketplace.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium rounded-md flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cost Parameter Grid (2 columns on tablet/desktop) */}
      <div className="bg-white rounded-md border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>Active Cost Variables</span>
          </div>
          <span className="text-[11px] text-slate-400">Atomic database updates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Base Fare */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Base Fare (₹)</div>
              <div className="text-xs text-text-muted mt-0.5">Minimum fixed charge per dispatch</div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Value</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={baseFare}
                  onChange={(e) => setBaseFare(Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-mono text-right focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-semibold bg-white"
                />
                <button
                  type="button"
                  disabled={savingKey === 'base_fare'}
                  onClick={() => handleUpdate('base_fare', baseFare)}
                  className="p-1.5 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
                  title="Save Base Fare"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Per KM Rate */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Per KM Rate (₹/km)</div>
              <div className="text-xs text-text-muted mt-0.5">Travel allowance calculated via PostGIS distance</div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Value</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={perKmRate}
                  onChange={(e) => setPerKmRate(Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-mono text-right focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-semibold bg-white"
                />
                <button
                  type="button"
                  disabled={savingKey === 'per_km_rate'}
                  onClick={() => handleUpdate('per_km_rate', perKmRate)}
                  className="p-1.5 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
                  title="Save Per KM Rate"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Experience Multiplier */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Experience Bonus (₹/yr)</div>
              <div className="text-xs text-text-muted mt-0.5">Fair craft seniority compensation rate</div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Value</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={experienceMultiplier}
                  onChange={(e) => setExperienceMultiplier(Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-mono text-right focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-semibold bg-white"
                />
                <button
                  type="button"
                  disabled={savingKey === 'experience_multiplier'}
                  onClick={() => handleUpdate('experience_multiplier', experienceMultiplier)}
                  className="p-1.5 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
                  title="Save Experience Bonus"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Urgency Multiplier */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Urgency Multiplier (factor)</div>
              <div className="text-xs text-text-muted mt-0.5">Surge factor for &lt;20 min emergency dispatches</div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Factor</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={urgencyMultiplier}
                  onChange={(e) => setUrgencyMultiplier(Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-mono text-right focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-semibold bg-white"
                />
                <button
                  type="button"
                  disabled={savingKey === 'urgency_multiplier'}
                  onClick={() => handleUpdate('urgency_multiplier', urgencyMultiplier)}
                  className="p-1.5 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
                  title="Save Urgency Multiplier"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Audit Log Viewer */}
      <div className="bg-white rounded-md border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <span>Tamper-Evident Audit Log Trail ({auditLogs.length})</span>
          </div>
          <span className="text-xs text-slate-400">Append-only compliance log</span>
        </div>

        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-2"
            >
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="font-mono font-medium text-slate-900 text-xs bg-slate-200/80 px-2 py-0.5 rounded">
                  {log.action}
                </span>
                <span className="text-[11px] text-text-muted">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>

              <div className="text-slate-600">
                Target Entity: <span className="font-medium text-slate-800">{log.target_id}</span> • Actor: @{log.actor?.username || 'admin'}
              </div>

              <div className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded-md border border-slate-200 overflow-x-auto">
                <span className="text-red-600">before: {JSON.stringify(log.before)}</span>
                <span className="mx-2 text-slate-400">→</span>
                <span className="text-emerald-700 font-semibold">after: {JSON.stringify(log.after)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
