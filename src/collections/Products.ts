import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sku', 'price', 'stock', 'productType', 'isPublished'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { isPublished: { equals: true } }
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'URL-safe identifier' },
    },
    { name: 'sku', type: 'text', unique: true, index: true },
    {
      name: 'productType',
      type: 'select',
      required: true,
      defaultValue: 'panel',
      options: [
        { label: 'Solar Panel', value: 'panel' },
        { label: 'Inverter', value: 'inverter' },
        { label: 'Battery', value: 'battery' },
        { label: 'Charge Controller', value: 'charge_controller' },
        { label: 'Mounting / Cable / Accessory', value: 'accessory' },
        { label: 'Kit / Bundle', value: 'kit' },
        { label: 'Service / Installation', value: 'service' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
    { name: 'brand', type: 'relationship', relationTo: 'brands' },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'Price in KES' },
    },
    { name: 'compareAtPrice', type: 'number', min: 0, admin: { description: 'Original price (for showing a discount)' } },
    {
      name: 'stock',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: {
        description:
          'Units in stock. Auto-decrements when an order is placed (and re-adds if the order is cancelled or refunded), unless "Track inventory" is off.',
      },
    },
    {
      name: 'trackInventory',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Off for items assembled-to-order or sourced on request — they will never auto-go-out-of-stock from sales.',
      },
    },
    { name: 'isPublished', type: 'checkbox', defaultValue: false, index: true },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false },
    { name: 'shortDescription', type: 'textarea' },
    { name: 'description', type: 'richText' },
    {
      name: 'images',
      type: 'array',
      labels: { singular: 'Image', plural: 'Images' },
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: {
        description: 'External image URL (used during migration / seed). Upload proper images to this product when ready.',
      },
    },
    {
      name: 'rating',
      type: 'number',
      defaultValue: 5,
      min: 0,
      max: 5,
      index: true,
    },
    {
      name: 'powerWatts',
      type: 'number',
      min: 0,
      index: true,
      admin: {
        description:
          'Continuous output watts. Used for the Power Capacity filter. Inverters use kVA→W (1kVA ≈ 1000W). Leave blank for items where wattage doesn\'t apply (batteries, heaters, pumps).',
      },
    },
    {
      name: 'reviews',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'badges',
      type: 'array',
      labels: { singular: 'Badge', plural: 'Badges' },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'specs',
      type: 'array',
      labels: { singular: 'Specification', plural: 'Specifications' },
      admin: { description: 'Key/value spec rows shown on the product page' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    {
      name: 'panelDetails',
      type: 'group',
      admin: { condition: (data) => data?.productType === 'panel' },
      fields: [
        { name: 'wattage', type: 'number', admin: { description: 'Output watts (W)' } },
        { name: 'efficiency', type: 'number', admin: { description: 'Efficiency %' } },
        { name: 'cellType', type: 'select', options: ['Monocrystalline', 'Polycrystalline', 'Thin Film'].map(v => ({ label: v, value: v })) },
      ],
    },
    {
      name: 'inverterDetails',
      type: 'group',
      admin: { condition: (data) => data?.productType === 'inverter' },
      fields: [
        { name: 'capacityW', type: 'number', admin: { description: 'Continuous output watts (W)' } },
        { name: 'inverterType', type: 'select', options: ['Off-grid', 'Hybrid', 'Grid-tie'].map(v => ({ label: v, value: v })) },
        { name: 'voltage', type: 'text' },
      ],
    },
    {
      name: 'batteryDetails',
      type: 'group',
      admin: { condition: (data) => data?.productType === 'battery' },
      fields: [
        { name: 'capacityWh', type: 'number', admin: { description: 'Capacity in Wh' } },
        { name: 'voltage', type: 'number', admin: { description: 'Nominal voltage (V)' } },
        { name: 'chemistry', type: 'select', options: ['Lithium (LiFePO4)', 'Lithium (NMC)', 'AGM', 'Gel', 'Lead-acid'].map(v => ({ label: v, value: v })) },
      ],
    },
    {
      name: 'kitContents',
      type: 'array',
      admin: {
        condition: (data) => data?.productType === 'kit',
        description: 'Components included in this kit',
      },
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products' },
        { name: 'quantity', type: 'number', defaultValue: 1, min: 1 },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
      ],
    },
  ],
}
