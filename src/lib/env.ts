import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid URL string."),

  NEXTAUTH_SECRET: z
    .string()
    .min(
      32,
      "NEXTAUTH_SECRET must be at least 32 characters long for production security."
    ),

  NEXTAUTH_URL: z
    .string()
    .url(
      "NEXTAUTH_URL must be a valid URL string (e.g. http://localhost:3000 or https://yourdomain.com)."
    ),

  MIDTRANS_ENV: z.enum(["sandbox", "production"]).default("sandbox"),

  MIDTRANS_SERVER_KEY: z
    .string()
    .min(1, "MIDTRANS_SERVER_KEY cannot be empty."),

  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_MIDTRANS_CLIENT_KEY cannot be empty."),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("\n=======================================================");
    console.error("❌ CRITICAL: ENVIRONMENT VARIABLE VALIDATION FAILED");
    console.error("=======================================================");

    const errors = result.error.format();
    for (const [key, value] of Object.entries(errors)) {
      if (
        key !== "_errors" &&
        value &&
        typeof value === "object" &&
        "_errors" in value
      ) {
        console.error(`- ${key}: ${(value as any)._errors.join(", ")}`);
      }
    }

    console.error("=======================================================\n");

    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw new Error("Invalid environment variables");
  }

  return result.data;
}

export const env = validateEnv();
