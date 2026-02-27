'use client'

import type { CSSProperties } from 'react'
import type { RideAlong } from '@/src/lib/rideAlongs/client'

type RideAlongsListProps = {
  rideAlongs: RideAlong[]
  onSelect: (rideAlong: RideAlong) => void
  onRefresh: () => Promise<void>
  isLoading: boolean
}

export default function RideAlongsList({
  rideAlongs,
  onSelect,
  onRefresh,
  isLoading,
}: RideAlongsListProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            color: 'var(--color-text)',
          }}
        >
          Scheduled Ride Alongs
        </h2>
        <button
          type="button"
          onClick={() => {
            void onRefresh()
          }}
          style={refreshButtonStyle}
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div style={emptyStateStyle}>Loading scheduled ride alongs...</div>
      ) : null}

      {!isLoading && rideAlongs.length === 0 ? (
        <div style={emptyStateStyle}>
          No scheduled ride alongs are assigned to you right now.
        </div>
      ) : null}

      {!isLoading
        ? rideAlongs.map((rideAlong) => (
          <button
            key={rideAlong.id}
            type="button"
            onClick={() => onSelect(rideAlong)}
            style={cardStyle}
          >
            <div style={cardHeaderStyle}>
              <div style={nameStyle}>{rideAlong.name}</div>
              <span style={statusChipStyle}>SCHEDULED</span>
            </div>
            <div style={metaTextStyle}>
              {rideAlong.address || 'No address provided'}
            </div>
            <div style={metaTextStyle}>
              Tap to open ride along details
            </div>
          </button>
        ))
        : null}
    </div>
  )
}

const refreshButtonStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text)',
  fontSize: '12px',
  fontWeight: 600,
  padding: '8px 12px',
  cursor: 'pointer',
}

const emptyStateStyle: CSSProperties = {
  border: '1px dashed var(--color-border)',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  padding: '20px',
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  textAlign: 'center',
}

const cardStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  textAlign: 'left',
  padding: '14px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  boxShadow: '0 10px 20px rgba(36, 41, 101, 0.08)',
}

const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
}

const nameStyle: CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--color-text)',
}

const statusChipStyle: CSSProperties = {
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '10px',
  fontWeight: 700,
  color: '#ffffff',
  backgroundColor: 'var(--color-support-info)',
}

const metaTextStyle: CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-text-muted)',
}
