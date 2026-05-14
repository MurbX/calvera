import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
    description:
      'Business contact details and API keys. Changes take effect on the next page load.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [
      async () => {
        // Bust the in-process settings cache so the new values are picked up
        // immediately (important in long-lived dev server).
        const { invalidateSettingsCache } = await import('../lib/site-settings')
        invalidateSettingsCache()
      },
    ],
  },
  fields: [
    {
      name: 'whatsappPhone',
      type: 'text',
      label: 'WhatsApp Phone Number',
      admin: {
        description:
          'International format, e.g. +254 723 284 994. Used on checkout, product pages, and WhatsApp order messages.',
        placeholder: '+254 723 284 994',
      },
    },
    {
      name: 'businessEmail',
      type: 'email',
      label: 'Business Email',
      admin: {
        description:
          'Displayed in the site footer, contact page, and PDF quotations.',
        placeholder: 'calveratechsolutions@gmail.com',
      },
    },
    {
      name: 'geminiApiKey',
      type: 'text',
      label: 'Gemini API Key',
      admin: {
        description:
          'Google AI Studio API key for the power audit AI chat. Leave empty to use the server environment variable.',
        components: {
          Field: '/components/admin/SecretField.tsx#SecretField',
        },
      },
    },
  ],
}
