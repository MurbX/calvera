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
  title: 'Calvera Tech Solutions — Power Your Kenya Home',
  description:
    'Solar panels, inverters, batteries and full kits delivered & installed across Kenya. Build your system with our solar calculator.',
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
