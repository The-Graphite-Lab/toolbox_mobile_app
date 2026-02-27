'use client'

import type { RideAlongSessionTurn } from '@/src/lib/rideAlongs/client'

type RideAlongTurnsFeedProps = {
  turns: RideAlongSessionTurn[]
  isLoading: boolean
}

export default function RideAlongTurnsFeed({ turns, isLoading }: RideAlongTurnsFeedProps) {
  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 600 }}>Transcript Turns</div>
      {isLoading ? (
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Loading turns...
        </div>
      ) : null}
      {!isLoading && turns.length === 0 ? (
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          No turns yet for this session.
        </div>
      ) : null}
      <div
        style={{
          maxHeight: '260px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {turns.map((turn) => (
          <div
            key={turn.id}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Turn #{turn.turnOrder} {turn.endOfTurn ? '(end)' : ''}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text)' }}>
              {turn.transcript || '[no transcript]'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Confidence: {turn.endOfTurnConfidence ?? 'n/a'} | Language: {turn.languageCode || 'n/a'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
