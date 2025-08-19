import { log } from "../logger.js";

export interface JitoBundle {
  txs: string[]; 
  tag?: string;
}

export class JitoClient {
  constructor(private url: string) {}

  async send(bundle: JitoBundle): Promise<{ id: string }> {
    log.info(`Jito bundle -> ${this.url}`, { size: bundle.txs.length, tag: bundle.tag });
    await new Promise(r => setTimeout(r, 150));
    return { id: "bundle_" + Math.random().toString(36).slice(2) };
  }
}