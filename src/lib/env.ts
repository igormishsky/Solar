import { z } from 'zod';

const envSchema = z.object({
  supabaseUrl: z.string().url(),
  supabaseAnonKey: z.string().min(1),
  appName: z.string().default('O.R.I SOLAR'),
  appVersion: z.string().default('1.0.0'),
});

const getEnvVar = (key: string, fallbackKey?: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || (fallbackKey ? process.env[fallbackKey] : undefined);
  }
  return undefined;
};

export const env = envSchema.parse({
  supabaseUrl: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'),
  appName: getEnvVar('EXPO_PUBLIC_APP_NAME', 'VITE_APP_NAME'),
  appVersion: getEnvVar('EXPO_PUBLIC_APP_VERSION', 'VITE_APP_VERSION'),
});
