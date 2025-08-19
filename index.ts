#!/usr/bin/env node
import { Command } from "commander";
import ora from "ora";
import { loadConfig } from "./config.js";
import { RpcPool } from "./services/rpcPool.js";
import { JitoClient } from "./services/jito.js";
import { Bundler } from "./modules/bundler.js";
import { Sniper } from "./modules/sniper.js";

const program = new Command();
program.name("solaio").description("Solana AIO TypeScript CLI").version("0.1.0");

program
  .command("rpc")
  .description("RPC utilities")
  .command("check")
  .description("Probe RPC endpoints")
  .action(async () => {
    const cfg = loadConfig();
    const pool = RpcPool.fromEnv(cfg.RPC_ENDPOINTS);
    const spin = ora("Probing RPC...").start();
    try {
      const res = await pool.probe();
      spin.succeed("Probed RPC endpoints");
      res.forEach(r =>
        console.log(`${r.ok ? "✓" : "✗"} ${r.url} ${r.t >= 0 ? `${r.t}ms` : ""}`)
      );
    } catch (e: any) {
      spin.fail(e.message);
      process.exit(1);
    }
  });

program
  .command("bundler")
  .description("Token bundler")
  .command("run")
  .description("Execute a bundler plan")
  .option("-p, --platform <name>", "pumpfun|raydium|meteora|bonkfun|bagsfm|heavenxyz", "pumpfun")
  .option("-w, --wallets <n>", "number of wallets", (v) => parseInt(v, 10), 10)
  .option("-b, --budget <sol>", "total SOL budget", (v) => parseFloat(v), 5)
  .option("--min <sol>", "min per wallet", (v) => parseFloat(v))
  .option("--max <sol>", "max per wallet", (v) => parseFloat(v))
  .option("--anti-sniper", "enable anti-sniper")
  .action(async (opts) => {
    const cfg = loadConfig();
    const pool = RpcPool.fromEnv(cfg.RPC_ENDPOINTS);
    const jito = new JitoClient(cfg.JITO_BUNDLE_URL);
    const bundler = new Bundler(pool, jito);

    const spin = ora("Running bundler...").start();
    try {
      await bundler.run({
        platform: opts.platform,
        wallets: opts.wallets,
        solBudget: opts.budget,
        minPerWallet: opts.min,
        maxPerWallet: opts.max,
        antiSniper: !!opts.antiSniper
      });
      spin.succeed("Bundler finished");
    } catch (e: any) {
      spin.fail(e.message);
      process.exit(1);
    }
  });

program
  .command("sniper")
  .description("Sniper tools")
  .command("watch")
  .description("Watch platform with filters")
  .option("-p, --platform <name>", "pumpfun|raydium|meteora|bonkfun|bagsfm|heavenxyz", "pumpfun")
  .option("--min-liq <n>", "min liquidity", (v) => parseFloat(v))
  .option("--max-liq <n>", "max liquidity", (v) => parseFloat(v))
  .option("--kw <list>", "comma-separated keywords")
  .option("--blacklist <list>", "comma-separated creators to ignore")
  .option("--jito", "prefer Jito routes")
  .action(async (opts) => {
    const spin = ora("Starting sniper...").start();
    try {
      const sniper = new Sniper();
      await sniper.watch({
        platform: opts.platform,
        keywords: (opts.kw ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
        minLiquidity: opts.minLiq,
        maxLiquidity: opts.maxLiq,
        creatorBlacklist: (opts.blacklist ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
        jito: !!opts.jito
      });
      spin.succeed("Sniper finished");
    } catch (e: any) {
      spin.fail(e.message);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
