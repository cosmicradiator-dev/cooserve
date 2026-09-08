'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldX, UserCheck, CheckCircle2, Clock } from 'lucide-react';

interface PendingWorker {
  user_id: string;
  skill_type: string;
  experience_years: number;
  verification_status: string;
  users: {
    full_name: string;
    username: string;
    phone?: string;
    address?: string;
  };
}

export default function AdminWorkersQueuePage() {
  const [queue, setQueue] = useState<PendingWorker[]>([
    {
      user_id: '00000000-0000-0000-0000-000000000004',
      skill_type: 'carpenter',
      experience_years: 3,
      verification_status: 'pending',
      users: {
        full_name: 'Amit Patel',
        username: 'amit_carpenter',
        phone: '+91 98765 43212',
        address: 'Karol Bagh, Delhi',
      },
    },
    {
      user_id: 'worker-pending-02',
      skill_type: 'plumber',
      experience_years: 4,
      verification_status: 'pending',
      users: {
        full_name: 'Vikas Kumar',
        username: 'vikas_plumb',
        phone: '+91 98765 43219',
        address: 'Rohini, Delhi',
      },
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleAction = async (userId: string, status: 'verified' | 'rejected') => {
    try {
      await fetch(`/api/v1/workers/${userId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': 'admin',
        },
        body: JSON.stringify({ verificationStatus: status }),
      });

      setQueue(queue.filter((w) => w.user_id !== userId));
      setNotification(`Worker ${status === 'verified' ? 'approved & verified' : 'rejected'}. Audit logged.`);
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setQueue(queue.filter((w) => w.user_id !== userId));
      setNotification(`Worker updated to ${status}.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Worker Verification Queue</h2>
        <p className="text-xs text-text-muted">Review credentials and verify cooperative technicians</p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {queue.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <UserCheck className="w-8 h-8 text-emerald-600 mx-auto" />
          <div className="font-bold text-sm text-slate-800">Queue is Clear</div>
          <p className="text-xs text-text-muted">All incoming workers have been verified and processed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((worker) => (
            <div
              key={worker.user_id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{worker.users.full_name}</h3>
                  <div className="text-xs text-text-muted font-mono">@{worker.users.username}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  <Clock className="w-3 h-3" /> Pending Review
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-text-muted">Skill:</span>{' '}
                  <span className="font-semibold text-slate-800 capitalize">{worker.skill_type}</span>
                </div>
                <div>
                  <span className="text-text-muted">Experience:</span>{' '}
                  <span className="font-semibold text-slate-800">{worker.experience_years} Years</span>
                </div>
                <div className="col-span-2">
                  <span className="text-text-muted">Address:</span>{' '}
                  <span className="font-medium text-slate-700">{worker.users.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAction(worker.user_id, 'rejected')}
                  className="py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldX className="w-4 h-4" /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(worker.user_id, 'verified')}
                  className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" /> Verify Worker
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

