import type { BundlerPlan, Platform } from "../types.js";
import { JitoClient } from "../services/jito.js";
import { RpcPool } from "../services/rpcPool.js";
import { log } from "../logger.js";

const PLATFORM_ALIASES: Record<Platform, string[]> = {
  pumpfun:    ["pump.fun", "pumpdotfun"],
  raydium:    ["raydium"],
  meteora:    ["meteora"],
  bonkfun:    ["bonk.fun", "letsbonk", "letsbonkfun"],
  bagsfm:     ["bags.fm", "bagsfm"],
  heavenxyz:  ["heaven.xyz", "heaven"]
};

export class Bundler {
  constructor(
    private rpc: RpcPool,
    private jito: JitoClient
  ) {}

  describePlatform(p: Platform): string {
    const a = PLATFORM_ALIASES[p].join(" / ");
    return `${p} (${a})`;
  }

  planToSplits(plan: BundlerPlan): number[] {
    const splits: number[] = [];
    const { wallets, solBudget, minPerWallet, maxPerWallet } = plan;
    const base = solBudget / wallets;
    for (let i = 0; i < wallets; i++) {
      let v = base * (0.8 + Math.random() * 0.4);
      if (minPerWallet) v = Math.max(v, minPerWallet);
      if (maxPerWallet) v = Math.min(v, maxPerWallet);
      splits.push(Number(v.toFixed(6)));
    }
    const fix = solBudget - splits.reduce((a, b) => a + b, 0);
    if (Math.abs(fix) > 1e-6) splits[0] = Number((splits[0] + fix).toFixed(6));
    return splits;
  }

  async run(plan: BundlerPlan): Promise<void> {
    log.info(`Bundler -> ${this.describePlatform(plan.platform)}`, plan);

    const rpcUrl = this.rpc.pick();
    log.info(`Using RPC: ${rpcUrl}`);

    const splits = this.planToSplits(plan);
    log.info(`Wallet splits generated`, { splits });

    const fakeTxs = splits.map(() => "BASE64_TX_PLACEHOLDER");

    if (plan.antiSniper) {
      log.info(`Anti-sniper enabled: adding randomization and delayed submits`);
    }

    const bundleId = await this.jito.send({ txs: fakeTxs, tag: plan.platform }).then(r => r.id);
    log.success(`Bundle submitted: ${bundleId}`);
  }
}