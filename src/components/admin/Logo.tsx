'use client'

/**
 * Admin login-screen logo. Rendered by Payload's `admin.components.graphics.Logo`.
 * Plain <img> avoids dragging Next/Image RSC machinery into the admin bundle.
 */
export function Logo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/calvera-logo.png"
        alt="Calvera Tech Solutions"
        width={88}
        height={88}
        style={{ objectFit: 'contain' }}
      />
      <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            color: 'var(--theme-text)',
          }}
        >
          CALVERA
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.22em',
            color: 'var(--theme-elevation-500)',
          }}
        >
          TECH SOLUTIONS
        </div>
      </div>
    </div>
  )
}

export default Logo
