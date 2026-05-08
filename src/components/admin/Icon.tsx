'use client'

/**
 * Small admin nav icon (top-left corner). Rendered by Payload's
 * `admin.components.graphics.Icon`.
 */
export function Icon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/calvera-logo.png"
      alt="Calvera"
      width={28}
      height={28}
      style={{ objectFit: 'contain' }}
    />
  )
}

export default Icon
