import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Brands } from './collections/Brands'
import { Products } from './collections/Products'
import { Projects } from './collections/Projects'
import { Orders } from './collections/Orders'
import { CalculatorSubmissions } from './collections/CalculatorSubmissions'
import { Leads } from './collections/Leads'
import { Customers } from './collections/Customers'
import { ManualQuotes } from './collections/ManualQuotes'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

function buildAllowedOrigins(): string[] {
  const out = new Set<string>([
    'http://localhost:3000',
    // Hardcoded production alias as a safety net in case the Vercel env
    // vars below aren't populated at config-load time.
    'https://calvera.vercel.app',
  ])
  if (process.env.NEXT_PUBLIC_SITE_URL) out.add(process.env.NEXT_PUBLIC_SITE_URL)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    out.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }
  if (process.env.VERCEL_URL) out.add(`https://${process.env.VERCEL_URL}`)
  return [...out]
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      Nav: '/components/admin/Nav.tsx#Nav',
      graphics: {
        Logo: '/components/admin/Logo.tsx#Logo',
        Icon: '/components/admin/Icon.tsx#Icon',
      },
    },
    meta: {
      title: 'Calvera Admin',
      titleSuffix: ' — Calvera Tech Solutions',
      description:
        'Calvera Tech Solutions — admin dashboard for products, orders, leads & calculator submissions.',
      icons: [
        { rel: 'icon', type: 'image/png', url: '/brand/calvera-logo.png' },
        { rel: 'apple-touch-icon', type: 'image/png', url: '/brand/calvera-logo.png' },
      ],
    },
  },
  editor: lexicalEditor(),
  collections: [
    Users,
    Customers,
    Media,
    Categories,
    Brands,
    Products,
    Projects,
    Orders,
    CalculatorSubmissions,
    Leads,
    ManualQuotes,
  ],
  globals: [SiteSettings],
  // CORS still uses the explicit allow-list. CSRF is intentionally empty:
  // Payload reads it as "no allow-list, trust the cookie" (see
  // node_modules/payload/dist/auth/extractJWT.js — `csrf.length === 0`
  // bypasses origin matching). We rely on SameSite=Lax + httpOnly cookies
  // for actual CSRF protection, which modern browsers enforce regardless.
  // Without this, every admin mutation on Vercel returned 403 because the
  // env-derived allow-list didn't match the request Origin reliably.
  cors: buildAllowedOrigins(),
  csrf: [],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? '',
      // Neon auto-suspends compute after 5 min idle; cloud NATs also cut
      // long-idle TCP sockets. These settings keep the pool healthy:
      // - keepAlive: send TCP probes so NAT/Neon don't silently drop sockets
      // - idleTimeoutMillis: cycle idle conns before Neon's auto-suspend hits
      // - connectionTimeoutMillis: fail fast instead of hanging on a bad socket
      // - max: cap Neon-side connections (Neon free tier allows ~100)
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
      allowExitOnIdle: false,
    },
    // Force schema-push in production too. We're sharing one Neon DB between
    // dev and prod, so dev has already pushed every column we need; this just
    // tells the prod runtime to trust the existing schema instead of erroring
    // on the "no migrations table" check. Switch to migrations before scale.
    push: true,
    // Neon's pooled (-pooler) endpoint runs in transaction-mode PgBouncer,
    // which doesn't support session-level transactions Payload would otherwise
    // use. Disable transactions to avoid "cannot begin transaction".
    transactionOptions: false,
  }),
  secret: process.env.PAYLOAD_SECRET ?? 'dev-only-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Vercel's serverless filesystem is read-only, so the default disk uploader
  // for the Media collection won't work in production. We route uploads to
  // Vercel Blob when BLOB_READ_WRITE_TOKEN is set; locally without the token
  // the plugin is a no-op and uploads still write to ./media as before.
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN ?? '',
    }),
  ],
  sharp,
})
