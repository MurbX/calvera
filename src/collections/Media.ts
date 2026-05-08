import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 320, height: 320, position: 'centre' },
      { name: 'card', width: 640, height: 480, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
    ],
    formatOptions: { format: 'webp', options: { quality: 80 } },
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
  ],
}
