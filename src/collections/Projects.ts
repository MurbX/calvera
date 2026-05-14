import type { CollectionConfig } from 'payload'

/** URL-safe slug from arbitrary text. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Completed installations shown on the public /projects page.
 *
 * The client manages this entirely from the admin panel — add a project,
 * upload a photo, set the category/location, tick "Published" and it appears
 * on the site. No code changes needed for new projects.
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'location', 'completedOn', 'isPublished'],
    description: 'Completed installations shown on the public Projects page.',
  },
  access: {
    // Public sees published projects only; logged-in admins see everything.
    read: ({ req }) => {
      if (req.user) return true
      return { isPublished: { equals: true } }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "20 kW Solar System Installed in Ruiru"' },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL-safe identifier — leave blank to auto-generate from the title.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            value || (data?.title ? slugify(String(data.title)) : value),
        ],
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'solar_power',
      options: [
        { label: 'Solar power system', value: 'solar_power' },
        { label: 'Solar water heater', value: 'water_heater' },
        { label: 'Solar flood lights', value: 'flood_light' },
        { label: 'Solar water pump', value: 'water_pump' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'location',
      type: 'text',
      admin: { description: 'e.g. "Ruiru, Kiambu County"' },
    },
    {
      name: 'capacity',
      type: 'text',
      admin: { description: 'Headline spec, e.g. "20 kW", "300 L", "10 fixtures"' },
    },
    {
      name: 'completedOn',
      type: 'date',
      admin: {
        description: 'When the project was completed.',
        date: { pickerAppearance: 'monthOnly', displayFormat: 'MMMM yyyy' },
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: { description: 'Short story / description shown on the project card.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main project photo. Upload here, or paste an Image URL below.',
      },
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: {
        description: 'Optional fallback — used only when no photo is uploaded above.',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Highlight this project at the top of the Projects page.',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Show this project on the public Projects page.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first.',
      },
    },
  ],
}
