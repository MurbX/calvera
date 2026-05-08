import type { CollectionConfig } from 'payload'
import { inventoryHook } from './orders-hooks'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customer.name', 'total', 'status', 'paymentMethod', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [inventoryHook],
  },
  fields: [
    { name: 'orderNumber', type: 'text', required: true, unique: true, index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending Payment', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
      index: true,
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      defaultValue: 'mpesa_on_delivery',
      admin: { description: 'How the customer chose to pay on delivery' },
      options: [
        { label: 'M-Pesa on delivery', value: 'mpesa_on_delivery' },
        { label: 'Cash on delivery', value: 'cash_on_delivery' },
      ],
    },
    {
      name: 'deliveryMethod',
      type: 'select',
      required: true,
      defaultValue: 'standard_countrywide',
      options: [
        { label: 'Same-day Nairobi delivery', value: 'same_day_nairobi' },
        { label: 'Standard countrywide delivery', value: 'standard_countrywide' },
        { label: 'Pickup at Nairobi office', value: 'pickup_nairobi' },
      ],
    },
    {
      name: 'paymentRef',
      type: 'text',
      admin: { description: 'M-Pesa receipt or Stripe payment intent id' },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        { name: 'name', type: 'text', required: true, admin: { description: 'Snapshot of product name at order time' } },
        { name: 'unitPrice', type: 'number', required: true, min: 0 },
        { name: 'quantity', type: 'number', required: true, min: 1, defaultValue: 1 },
        { name: 'lineTotal', type: 'number', required: true, min: 0 },
      ],
    },
    { name: 'subtotal', type: 'number', required: true, min: 0 },
    { name: 'shipping', type: 'number', defaultValue: 0, min: 0 },
    { name: 'tax', type: 'number', defaultValue: 0, min: 0 },
    { name: 'total', type: 'number', required: true, min: 0 },
    {
      name: 'customer',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text', required: true },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'line1', type: 'text', required: true },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'county', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'notes', type: 'textarea' },
      ],
    },
  ],
}
