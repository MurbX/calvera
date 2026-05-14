import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'

let cachedLogo: string | null = null

/** Load the Calvera logo as a base64 data URI for @react-pdf/renderer. */
export async function loadLogoDataUri(): Promise<string | null> {
  if (cachedLogo !== null) return cachedLogo
  try {
    const file = path.resolve(process.cwd(), 'public/brand/calvera-logo.png')
    const buf = await fs.readFile(file)
    cachedLogo = `data:image/png;base64,${buf.toString('base64')}`
    return cachedLogo
  } catch (err) {
    console.warn('[logo] could not load logo:', err)
    return null
  }
}
