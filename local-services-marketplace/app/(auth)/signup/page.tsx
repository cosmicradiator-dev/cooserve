'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HardHat, User, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<'worker' | 'customer'>('customer');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [skillType, setSkillType] = useState('electrician');
  const [experienceYears, setExperienceYears] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        role,
        fullName,
        username,
        email,
        password,
        phone: phone || undefined,
        address: address || undefined,
        ...(role === 'worker' ? { skillType, experienceYears: Number(experienceYears) } : {}),
      };

      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Signup failed');
      }

      // Set session cookies for demonstration
      document.cookie = `coop_user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `coop_user_id=${json.data.user.id}; path=/; max-age=86400; SameSite=Lax`;

      if (role === 'worker') {
        router.push('/worker/dashboard');
      } else {
        router.push('/customer/request');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-900 text-white overflow-y-auto">
      <div>
        <h1 className="text-xl font-black tracking-tight">Join the Cooperative</h1>
        <p className="text-slate-400 text-xs mt-1">
          Select your member role. (Admin is strictly seeded & privileged).
        </p>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              role === 'customer'
                ? 'bg-amber-500/20 border-secondary text-amber-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('worker')}
            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
              role === 'worker'
                ? 'bg-teal-500/20 border-primary text-teal-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <HardHat className="w-5 h-5" />
            <span className="text-xs">Worker</span>
          </button>
        </div>

        <form onSubmit={handleSignup} className="mt-4 space-y-2.5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Full Name</label>
            <input
              required
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Sharma"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Username</label>
            <input
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ramesh_pro"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Password</label>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          {role === 'worker' && (
            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/60 space-y-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-teal-400 mb-0.5">Primary Skill</label>
                <select
                  value={skillType}
                  onChange={(e) => setSkillType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                >
                  <option value="electrician">Electrician</option>
                  <option value="plumber">Plumber</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="painter">Painter</option>
                  <option value="appliance_repair">Appliance Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-teal-400 mb-0.5">
                  Experience ({experienceYears} years)
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-2 text-white ${
              role === 'worker' ? 'bg-primary hover:bg-primary-hover' : 'bg-secondary hover:bg-secondary-hover'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> {loading ? 'Registering...' : `Register as ${role}`}
          </button>
        </form>
      </div>

      <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
        Already registered?{' '}
        <Link href="/login" className="text-teal-400 font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

