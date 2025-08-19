import { log } from "../logger.js";
import { parseList } from "../config.js";

export class RpcPool {
  constructor(private endpoints: string[]) {
    if (endpoints.length === 0) {
      throw new Error("RPC pool requires at least one endpoint");
    }
  }

  pick(): string {
    return this.endpoints[Math.floor(Math.random() * this.endpoints.length)];
  }

  async probe(): Promise<Array<{ url: string; ok: boolean; t: number }>> {
    const checks = await Promise.all(
      this.endpoints.map(async url => {
        const t0 = performance.now();
        try {
          await new Promise(r => setTimeout(r, 50 + Math.random() * 200));
          const t1 = performance.now();
          return { url, ok: true, t: Math.round(t1 - t0) };
        } catch {
          return { url, ok: false, t: -1 };
        }
      })
    );
    checks.forEach(c =>
      c.ok ? log.success(`RPC OK ${c.url} (${c.t}ms)`) : log.warn(`RPC BAD ${c.url}`)
    );
    return checks;
  }

  static fromEnv(list: string | undefined): RpcPool {
    return new RpcPool(parseList(list));
  }
}