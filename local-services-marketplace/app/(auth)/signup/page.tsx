'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HardHat,
  User,
  ShieldAlert,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ErrorDetails {
  code?: string;
  message: string;
  userMessage?: string;
  developerHint?: string;
  action?: 'login' | 'retry' | 'check_config' | 'wait' | 'contact_support';
}

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
  const [errorInfo, setErrorInfo] = useState<ErrorDetails | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDevDetails, setShowDevDetails] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/v1/health/auth');
      const data = await res.json();
      setHealthStatus(data);
    } catch (err: any) {
      setHealthStatus({ status: 'ERROR', error: err.message });
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
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
        const errPayload = json?.error;
        if (typeof errPayload === 'object' && errPayload !== null) {
          setErrorInfo({
            code: errPayload.code,
            message: errPayload.message || 'Signup failed',
            userMessage: errPayload.userMessage,
            developerHint: errPayload.developerHint,
            action: errPayload.action,
          });
        } else {
          setErrorInfo({
            message: json?.error?.message || 'Registration request could not be processed',
          });
        }
        return;
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
          'Registration complete! Your profile has been securely recorded on the cloud database. You can now sign in.'
        );
      }
    } catch (err: any) {
      setErrorInfo({
        message: err.message || 'An unexpected error occurred during registration',
      });
    } finally {
      setLoading(false);
    }
  };

  const isConfigError =
    errorInfo?.code === 'AUTH_GATEWAY_MISCONFIGURED' ||
    errorInfo?.code === 'AUTH_GATEWAY_CONFIG_ERROR' ||
    errorInfo?.code === 'API_KEY_CONFIG_ERROR' ||
    errorInfo?.message?.toLowerCase().includes('api key');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-bg py-10">
      <div className="w-full max-w-lg mx-auto p-6 sm:p-8 rounded-md bg-white border border-slate-200 flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
            <span className="text-[11px] text-slate-400 font-mono">CooServe Enterprise</span>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Create Member Account
          </h1>
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
            Select your member role. Passwords and identities are cryptographically isolated on the cloud database.
          </p>

          {/* Enterprise Error Notification System */}
          {errorInfo && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50/70 p-4 text-xs text-red-900 space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="font-semibold text-red-950 flex items-center justify-between">
                    <span>
                      {isConfigError
                        ? 'Cloud Database Authentication Setup Required'
                        : errorInfo.code === 'AUTH_USER_CONFLICT'
                        ? 'Account Already Exists'
                        : errorInfo.code === 'AUTH_EMAIL_RATE_LIMITED'
                        ? 'Verification Email Rate Limited'
                        : 'Registration Request Notice'}
                    </span>
                    {errorInfo.code && (
                      <span className="text-[10px] font-mono bg-red-100 text-red-800 px-1.5 py-0.5 rounded border border-red-200">
                        {errorInfo.code}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {errorInfo.userMessage || errorInfo.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons based on Error Type */}
              {errorInfo.code === 'AUTH_USER_CONFLICT' && (
                <div className="pt-2 border-t border-red-200/60 flex items-center gap-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors"
                  >
                    Sign In with Existing Account →
                  </Link>
                </div>
              )}

              {/* Guidance for Config & API Key Issues */}
              {isConfigError && (
                <div className="pt-2 border-t border-red-200/60 space-y-2">
                  <div className="bg-white/80 rounded-md p-3 border border-red-200/80 text-[11px] text-slate-700 space-y-1.5">
                    <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      Quick Setup Resolution:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                      <li>
                        Ensure <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">.env</code> matches your Supabase Project Settings &gt; API.
                      </li>
                      <li>
                        Set <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to your secret key.
                      </li>
                      <li>
                        Restart the Next.js dev server (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">Ctrl + C</code> &rarr; <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">npm run dev</code>).
                      </li>
                    </ol>
                  </div>

                  {/* Real-time Diagnostics Trigger */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={checkHealth}
                      disabled={checkingHealth}
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary-hover font-medium underline transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${checkingHealth ? 'animate-spin' : ''}`} />
                      {checkingHealth ? 'Testing connection...' : 'Test Cloud Connection Now'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDevDetails(!showDevDetails)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <span>Technical Details</span>
                      {showDevDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {healthStatus && (
                    <div className="bg-slate-900 text-slate-100 p-2.5 rounded-md font-mono text-[10px] space-y-1">
                      <div className="flex justify-between">
                        <span>Gateway:</span>
                        <span className={healthStatus.authGateway?.reachable ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {healthStatus.authGateway?.reachable ? 'ONLINE (200 OK)' : 'OFFLINE / INVALID KEY'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Database:</span>
                        <span className={healthStatus.database?.reachable ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {healthStatus.database?.reachable ? 'CONNECTED' : 'UNREACHABLE'}
                        </span>
                      </div>
                      {healthStatus.remediation && (
                        <div className="text-amber-300 pt-1 border-t border-slate-700 text-[10px]">
                          {healthStatus.remediation}
                        </div>
                      )}
                    </div>
                  )}

                  {showDevDetails && errorInfo.developerHint && (
                    <div className="bg-slate-100 p-2.5 rounded border border-slate-300 font-mono text-[10px] text-slate-800 break-all">
                      {errorInfo.developerHint}
                    </div>
                  )}
                </div>
              )}
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
                  placeholder="e.g. Haresh S"
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
                  placeholder="e.g. haresh_g"
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
                  placeholder="Coimbatore, Tamil Nadu"
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
              className="w-full py-2.5 rounded-md font-medium text-xs flex items-center justify-center gap-2 transition-colors duration-150 mt-4 bg-primary hover:bg-primary-hover text-white disabled:opacity-60 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> {loading ? 'Securing Registration...' : `Register as ${role === 'worker' ? 'Worker' : 'Customer'}`}
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
