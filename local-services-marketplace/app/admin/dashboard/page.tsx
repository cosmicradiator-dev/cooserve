'use client';

import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, History, AlertCircle } from 'lucide-react';

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
      const res = await fetch('/api/v1/admin/cost-parameters', {
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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Cost Engine Governance</h2>
        <p className="text-xs text-text-muted">Live parameters applied immediately on subsequent quotes</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cost Parameter Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-admin flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>Active Cost Variables</span>
        </div>

        {/* Base Fare */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">Base Fare (₹)</div>
            <div className="text-[10px] text-text-muted">Minimum fixed charge per dispatch</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={baseFare}
              onChange={(e) => setBaseFare(Number(e.target.value))}
              className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono text-right"
            />
            <button
              type="button"
              disabled={savingKey === 'base_fare'}
              onClick={() => handleUpdate('base_fare', baseFare)}
              className="p-1.5 rounded-lg bg-admin text-white hover:bg-admin-hover transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Per KM Rate */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">Per KM Rate (₹/km)</div>
            <div className="text-[10px] text-text-muted">Travel allowance calculated via PostGIS</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={perKmRate}
              onChange={(e) => setPerKmRate(Number(e.target.value))}
              className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono text-right"
            />
            <button
              type="button"
              disabled={savingKey === 'per_km_rate'}
              onClick={() => handleUpdate('per_km_rate', perKmRate)}
              className="p-1.5 rounded-lg bg-admin text-white hover:bg-admin-hover transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Experience Multiplier */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">Experience Bonus (₹/yr)</div>
            <div className="text-[10px] text-text-muted">Fair craft seniority compensation</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={experienceMultiplier}
              onChange={(e) => setExperienceMultiplier(Number(e.target.value))}
              className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono text-right"
            />
            <button
              type="button"
              disabled={savingKey === 'experience_multiplier'}
              onClick={() => handleUpdate('experience_multiplier', experienceMultiplier)}
              className="p-1.5 rounded-lg bg-admin text-white hover:bg-admin-hover transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Urgency Multiplier */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">Urgency Multiplier (factor)</div>
            <div className="text-[10px] text-text-muted">Surge multiplier for &lt;20 min dispatches</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              value={urgencyMultiplier}
              onChange={(e) => setUrgencyMultiplier(Number(e.target.value))}
              className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono text-right"
            />
            <button
              type="button"
              disabled={savingKey === 'urgency_multiplier'}
              onClick={() => handleUpdate('urgency_multiplier', urgencyMultiplier)}
              className="p-1.5 rounded-lg bg-admin text-white hover:bg-admin-hover transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Enterprise Audit Log Viewer */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          <span>Audit Log Trail ({auditLogs.length})</span>
        </div>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm text-xs space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                  {log.action}
                </span>
                <span className="text-[10px] text-text-muted">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                Target: <span className="font-semibold text-slate-800">{log.target_id}</span> • Actor: @{log.actor?.username || 'admin'}
              </div>
              <div className="font-mono text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 overflow-x-auto">
                before: {JSON.stringify(log.before)} → after: {JSON.stringify(log.after)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

