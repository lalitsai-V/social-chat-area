import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
});

function parseEnv() {
  const partial = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const result = envSchema.safeParse(partial);

  if (result.success) return result.data;

  // Fail fast on the server so developers notice missing config
  if (typeof window === "undefined") {
    // eslint-disable-next-line no-console
    console.error("Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment variables. See server logs for details.");
  }

  // In the browser (during client-side builds/hydration), return safe fallbacks
  return {
    NEXT_PUBLIC_SUPABASE_URL: partial.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: partial.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

const env = parseEnv();

export default env;
