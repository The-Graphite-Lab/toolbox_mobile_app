'use client'

import type { CSSProperties } from 'react'
import type { RideAlong } from '@/src/lib/rideAlongs/client'

type RideAlongDetailProps = {
  rideAlong: RideAlong
  isMonitoringEnabled: boolean
  isSessionActive: boolean
  onBack: () => void
  onStartRideAlong: () => Promise<void>
  onPauseRideAlong: () => Promise<void>
  onResumeRideAlong: () => Promise<void>
  onCompleteRideAlong: () => Promise<void>
  actionError: string | null
  isBusy: boolean
}

export default function RideAlongDetail({
  rideAlong,
  isMonitoringEnabled,
  isSessionActive,
  onBack,
  onStartRideAlong,
  onPauseRideAlong,
  onResumeRideAlong,
  onCompleteRideAlong,
  actionError,
  isBusy,
}: RideAlongDetailProps) {
  const isLive = rideAlong.status === 'LIVE'
  const isPaused = rideAlong.status === 'PAUSED'
  const isActiveRideAlong = isLive || isPaused
  const statusChipStyle = isLive
    ? liveChipStyle
    : isPaused
      ? pausedChipStyle
      : scheduledChipStyle
  const statusLabel = isLive ? 'LIVE' : isPaused ? 'PAUSED' : 'SCHEDULED'

  return (
    <div style={cardStyle}>
      <div style={topRowStyle}>
        <button type="button" onClick={onBack} style={backButtonStyle}>
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          Back
        </button>
        <span style={statusChipStyle}>{statusLabel}</span>
      </div>

      <h2 style={titleStyle}>{rideAlong.name}</h2>
      <div style={metaStyle}>Address: {rideAlong.address || 'No address provided'}</div>
      <div style={metaStyle}>Started: {rideAlong.startedAt || 'Not started yet'}</div>
      <div style={metaStyle}>Ended: {rideAlong.endedAt || 'Not completed'}</div>
      <div style={metaStyle}>
        Monitoring:{' '}
        {isPaused
          ? 'Paused (new sessions blocked)'
          : isMonitoringEnabled
            ? 'Listening for speech'
            : 'Not listening'}
      </div>
      <div style={metaStyle}>
        Current Session: {isSessionActive ? 'Active' : 'No active session'}
      </div>

      {actionError ? <div style={errorStyle}>{actionError}</div> : null}

      {!isActiveRideAlong ? (
        <button
          type="button"
          onClick={() => {
            void onStartRideAlong()
          }}
          disabled={isBusy}
          style={{
            ...primaryButtonStyle,
            opacity: isBusy ? 0.65 : 1,
          }}
        >
          {isBusy ? 'Starting...' : 'Start Ride Along'}
        </button>
      ) : null}

      {isLive ? (
        <button
          type="button"
          onClick={() => {
            void onPauseRideAlong()
          }}
          disabled={isBusy}
          style={{
            ...secondaryButtonStyle,
            opacity: isBusy ? 0.65 : 1,
          }}
        >
          {isBusy ? 'Pausing...' : 'Pause Ride Along'}
        </button>
      ) : null}

      {isPaused ? (
        <button
          type="button"
          onClick={() => {
            void onResumeRideAlong()
          }}
          disabled={isBusy}
          style={{
            ...primaryButtonStyle,
            opacity: isBusy ? 0.65 : 1,
          }}
        >
          {isBusy ? 'Resuming...' : 'Resume Ride Along'}
        </button>
      ) : null}

      {isActiveRideAlong ? (
        <button
          type="button"
          onClick={() => {
            void onCompleteRideAlong()
          }}
          disabled={isBusy}
          style={{
            ...dangerButtonStyle,
            opacity: isBusy ? 0.65 : 1,
          }}
        >
          {isBusy ? 'Completing...' : 'Complete Ride Along'}
        </button>
      ) : null}

      <div style={helperTextStyle}>
        While live, the app listens for speech and starts sessions automatically. Pausing keeps
        the ride along active, stops any active session, and blocks new sessions until resumed.
      </div>
    </div>
  )
}

const cardStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '20px',
  backgroundColor: '#ffffff',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  boxShadow: '0 14px 26px rgba(36, 41, 101, 0.08)',
}

const topRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '20px',
  color: 'var(--color-text)',
}

const metaStyle: CSSProperties = {
  fontSize: '13px',
  color: 'var(--color-text-muted)',
}

const helperTextStyle: CSSProperties = {
  marginTop: '6px',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
}

const errorStyle: CSSProperties = {
  borderRadius: '10px',
  border: '1px solid rgba(197, 24, 24, 0.28)',
  padding: '8px 10px',
  fontSize: '12px',
  color: 'var(--color-support-negative)',
  backgroundColor: 'rgba(197, 24, 24, 0.06)',
}

const backButtonStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text)',
  fontSize: '12px',
  fontWeight: 600,
  padding: '7px 12px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
}

const primaryButtonStyle: CSSProperties = {
  border: 'none',
  borderRadius: '999px',
  backgroundColor: 'var(--color-brand-marigold)',
  color: 'var(--color-neutral-graphite)',
  fontSize: '14px',
  fontWeight: 700,
  padding: '12px 14px',
  cursor: 'pointer',
}

const secondaryButtonStyle: CSSProperties = {
  border: '1px solid var(--color-brand-marigold)',
  borderRadius: '999px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text)',
  fontSize: '14px',
  fontWeight: 700,
  padding: '12px 14px',
  cursor: 'pointer',
}

const dangerButtonStyle: CSSProperties = {
  border: 'none',
  borderRadius: '999px',
  backgroundColor: 'var(--color-support-negative)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 700,
  padding: '12px 14px',
  cursor: 'pointer',
}

const scheduledChipStyle: CSSProperties = {
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '10px',
  fontWeight: 700,
  color: '#ffffff',
  backgroundColor: 'var(--color-support-info)',
}

const liveChipStyle: CSSProperties = {
  ...scheduledChipStyle,
  backgroundColor: 'var(--color-support-positive)',
}

const pausedChipStyle: CSSProperties = {
  ...scheduledChipStyle,
  color: 'var(--color-neutral-graphite)',
  backgroundColor: 'var(--color-brand-marigold)',
}
