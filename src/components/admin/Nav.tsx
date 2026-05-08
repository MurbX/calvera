import type { ServerProps } from 'payload'
import { NavClient } from './NavClient'

/**
 * Server-side Nav slot. Payload passes `visibleEntities` via ServerProps,
 * which we use to filter nav items by the user's collection-read access.
 *
 * Registered via `admin.components.Nav` in payload.config.ts.
 */
export const Nav: React.FC<ServerProps> = async (props) => {
  const visibleSlugs: string[] = props.visibleEntities?.collections ?? []
  return <NavClient visibleSlugs={visibleSlugs} />
}

export default Nav
