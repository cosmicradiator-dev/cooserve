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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(text.slice(0, 150) || `Server error (${res.status})`);
      }

      if (!res.ok || json?.error) {
        throw new Error(json?.error?.message || 'Signup failed');
      }

      // Set session cookies
      const userId = json.data?.user?.id;
      document.cookie = `coop_user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `coop_user_id=${userId}; path=/; max-age=86400; SameSite=Lax`;

      if (json.data?.session) {
        if (role === 'worker') {
          router.push('/worker/dashboard');
        } else {
          router.push('/customer/request');
        }
      } else {
        setSuccessMsg(
          'Registration complete! Your profile and hashed password are securely stored on the Supabase database server. You can now sign in.'
        );
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-bg py-10">
      <div className="w-full max-w-lg mx-auto p-6 sm:p-8 rounded-md bg-white border border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
            <span className="text-[11px] text-slate-400 font-mono">CooServe Register</span>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Create Member Account
          </h1>
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
            Select your member role. Passwords and profiles are securely stored on the database server.
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-3.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                <span>{successMsg}</span>
              </div>
              <Link
                href="/login"
                className="inline-block px-3 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors"
              >
                Go to Sign In →
              </Link>
            </div>
          )}

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-3 rounded-md border flex items-center justify-center gap-2 text-xs font-medium transition-colors duration-150 ${
                role === 'customer'
                  ? 'bg-blue-50 border-primary text-primary'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Consumer Member</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`p-3 rounded-md border flex items-center justify-center gap-2 text-xs font-medium transition-colors duration-150 ${
                role === 'worker'
                  ? 'bg-blue-50 border-primary text-primary'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>Verified Worker</span>
            </button>
          </div>

          <form onSubmit={handleSignup} className="mt-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ramesh_pro"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  City / Locality
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Connaught Place, New Delhi"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
            </div>

            {role === 'worker' && (
              <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-3 mt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Primary Trade Craft
                  </label>
                  <select
                    value={skillType}
                    onChange={(e) => setSkillType(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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
                    <span className="text-xs font-medium text-slate-700">
                      Craft Experience
                    </span>
                    <span className="text-xs font-medium text-primary font-mono">
                      {experienceYears} Years
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md font-medium text-xs flex items-center justify-center gap-2 transition-colors duration-150 mt-4 bg-primary hover:bg-primary-hover text-white disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" /> {loading ? 'Registering...' : `Register as ${role === 'worker' ? 'Worker' : 'Customer'}`}
            </button>
          </form>
        </div>

        <div className="pt-5 mt-5 border-t border-slate-200 text-center text-xs text-slate-600">
          Already a cooperative member?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
