'use client'

import type { CSSProperties, ReactNode } from 'react'

type AuthCardProps = {
  heading: string
  subheading: string
  children: ReactNode
}

export default function AuthCard({ heading, subheading, children }: AuthCardProps) {
  return (
    <div style={styles.card}>
      <h1 style={styles.heading}>{heading}</h1>
      <p style={styles.subheading}>{subheading}</p>
      {children}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  card: {
    width: '100%',
    maxWidth: '100%',
    height: '70vh',
    maxHeight: '70vh',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '28px 24px 36px',
    boxShadow: '0 -12px 40px rgba(0, 0, 0, 0.18)',
    color: 'var(--color-text)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  heading: {
    fontSize: '22px',
    marginBottom: '8px',
  },
  subheading: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    marginBottom: '20px',
  },
}
