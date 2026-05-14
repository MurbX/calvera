import 'server-only'

/**
 * Retry wrapper for transient Postgres connection failures.
 *
 * Why we need this even with pool tuning:
 * - Neon auto-suspends compute after 5 min idle. The first request after a
 *   long idle period can hit a stale socket before keepAlive/idleTimeout
 *   recycles it.
 * - PgBouncer in transaction mode occasionally rejects on cold-start.
 * - Network blips on cloud NATs.
 *
 * We only retry on errors that match transient connection signatures —
 * non-transient errors (auth failures, schema errors, query bugs) surface
 * immediately so we don't mask real bugs.
 */
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      const msg = String((err as Error)?.message ?? err)
      const transient =
        msg.includes('Failed query') ||
        msg.includes('Connection terminated') ||
        msg.includes('connection terminated') ||
        msg.includes('connection timeout') ||
        msg.includes('cannot connect to Postgres') ||
        msg.includes('ECONNRESET') ||
        msg.includes('ETIMEDOUT') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('socket hang up') ||
        msg.includes('Client has encountered a connection error')
      if (!transient || i === attempts - 1) throw err
      // Exponential backoff: 500ms, 1.5s — gives Neon time to cold-start
      await new Promise((r) => setTimeout(r, 500 * (i + 1)))
    }
  }
  throw lastErr
}
