import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const ConfigSchema = z.object({
  RPC_ENDPOINTS: z.string().default("https://api.mainnet-beta.solana.com"),
  JITO_BUNDLE_URL: z.string().default("https://bundles.jito.wtf"),
  PROXIES: z.string().optional(),        
  DEFAULT_PLATFORM: z
    .enum(["pumpfun","raydium","meteora","bonkfun","bagsfm","heavenxyz"])
    .default("pumpfun"),
  TIMEOUT_MS: z.coerce.number().default(20000)
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(): AppConfig {
  const parsed = ConfigSchema.safeParse({
    RPC_ENDPOINTS: process.env.RPC_ENDPOINTS,
    JITO_BUNDLE_URL: process.env.JITO_BUNDLE_URL,
    PROXIES: process.env.PROXIES,
    DEFAULT_PLATFORM: process.env.DEFAULT_PLATFORM,
    TIMEOUT_MS: process.env.TIMEOUT_MS
  });
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    throw new Error("Invalid config: " + JSON.stringify(errors));
  }
  return parsed.data;
}

export function parseList(val?: string): string[] {
  return (val ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}