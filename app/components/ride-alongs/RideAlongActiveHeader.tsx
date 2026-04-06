'use client'

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
      <div className="-mx-3 md:-mx-5 -mt-2 bg-neutral-graphite rounded-b-2xl px-3 md:px-5 pt-2 pb-[14px] md:pb-5 text-neutral-alabaster">
        <div className="flex items-center justify-between mb-2.5">
          <button
            type="button"
            onClick={onBack}
            className="border border-white/[0.46] rounded-full min-w-[38px] md:min-w-[46px] h-[38px] md:h-[46px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer text-[14px]"
            aria-label="Back to ride along list"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onOpenDetails}
            className="border border-white/[0.46] rounded-full min-w-[38px] md:min-w-[46px] h-[38px] md:h-[46px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer text-[14px]"
            aria-label="Open ride along details"
          >
            <i className="fa-solid fa-sliders" aria-hidden="true" />
          </button>
        </div>

        <h2 className="m-0 text-[18px] md:text-[22px] truncate">{rideAlong.name}</h2>
        <p className="m-0 text-[13px] md:text-[16px] text-white/[0.72] mt-[2px] truncate">{summaryLocation}</p>
        <p className="m-0 text-[11px] md:text-[13px] text-white/[0.55] font-semibold mt-[2px]">
          {getStatusLabel(rideAlong.status)}
          {' \u00b7 '}
          {isSessionActive ? 'Recording speech' : 'Ready for speech'}
        </p>
        <div className="flex gap-4 mt-2 text-[11px] md:text-[13px] text-white/[0.6]">
          <span><strong className="text-white/[0.85]">{totalDuration}</strong> duration</span>
          <span><strong className="text-white/[0.85]">{startedLabel}</strong></span>
          <span>Updated <strong className="text-white/[0.85]">{updatedLabel}</strong></span>
        </div>
      </div>

      {isDetailsOpen ? (
        <button
          type="button"
          onClick={onCloseDetails}
          className="fixed inset-0 border-none m-0 p-0 bg-brand-navy/[0.22] z-[21]"
          aria-label="Close ride along details"
        />
      ) : null}

      <aside
        aria-hidden={!isDetailsOpen}
        style={{
          transform: isDetailsOpen ? 'translateX(0)' : 'translateX(102%)',
          pointerEvents: isDetailsOpen ? 'auto' : 'none',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 14px)',
        }}
        className="fixed top-0 right-0 bottom-0 w-[min(340px,100%)] md:w-[min(420px,100%)] border-l border-brand-navy/[0.12] rounded-[22px_0_0_22px] bg-white shadow-[-12px_0_30px_rgba(36,41,101,0.16)] z-[22] transition-transform duration-[180ms] ease-out flex flex-col gap-3 px-[14px]"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="m-0 text-[17px] md:text-[20px] text-color-text">Ride Along Details</h3>
          <button
            type="button"
            onClick={onCloseDetails}
            className="border border-color-border rounded-full min-w-[38px] h-[38px] bg-white text-color-text-muted inline-flex items-center justify-center cursor-pointer text-[14px]"
            aria-label="Close details panel"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
          {[
            { label: 'Ride Along', value: rideAlong.name },
            { label: 'Status', value: getStatusLabel(rideAlong.status) },
            { label: 'Address', value: rideAlong.address || 'Not set' },
            { label: 'Location', value: getLocationDisplay(rideAlong) },
            { label: 'Started', value: formatDateTime(rideAlong.startedAt) },
            { label: 'Ended', value: formatDateTime(rideAlong.endedAt) },
            { label: 'Updated', value: formatDateTime(rideAlong.updatedAt) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="border border-color-border rounded-xl bg-white p-[10px] md:p-3.5 flex flex-col gap-[3px]"
            >
              <div className="text-[11px] md:text-[13px] font-bold text-color-text-muted uppercase tracking-[0.2px]">
                {label}
              </div>
              <div className="text-[12px] md:text-[14px] text-color-text leading-[1.35] break-words">
                {value}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
