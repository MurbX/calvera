import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'source', 'status', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true, index: true },
    { name: 'email', type: 'email' },
    { name: 'message', type: 'textarea' },
    {
      name: 'address',
      type: 'text',
      admin: { description: 'Property / delivery address (Power Audit step 1).' },
    },
    {
      name: 'monthlyBill',
      type: 'select',
      admin: { description: 'Average monthly electricity bill (Kenya Power) — used to size the system.' },
      options: [
        { label: 'Under KES 2,000', value: 'under_2k' },
        { label: 'KES 2,000 – 5,000', value: '2k_5k' },
        { label: 'KES 5,000 – 10,000', value: '5k_10k' },
        { label: 'KES 10,000 – 20,000', value: '10k_20k' },
        { label: 'KES 20,000 – 50,000', value: '20k_50k' },
        { label: 'Over KES 50,000', value: 'over_50k' },
      ],
    },
    {
      name: 'rooftopType',
      type: 'select',
      admin: { description: 'Property roof type — affects mounting hardware.' },
      options: [
        { label: 'Concrete (flat)', value: 'concrete' },
        { label: 'Iron sheet (mabati)', value: 'iron_sheet' },
        { label: 'Tile', value: 'tile' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'contact_form',
      options: [
        { label: 'Contact Form', value: 'contact_form' },
        { label: 'Find Installer', value: 'find_installer' },
        { label: 'Calculator', value: 'calculator' },
        { label: 'Power Audit', value: 'power_audit' },
        { label: 'Newsletter', value: 'newsletter' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
      ],
    },
  ],
}
