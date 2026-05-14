import type { CollectionConfig, CollectionBeforeValidateHook } from 'payload'

function generateQuotationNumber(): string {
  const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `CTS-${yyyymmdd}-${rand}`
}

const computeFields: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data

  // Auto-generate quotation number on first save
  if (!data.quotationNumber) {
    data.quotationNumber = generateQuotationNumber()
  }

  // Compute line item totals and subtotal
  if (Array.isArray(data.items)) {
    let subtotal = 0
    for (const item of data.items) {
      const qty = Number(item.qty) || 1
      const unit = Number(item.unitPriceKes) || 0
      item.totalKes = qty * unit
      subtotal += item.totalKes
    }
    data.subtotalKes = subtotal
  }

  return data
}

export const ManualQuotes: CollectionConfig = {
  slug: 'manual-quotes',
  labels: { singular: 'Manual Quote', plural: 'Manual Quotes' },
  admin: {
    useAsTitle: 'quotationNumber',
    defaultColumns: [
      'quotationNumber',
      'customer.name',
      'quoteKind',
      'subtotalKes',
      'status',
      'createdAt',
    ],
    description:
      'Manually created quotations. Fill in customer details and line items, then download the branded PDF.',
    group: 'Workflow',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [computeFields],
  },
  fields: [
    // ── UI-only: Download PDF button ─────────────────────────────────
    {
      name: 'downloadPdf',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/DownloadQuotePDF.tsx#DownloadQuotePDF',
        },
      },
    },

    // ── Quote metadata ───────────────────────────────────────────────
    {
      name: 'quotationNumber',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Auto-generated on first save if left empty.',
        placeholder: 'CTS-20260514-AB12C',
      },
    },
    {
      name: 'quoteKind',
      type: 'text',
      label: 'Quote Type',
      admin: {
        description: 'Shown under the quotation header, e.g. "Solar System Quote".',
        placeholder: 'Solar System Quote',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },

    // ── Customer ─────────────────────────────────────────────────────
    {
      name: 'customer',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'address', type: 'text' },
      ],
    },

    // ── System summary stats (optional, shown in PDF pill) ───────────
    {
      name: 'systemSummary',
      type: 'array',
      label: 'Summary Stats',
      labels: { singular: 'Stat', plural: 'Stats' },
      admin: {
        description:
          'Up to 4 headline stats shown in the green pill on the PDF (e.g. "Panels" → "2000W").',
      },
      maxRows: 4,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },

    // ── Line items ───────────────────────────────────────────────────
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Line Item', plural: 'Line Items' },
      fields: [
        { name: 'qty', type: 'number', required: true, min: 1, defaultValue: 1 },
        {
          name: 'product',
          type: 'text',
          required: true,
          admin: { placeholder: 'e.g. 450W Mono Solar Panel' },
        },
        { name: 'description', type: 'textarea' },
        {
          name: 'unitPriceKes',
          type: 'number',
          required: true,
          min: 0,
          label: 'Unit Price (KES)',
        },
        {
          name: 'totalKes',
          type: 'number',
          label: 'Line Total (KES)',
          admin: {
            readOnly: true,
            description: 'Auto-computed: qty × unit price.',
          },
        },
      ],
    },

    // ── Subtotal ─────────────────────────────────────────────────────
    {
      name: 'subtotalKes',
      type: 'number',
      label: 'Subtotal (KES)',
      admin: {
        readOnly: true,
        description: 'Auto-computed from line items.',
        position: 'sidebar',
      },
    },

    // ── Notes ────────────────────────────────────────────────────────
    {
      name: 'notes',
      type: 'array',
      labels: { singular: 'Note', plural: 'Notes' },
      admin: { description: 'Extra notes printed as bullet points on the PDF.' },
      fields: [{ name: 'note', type: 'text', required: true }],
    },
  ],
}
