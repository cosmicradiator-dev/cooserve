/**
 * Enterprise Supabase Configuration & Validation Module
 * Sanitizes environment variables, trims copy-paste artifacts, and provides diagnostic health.
 */

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  hasServiceRoleKey: boolean;
  isPlaceholder: boolean;
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  remediation?: string;
}

/**
 * Strips accidental wrapping quotes, carriage returns, or whitespace from .env strings
 */
export function sanitizeEnvVar(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .trim()
    .replace(/^["']|["']$/g, '') // remove surrounding quotes
    .trim();
}

/**
 * Checks if a value is a placeholder from a template
 */
export function isPlaceholderValue(value: string): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return (
    lower.includes('placeholder') ||
    lower.includes('your-project') ||
    lower.includes('your-anon') ||
    lower.includes('your-supabase') ||
    lower.includes('your_production') ||
    lower.includes('your-service') ||
    lower.startsWith('eyjh...your')
  );
}

/**
 * Returns normalized and sanitized Supabase configuration
 */
export function getSupabaseConfig(): SupabaseConfigStatus {
  const rawUrl = sanitizeEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const rawAnonKey = sanitizeEnvVar(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  const rawServiceKey = sanitizeEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const hasUrl = Boolean(rawUrl && !isPlaceholderValue(rawUrl));
  const hasAnonKey = Boolean(rawAnonKey && !isPlaceholderValue(rawAnonKey));
  const hasServiceRoleKey = Boolean(rawServiceKey && !isPlaceholderValue(rawServiceKey));

  const isConfigured = hasUrl && hasAnonKey;
  const isPlaceholder = isPlaceholderValue(rawUrl) || isPlaceholderValue(rawAnonKey);

  let remediation: string | undefined;
  if (!isConfigured) {
    if (!hasUrl) {
      remediation = 'NEXT_PUBLIC_SUPABASE_URL is missing or using placeholder in .env';
    } else if (!hasAnonKey) {
      remediation = 'NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid in .env';
    }
  }

  return {
    isConfigured,
    hasUrl,
    hasAnonKey,
    hasServiceRoleKey,
    isPlaceholder,
    url: rawUrl || 'https://placeholder.supabase.co',
    anonKey: rawAnonKey || 'placeholder-anon-key',
    serviceRoleKey: hasServiceRoleKey ? rawServiceKey : (rawAnonKey || 'placeholder-key'),
    remediation,
  };
}

/**
 * Masks a sensitive API key for safe logging or diagnostic display (e.g., "sb_pub...8Lj")
 */
export function maskKey(key: string): string {
  if (!key || key.length < 8) return '***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}
