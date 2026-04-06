'use client'

import type { RideAlong } from '@/app/lib/rideAlongs/client'

type RideAlongsListProps = {
  rideAlongs: RideAlong[]
  onSelect: (rideAlong: RideAlong) => void
  isLoading: boolean
}

const parseLocation = (location: string): string => {
  let candidate: unknown = location
  for (let i = 0; i < 6; i++) {
    if (typeof candidate !== 'string') break
    try {
      candidate = JSON.parse(candidate)
    } catch {
      break
    }
  }

  if (candidate && typeof candidate === 'object') {
    const obj = candidate as Record<string, unknown>
    if (typeof obj.label === 'string' && obj.label) return obj.label
    if (typeof obj.latitude === 'number' && typeof obj.longitude === 'number') {
      return `${obj.latitude.toFixed(4)}, ${obj.longitude.toFixed(4)}`
    }
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
  isLoading,
}: RideAlongsListProps) {
  if (isLoading) {
    return (
      <div className="text-color-text-muted text-[13px] md:text-[16px] py-4 text-center">
        Loading your jobs...
      </div>
    )
  }

  if (rideAlongs.length === 0) {
    return (
      <div className="text-color-text-muted text-[13px] md:text-[16px] py-4 text-center">
        No jobs are assigned to you right now. Check back soon or contact your supervisor.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5 md:gap-3.5">
      {rideAlongs.map((rideAlong) => (
        <button
          key={rideAlong.id}
          type="button"
          onClick={() => onSelect(rideAlong)}
          className="bg-white rounded-[14px] md:rounded-[22px] text-left p-[14px] md:p-5 cursor-pointer flex flex-col gap-[3px] md:gap-[5px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-color-border/40 md:border-color-border/60"
        >
          <div className="text-[15px] md:text-[19px] font-bold text-color-text">{rideAlong.name}</div>
          <div className="text-[13px] md:text-[16px] text-[rgba(58,59,56,0.55)]">
            {getRideAlongSubtitle(rideAlong)}
          </div>
          <div className="mt-1.5">
            <span className="border border-brand-navy/[0.14] rounded-full px-2.5 md:px-3.5 py-[3px] md:py-[5px] text-[11px] md:text-[14px] font-semibold text-brand-navy bg-brand-cerulean/[0.14]">
              {getScheduledLabel(rideAlong.startedAt)}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
