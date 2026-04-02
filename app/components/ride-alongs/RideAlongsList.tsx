'use client'

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
  if (!isoDate) return 'Scheduled'
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return 'Scheduled'
  return `Scheduled ${parsed.toLocaleDateString()}`
}

export default function RideAlongsList({
  rideAlongs,
  onSelect,
  onRefresh,
  isLoading,
}: RideAlongsListProps) {
  return (
    <section
      className="border border-color-border rounded-2xl bg-white p-[14px] flex flex-col gap-3"
      aria-label="Scheduled ride alongs"
    >
      <header className="flex items-start justify-between gap-2.5">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[20px] text-color-text">Ride Alongs</h2>
          <p className="m-0 text-[12px] text-color-text-muted">
            Select a job below to begin your ride along.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { void onRefresh() }}
          className="border border-color-border rounded-full min-w-[34px] h-[34px] bg-white text-color-text-muted cursor-pointer inline-flex items-center justify-center"
          aria-label="Refresh ride along list"
        >
          <i className="fa-solid fa-rotate-right" aria-hidden="true" />
        </button>
      </header>

      {isLoading ? (
        <div className="border border-dashed border-color-border rounded-xl bg-white/[0.88] text-color-text-muted text-[12px] p-3">
          Loading your jobs...
        </div>
      ) : null}

      {!isLoading && rideAlongs.length === 0 ? (
        <div className="border border-dashed border-color-border rounded-xl bg-white/[0.88] text-color-text-muted text-[12px] p-3">
          No jobs are assigned to you right now. Check back soon or contact your supervisor.
        </div>
      ) : null}

      {!isLoading && rideAlongs.length > 0 ? (
        <div className="flex flex-col gap-2">
          {rideAlongs.map((rideAlong) => (
            <button
              key={rideAlong.id}
              type="button"
              onClick={() => onSelect(rideAlong)}
              className="border border-color-border rounded-[14px] bg-white text-left p-3 cursor-pointer flex flex-col gap-[7px]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[14px] font-bold text-color-text">{rideAlong.name}</div>
                <span className="border border-brand-navy/[0.14] rounded-full px-2 py-1 text-[11px] font-semibold text-brand-navy bg-brand-cerulean/[0.14] whitespace-nowrap">
                  {getScheduledLabel(rideAlong.startedAt)}
                </span>
              </div>
              <div className="text-[12px] text-color-text-muted">
                {getRideAlongSubtitle(rideAlong)}
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
