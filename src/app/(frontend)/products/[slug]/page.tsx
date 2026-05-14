import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
} from 'lucide-react'
import { formatKes } from '@/lib/utils'
import { getDeliveryEstimate } from '@/lib/delivery'
import { ProductCard } from '@/components/ProductCard'
import { ProductImageGallery } from '@/components/ProductImageGallery'
import { ProductBuyBox } from '@/components/ProductBuyBox'
import { ProductAccordion } from '@/components/ProductAccordion'
import { WishlistButton } from '@/components/WishlistButton'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { StickyMobileBuyBar } from '@/components/StickyMobileBuyBar'
import { getProductBySlug, getProductsByCategory, getProducts } from '@/lib/payload-data'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product not found' }
  return {
    title: `${product.name} — Calvera Tech Solutions`,
    description:
      product.shortDescription ?? `${product.name} — available at Calvera Tech Solutions.`,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  let related: Awaited<ReturnType<typeof getProductsByCategory>> = []
  try {
    related = (await getProductsByCategory(product.category.slug))
      .filter((p) => p.id !== product.id)
      .slice(0, 4)
  } catch (err) {
    console.error('[product detail] failed to load related products', err)
  }

  const delivery = getDeliveryEstimate()
  const inStock = (product.stock ?? 0) > 0
  const businessPhoneRaw = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+254 723 284 994'
  const waPhone = businessPhoneRaw.replace(/\s|\+|-/g, '')
  const waMessage = `Hi Calvera, I'm interested in ${product.name}${product.sku ? ` (${product.sku})` : ''}. Could you confirm availability and delivery to my location?`
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calvera.tech'}/products/${product.slug}`

  // Schema.org Product JSON-LD for Google Shopping + rich snippets
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrl ? [product.imageUrl] : [],
    description: product.shortDescription ?? '',
    sku: product.sku ?? undefined,
    brand: product.brand?.name
      ? { '@type': 'Brand', name: product.brand.name }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'KES',
      price: product.price,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Calvera Tech Solutions' },
    },
    aggregateRating:
      product.rating && product.reviews
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviews,
          }
        : undefined,
  }

  const cartItem = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl ?? null,
  }

  const wishlistItem = {
    ...cartItem,
    categoryName: product.category?.name ?? null,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="mx-auto max-w-350 px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="mx-1 inline h-3 w-3" />
          <Link href="/shop" className="hover:text-brand-700">Shop</Link>
          <ChevronRight className="mx-1 inline h-3 w-3" />
          <Link
            href={`/categories/${product.category.slug}`}
            className="hover:text-brand-700"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="mx-1 inline h-3 w-3" />
          <span className="text-fg">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <ProductImageGallery name={product.name} primary={product.imageUrl ?? null} />

          <div id="product-buy-box">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
              {product.category?.name}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg md:text-4xl">
              {product.name}
            </h1>
            {product.brand?.name && (
              <p className="mt-1 text-sm text-muted">
                Brand: <span className="font-semibold text-fg">{product.brand.name}</span>
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-brand-700">
              {Array.from({ length: product.rating ?? 0 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="text-sm text-muted">({product.reviews ?? 0} reviews)</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-brand-800">
                {formatKes(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-muted line-through">
                  {formatKes(product.compareAtPrice)}
                </span>
              )}
              <span className="text-sm text-muted">incl. VAT</span>
            </div>

            {product.shortDescription && (
              <p className="mt-5 text-base text-fg/80">{product.shortDescription}</p>
            )}

            {(product.specs?.length ?? 0) > 0 && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
                <h2 className="border-b border-border px-5 py-3 text-sm font-bold text-fg">
                  Specifications
                </h2>
                <table className="w-full text-sm">
                  <tbody>
                    {product.specs!.map((s, i) => (
                      <tr
                        key={s.label}
                        className={i % 2 === 1 ? 'bg-soft/60' : 'bg-white'}
                      >
                        <th
                          scope="row"
                          className="w-2/5 px-5 py-2.5 text-left font-medium text-muted"
                        >
                          {s.label}
                        </th>
                        <td className="px-5 py-2.5 text-right font-bold text-fg">
                          {s.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-border bg-soft/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-fg">
                {inStock ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    In stock — ships from our warehouse
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-amber-600" />
                    On order — talk to us for ETA
                  </>
                )}
              </div>
              {inStock && (
                <div className="flex items-start gap-2 text-xs text-fg/80">
                  <Truck className="mt-0.5 h-4 w-4 text-brand-700" />
                  <div>
                    <span className="font-semibold text-fg">{delivery.headline}</span>
                    <span className="ml-1 text-muted">— {delivery.subline}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <ProductBuyBox product={cartItem} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <WishlistButton
                item={wishlistItem}
                className="h-10! w-auto! rounded-full! border! border-border! px-4! text-fg/80! hover:text-rose-500!"
              />
              <a
                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-fg hover:border-[#25D366] hover:text-[#25D366]"
              >
                Ask on WhatsApp
              </a>
              <Link
                href="/installation"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-fg hover:border-fg/30"
              >
                <Wrench className="h-4 w-4" /> Request installation
              </Link>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-fg/80 sm:grid-cols-4">
              <TrustItem Icon={Banknote} label="Pay on delivery" />
              <TrustItem Icon={Truck} label="Same-day dispatch" />
              <TrustItem Icon={ShieldCheck} label="Manufacturer warranty" />
              <TrustItem Icon={RotateCcw} label="7-day returns" />
            </ul>
          </div>
        </div>

        <section className="mt-12">
          <ProductAccordion
            sections={[
              {
                id: 'description',
                title: 'Description',
                defaultOpen: true,
                body: (
                  <div className="prose prose-sm max-w-none text-fg/85">
                    <p>
                      {product.shortDescription ??
                        `${product.name} from Calvera Tech Solutions — sold and supported by Calvera.`}
                    </p>
                    <p className="mt-3">
                      Every order is checked, packed and shipped from our warehouse. We
                      stand behind every product with a manufacturer-backed warranty plus our own
                      12-month workmanship cover on installations.
                    </p>
                  </div>
                ),
              },
              {
                id: 'installation',
                title: 'Installation',
                body: (
                  <div className="space-y-2 text-sm text-fg/85">
                    <p>
                      Calvera operates a vetted installer network across the areas we serve.
                      Free site survey before any commitment.
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-fg/80">
                      <li>Tell us your appliance load (or use the calculator).</li>
                      <li>A local installer visits within 1–3 working days for a survey.</li>
                      <li>Most home installs are completed in 1–2 days.</li>
                      <li>12-month workmanship warranty on top of the manufacturer warranty.</li>
                    </ul>
                    <Link
                      href="/installation"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-800 hover:text-brand-700"
                    >
                      Request installation →
                    </Link>
                  </div>
                ),
              },
              {
                id: 'warranty',
                title: 'Warranty & returns',
                body: (
                  <div className="space-y-2 text-sm text-fg/85">
                    <p>
                      <span className="font-semibold text-fg">Manufacturer warranty:</span> Product
                      warranty is honoured locally — we handle the claim with the manufacturer or
                      replace the unit in-house.
                    </p>
                    <p>
                      <span className="font-semibold text-fg">Returns:</span> 7-day returns on
                      unopened, unused items in original packaging. Faulty items can be returned
                      within the warranty window.
                    </p>
                  </div>
                ),
              },
              {
                id: 'shipping',
                title: 'Shipping & delivery',
                body: (
                  <div className="space-y-2 text-sm text-fg/85">
                    <p>
                      <span className="font-semibold text-fg">Local delivery:</span> Same-day
                      delivery (order before 1pm Mon–Fri or 11am Sat). KSh 500 within town.
                    </p>
                    <p>
                      <span className="font-semibold text-fg">Courier:</span> Tracked courier
                      delivery — typically 1–3 working days. KSh 1,500 standard.
                    </p>
                    <p>
                      <span className="font-semibold text-fg">Pickup:</span> Free pickup at our
                      office (North Airport Rd, Embakasi) — usually ready within 2 hours
                      of ordering.
                    </p>
                  </div>
                ),
              },
              {
                id: 'faq',
                title: 'FAQs',
                body: (
                  <div className="space-y-3 text-sm text-fg/85">
                    <div>
                      <p className="font-semibold text-fg">Can I pay on delivery?</p>
                      <p className="text-fg/75">
                        Yes — choose Cash or Mobile money on delivery at checkout. Pay only when your
                        order arrives.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-fg">Do you install what I buy?</p>
                      <p className="text-fg/75">
                        Yes. Add &ldquo;Request installation&rdquo; at checkout and a vetted
                        local installer will reach out within one working day.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-fg">Is the warranty honoured locally?</p>
                      <p className="text-fg/75">
                        Yes — we handle warranty claims directly. You don&apos;t deal with
                        the overseas manufacturer.
                      </p>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-fg md:text-3xl">
              Related products
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={String(p.id)} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <StickyMobileBuyBar product={cartItem} />
      <WhatsAppFloat phone={waPhone} message={waMessage} />
    </>
  )
}

function TrustItem({
  Icon,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <li className="flex items-start gap-2 rounded-xl border border-border bg-white p-3">
      <Icon className="h-4 w-4 shrink-0 text-brand-700" />
      <span className="text-xs font-medium text-fg">{label}</span>
    </li>
  )
}

