/**
 * Helpers for reading & writing search-param state.
 * Lists are stored as repeated keys: ?cats=panels&cats=inverters
 * (which Next.js gives us as `string | string[]` per key).
 */

export type RawSearchParams = Record<string, string | string[] | undefined>

export function readList(raw: string | string[] | undefined): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function readNumber(
  raw: string | string[] | undefined,
  fallback?: number,
): number | undefined {
  if (!raw) return fallback
  const v = Array.isArray(raw) ? raw[0] : raw
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function readString(raw: string | string[] | undefined): string | undefined {
  if (!raw) return undefined
  return Array.isArray(raw) ? raw[0] : raw
}

export function readBool(raw: string | string[] | undefined): boolean {
  const s = readString(raw)
  return s === '1' || s === 'true'
}
