export const log = {
  info: (m: string, extra?: unknown) =>
    console.log(`[INFO] ${m}`, extra ?? ""),
  warn: (m: string, extra?: unknown) =>
    console.warn(`[WARN] ${m}`, extra ?? ""),
  error: (m: string, extra?: unknown) =>
    console.error(`[ERROR] ${m}`, extra ?? ""),
  success: (m: string, extra?: unknown) =>
    console.log(`[OK]   ${m}`, extra ?? "")
};