'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
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
        if (!normalizedText) {
          return
        }

        const timestampMs = parseTimestamp(turn.createdAt) ?? sessionStartTimestamp
        if (timestampMs === null) {
          return
        }

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
    if (!isTranscriptExpanded) {
      return
    }

    window.requestAnimationFrame(() => {
      const turnsContainer = transcriptTurnsScrollRef.current
      if (!turnsContainer) {
        return
      }
      turnsContainer.scrollTop = turnsContainer.scrollHeight
    })
  }, [isTranscriptExpanded, combinedTranscriptTurns.length])

  return (
    <section style={panelStyle} aria-label="Live ride along controls">
      <div style={waveStageStyle}>
        <div style={waveContainerStyle}>
          <SpeechWaveform
            level={currentLevel}
            spectrumLevels={spectrumLevels}
            isMonitoringEnabled={isMonitoringEnabled && !isRideAlongPaused}
          />
        </div>

        <p style={helperTextStyle}>
          {helperMessage}
          {isSessionActive && silenceSeconds >= 0.8
            ? ` Silence: ${silenceSeconds.toFixed(1)}s`
            : ''}
        </p>
      </div>

      <div style={transcriptWrapStyle}>
        <div style={transcriptHeaderRowStyle}>
          <span style={transcriptLabelStyle}>Transcript</span>
          <button
            type="button"
            onClick={() => setIsTranscriptExpanded(true)}
            style={transcriptOpenButtonStyle}
            aria-label="Open transcript timeline"
          >
            <span style={transcriptOpenButtonTextStyle}>Expand</span>
            <i className="fa-solid fa-up-right-and-down-left-from-center" aria-hidden="true" />
          </button>
        </div>
        <div style={transcriptPreviewStyle}>
          {transcriptPreview || 'Listening for transcription...'}
        </div>
      </div>

      {isTranscriptExpanded ? (
        <section style={transcriptPageOverlayStyle} aria-label="Full transcript">
          <div style={transcriptPageHeaderStyle}>
            <button
              type="button"
              onClick={() => setIsTranscriptExpanded(false)}
              style={transcriptPageHeaderIconButtonStyle}
              aria-label="Back to recording controls"
            >
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            </button>

            <div style={transcriptPageTitleStyle}>Transcript</div>

            <button
              type="button"
              onClick={() => setIsTranscriptExpanded(false)}
              style={transcriptPageHeaderIconButtonStyle}
              aria-label="Close transcript timeline"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>

          <div ref={transcriptTurnsScrollRef} style={transcriptPageScrollStyle}>
            {hasTranscriptTurns ? (
              <div style={speechBubbleListStyle}>
                {combinedTranscriptTurns.map((turn) => (
                  <div key={turn.id} style={transcriptTurnEntryStyle}>
                    <div style={transcriptDatetimeLineStyle}>
                      {turn.datetimeLine || 'Timestamp unavailable'}
                    </div>
                    <div style={speechBubbleStyle}>{turn.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={transcriptEmptyStyle}>Listening for transcription...</div>
            )}
          </div>
        </section>
      ) : null}

      <div style={buttonRowStyle}>
        <button
          type="button"
          onClick={actionConfig.onClick}
          disabled={disableMainAction}
          style={{
            ...actionButtonBaseStyle,
            ...(actionConfig.tone === 'primary'
              ? actionButtonPrimaryStyle
              : actionConfig.tone === 'resume'
                ? actionButtonResumeStyle
                : actionConfig.tone === 'neutral'
                ? actionButtonNeutralStyle
                : actionButtonInactiveStyle),
            opacity: disableMainAction ? 0.62 : 1,
            cursor: disableMainAction ? 'default' : 'pointer',
          }}
          aria-label={actionConfig.label}
        >
          <i className={actionConfig.iconClassName} aria-hidden="true" />
          {isBusy || isStoppingSession ? 'Working...' : actionConfig.label}
        </button>

        <button
          type="button"
          onClick={onCompleteRideAlong}
          disabled={disableCompleteAction}
          style={{
            ...actionButtonBaseStyle,
            ...completeActionButtonStyle,
            opacity: disableCompleteAction ? 0.62 : 1,
            cursor: disableCompleteAction ? 'default' : 'pointer',
          }}
          aria-label="Complete ride along"
        >
          <i className="fa-solid fa-flag-checkered" aria-hidden="true" />
          {rideAlongStatus === 'ENDED' ? 'Completed' : 'Complete'}
        </button>
      </div>

      {error ? <div style={errorTextStyle}>{error}</div> : null}
    </section>
  )
}

const panelStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  gap: '12px',
  paddingBottom: '2px',
}

const waveStageStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '6px 0 2px',
}

const waveContainerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '620px',
}

const helperTextStyle: CSSProperties = {
  margin: 0,
  fontSize: '13px',
  color: 'rgba(58, 59, 56, 0.72)',
  textAlign: 'center',
  fontWeight: 600,
}

const transcriptWrapStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.16)',
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.78)',
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const transcriptHeaderRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
}

const transcriptLabelStyle: CSSProperties = {
  fontSize: '11px',
  letterSpacing: 0.25,
  textTransform: 'uppercase',
  fontWeight: 700,
  color: 'rgba(58, 59, 56, 0.62)',
}

const transcriptOpenButtonStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  backgroundColor: '#ffffff',
  color: 'var(--color-text-muted)',
  padding: '4px 10px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer',
}

const transcriptOpenButtonTextStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
}

const transcriptPreviewStyle: CSSProperties = {
  fontSize: '14px',
  color: 'var(--color-text)',
  lineHeight: 1.35,
  minHeight: '20px',
  maxHeight: '2.7em',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
}

const transcriptPageOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 6505,
  backgroundColor: '#ffffff',
  paddingTop: 'env(safe-area-inset-top, 0px)',
  paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
  display: 'flex',
  flexDirection: 'column',
}

const transcriptPageHeaderStyle: CSSProperties = {
  border: '1px solid rgba(58, 59, 56, 0.92)',
  borderRadius: 0,
  backgroundColor: 'var(--color-neutral-graphite)',
  padding: '8px 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
}

const transcriptPageTitleStyle: CSSProperties = {
  flex: 1,
  textAlign: 'center',
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--color-neutral-alabaster)',
}

const transcriptPageHeaderIconButtonStyle: CSSProperties = {
  border: '1px solid rgba(255, 255, 255, 0.46)',
  borderRadius: '999px',
  width: '38px',
  height: '38px',
  backgroundColor: 'transparent',
  color: 'var(--color-neutral-alabaster)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
}

const transcriptPageScrollStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '12px',
}

const speechBubbleListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}

const transcriptTurnEntryStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

const transcriptDatetimeLineStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--color-text-muted)',
  lineHeight: 1.25,
}

const speechBubbleStyle: CSSProperties = {
  border: '1px solid rgba(36, 41, 101, 0.15)',
  borderRadius: '10px',
  backgroundColor: '#ffffff',
  padding: '8px 10px',
  fontSize: '13px',
  lineHeight: 1.4,
  color: 'var(--color-text)',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}

const transcriptEmptyStyle: CSSProperties = {
  margin: 0,
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  lineHeight: 1.35,
  padding: '2px',
}

const buttonRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
}

const actionButtonBaseStyle: CSSProperties = {
  flex: 1,
  borderRadius: '14px',
  minHeight: '52px',
  border: '1px solid transparent',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontSize: '15px',
  fontWeight: 800,
}

const actionButtonPrimaryStyle: CSSProperties = {
  backgroundColor: 'var(--color-brand-marigold)',
  borderColor: 'rgba(252, 181, 0, 0.62)',
  color: 'var(--color-neutral-graphite)',
}

const actionButtonResumeStyle: CSSProperties = {
  backgroundColor: 'var(--color-brand-marigold)',
  borderColor: 'rgba(252, 181, 0, 0.62)',
  color: 'var(--color-neutral-graphite)',
}

const actionButtonNeutralStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  borderColor: 'rgba(36, 41, 101, 0.34)',
  color: 'var(--color-brand-navy)',
}

const actionButtonInactiveStyle: CSSProperties = {
  backgroundColor: 'rgba(58, 59, 56, 0.16)',
  borderColor: 'rgba(58, 59, 56, 0.24)',
  color: 'rgba(58, 59, 56, 0.75)',
}

const completeActionButtonStyle: CSSProperties = {
  backgroundColor: 'rgba(233, 102, 0, 0.14)',
  borderColor: 'rgba(233, 102, 0, 0.38)',
  color: 'var(--color-brand-tangerine)',
}

const errorTextStyle: CSSProperties = {
  border: '1px solid rgba(203, 45, 45, 0.3)',
  borderRadius: '10px',
  backgroundColor: 'rgba(203, 45, 45, 0.08)',
  color: 'var(--color-support-negative)',
  fontSize: '12px',
  padding: '8px 9px',
}
