import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  VITE_GOOGLE_CLIENT_ID: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  APP_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('\n❌ Invalid environment configuration — server cannot start:\n');
  const formatted = parseResult.error.format();
  for (const [field, value] of Object.entries(formatted)) {
    if (field === '_errors') continue;
    const messages = (value as any)?._errors;
    if (messages?.length) console.error(`  ${field}: ${messages.join(', ')}`);
  }
  console.error('\nCheck your .env file against .env.example\n');
  process.exit(1);
}

export const env = parseResult.data;
