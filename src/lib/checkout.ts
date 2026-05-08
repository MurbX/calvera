export type DeliveryMethod = 'same_day_nairobi' | 'standard_countrywide' | 'pickup_nairobi'
export type PaymentMethod = 'mpesa_on_delivery' | 'cash_on_delivery'

export const DELIVERY_OPTIONS: {
  id: DeliveryMethod
  label: string
  hint: string
  fee: number
  eta: string
}[] = [
  {
    id: 'same_day_nairobi',
    label: 'Same-day Nairobi delivery',
    hint: 'Order before 1pm — we deliver today within Nairobi metro.',
    fee: 500,
    eta: 'Today',
  },
  {
    id: 'standard_countrywide',
    label: 'Standard countrywide delivery',
    hint: 'Tracked courier to anywhere in Kenya.',
    fee: 1500,
    eta: '1–3 working days',
  },
  {
    id: 'pickup_nairobi',
    label: 'Pickup at our Nairobi office',
    hint: 'Pick up free of charge during business hours.',
    fee: 0,
    eta: 'Ready in 2 hours',
  },
]

export const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; hint: string }[] = [
  {
    id: 'mpesa_on_delivery',
    label: 'M-Pesa on delivery',
    hint: 'Pay our rider via M-Pesa when your order arrives.',
  },
  {
    id: 'cash_on_delivery',
    label: 'Cash on delivery',
    hint: 'Pay in cash to our rider when your order arrives.',
  },
]

export function deliveryFee(method: DeliveryMethod): number {
  return DELIVERY_OPTIONS.find((o) => o.id === method)?.fee ?? 0
}
