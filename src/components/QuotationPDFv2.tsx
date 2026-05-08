/* eslint-disable jsx-a11y/alt-text */
import { Document, Image, Page, StyleSheet, Text, View, type DocumentProps } from '@react-pdf/renderer'

export type QuotationLineItem = {
  qty: number
  product: string
  description?: string
  unitPriceKes: number
  totalKes: number
}

export type QuotationProps = {
  quotationNumber: string
  date: string
  /** Optional logo source — data URI or absolute file path. */
  logoSrc?: string | null
  customer: {
    name: string
    phone: string
    email?: string
    address?: string
  }
  systemSummary: {
    panelWattsTotal: number
    inverterWatts: number
    batteryWh: number
    dailyEnergyWh: number
  }
  items: QuotationLineItem[]
  subtotalKes: number
  business: {
    phone: string
    email: string
    name: string
  }
  notes?: string[]
}

const C = {
  brand: '#063f27',
  brand50: '#e8f3e9',
  amber: '#fbbf24',
  fg: '#0f172a',
  muted: '#6b7280',
  border: '#e5e7eb',
  soft: '#f5f5f3',
}

const fmtKes = (n: number) =>
  `KES ${n.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: C.fg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottom: `1px solid ${C.border}`,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImage: { width: 44, height: 44, objectFit: 'contain' },
  logoFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: C.brand,
  },
  brandStack: { marginLeft: 4 },
  brandName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: C.brand,
    letterSpacing: 1,
  },
  brandTag: {
    fontSize: 7,
    color: C.muted,
    letterSpacing: 2,
    marginTop: 2,
  },
  quoteMeta: { textAlign: 'right' },
  metaTitle: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.brand },
  metaLine: { fontSize: 9, color: C.fg, marginTop: 2 },

  // body section
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  partyCol: { width: '48%' },
  partyHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: C.brand,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  partyLine: { fontSize: 9, color: C.fg, lineHeight: 1.45 },

  systemPill: {
    marginTop: 16,
    backgroundColor: C.brand50,
    padding: 10,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillItem: { width: '24%' },
  pillLabel: { fontSize: 7, color: C.muted, letterSpacing: 1.2, textTransform: 'uppercase' },
  pillValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: C.brand,
    marginTop: 2,
  },

  // table
  tableHeader: {
    marginTop: 20,
    flexDirection: 'row',
    backgroundColor: C.brand,
    color: '#fff',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  th: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  thQty: { width: '10%' },
  thProduct: { width: '50%' },
  thUnit: { width: '20%', textAlign: 'right' },
  thTotal: { width: '20%', textAlign: 'right' },

  tr: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottom: `0.5px solid ${C.border}`,
  },
  tdQty: { width: '10%', fontSize: 9 },
  tdProduct: { width: '50%', fontSize: 9 },
  tdProductName: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  tdProductDesc: { fontSize: 8, color: C.muted, marginTop: 2 },
  tdUnit: { width: '20%', textAlign: 'right', fontSize: 9 },
  tdTotal: { width: '20%', textAlign: 'right', fontSize: 9, fontFamily: 'Helvetica-Bold' },

  totalsBlock: { marginTop: 4, alignItems: 'flex-end', paddingHorizontal: 8 },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    paddingVertical: 4,
  },
  totalsRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    paddingVertical: 8,
    borderTop: `1px solid ${C.fg}`,
    marginTop: 4,
  },
  totalsLabel: { fontSize: 9, color: C.muted },
  totalsLabelFinal: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: C.fg },
  totalsValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  totalsValueFinal: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.brand },

  // terms
  termsHeading: {
    marginTop: 24,
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: C.brand,
  },
  termsBody: { fontSize: 9, color: C.fg, lineHeight: 1.5, marginTop: 6 },
  termsBullet: { fontSize: 9, color: C.fg, lineHeight: 1.5, marginTop: 2 },

  // signatures
  sigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  sigBlock: { width: '48%' },
  sigLine: { borderTop: `1px solid ${C.fg}`, marginTop: 32, paddingTop: 4 },
  sigLabel: { fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 },

  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7,
    color: C.muted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
})

export function QuotationPDFv2(props: QuotationProps): React.ReactElement<DocumentProps> {
  const {
    quotationNumber,
    date,
    logoSrc,
    customer,
    systemSummary,
    items,
    subtotalKes,
    business,
    notes,
  } = props

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.logoImage} />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoFallbackText}>C</Text>
              </View>
            )}
            <View style={styles.brandStack}>
              <Text style={styles.brandName}>CALVERA</Text>
              <Text style={styles.brandTag}>TECH SOLUTIONS</Text>
            </View>
          </View>
          <View style={styles.quoteMeta}>
            <Text style={styles.metaTitle}>Quotation</Text>
            <Text style={styles.metaLine}>No. {quotationNumber}</Text>
            <Text style={styles.metaLine}>Date {date}</Text>
            <Text style={styles.metaLine}>Solar System Quote</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesRow}>
          <View style={styles.partyCol}>
            <Text style={styles.partyHeading}>Quotation Note</Text>
            <Text style={styles.partyLine}>{customer.name}</Text>
            {customer.phone && <Text style={styles.partyLine}>{customer.phone}</Text>}
            {customer.email && <Text style={styles.partyLine}>{customer.email}</Text>}
            {customer.address && <Text style={styles.partyLine}>{customer.address}</Text>}
            <Text style={[styles.partyLine, { color: C.muted, marginTop: 6 }]}>
              Linked to Quote: {quotationNumber}
            </Text>
          </View>
          <View style={[styles.partyCol, { textAlign: 'right' }]}>
            <Text style={styles.partyHeading}>From</Text>
            <Text style={styles.partyLine}>{business.name}</Text>
            <Text style={styles.partyLine}>{business.phone}</Text>
            <Text style={styles.partyLine}>{business.email}</Text>
            <Text style={[styles.partyLine, { color: C.muted, marginTop: 6 }]}>
              Nairobi, Kenya
            </Text>
          </View>
        </View>

        {/* System summary pill */}
        <View style={styles.systemPill}>
          <View style={styles.pillItem}>
            <Text style={styles.pillLabel}>Solar Panels</Text>
            <Text style={styles.pillValue}>{systemSummary.panelWattsTotal}W</Text>
          </View>
          <View style={styles.pillItem}>
            <Text style={styles.pillLabel}>Inverter</Text>
            <Text style={styles.pillValue}>{systemSummary.inverterWatts}W</Text>
          </View>
          <View style={styles.pillItem}>
            <Text style={styles.pillLabel}>Battery</Text>
            <Text style={styles.pillValue}>
              {(systemSummary.batteryWh / 1000).toFixed(1)} kWh
            </Text>
          </View>
          <View style={styles.pillItem}>
            <Text style={styles.pillLabel}>Daily energy</Text>
            <Text style={styles.pillValue}>
              {(systemSummary.dailyEnergyWh / 1000).toFixed(2)} kWh
            </Text>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.thQty]}>Qty</Text>
          <Text style={[styles.th, styles.thProduct]}>Product</Text>
          <Text style={[styles.th, styles.thUnit]}>Unit Price</Text>
          <Text style={[styles.th, styles.thTotal]}>Total</Text>
        </View>
        {items.map((it, i) => (
          <View key={i} style={styles.tr}>
            <Text style={styles.tdQty}>{it.qty}</Text>
            <View style={styles.tdProduct}>
              <Text style={styles.tdProductName}>{it.product}</Text>
              {it.description && <Text style={styles.tdProductDesc}>{it.description}</Text>}
            </View>
            <Text style={styles.tdUnit}>{fmtKes(it.unitPriceKes)}</Text>
            <Text style={styles.tdTotal}>{fmtKes(it.totalKes)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalsRowFinal}>
            <Text style={styles.totalsLabelFinal}>Subtotal</Text>
            <Text style={styles.totalsValueFinal}>{fmtKes(subtotalKes)}</Text>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.termsHeading}>Terms</Text>
        <Text style={styles.termsBody}>
          This is an indicative quotation generated from your Power Audit. Final pricing is
          confirmed after a free site survey by a Calvera-vetted installer. Pricing is in Kenyan
          Shillings (KES) and excludes site-specific civil works.
        </Text>
        {notes && notes.length > 0 && (
          <View style={{ marginTop: 6 }}>
            {notes.map((n, i) => (
              <Text key={i} style={styles.termsBullet}>
                • {n}
              </Text>
            ))}
          </View>
        )}
        <Text style={[styles.termsBody, { marginTop: 10 }]}>
          Quotation valid for 30 days. Payment on delivery (M-Pesa or cash). Installation typically
          completes within 5–10 working days from confirmation. Manufacturer warranty applies on all
          components: panels (25 yrs), inverters (2–5 yrs), batteries (2–5 yrs).
        </Text>

        {/* Signatures */}
        <View style={styles.sigRow}>
          <View style={styles.sigBlock}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Calvera Tech Solutions</Text>
          </View>
          <View style={styles.sigBlock}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Customer Acceptance</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          {business.name}  ·  {business.phone}  ·  {business.email}
        </Text>
      </Page>
    </Document>
  )
}
