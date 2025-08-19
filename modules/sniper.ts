import type { SniperFilter, Platform } from "../types.js";
import { log } from "../logger.js";

const SUPPORTED: Platform[] = [
  "pumpfun",
  "raydium",
  "meteora",
  "bonkfun",
  "bagsfm",
  "heavenxyz"
];

export class Sniper {
  constructor() {}

  supports(p: Platform): boolean {
    return SUPPORTED.includes(p);
  }

  async watch(filter: SniperFilter): Promise<void> {
    if (!this.supports(filter.platform)) {
      throw new Error(`Unsupported platform: ${filter.platform}`);
    }
    log.info(`Sniper watching ${filter.platform}`, filter);

    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
      const ev = {
        token: "So11111111111111111111111111111111111111112",
        liq: Math.round(10 + Math.random() * 90),
        creator: "CREATOR_" + Math.random().toString(36).slice(2, 8)
      };
      const ok =
        (filter.minLiquidity === undefined || ev.liq >= filter.minLiquidity) &&
        (filter.maxLiquidity === undefined || ev.liq <= filter.maxLiquidity) &&
        !(filter.creatorBlacklist ?? []).includes(ev.creator);

      ok
        ? log.success(`[MATCH] ${filter.platform} ${ev.token} liq=${ev.liq}`)
        : log.warn(`[SKIP] ${filter.platform} ${ev.token} liq=${ev.liq}`);
    }
    log.info(`Sniper session ended.`);
  }
}