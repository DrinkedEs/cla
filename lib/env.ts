import { z } from "zod";

const envSchema = z.object({
  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default("root"),
  DB_NAME: z.string().default("la_dental"),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  SESSION_MAX_AGE_DAYS: z.coerce.number().int().positive().default(14)
});

export const env = envSchema.parse({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  APP_BASE_URL: process.env.APP_BASE_URL,
  SESSION_MAX_AGE_DAYS: process.env.SESSION_MAX_AGE_DAYS
});
