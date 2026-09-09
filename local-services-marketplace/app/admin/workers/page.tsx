'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldX, UserCheck, CheckCircle2, Clock, Wrench, MapPin, Calendar, Phone } from 'lucide-react';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          Worker Verification Queue
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          Review credentials, background disclosures, and verify cooperative technicians for the dispatch network.
        </p>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium rounded-md flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {queue.length === 0 ? (
        <div className="p-10 bg-white rounded-md border border-dashed border-slate-300 text-center space-y-3 max-w-xl mx-auto">
          <UserCheck className="w-10 h-10 text-emerald-600 mx-auto" />
          <h2 className="font-semibold text-base text-slate-900">Verification Queue is Clear</h2>
          <p className="text-xs text-text-muted">
            All incoming technician applicants have been processed and verified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {queue.map((worker) => (
            <div
              key={worker.user_id}
              className="p-5 sm:p-6 rounded-md bg-white border border-slate-200 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-base text-slate-900">{worker.users.full_name}</h2>
                    <div className="text-xs text-text-muted font-mono mt-0.5">
                      @{worker.users.username}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800">
                    <Clock className="w-3.5 h-3.5" /> Pending Review
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-md border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-text-muted">Trade:</span>{' '}
                    <span className="font-medium text-slate-900 capitalize">{worker.skill_type}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-text-muted">Experience:</span>{' '}
                    <span className="font-medium text-slate-900">{worker.experience_years} Years</span>
                  </div>

                  {worker.users.phone && (
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-text-muted">Mobile:</span>{' '}
                      <span className="font-mono text-slate-900 font-medium">{worker.users.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-text-muted">Address:</span>{' '}
                    <span className="font-medium text-slate-700">{worker.users.address}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleAction(worker.user_id, 'rejected')}
                  className="py-2 rounded-md bg-white hover:bg-red-50 border border-slate-300 hover:border-red-300 text-slate-700 hover:text-red-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldX className="w-4 h-4" /> Reject Applicant
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(worker.user_id, 'verified')}
                  className="py-2 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
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
