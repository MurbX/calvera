import type { CollectionConfig } from 'payload'

/**
 * Storefront customer accounts. Auth-enabled but cannot log into the admin panel.
 * - admin Users (`users` collection) → admin panel access
 * - Customers (`customers` collection) → storefront /account access only
 */
export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: {
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
    verify: false, // email verification skipped for v1; revisit before production
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = (args as { token?: string } | undefined)?.token ?? ''
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
        const url = `${base}/account/reset-password?token=${encodeURIComponent(token)}`
        return `
          <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
            <h2 style="margin:0 0 12px;color:#063f27">Reset your Calvera password</h2>
            <p style="line-height:1.5">We got a request to reset your password. Click the button below to set a new one. The link expires in 1 hour.</p>
            <p style="margin:24px 0">
              <a href="${url}" style="background:#063f27;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Set new password</a>
            </p>
            <p style="font-size:13px;color:#64748b;line-height:1.5">If the button doesn't work, paste this URL into your browser:<br/><span style="word-break:break-all">${url}</span></p>
            <p style="font-size:13px;color:#64748b">Didn't ask for this? You can safely ignore this email.</p>
          </div>
        `
      },
      generateEmailSubject: () => 'Reset your Calvera password',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'phone', 'createdAt'],
    description: 'Storefront customers. They cannot log into this admin.',
  },
  access: {
    // Block customers from logging into the admin panel
    admin: ({ req }) => req.user?.collection === 'users',
    // Anyone can create (= register)
    create: () => true,
    // Customers see only themselves; admins see all
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      if (req.user.collection === 'customers') {
        return { id: { equals: req.user.id } }
      }
      return false
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      if (req.user.collection === 'customers') {
        return { id: { equals: req.user.id } }
      }
      return false
    },
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    { name: 'firstName', type: 'text' },
    { name: 'lastName', type: 'text' },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description:
          'M-Pesa-capable Safaricom number. Format: 07XX XXX XXX or +254 7XX XXX XXX.',
      },
    },
    {
      name: 'addresses',
      type: 'array',
      labels: { singular: 'Address', plural: 'Addresses' },
      fields: [
        {
          name: 'label',
          type: 'text',
          admin: { description: 'Friendly label, e.g. "Home" or "Office"' },
        },
        { name: 'recipientName', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'line1', type: 'text', required: true },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'county', type: 'text' },
        { name: 'postalCode', type: 'text' },
        {
          name: 'landmark',
          type: 'text',
          admin: { description: 'e.g. "Opp. Naivas Embakasi"' },
        },
        { name: 'notes', type: 'textarea' },
        { name: 'isDefaultShipping', type: 'checkbox', defaultValue: false },
        { name: 'isDefaultBilling', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'marketingOptIn', type: 'checkbox', defaultValue: false },
  ],
}
