'use client'

import type { CSSProperties } from 'react'
import SpeechWaveform from './SpeechWaveform'

type VoiceLevelBand = 'off' | 'ambient' | 'pre-speech' | 'speech' | 'peak'

type VoiceDiagnostics = {
  currentLevel: number | null
  rollingMin: number | null
  rollingMax: number | null
  rollingAverage: number | null
  rollingPeak: number | null
  lastThresholdCrossingLevel: number | null
  lastSessionStartLevel: number | null
  suggestedStartThreshold: number | null
  speechIndicatorCount: number | null
  speechIndicatorRequiredCount: number | null
  speechIndicatorTotalCount: number | null
  levelBand: VoiceLevelBand
  sampleWindowSeconds: number
}

type RideAlongLiveSessionPanelProps = {
  isMonitoringEnabled: boolean
  isRideAlongPaused: boolean
  isVisualizerEnabled: boolean
  isSessionActive: boolean
  sessionId: string | null
  durationSeconds: number | null
  currentLevel: number | null
  spectrumLevels: number[] | null
  voiceDiagnostics: VoiceDiagnostics
  speechStartThreshold: number
  waveformNoiseFloor: number
  waveformPeakTarget: number
  silenceSeconds: number
  onStopCurrentSession: () => Promise<void>
  isStoppingSession: boolean
  error: string | null
}

export default function RideAlongLiveSessionPanel({
  isMonitoringEnabled,
  isRideAlongPaused,
  isVisualizerEnabled,
  isSessionActive,
  sessionId,
  durationSeconds,
  currentLevel,
  spectrumLevels,
  voiceDiagnostics,
  speechStartThreshold,
  waveformNoiseFloor,
  waveformPeakTarget,
  silenceSeconds,
  onStopCurrentSession,
  isStoppingSession,
  error,
}: RideAlongLiveSessionPanelProps) {
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
      <div style={{ fontSize: '13px', fontWeight: 600 }}>Session Monitor</div>
      <SpeechWaveform
        level={currentLevel}
        spectrumLevels={spectrumLevels}
        isMonitoringEnabled={isVisualizerEnabled}
      />
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        Ride Along Monitor:{' '}
        {isRideAlongPaused ? 'Paused' : isMonitoringEnabled ? 'Active' : 'Inactive'}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        Session Status:{' '}
        {isRideAlongPaused
          ? 'Paused (new sessions blocked)'
          : isSessionActive
            ? 'Recording'
            : 'Idle (waiting for speech)'}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        Active Session ID: {sessionId || 'No active session'}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        Session Duration: {durationSeconds ?? 0}s
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        Audio Level: {currentLevel !== null ? currentLevel.toFixed(2) : 'n/a'}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        Silence Timer: {silenceSeconds.toFixed(1)}s
      </div>
      <div style={voiceConsoleStyle}>
        <div style={{ fontSize: '12px', fontWeight: 600 }}>Voice Console</div>
        <div style={voiceMetricStyle}>
          Signal Band: {getVoiceBandLabel(voiceDiagnostics.levelBand)}
        </div>
        <div style={voiceMetricStyle}>
          Current Level: {formatLevel(voiceDiagnostics.currentLevel)}
        </div>
        <div style={voiceMetricStyle}>
          Start Threshold (Configured): {formatLevel(speechStartThreshold)}
        </div>
        <div style={voiceMetricStyle}>
          Speech Indicators: {formatIndicatorCount(voiceDiagnostics)}
        </div>
        <div style={voiceMetricStyle}>
          Suggested Start Threshold: {formatLevel(voiceDiagnostics.suggestedStartThreshold)}
        </div>
        <div style={voiceMetricStyle}>
          Waveform Noise Floor: {formatLevel(waveformNoiseFloor)}
        </div>
        <div style={voiceMetricStyle}>
          Waveform Peak Target: {formatLevel(waveformPeakTarget)}
        </div>
        <div style={voiceMetricStyle}>
          Last Threshold Crossing: {formatLevel(voiceDiagnostics.lastThresholdCrossingLevel)}
        </div>
        <div style={voiceMetricStyle}>
          Last Session Start Level: {formatLevel(voiceDiagnostics.lastSessionStartLevel)}
        </div>
        <div style={voiceMetricStyle}>
          Rolling Min ({voiceDiagnostics.sampleWindowSeconds}s):{' '}
          {formatLevel(voiceDiagnostics.rollingMin)}
        </div>
        <div style={voiceMetricStyle}>
          Rolling Avg ({voiceDiagnostics.sampleWindowSeconds}s):{' '}
          {formatLevel(voiceDiagnostics.rollingAverage)}
        </div>
        <div style={voiceMetricStyle}>
          Rolling Peak ({voiceDiagnostics.sampleWindowSeconds}s):{' '}
          {formatLevel(voiceDiagnostics.rollingMax)}
        </div>
        <div style={voiceMetricStyle}>
          Session Peak: {formatLevel(voiceDiagnostics.rollingPeak)}
        </div>
      </div>
      {error ? (
        <div style={{ fontSize: '12px', color: 'var(--color-support-negative)' }}>
          {error}
        </div>
      ) : null}
      <div
        style={{
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => {
            void onStopCurrentSession()
          }}
          disabled={!isSessionActive || isStoppingSession}
          style={{
            ...dangerButtonStyle,
            opacity: !isSessionActive || isStoppingSession ? 0.6 : 1,
          }}
        >
          {isStoppingSession ? 'Stopping Session...' : 'Stop Current Session'}
        </button>
      </div>
    </div>
  )
}

const dangerButtonStyle: CSSProperties = {
  border: 'none',
  borderRadius: '10px',
  backgroundColor: 'var(--color-support-negative)',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 600,
  padding: '10px 12px',
  cursor: 'pointer',
  width: '100%',
}

const voiceConsoleStyle: CSSProperties = {
  border: '1px solid rgba(252, 181, 0, 0.35)',
  borderRadius: '10px',
  backgroundColor: 'rgba(252, 181, 0, 0.07)',
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
}

const voiceMetricStyle: CSSProperties = {
  fontSize: '11px',
  color: 'var(--color-text-muted)',
}

const formatLevel = (value: number | null) =>
  value === null ? 'n/a' : value.toFixed(3)

const formatIndicatorCount = (voiceDiagnostics: VoiceDiagnostics) => {
  const count = voiceDiagnostics.speechIndicatorCount
  const required = voiceDiagnostics.speechIndicatorRequiredCount
  const total = voiceDiagnostics.speechIndicatorTotalCount
  if (count === null || required === null || total === null) {
    return 'n/a'
  }
  return `${count}/${total} (trigger at ${required})`
}

const getVoiceBandLabel = (band: VoiceLevelBand) => {
  switch (band) {
    case 'off':
      return 'Monitoring Off'
    case 'ambient':
      return 'Ambient Noise'
    case 'pre-speech':
      return 'Below Visual Spike Floor'
    case 'speech':
      return 'Speech Range'
    case 'peak':
      return 'High Peak'
    default:
      return 'n/a'
  }
}
