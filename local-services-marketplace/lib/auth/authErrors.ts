/**
 * Enterprise Authentication Error Mapping & Problem Details
 * Maps raw Supabase / GoTrue / PostgREST error codes to standardized domain contracts.
 */

export interface FormattedAuthError {
  code: string;
  message: string;
  userMessage: string;
  developerHint?: string;
  action?: 'login' | 'retry' | 'check_config' | 'wait' | 'contact_support';
  status: number;
}

export function formatAuthError(err: any): FormattedAuthError {
  const rawMsg = err?.message || err?.msg || String(err || '');
  const rawCode = err?.code || err?.error_code || '';
  const status = err?.status || 400;
  const isDev = process.env.NODE_ENV !== 'production';

  // 1. API Key or Gateway Credentials Issues
  if (
    rawMsg.toLowerCase().includes('api key') ||
    rawMsg.toLowerCase().includes('apikey') ||
    rawCode === 'invalid_api_key' ||
    rawCode === 'API_KEY_CONFIG_ERROR' ||
    rawCode === 'AUTH_GATEWAY_CONFIG_ERROR' ||
    (status === 401 && rawMsg.toLowerCase().includes('unauthorized'))
  ) {
    return {
      code: 'AUTH_GATEWAY_MISCONFIGURED',
      message: rawMsg,
      userMessage: 'The authentication service is currently verifying database credentials. Please refresh or verify server settings.',
      developerHint: isDev
        ? 'Invalid Supabase API key. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY in .env matches your Supabase Project Settings > API key, and restart your server.'
        : undefined,
      action: 'check_config',
      status: 503,
    };
  }

  // 2. Email Rate Limiting (Free Tier 3 emails/hour limit)
  if (
    rawCode === 'over_email_send_rate_limit' ||
    rawMsg.toLowerCase().includes('rate limit') ||
    rawMsg.toLowerCase().includes('email rate')
  ) {
    return {
      code: 'AUTH_EMAIL_RATE_LIMITED',
      message: rawMsg,
      userMessage: 'Registration email verification limit reached. If you already have an account, please log in.',
      developerHint: isDev
        ? 'Supabase Free Tier limits to 3 confirmation emails/hr. Go to Supabase Dashboard > Authentication > Providers > Email and turn OFF "Confirm email" for instant local testing.'
        : undefined,
      action: 'login',
      status: 429,
    };
  }

  // 3. User Already Exists / Conflict
  if (
    rawCode === 'user_already_exists' ||
    rawCode === '23505' ||
    rawMsg.toLowerCase().includes('already registered') ||
    rawMsg.toLowerCase().includes('already exists') ||
    rawMsg.toLowerCase().includes('unique constraint')
  ) {
    return {
      code: 'AUTH_USER_CONFLICT',
      message: rawMsg,
      userMessage: 'An account with this email address or username is already registered. Please sign in.',
      developerHint: 'User already exists in Supabase auth.users or public.users.',
      action: 'login',
      status: 409,
    };
  }

  // 4. Invalid Email Address
  if (rawCode === 'email_address_invalid' || rawMsg.toLowerCase().includes('email address')) {
    return {
      code: 'AUTH_INVALID_EMAIL',
      message: rawMsg,
      userMessage: 'Please enter a valid, active email address.',
      action: 'retry',
      status: 400,
    };
  }

  // 5. Password Policy Violation
  if (rawCode === 'weak_password' || rawMsg.toLowerCase().includes('password')) {
    return {
      code: 'AUTH_WEAK_PASSWORD',
      message: rawMsg,
      userMessage: 'Password must be at least 8 characters long.',
      action: 'retry',
      status: 400,
    };
  }

  // 6. Network / Offline Issues
  if (rawMsg.toLowerCase().includes('fetch failed') || rawMsg.toLowerCase().includes('enotfound')) {
    return {
      code: 'AUTH_NETWORK_UNAVAILABLE',
      message: rawMsg,
      userMessage: 'Unable to reach the cloud database server. Please verify your internet connection.',
      developerHint: 'DNS lookup or network fetch to Supabase endpoint failed.',
      action: 'retry',
      status: 503,
    };
  }

  // Default Fallback
  return {
    code: rawCode || 'AUTH_REQUEST_FAILED',
    message: rawMsg,
    userMessage: rawMsg || 'Unable to complete account registration at this time. Please try again.',
    developerHint: isDev ? `Raw Error: ${rawMsg}` : undefined,
    action: 'retry',
    status,
  };
}
