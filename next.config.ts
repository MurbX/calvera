import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Some upstream CDNs resolve via IPv6 NAT64 (e.g. 64:ff9b::) which Next 16
    // conservatively flags as "local". Allowed because remotePatterns below
    // still gates which hostnames we'll optimize.
    dangerouslyAllowLocalIP: true,
    // Hold optimized variants 30 days so we don't re-fetch from slow upstream.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'www.calveratechsolutions.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
