export type Platform =
  | "pumpfun"
  | "raydium"
  | "meteora"
  | "bonkfun"
  | "bagsfm"
  | "heavenxyz";

export interface BundlerPlan {
  platform: Platform;
  wallets: number;
  solBudget: number;        
  minPerWallet?: number;    
  maxPerWallet?: number;    
  randomDelayMs?: [number, number]; 
  antiSniper?: boolean;
}

export interface SniperFilter {
  platform: Platform;
  keywords?: string[];
  minLiquidity?: number;
  maxLiquidity?: number;
  creatorBlacklist?: string[];
  jito?: boolean;
}