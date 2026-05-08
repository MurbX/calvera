/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ApplianceInput, Recommendation } from '@/lib/calculator'

type Props = {
  quotationNumber: string
  date: string
  customer: { name: string; phone: string; email?: string; location?: string }
  appliances: ApplianceInput[]
  recommendation: Recommendation
  business: { phone: string; email: string }
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
  quoteMeta: {
    textAlign: 'right',
    fontSize: 9,
    color: C.muted,
  },
  quoteNumber: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: C.fg,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    marginTop: 24,
    color: C.fg,
  },
  subtitle: {
    fontSize: 10,
    color: C.muted,
    marginTop: 4,
  },
  twoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    marginTop: 20,
  },
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 6,
    backgroundColor: C.soft,
  },
  cardTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  customerName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: C.fg,
  },
  customerLine: {
    fontSize: 9,
    color: C.muted,
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: C.fg,
  },
  table: {
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: C.soft,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTop: `1px solid ${C.border}`,
  },
  th: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  td: {
    fontSize: 10,
    color: C.fg,
  },
  colName: { flex: 2 },
  colNum: { flex: 1, textAlign: 'right' },
  recBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 6,
    backgroundColor: C.brand,
    color: 'white',
  },
  recTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: 'white',
  },
  recRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    fontSize: 10,
  },
  recLabel: { color: '#cbd5d5' },
  recValue: { fontFamily: 'Helvetica-Bold', color: 'white' },
  priceRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: '1px solid rgba(255,255,255,0.18)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: 9,
    color: '#cbd5d5',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: C.amber,
  },
  notes: {
    marginTop: 18,
    padding: 12,
    backgroundColor: C.soft,
    borderRadius: 6,
  },
  noteItem: {
    fontSize: 9,
    color: C.muted,
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 12,
    borderTop: `1px solid ${C.border}`,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: C.muted,
  },
})

export function QuotationPDF({
  quotationNumber,
  date,
  customer,
  appliances,
  recommendation,
  business,
}: Props) {
  const formatKes = (n: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(n)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>CALVERA</Text>
            <Text style={styles.brandTag}>TECH SOLUTIONS</Text>
          </View>
          <View style={styles.quoteMeta}>
            <Text style={styles.quoteNumber}>{quotationNumber}</Text>
            <Text>{date}</Text>
          </View>
        </View>

        <Text style={styles.title}>Solar System Quotation</Text>
        <Text style={styles.subtitle}>
          Sized for the appliances you listed in our calculator.
        </Text>

        <View style={styles.twoCol}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer</Text>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerLine}>{customer.phone}</Text>
            {customer.email && <Text style={styles.customerLine}>{customer.email}</Text>}
            {customer.location && <Text style={styles.customerLine}>{customer.location}</Text>}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Prepared by</Text>
            <Text style={styles.customerName}>Calvera Tech Solutions</Text>
            <Text style={styles.customerLine}>{business.phone}</Text>
            <Text style={styles.customerLine}>{business.email}</Text>
            <Text style={styles.customerLine}>Nairobi, Kenya</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your appliance load</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colName]}>Appliance</Text>
            <Text style={[styles.th, styles.colNum]}>Watts</Text>
            <Text style={[styles.th, styles.colNum]}>Qty</Text>
            <Text style={[styles.th, styles.colNum]}>Hrs/day</Text>
            <Text style={[styles.th, styles.colNum]}>Wh/day</Text>
          </View>
          {appliances.map((a, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.td, styles.colName]}>{a.name}</Text>
              <Text style={[styles.td, styles.colNum]}>{a.wattage}</Text>
              <Text style={[styles.td, styles.colNum]}>{a.quantity}</Text>
              <Text style={[styles.td, styles.colNum]}>{a.hoursPerDay}</Text>
              <Text style={[styles.td, styles.colNum]}>
                {a.wattage * a.quantity * a.hoursPerDay}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.recBox}>
          <Text style={styles.recTitle}>
            Recommended {(recommendation.panelWattsTotal / 1000).toFixed(1)}kW Solar System
          </Text>
          <View style={styles.recRow}>
            <Text style={styles.recLabel}>Total connected load</Text>
            <Text style={styles.recValue}>{recommendation.totalConnectedWatts} W</Text>
          </View>
          <View style={styles.recRow}>
            <Text style={styles.recLabel}>Daily energy use</Text>
            <Text style={styles.recValue}>{recommendation.dailyEnergyWh} Wh</Text>
          </View>
          <View style={styles.recRow}>
            <Text style={styles.recLabel}>Solar panels</Text>
            <Text style={styles.recValue}>{recommendation.panelWattsTotal} W</Text>
          </View>
          <View style={styles.recRow}>
            <Text style={styles.recLabel}>Inverter</Text>
            <Text style={styles.recValue}>{recommendation.inverterWatts} W</Text>
          </View>
          <View style={styles.recRow}>
            <Text style={styles.recLabel}>Battery storage</Text>
            <Text style={styles.recValue}>{recommendation.batteryWh} Wh</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Estimated price (incl. install)</Text>
            <Text style={styles.priceValue}>{formatKes(recommendation.estimatedPriceKes)}</Text>
          </View>
        </View>

        <View style={styles.notes}>
          <Text style={[styles.cardTitle, { marginBottom: 6 }]}>How we sized this</Text>
          {recommendation.notes.map((n) => (
            <Text key={n} style={styles.noteItem}>
              • {n}
            </Text>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text>Calvera Tech Solutions • Nairobi, Kenya</Text>
          <Text>{business.phone} • {business.email}</Text>
        </View>
      </Page>
    </Document>
  )
}
