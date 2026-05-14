/**
 * Seed data for the Projects collection — the 9 installations carried over
 * from the previous Calvera website. Run the seed route once to load them;
 * after that the client manages everything from the Payload admin.
 *
 * Images live in /public/portfolio and are referenced via `imageUrl`. New
 * projects added in the admin should use the `image` upload field instead.
 */

export type ProjectSeedCategory =
  | 'solar_power'
  | 'water_heater'
  | 'flood_light'
  | 'water_pump'
  | 'other'

export type ProjectSeed = {
  slug: string
  title: string
  category: ProjectSeedCategory
  location: string
  capacity: string
  summary: string
  imageUrl: string
  isFeatured?: boolean
  order: number
}

export const PROJECTS: ProjectSeed[] = [
  {
    slug: 'masai-mara-250kw-solar-system',
    title: '250 kW Solar Power System — Maasai Mara',
    category: 'solar_power',
    location: 'Maasai Mara, Narok County',
    capacity: '250 kW',
    summary:
      'A 250 kW commercial solar power system installed on a lodge in the Maasai Mara. The full rooftop array keeps the property running reliably, far from the grid.',
    imageUrl: '/portfolio/masai-mara-250kw.webp',
    isFeatured: true,
    order: 0,
  },
  {
    slug: 'ruiru-20kw-solar-system',
    title: '20 kW Solar System — Ruiru',
    category: 'solar_power',
    location: 'Ruiru, Kiambu County',
    capacity: '20 kW',
    summary:
      'A 20 kW solar installation in Ruiru, built around a hybrid inverter and lithium battery bank — neatly wall-mounted for a clean, easily serviced setup.',
    imageUrl: '/portfolio/ruiru-20kw.jpeg',
    order: 1,
  },
  {
    slug: 'kamulu-300l-solar-water-heater',
    title: '300 L Solar Water Heater — Kamulu',
    category: 'water_heater',
    location: 'Kamulu, Machakos County',
    capacity: '300 L',
    summary:
      'A 300 L evacuated-tube solar water heater installed in Kamulu — plenty of hot water for a busy household, heated entirely by the sun.',
    imageUrl: '/portfolio/kamulu-water-heater.webp',
    order: 2,
  },
  {
    slug: 'isinya-10-solar-flood-lights',
    title: '10 Solar Flood Lights — Isinya',
    category: 'flood_light',
    location: 'Isinya, Kajiado County',
    capacity: '10 fixtures',
    summary:
      'Ten all-in-one solar flood lights supplied and installed in Isinya — dusk-to-dawn security and yard lighting with zero running cost.',
    imageUrl: '/portfolio/isinya-flood-lights.webp',
    order: 3,
  },
  {
    slug: 'thika-5kw-solar-power',
    title: '5 kW Solar Power System — Thika',
    category: 'solar_power',
    location: 'Thika, Kiambu County',
    capacity: '5 kW',
    summary:
      'A 5 kW rooftop solar system installed for a home in Thika — quietly cutting the power bill from the first day of sun.',
    imageUrl: '/portfolio/thika-5kw.webp',
    order: 4,
  },
  {
    slug: 'kisumu-500w-flood-light-mast',
    title: '3 × 500 W Solar Flood Light Mast — Kisumu',
    category: 'flood_light',
    location: 'Kisumu, Kisumu County',
    capacity: '3 × 500 W mast',
    summary:
      'A high-mast lighting tower fitted with three 500 W solar flood lights in Kisumu — wide-area illumination for a commercial yard.',
    imageUrl: '/portfolio/kisumu-flood-light-mast.webp',
    order: 5,
  },
  {
    slug: 'mbiuni-10kw-solar-system',
    title: '10 kW Solar System — Mbiuni',
    category: 'solar_power',
    location: 'Mbiuni, Machakos County',
    capacity: '10 kW',
    summary:
      'A 10 kW home solar system in Mbiuni — rooftop panels paired with a hybrid inverter and battery storage for dependable power day and night.',
    imageUrl: '/portfolio/mbiuni-10kw.webp',
    order: 6,
  },
  {
    slug: 'masai-mara-solar-submersible-pump',
    title: 'Solar Submersible Water Pump — Maasai Mara',
    category: 'water_pump',
    location: 'Maasai Mara, Narok County',
    capacity: 'Solar borehole pump',
    summary:
      'A solar-powered submersible pump installed in the Maasai Mara, driven by a dedicated ground-mounted array — drawing water with no fuel and no grid.',
    imageUrl: '/portfolio/masai-mara-water-pump.webp',
    order: 7,
  },
  {
    slug: 'narok-192-solar-panels',
    title: '192 Solar Panels Staged for Installation — Narok',
    category: 'solar_power',
    location: 'Narok, Narok County',
    capacity: '192 panels',
    summary:
      '192 solar panels staged on site in Narok ahead of a large-scale installation — one of our biggest deployments to date.',
    imageUrl: '/portfolio/narok-192-panels.webp',
    isFeatured: true,
    order: 8,
  },
]
