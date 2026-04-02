'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { RideAlongStatus } from '@/app/lib/rideAlongs/client'
import SpeechWaveform from './SpeechWaveform'

type TranscriptTurn = {
  id: string
  turnOrder: number
  text: string
  createdAt: string | null
}

type TranscriptSession = {
  id: string
  sessionStartTime: string | null | undefined
  turns: TranscriptTurn[]
}

type RideAlongActiveControlsProps = {
  rideAlongStatus: RideAlongStatus | null | undefined
  isMonitoringEnabled: boolean
  isRideAlongPaused: boolean
  isSessionActive: boolean
  currentLevel: number | null
  spectrumLevels: number[] | null
  liveTranscriptPreviewText: string | null
  transcriptSessions: TranscriptSession[]
  speechStartThreshold: number
  silenceSeconds: number
  onStartRideAlong: () => void
  onPauseRideAlong: () => void
  onResumeRideAlong: () => void
  onCompleteRideAlong: () => void
  isBusy: boolean
  isStoppingSession: boolean
  error: string | null
}

type MainActionConfig = {
  label: string
  iconClassName: string
  onClick: () => void
  tone: 'primary' | 'resume' | 'neutral' | 'inactive'
}

const getMainAction = ({
  rideAlongStatus,
  onStartRideAlong,
  onPauseRideAlong,
  onResumeRideAlong,
}: {
  rideAlongStatus: RideAlongStatus | null | undefined
  onStartRideAlong: () => void
  onPauseRideAlong: () => void
  onResumeRideAlong: () => void
}): MainActionConfig => {
  if (rideAlongStatus === 'LIVE') {
    return {
      label: 'Pause',
      iconClassName: 'fa-solid fa-pause',
      onClick: onPauseRideAlong,
      tone: 'neutral',
    }
  }

  if (rideAlongStatus === 'PAUSED') {
    return {
      label: 'Resume',
      iconClassName: 'fa-solid fa-play',
      onClick: onResumeRideAlong,
      tone: 'resume',
    }
  }

  if (rideAlongStatus === 'ENDED') {
    return {
      label: 'Completed',
      iconClassName: 'fa-solid fa-circle-check',
      onClick: () => {},
      tone: 'inactive',
    }
  }

  return {
    label: 'Start',
    iconClassName: 'fa-solid fa-play',
    onClick: onStartRideAlong,
    tone: 'primary',
  }
}

const parseTimestamp = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  const timestamp = parsed.getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

export default function RideAlongActiveControls({
  rideAlongStatus,
  isMonitoringEnabled,
  isRideAlongPaused,
  isSessionActive,
  currentLevel,
  spectrumLevels,
  liveTranscriptPreviewText,
  transcriptSessions,
  speechStartThreshold,
  silenceSeconds,
  onStartRideAlong,
  onPauseRideAlong,
  onResumeRideAlong,
  onCompleteRideAlong,
  isBusy,
  isStoppingSession,
  error,
}: RideAlongActiveControlsProps) {
  const level = Number(currentLevel || 0)
  const speakingNow =
    !isRideAlongPaused && isMonitoringEnabled && level >= speechStartThreshold
  const actionConfig = getMainAction({
    rideAlongStatus,
    onStartRideAlong,
    onPauseRideAlong,
    onResumeRideAlong,
  })
  const disableMainAction = isBusy || isStoppingSession || rideAlongStatus === 'ENDED'
  const disableCompleteAction = isBusy || isStoppingSession || rideAlongStatus === 'ENDED'
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false)
  const transcriptTurnsScrollRef = useRef<HTMLDivElement | null>(null)

  const helperMessage = isRideAlongPaused
    ? 'Ride along is paused. Tap resume when ready.'
    : speakingNow
      ? 'Speech detected.'
      : isSessionActive
        ? 'Listening for speech...'
        : 'Speak naturally to start capture.'
  const transcriptPreview =
    typeof liveTranscriptPreviewText === 'string' &&
    liveTranscriptPreviewText.trim().length > 0
      ? liveTranscriptPreviewText.trim()
      : null

  const combinedTranscriptTurns = useMemo(() => {
    const turns: Array<{
      id: string
      text: string
      timestampMs: number
      datetimeLine: string | null
    }> = []

    transcriptSessions.forEach((session) => {
      const sessionStartTimestamp = parseTimestamp(session.sessionStartTime)
      session.turns.forEach((turn) => {
        const normalizedText = turn.text.trim()
        if (!normalizedText) return
        const timestampMs = parseTimestamp(turn.createdAt) ?? sessionStartTimestamp
        if (timestampMs === null) return
        turns.push({
          id: `${session.id}:${turn.id}:${turn.turnOrder}`,
          text: normalizedText,
          timestampMs,
          datetimeLine: turn.createdAt || session.sessionStartTime || null,
        })
      })
    })

    return turns.sort((left, right) => left.timestampMs - right.timestampMs)
  }, [transcriptSessions])

  const hasTranscriptTurns = combinedTranscriptTurns.length > 0

  useEffect(() => {
    if (!isTranscriptExpanded) return
    window.requestAnimationFrame(() => {
      const turnsContainer = transcriptTurnsScrollRef.current
      if (!turnsContainer) return
      turnsContainer.scrollTop = turnsContainer.scrollHeight
    })
  }, [isTranscriptExpanded, combinedTranscriptTurns.length])

  const mainActionToneClass =
    actionConfig.tone === 'primary' || actionConfig.tone === 'resume'
      ? 'bg-brand-marigold border-brand-marigold/[0.62] text-neutral-graphite'
      : actionConfig.tone === 'neutral'
        ? 'bg-white border-brand-navy/[0.34] text-brand-navy'
        : 'bg-[rgba(58,59,56,0.16)] border-[rgba(58,59,56,0.24)] text-[rgba(58,59,56,0.75)]'

  return (
    <section className="flex-1 min-h-0 flex flex-col justify-end gap-3 pb-[2px]" aria-label="Live ride along controls">
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 py-1.5">
        <div className="w-full max-w-[620px]">
          <SpeechWaveform
            level={currentLevel}
            spectrumLevels={spectrumLevels}
            isMonitoringEnabled={isMonitoringEnabled && !isRideAlongPaused}
          />
        </div>
        <p className="m-0 text-[13px] text-[rgba(58,59,56,0.72)] text-center font-semibold">
          {helperMessage}
          {isSessionActive && silenceSeconds >= 0.8
            ? ` Silence: ${silenceSeconds.toFixed(1)}s`
            : ''}
        </p>
      </div>

      <div className="border border-brand-navy/[0.16] rounded-xl bg-white/[0.78] p-[10px] flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] tracking-[0.25px] uppercase font-bold text-[rgba(58,59,56,0.62)]">
            Transcript
          </span>
          <button
            type="button"
            onClick={() => setIsTranscriptExpanded(true)}
            className="border border-color-border rounded-full bg-white text-color-text-muted px-[10px] py-1 inline-flex items-center gap-1.5 text-[12px] font-bold cursor-pointer"
            aria-label="Open transcript timeline"
          >
            <span className="text-[12px] font-bold">Expand</span>
            <i className="fa-solid fa-up-right-and-down-left-from-center" aria-hidden="true" />
          </button>
        </div>
        <div className="text-[14px] text-color-text leading-[1.35] min-h-[20px] max-h-[2.7em] [-webkit-line-clamp:2] [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden break-words">
          {transcriptPreview || 'Listening for transcription...'}
        </div>
      </div>

      {isTranscriptExpanded ? (
        <section
          className="fixed inset-0 z-[6505] bg-white flex flex-col"
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
          }}
          aria-label="Full transcript"
        >
          <div className="border border-[rgba(58,59,56,0.92)] rounded-none bg-neutral-graphite px-[10px] py-2 flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => setIsTranscriptExpanded(false)}
              className="border border-white/[0.46] rounded-full w-[38px] h-[38px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer flex-shrink-0"
              aria-label="Back to recording controls"
            >
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            </button>
            <div className="flex-1 text-center text-[15px] font-bold text-neutral-alabaster">
              Transcript
            </div>
            <button
              type="button"
              onClick={() => setIsTranscriptExpanded(false)}
              className="border border-white/[0.46] rounded-full w-[38px] h-[38px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer flex-shrink-0"
              aria-label="Close transcript timeline"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>

          <div ref={transcriptTurnsScrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3">
            {hasTranscriptTurns ? (
              <div className="flex flex-col gap-2.5">
                {combinedTranscriptTurns.map((turn) => (
                  <div key={turn.id} className="flex flex-col gap-1">
                    <div className="text-[11px] font-bold text-color-text-muted leading-[1.25]">
                      {turn.datetimeLine || 'Timestamp unavailable'}
                    </div>
                    <div className="border border-brand-navy/[0.15] rounded-[10px] bg-white px-[10px] py-2 text-[13px] leading-[1.4] text-color-text whitespace-pre-wrap break-words">
                      {turn.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="m-0 text-[14px] text-color-text-muted leading-[1.35] p-[2px]">
                Listening for transcription...
              </div>
            )}
          </div>
        </section>
      ) : null}

      <div className="flex items-center gap-2.5 w-full">
        <button
          type="button"
          onClick={actionConfig.onClick}
          disabled={disableMainAction}
          className={`flex-1 rounded-[14px] min-h-[52px] border inline-flex items-center justify-center gap-2 text-[15px] font-extrabold ${mainActionToneClass}`}
          style={{ opacity: disableMainAction ? 0.62 : 1, cursor: disableMainAction ? 'default' : 'pointer' }}
          aria-label={actionConfig.label}
        >
          <i className={actionConfig.iconClassName} aria-hidden="true" />
          {isBusy || isStoppingSession ? 'Working...' : actionConfig.label}
        </button>

        <button
          type="button"
          onClick={onCompleteRideAlong}
          disabled={disableCompleteAction}
          className="flex-1 rounded-[14px] min-h-[52px] border inline-flex items-center justify-center gap-2 text-[15px] font-extrabold bg-brand-tangerine/[0.14] border-brand-tangerine/[0.38] text-brand-tangerine"
          style={{ opacity: disableCompleteAction ? 0.62 : 1, cursor: disableCompleteAction ? 'default' : 'pointer' }}
          aria-label="Complete ride along"
        >
          <i className="fa-solid fa-flag-checkered" aria-hidden="true" />
          {rideAlongStatus === 'ENDED' ? 'Completed' : 'Complete'}
        </button>
      </div>

      {error ? (
        <div className="border border-support-negative/[0.3] rounded-[10px] bg-support-negative/[0.08] text-support-negative text-[12px] px-[9px] py-2">
          {error}
        </div>
      ) : null}
    </section>
  )
}
