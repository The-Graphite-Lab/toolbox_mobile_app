'use client'

import type { CSSProperties } from 'react'
import type { RideAlong, RideAlongStatus } from '@/app/lib/rideAlongs/client'

type RideAlongActiveHeaderProps = {
  rideAlong: RideAlong
  isSessionActive: boolean
  totalDurationSeconds: number | null
  isDetailsOpen: boolean
  onOpenDetails: () => void
  onCloseDetails: () => void
  onBack: () => void
}

const statusLabelMap: Record<RideAlongStatus, string> = {
  SCHEDULED: 'Scheduled',
  LIVE: 'Live',
  PAUSED: 'Paused',
  ENDED: 'Completed',
}

const getStatusLabel = (status: RideAlongStatus | null | undefined) =>
  status ? statusLabelMap[status] : 'Scheduled'

const parseLocationPayload = (raw: string) => {
  let candidate: unknown = raw
  for (let index = 0; index < 6; index += 1) {
    if (typeof candidate !== 'string') {
      break
    }

    const trimmed = candidate.trim()
    if (!trimmed) {
      break
    }

    try {
      candidate = JSON.parse(trimmed)
      continue
    } catch {
      // Ignore and try normalized escaped payload once.
    }

    const normalizedEscaped = trimmed.replace(/\\"/g, '"')
    if (normalizedEscaped !== trimmed) {
      try {
        candidate = JSON.parse(normalizedEscaped)
        continue
      } catch {
        // Continue to final break below.
      }
    }

    if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 2) {
      const unwrapped = trimmed.slice(1, -1)
      const normalizedUnwrapped = unwrapped.replace(/\\"/g, '"')
      if (normalizedUnwrapped.includes('{') || normalizedUnwrapped.includes('[')) {
        try {
          candidate = JSON.parse(normalizedUnwrapped)
          continue
        } catch {
          // Continue to final break below.
        }
      }
    }

    break
  }

  return candidate
}

const getLocationDisplay = (rideAlong: RideAlong) => {
  const locationRaw = rideAlong.location
  if (typeof locationRaw !== 'string' || locationRaw.trim().length === 0) {
    return rideAlong.address || 'Location details pending'
  }

  const labelProbe = locationRaw.replace(/\\"/g, '"')
  const labelMatch = labelProbe.match(/"label"\s*:\s*"([^"]+)"/i)
  if (labelMatch && labelMatch[1]) {
    return labelMatch[1]
  }

  const parsed = parseLocationPayload(locationRaw)
  if (typeof parsed === 'string' && parsed.trim().length > 0) {
    return parsed
  }

  if (parsed && typeof parsed === 'object') {
    const locationRecord = parsed as Record<string, unknown>
    const label = locationRecord.label
    if (typeof label === 'string' && label.trim().length > 0) {
      return label
    }

    const latitude = locationRecord.latitude
    const longitude = locationRecord.longitude
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    }
  }

  return locationRaw
}

const parseDateValue = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return 'Not set'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString()
}

const formatCompactDateTime = (value: string | null | undefined) => {
  const parsed = parseDateValue(value)
  if (!parsed) {
    return 'Not set'
  }

  const datePart = parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
  const timePart = parsed.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return `${datePart}, ${timePart}`
}

const formatTotalDuration = (
  totalDurationSeconds: number | null,
  startedAt: string | null | undefined,
  endedAt: string | null | undefined
) => {
  if (
    typeof totalDurationSeconds === 'number' &&
    Number.isFinite(totalDurationSeconds) &&
    totalDurationSeconds > 0
  ) {
    const normalizedSeconds = Math.max(0, Math.round(totalDurationSeconds))
    const hours = Math.floor(normalizedSeconds / 3600)
    const minutes = Math.floor((normalizedSeconds % 3600) / 60)
    const seconds = normalizedSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const startedAtDate = parseDateValue(startedAt)
  if (!startedAtDate) {
    return 'Not started'
  }

  const endedAtDate = parseDateValue(endedAt) ?? new Date()
  const elapsedSeconds = Math.max(
    0,
    Math.floor((endedAtDate.getTime() - startedAtDate.getTime()) / 1000)
  )

  const hours = Math.floor(elapsedSeconds / 3600)
  const minutes = Math.floor((elapsedSeconds % 3600) / 60)
  const seconds = elapsedSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

export default function RideAlongActiveHeader({
  rideAlong,
  isSessionActive,
  totalDurationSeconds,
  isDetailsOpen,
  onOpenDetails,
  onCloseDetails,
  onBack,
}: RideAlongActiveHeaderProps) {
  const summaryLocation = getLocationDisplay(rideAlong)
  const totalDuration = formatTotalDuration(
    totalDurationSeconds,
    rideAlong.startedAt,
    rideAlong.endedAt
  )
  const startedLabel = formatCompactDateTime(rideAlong.startedAt)
  const updatedLabel = formatCompactDateTime(rideAlong.updatedAt)

  return (
    <>
      <div style={topSectionStyle}>
        <div style={toolbarStyle}>
          <button
            type="button"
            onClick={onBack}
            style={toolbarIconButtonStyle}
            aria-label="Back to ride along list"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onOpenDetails}
            style={toolbarIconButtonStyle}
            aria-label="Open ride along details"
          >
            <i className="fa-solid fa-sliders" aria-hidden="true" />
          </button>
        </div>

        <div style={summaryCardStyle}>
          <div style={headingGroupStyle}>
            <h2 style={titleStyle}>{rideAlong.name}</h2>
            <p style={subtitleStyle}>{summaryLocation}</p>
            <p style={statusTextStyle}>
              {getStatusLabel(rideAlong.status)}
              {' \u00b7 '}
              {isSessionActive ? 'Recording speech' : 'Ready for speech'}
            </p>

            <div style={statsGridStyle}>
              <div style={statItemStyle}>
                <span style={statLabelStyle}>Total Duration</span>
                <span style={statValueStyle}>{totalDuration}</span>
              </div>
              <div style={statItemStyle}>
                <span style={statLabelStyle}>Started</span>
                <span style={statValueStyle}>{startedLabel}</span>
              </div>
              <div style={statItemStyle}>
                <span style={statLabelStyle}>Updated</span>
                <span style={statValueStyle}>{updatedLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDetailsOpen ? (
        <button
          type="button"
          onClick={onCloseDetails}
          style={flyoutBackdropStyle}
          aria-label="Close ride along details"
        />
      ) : null}

      <aside
        aria-hidden={!isDetailsOpen}
        style={{
          ...detailsFlyoutStyle,
          transform: isDetailsOpen ? 'translateX(0)' : 'translateX(102%)',
          pointerEvents: isDetailsOpen ? 'auto' : 'none',
        }}
      >
        <div style={flyoutHeaderStyle}>
          <h3 style={flyoutTitleStyle}>Ride Along Details</h3>
          <button
            type="button"
            onClick={onCloseDetails}
            style={iconButtonStyle}
            aria-label="Close details panel"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div style={detailsListStyle}>
          <div style={detailRowStyle}>
            <div style={detailLabelStyle}>Ride Along</div>
            <div style={detailValueStyle}>{rideAlong.name}</div>
          </div>
          <div style={detailRowStyle}>
            <div style={detailLabelStyle}>Status</div>
            <div style={detailValueStyle}>{getStatusLabel(rideAlong.status)}</div>
          </div>
          <div style={detailRowStyle}>
            <div style={detailLabelStyle}>Address</div>
            <div style={detailValueStyle}>{rideAlong.address || 'Not set'}</div>
          </div>
          <div style={detailRowStyle}>
            <div style={detailLabelStyle}>Location</div>
            <div style={detailValueStyle}>{rideAlong.location || 'Not set'}</div>
          </div>
          <div style={detailRowStyle}>
            <div style={detailLabelStyle}>Started</div>
            <div style={detailValueStyle}>{formatDateTime(rideAlong.startedAt)}</div>
          </div>
          <div style={detailRowStyle}>
            <div style={detailLabelStyle}>Ended</div>
            <div style={detailValueStyle}>{formatDateTime(rideAlong.endedAt)}</div>
          </div>
          <div style={detailRowStyle}>
            <div style={detailLabelStyle}>Updated</div>
            <div style={detailValueStyle}>{formatDateTime(rideAlong.updatedAt)}</div>
          </div>
        </div>
      </aside>
    </>
  )
}

const topSectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const toolbarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  margin: '-8px -12px 0',
  border: '1px solid rgba(58, 59, 56, 0.92)',
  borderRadius: '0',
  backgroundColor: 'var(--color-neutral-graphite)',
  padding: '8px 10px',
}

const summaryCardStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '14px',
  backgroundColor: 'var(--color-neutral-alabaster)',
  padding: '10px 12px',
}

const toolbarIconButtonStyle: CSSProperties = {
  border: '1px solid rgba(255, 255, 255, 0.46)',
  borderRadius: '999px',
  minWidth: '38px',
  height: '38px',
  backgroundColor: 'transparent',
  color: 'var(--color-neutral-alabaster)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '14px',
}

const iconButtonStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  minWidth: '38px',
  height: '38px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text-muted)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '14px',
}

const headingGroupStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '21px',
  color: 'var(--color-text)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const subtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '15px',
  color: 'rgba(58, 59, 56, 0.78)',
  lineHeight: 1.35,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const statusTextStyle: CSSProperties = {
  margin: 0,
  fontSize: '12px',
  color: 'rgba(58, 59, 56, 0.72)',
  fontWeight: 600,
}

const statsGridStyle: CSSProperties = {
  marginTop: '6px',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '7px',
}

const statItemStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  backgroundColor: '#ffffff',
  padding: '7px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
}

const statLabelStyle: CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--color-text-muted)',
  letterSpacing: 0.2,
  textTransform: 'uppercase',
}

const statValueStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const flyoutBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  border: 'none',
  margin: 0,
  padding: 0,
  background: 'rgba(36, 41, 101, 0.22)',
  zIndex: 21,
}

const detailsFlyoutStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: 'min(340px, 100%)',
  borderLeft: '1px solid rgba(36, 41, 101, 0.12)',
  borderRadius: '22px 0 0 22px',
  backgroundColor: '#ffffff',
  boxShadow: '-12px 0 30px rgba(36, 41, 101, 0.16)',
  zIndex: 22,
  transition: 'transform 180ms ease-out',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding:
    'max(env(safe-area-inset-top, 0px), 14px) 14px max(env(safe-area-inset-bottom, 0px), 14px)',
}

const flyoutHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
}

const flyoutTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '17px',
  color: 'var(--color-text)',
}

const detailsListStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const detailRowStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
}

const detailLabelStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--color-text-muted)',
  letterSpacing: 0.2,
  textTransform: 'uppercase',
}

const detailValueStyle: CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-text)',
  lineHeight: 1.35,
  wordBreak: 'break-word',
}

