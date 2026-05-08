import { OffersCarousel, type Offer } from '@/components/OffersCarousel'
import { getFeaturedProducts, getProducts } from '@/lib/payload-data'

const FEATURE_CARDS: Offer[] = [
  {
    kind: 'feature',
    title: 'Professional Installation Partner',
    description:
      'Our vetted installer network covers all 47 counties. Free site survey, certified electricians, full post-install support and warranty fulfillment.',
    price: 'Free site survey',
    tagline: '500+ installations completed',
    href: '/installation',
    iconKey: 'tools',
  },
  {
    kind: 'feature',
    title: '24/7 Customer Support',
    description:
      'Talk to a real solar expert any day of the week, weekends included. Reach us by phone, WhatsApp or email — replies under 30 minutes.',
    price: 'Free with every order',
    tagline: 'Phone, WhatsApp, Email',
    href: '/contact',
    iconKey: 'headset',
  },
  {
    kind: 'feature',
    title: 'Same-day Nairobi Delivery',
    description:
      'Order before 1pm and we hand-deliver across Nairobi metro the same day. Countrywide courier with tracking for orders outside the city.',
    price: 'From KSh 500',
    tagline: 'Countrywide via courier',
    href: '/shop',
    iconKey: 'truck',
  },
  {
    kind: 'feature',
    title: 'Genuine, Warrantied Stock',
    description:
      'Only Tier-1 manufacturer-backed gear from JINKO, Victron, HANTI and InfiniSolar — with proper local warranty fulfillment and replacement.',
    price: 'Manufacturer-backed',
    tagline: 'Up to 25-year warranty',
    href: '/shop',
    iconKey: 'shield',
  },
]

export async function OffersSection() {
  // Prefer featured products; fall back to top-of-catalog if no featured exist.
  const [featured, all] = await Promise.all([getFeaturedProducts(), getProducts()])
  const products = featured.length > 0 ? featured : all
  const productOffers: Offer[] = products.slice(0, 6).map((p) => ({
    kind: 'package',
    slug: p.slug,
    href: `/products/${p.slug}`,
    title: p.name,
    price: p.price,
    rating: p.rating ?? 5,
    image: p.imageUrl ?? null,
  }))

  // Interleave: 2 products, 1 feature, 2 products, 1 feature, …
  const offers: Offer[] = []
  let pi = 0
  let fi = 0
  while (pi < productOffers.length || fi < FEATURE_CARDS.length) {
    if (pi < productOffers.length) offers.push(productOffers[pi++])
    if (pi < productOffers.length) offers.push(productOffers[pi++])
    if (fi < FEATURE_CARDS.length) offers.push(FEATURE_CARDS[fi++])
  }

  return <OffersCarousel offers={offers} />
}
