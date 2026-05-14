import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import '../globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calvera.vercel.app',
  ),
  title: 'Calvera Tech Solutions — Power Your Home',
  description:
    'Solar panels, inverters, batteries and full kits delivered & installed wherever you are. Build your system with our solar calculator.',
  // Favicons come from src/app/icon.png + src/app/favicon.ico (Next.js
  // convention) — don't override here with the 1.8MB social-preview file.
  openGraph: {
    images: ['/brand/logo_2.png'],
  },
  twitter: {
    card: 'summary',
    images: ['/brand/logo_2.png'],
  },
}

export default async function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-fg">
        <WishlistProvider>
          <CartProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  )
}
