'use client'

import type { CSSProperties } from 'react'
import type { RideAlong } from '@/app/lib/rideAlongs/client'

type RideAlongsListProps = {
  rideAlongs: RideAlong[]
  onSelect: (rideAlong: RideAlong) => void
  onRefresh: () => Promise<void> | void
  isLoading: boolean
}

const parseLocation = (location: string): string => {
  try {
    const parsed = JSON.parse(location) as Record<string, unknown>
    if (typeof parsed.label === 'string' && parsed.label) return parsed.label
    if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
      return `${parsed.latitude.toFixed(4)}, ${parsed.longitude.toFixed(4)}`
    }
  } catch {
    // not JSON — use as-is
  }
  return location
}

const getRideAlongSubtitle = (rideAlong: RideAlong) => {
  if (rideAlong.location) return parseLocation(rideAlong.location)
  return rideAlong.address || 'Location details pending'
}

const getScheduledLabel = (isoDate: string | null | undefined) => {
  if (!isoDate) {
    return 'Scheduled'
  }

  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) {
    return 'Scheduled'
  }

  return `Scheduled ${parsed.toLocaleDateString()}`
}

export default function RideAlongsList({
  rideAlongs,
  onSelect,
  onRefresh,
  isLoading,
}: RideAlongsListProps) {
  return (
    <section style={sectionStyle} aria-label="Scheduled ride alongs">
      <header style={headerStyle}>
        <div style={headingGroupStyle}>
          <h2 style={headingStyle}>Ride Alongs</h2>
          <p style={subheadingStyle}>Select a job below to begin your ride along.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            void onRefresh()
          }}
          style={refreshButtonStyle}
          aria-label="Refresh ride along list"
        >
          <i className="fa-solid fa-rotate-right" aria-hidden="true" />
        </button>
      </header>

      {isLoading ? (
        <div style={emptyStateStyle}>Loading your jobs...</div>
      ) : null}

      {!isLoading && rideAlongs.length === 0 ? (
        <div style={emptyStateStyle}>
          No jobs are assigned to you right now. Check back soon or contact your supervisor.
        </div>
      ) : null}

      {!isLoading && rideAlongs.length > 0 ? (
        <div style={listStyle}>
          {rideAlongs.map((rideAlong) => (
            <button
              key={rideAlong.id}
              type="button"
              onClick={() => onSelect(rideAlong)}
              style={cardButtonStyle}
            >
              <div style={cardTopRowStyle}>
                <div style={cardTitleStyle}>{rideAlong.name}</div>
                <span style={statusChipStyle}>{getScheduledLabel(rideAlong.startedAt)}</span>
              </div>
              <div style={cardSubtitleStyle}>{getRideAlongSubtitle(rideAlong)}</div>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}

const sectionStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '10px',
}

const headingGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: '20px',
  color: 'var(--color-text)',
}

const subheadingStyle: CSSProperties = {
  margin: 0,
  fontSize: '12px',
  color: 'var(--color-text-muted)',
}

const refreshButtonStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  minWidth: '34px',
  height: '34px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const emptyStateStyle: CSSProperties = {
  border: '1px dashed var(--color-border)',
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.88)',
  color: 'var(--color-text-muted)',
  fontSize: '12px',
  padding: '12px',
}

const cardButtonStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '14px',
  backgroundColor: '#ffffff',
  textAlign: 'left',
  padding: '12px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
}

const cardTopRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
}

const cardTitleStyle: CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: 'var(--color-text)',
}

const statusChipStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.14)',
  borderRadius: '999px',
  padding: '4px 8px',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--color-brand-navy)',
  backgroundColor: 'rgba(130, 190, 232, 0.14)',
  whiteSpace: 'nowrap',
}

const cardSubtitleStyle: CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-text-muted)',
}
