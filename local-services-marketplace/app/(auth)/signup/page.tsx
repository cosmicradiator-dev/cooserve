'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HardHat, User, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 py-10">
      <div className="w-full max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              Home
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Join the Cooperative
          </h1>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Select your member role. (Admin is strictly seeded & privileged).
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                role === 'customer'
                  ? 'bg-amber-500/20 border-secondary text-amber-300 font-bold shadow-md shadow-amber-950/30'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Consumer Member</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                role === 'worker'
                  ? 'bg-teal-500/20 border-primary text-teal-300 font-bold shadow-md shadow-teal-950/30'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <HardHat className="w-5 h-5" />
              <span className="text-xs">Verified Worker</span>
            </button>
          </div>

          <form onSubmit={handleSignup} className="mt-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Username
                </label>
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ramesh_pro"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Password
                </label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  City / Locality
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Connaught Place, New Delhi"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            {role === 'worker' && (
              <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-800/60 space-y-3 mt-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-teal-400 mb-1">
                    Primary Trade Craft
                  </label>
                  <select
                    value={skillType}
                    onChange={(e) => setSkillType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
                  >
                    <option value="electrician">Electrician (Wiring, Fuse, Inverters)</option>
                    <option value="plumber">Plumber (Pipes, Taps, Leakages)</option>
                    <option value="carpenter">Carpenter (Woodwork, Furniture)</option>
                    <option value="painter">Painter (Interior, Exterior)</option>
                    <option value="appliance_repair">Appliance Repair (HVAC, Refrigerator)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-teal-400">
                      Craft Experience
                    </span>
                    <span className="text-xs font-bold text-teal-300 font-mono">
                      {experienceYears} Years
                    </span>
                  </div>
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
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-3 text-white shadow-md ${
                role === 'worker'
                  ? 'bg-primary hover:bg-primary-hover shadow-teal-950/30'
                  : 'bg-secondary hover:bg-secondary-hover shadow-amber-950/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> {loading ? 'Registering...' : `Register as ${role}`}
            </button>
          </form>
        </div>

        <div className="pt-5 mt-5 border-t border-slate-800 text-center text-xs text-slate-400">
          Already a cooperative member?{' '}
          <Link href="/login" className="text-teal-400 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
