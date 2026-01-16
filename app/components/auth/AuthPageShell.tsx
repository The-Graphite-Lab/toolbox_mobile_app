'use client'

import type { CSSProperties, ReactNode } from 'react'

type AuthPageShellProps = {
  children: ReactNode
}

export default function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div style={styles.page}>
      <div style={styles.logoWrap}>
        <img
          src="/images/TGL-ELI-ThumbsUp.svg"
          alt="Graphite Lab mascot"
          style={styles.logoImage}
        />
      </div>
      {children}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    width: '100vw',
    height: '100vh',
    display: 'grid',
    gridTemplateRows: '1fr auto',
    justifyItems: 'stretch',
    backgroundColor: 'var(--color-bg)',
    backgroundImage: 'url(/images/TGL-WavesDots.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    backgroundSize: 'auto 100vh',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 0',
  },
  logoImage: {
    width: 'auto',
    maxHeight: 'min(180px, 24vh)',
  },
}
