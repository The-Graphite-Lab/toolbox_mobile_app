'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AudioRecording } from '@/plugins/AudioRecording'
import RideAlongsList from './RideAlongsList'
import RideAlongActiveHeader from './RideAlongActiveHeader'
import RideAlongActiveControls from './RideAlongActiveControls'
import {
  SPEECH_START_LEVEL_THRESHOLD,
  WAVEFORM_NOISE_FLOOR_LEVEL,
  WAVEFORM_SPEECH_PEAK_LEVEL,
  clampLevel,
} from './audioLevelTuning'
import {
  createAssemblyStreamingToken,
  getApiAuthToken,
  getRideAlongRecordingUploadUrl,
  getActiveRideAlongByUser,
  getRideAlongApiBaseUrl,
  listRideAlongsByUser,
  listRideAlongSessionsByRideAlong,
  listRideAlongTurnsBySession,
  markRideAlongAsEnded,
  markRideAlongAsLive,
  markRideAlongAsPaused,
  markRideAlongAsResumed,
  postRideAlongSessionFinish,
  postRideAlongSessionStart,
  postRideAlongSessionTurns,
  type RideAlong,
  type RideAlongSession,
  type RideAlongSessionTurn,
  uploadRideAlongRecordingBlob,
} from '@/app/lib/rideAlongs/client'

type RideAlongsTabProps = {
  clientId: string | null
  userId: string | null
  /** When this value changes (and > 0), navigate back to the list (clear selected ride along). */
  homeTrigger?: number
  /** Top safe-area inset applied inside the scroll content. */
  topContentInset?: string
}

type ViewMode = 'list' | 'rideAlong'

type LiveSessionState = {
  isActive: boolean
  isStreaming: boolean
  isRecording: boolean
  isPaused: boolean
  sessionId: string | null
  durationSeconds: number | null
}

type MonitorState = {
  silenceStartedAt: number | null
  speechStartedAt: number | null
  isStartingSession: boolean
  isStoppingSession: boolean
}

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

const defaultLiveSessionState: LiveSessionState = {
  isActive: false,
  isStreaming: false,
  isRecording: false,
  isPaused: false,
  sessionId: null,
  durationSeconds: null,
}

const MIN_SPEECH_MS = 650
const LONG_PAUSE_MS = 6000
const POLL_INTERVAL_MS = 2500
const LEVEL_POLL_INTERVAL_MS = 85
const SPEECH_MONITOR_INTERVAL_MS = 220
const PRE_ROLL_BUFFER_MS = 2500
const SPEECH_MIN_LEVEL_ABOVE_AMBIENT = 0.008
const SPEECH_BAND_ACTIVITY_THRESHOLD = 0.035
const SPEECH_MIN_ACTIVE_BANDS = 3
const SPEECH_MIN_PEAK_BAND = 0.085
const SPEECH_MIN_AVERAGE_BAND = 0.014
const SPEECH_MID_BAND_DOMINANCE_RATIO = 0.82
const SPEECH_HIGH_BAND_TRANSIENT_RATIO = 1.6
const SPEECH_INDICATOR_TOTAL_COUNT = 6
const SPEECH_INDICATOR_REQUIRED_COUNT = 4
const WAVEFORM_SPECTRUM_BAND_COUNT = 29
const WAVEFORM_SPECTRUM_MIN_FREQUENCY_HZ = 90
const WAVEFORM_SPECTRUM_MAX_FREQUENCY_HZ = 4800
const VOICE_DIAGNOSTIC_WINDOW_MS = 20000
const VOICE_DIAGNOSTIC_WINDOW_SECONDS = VOICE_DIAGNOSTIC_WINDOW_MS / 1000

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const average = (values: number[]) =>
  values.length > 0
    ? values.reduce((total, value) => total + value, 0) / values.length
    : 0

const parseIsoTimestampMs = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  const timestamp = parsed.getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

const evaluateSpeechIndicators = ({
  level,
  spectrum,
  ambientLevel,
}: {
  level: number
  spectrum: number[] | null
  ambientLevel: number
}) => {
  const normalizedAmbient = Number.isFinite(ambientLevel)
    ? Math.max(0, ambientLevel)
    : 0
  const minimumLevel = Math.max(
    SPEECH_START_LEVEL_THRESHOLD,
    normalizedAmbient + SPEECH_MIN_LEVEL_ABOVE_AMBIENT
  )

  if (level < minimumLevel) {
    return {
      indicatorCount: 0,
      requiredCount: SPEECH_INDICATOR_REQUIRED_COUNT,
      totalCount: SPEECH_INDICATOR_TOTAL_COUNT,
      isLikelySpeech: false,
    }
  }

  if (!spectrum || spectrum.length < 8) {
    const strongLevelOnly =
      level >= Math.max(minimumLevel, SPEECH_START_LEVEL_THRESHOLD + 0.006)
    return {
      indicatorCount: strongLevelOnly ? 1 : 0,
      requiredCount: SPEECH_INDICATOR_REQUIRED_COUNT,
      totalCount: SPEECH_INDICATOR_TOTAL_COUNT,
      isLikelySpeech: strongLevelOnly,
    }
  }

  const normalizedBands = spectrum.map((band) => clampLevel(Number(band || 0), 0, 1))
  const activeBands = normalizedBands.filter(
    (band) => band >= SPEECH_BAND_ACTIVITY_THRESHOLD
  ).length
  const peakBand = Math.max(...normalizedBands)
  const averageBand = average(normalizedBands)
  const lowBandEndIndex = Math.max(1, Math.floor(normalizedBands.length * 0.28))
  const highBandStartIndex = Math.max(
    lowBandEndIndex + 1,
    Math.floor(normalizedBands.length * 0.72)
  )
  const midBandAverage = average(
    normalizedBands.slice(lowBandEndIndex, highBandStartIndex)
  )
  const highBandAverage = average(normalizedBands.slice(highBandStartIndex))
  let speechScore = 0

  if (level >= minimumLevel) {
    speechScore += 1
  }
  if (activeBands >= SPEECH_MIN_ACTIVE_BANDS) {
    speechScore += 1
  }
  if (peakBand >= SPEECH_MIN_PEAK_BAND) {
    speechScore += 1
  }
  if (averageBand >= SPEECH_MIN_AVERAGE_BAND) {
    speechScore += 1
  }
  if (midBandAverage >= highBandAverage * SPEECH_MID_BAND_DOMINANCE_RATIO) {
    speechScore += 1
  }

  // Strong level spikes with some band activity should still count as speech.
  if (level >= minimumLevel + 0.016 && (activeBands >= 2 || peakBand >= 0.07)) {
    speechScore += 1
  }

  // Typing and mechanical taps are often high-band heavy short transients.
  if (
    highBandAverage > midBandAverage * SPEECH_HIGH_BAND_TRANSIENT_RATIO &&
    level < minimumLevel + 0.03
  ) {
    speechScore = Math.max(0, speechScore - 2)
  }

  return {
    indicatorCount: speechScore,
    requiredCount: SPEECH_INDICATOR_REQUIRED_COUNT,
    totalCount: SPEECH_INDICATOR_TOTAL_COUNT,
    isLikelySpeech: speechScore >= SPEECH_INDICATOR_REQUIRED_COUNT,
  }
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error
  }

  if (error && typeof error === 'object') {
    const maybeRecord = error as Record<string, unknown>
    const topMessage = maybeRecord.message
    if (typeof topMessage === 'string' && topMessage.trim().length > 0) {
      return topMessage
    }

    const errorsList = maybeRecord.errors
    if (Array.isArray(errorsList) && errorsList.length > 0) {
      const first = errorsList[0] as Record<string, unknown>
      if (typeof first?.message === 'string' && first.message.trim().length > 0) {
        return first.message
      }
    }

    const data = maybeRecord.data as Record<string, unknown> | undefined
    const dataErrors = data?.errors
    if (Array.isArray(dataErrors) && dataErrors.length > 0) {
      const first = dataErrors[0] as Record<string, unknown>
      if (typeof first?.message === 'string' && first.message.trim().length > 0) {
        return first.message
      }
    }
  }

  return fallback
}

const normalizeTranscriptText = (value: unknown) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''

const extractLiveTranscriptText = (
  event: Record<string, unknown>,
  turn: Record<string, unknown> | undefined
) => {
  const candidates = [
    turn?.transcript,
    turn?.utterance,
    turn?.text,
    event.transcript,
    event.utterance,
    event.text,
  ]

  for (const candidate of candidates) {
    const normalized = normalizeTranscriptText(candidate)
    if (normalized.length > 0) {
      return normalized
    }
  }

  return null
}

const getVoiceLevelBand = (
  level: number,
  isMonitoringEnabled: boolean
): VoiceLevelBand => {
  if (!isMonitoringEnabled) {
    return 'off'
  }
  if (level < SPEECH_START_LEVEL_THRESHOLD) {
    return 'ambient'
  }
  if (level < WAVEFORM_NOISE_FLOOR_LEVEL) {
    return 'pre-speech'
  }
  if (level < WAVEFORM_SPEECH_PEAK_LEVEL) {
    return 'speech'
  }
  return 'peak'
}

const getInitialVoiceDiagnostics = (): VoiceDiagnostics => ({
  currentLevel: null,
  rollingMin: null,
  rollingMax: null,
  rollingAverage: null,
  rollingPeak: null,
  lastThresholdCrossingLevel: null,
  lastSessionStartLevel: null,
  suggestedStartThreshold: null,
  speechIndicatorCount: null,
  speechIndicatorRequiredCount: null,
  speechIndicatorTotalCount: null,
  levelBand: 'off',
  sampleWindowSeconds: VOICE_DIAGNOSTIC_WINDOW_SECONDS,
})

export default function RideAlongsTab({
  clientId,
  userId,
  homeTrigger = 0,
  topContentInset = '14px',
}: RideAlongsTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [scheduledRideAlongs, setScheduledRideAlongs] = useState<RideAlong[]>([])
  const [activeRideAlong, setActiveRideAlong] = useState<RideAlong | null>(null)
  const [selectedRideAlong, setSelectedRideAlong] = useState<RideAlong | null>(null)
  const [sessions, setSessions] = useState<RideAlongSession[]>([])
  const [isDetailsFlyoutOpen, setIsDetailsFlyoutOpen] = useState(false)
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [isStoppingSession, setIsStoppingSession] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [liveSessionState, setLiveSessionState] = useState<LiveSessionState>(
    defaultLiveSessionState
  )
  const [audioLevel, setAudioLevel] = useState<number | null>(null)
  const [audioSpectrum, setAudioSpectrum] = useState<number[] | null>(null)
  const [silenceSeconds, setSilenceSeconds] = useState(0)
  const [sessionTurnsById, setSessionTurnsById] = useState<
    Record<string, RideAlongSessionTurn[]>
  >({})
  const [liveTranscriptPreview, setLiveTranscriptPreview] = useState<string | null>(null)
  const [isDomReady, setIsDomReady] = useState(false)
  const [, setVoiceDiagnostics] = useState<VoiceDiagnostics>(
    () => getInitialVoiceDiagnostics()
  )

  const monitorStateRef = useRef<MonitorState>({
    silenceStartedAt: null,
    speechStartedAt: null,
    isStartingSession: false,
    isStoppingSession: false,
  })
  const voiceSamplesRef = useRef<Array<{ timestamp: number; level: number }>>([])
  const rollingPeakRef = useRef(0)
  const rollingAverageLevelRef = useRef(0)
  const previousLevelRef = useRef(0)
  const currentAudioLevelRef = useRef(0)
  const currentAudioSpectrumRef = useRef<number[] | null>(null)
  const supportsSpectrumLevelsRef = useRef<boolean | null>(null)
  const sessionVersionByIdRef = useRef<Record<string, number>>({})
  const handledSessionStartRef = useRef<Set<string>>(new Set())
  const inFlightSessionStartRef = useRef<Set<string>>(new Set())
  const handledTurnRef = useRef<Set<string>>(new Set())

  const selectedRideAlongId = selectedRideAlong?.id || null
  const shouldMonitorSpeech = selectedRideAlong?.status === 'LIVE'
  const shouldRenderAudioVisualizer =
    viewMode === 'rideAlong' && Boolean(selectedRideAlong)
  const isSpeechSessionActive =
    liveSessionState.isActive ||
    liveSessionState.isRecording ||
    liveSessionState.isStreaming

  const transcriptSessions = useMemo<TranscriptSession[]>(
    () => {
      const mappedSessions = sessions.map((session) => {
        const transcriptTurns = (sessionTurnsById[session.id] || [])
          .map((turn) => {
            const text = normalizeTranscriptText(turn.transcript || turn.utterance)
            return {
              id: turn.id,
              turnOrder: turn.turnOrder,
              text,
              createdAt: turn.createdAt || turn.updatedAt || null,
            }
          })
          .filter((turn) => turn.text.length > 0)
          .sort((a, b) => a.turnOrder - b.turnOrder)

        return {
          id: session.id,
          sessionStartTime: session.sessionStartTime,
          turns: transcriptTurns,
        }
      })

      const getSessionSortTime = (sessionStartTime: string | null | undefined) => {
        if (!sessionStartTime) {
          return 0
        }
        const parsed = new Date(sessionStartTime)
        if (Number.isNaN(parsed.getTime())) {
          return 0
        }
        return parsed.getTime()
      }

      return mappedSessions.sort((left, right) => {
        const leftTime = getSessionSortTime(left.sessionStartTime)
        const rightTime = getSessionSortTime(right.sessionStartTime)
        if (leftTime === rightTime) {
          return left.id.localeCompare(right.id)
        }
        return leftTime - rightTime
      })
    },
    [sessions, sessionTurnsById]
  )

  const totalRecordedDurationSeconds = useMemo(() => {
    const currentLiveSessionId = liveSessionState.sessionId
    const currentLiveSessionDuration =
      typeof liveSessionState.durationSeconds === 'number' &&
      Number.isFinite(liveSessionState.durationSeconds) &&
      liveSessionState.durationSeconds > 0
        ? liveSessionState.durationSeconds
        : 0

    const sessionDurationTotal = sessions.reduce((total, session) => {
      const explicitDuration =
        typeof session.recordingDurationSeconds === 'number' &&
        Number.isFinite(session.recordingDurationSeconds) &&
        session.recordingDurationSeconds > 0
          ? session.recordingDurationSeconds
          : null

      if (explicitDuration !== null) {
        return total + explicitDuration
      }

      if (currentLiveSessionId && session.id === currentLiveSessionId && currentLiveSessionDuration > 0) {
        return total + currentLiveSessionDuration
      }

      const startedAtMs = parseIsoTimestampMs(session.sessionStartTime)
      const endedAtMs = parseIsoTimestampMs(session.sessionEndTime)
      if (startedAtMs !== null && endedAtMs !== null && endedAtMs >= startedAtMs) {
        return total + Math.round((endedAtMs - startedAtMs) / 1000)
      }

      return total
    }, 0)

    const includesCurrentLiveSession =
      Boolean(currentLiveSessionId) &&
      sessions.some((session) => session.id === currentLiveSessionId)
    const totalSeconds =
      !includesCurrentLiveSession && currentLiveSessionDuration > 0
        ? sessionDurationTotal + currentLiveSessionDuration
        : sessionDurationTotal

    return totalSeconds > 0 ? Math.round(totalSeconds) : null
  }, [liveSessionState.durationSeconds, liveSessionState.sessionId, sessions])

  const resetLiveTranscriptPreview = useCallback(() => {
    setLiveTranscriptPreview(null)
  }, [])

  const setLatestTranscriptPreview = useCallback((text: string) => {
    const normalized = normalizeTranscriptText(text)
    if (!normalized) {
      return
    }
    setLiveTranscriptPreview(normalized)
  }, [])

  const loadRideAlongs = useCallback(async () => {
    if (!userId) {
      setScheduledRideAlongs([])
      setActiveRideAlong(null)
      setSelectedRideAlong(null)
      setSessions([])
      setSessionTurnsById({})
      resetLiveTranscriptPreview()
      setViewMode('list')
      sessionVersionByIdRef.current = {}
      return
    }

    setIsLoadingList(true)
    try {
      const [scheduled, active] = await Promise.all([
        listRideAlongsByUser({ userId, status: 'SCHEDULED' }),
        getActiveRideAlongByUser(userId),
      ])

      setScheduledRideAlongs(scheduled)
      setActiveRideAlong(active)

      setSelectedRideAlong((current) => {
        if (active) {
          return active
        }
        if (current) {
          const nextMatch = scheduled.find((item) => item.id === current.id)
          return nextMatch || null
        }
        return null
      })

      setViewMode((current) => {
        if (active) {
          return 'rideAlong'
        }
        if (current === 'rideAlong' && selectedRideAlongId) {
          const stillExists = scheduled.some((item) => item.id === selectedRideAlongId)
          return stillExists ? 'rideAlong' : 'list'
        }
        return current
      })
    } finally {
      setIsLoadingList(false)
    }
  }, [resetLiveTranscriptPreview, selectedRideAlongId, userId])

  useEffect(() => {
    setIsDomReady(true)
  }, [])

  useEffect(() => {
    if (homeTrigger > 0) {
      setSelectedRideAlong(null)
      setIsDetailsFlyoutOpen(false)
      setSessions([])
      setSessionTurnsById({})
      resetLiveTranscriptPreview()
      setViewMode('list')
    }
  }, [homeTrigger, resetLiveTranscriptPreview])

  useEffect(() => {
    if (isSpeechSessionActive) {
      return
    }
    if (!liveTranscriptPreview) {
      return
    }
    resetLiveTranscriptPreview()
  }, [isSpeechSessionActive, liveTranscriptPreview, resetLiveTranscriptPreview])

  const loadSessions = useCallback(async (rideAlongId: string) => {
    const data = await listRideAlongSessionsByRideAlong(rideAlongId)
    const nextVersionMap: Record<string, number> = {}
    data.forEach((session) => {
      if (typeof session._version === 'number') {
        nextVersionMap[session.id] = session._version
      }
    })
    sessionVersionByIdRef.current = nextVersionMap
    setSessions(data)

    const turnEntries = await Promise.all(
      data.map(async (session) => {
        try {
          const turns = await listRideAlongTurnsBySession(session.id)
          return [session.id, turns] as const
        } catch (error) {
          console.warn(
            '[RideAlongs] Failed to load transcript turns for session:',
            session.id,
            error
          )
          return [session.id, [] as RideAlongSessionTurn[]] as const
        }
      })
    )
    setSessionTurnsById(Object.fromEntries(turnEntries))
  }, [])

  const syncLiveSessionState = useCallback(async () => {
    try {
      const state = await AudioRecording.getRideAlongSessionState()
      const sessionId = state.sessionId || null
      setLiveSessionState({
        isActive: Boolean(state.isActive),
        isStreaming: Boolean(state.isStreaming),
        isRecording: Boolean(state.isRecording),
        isPaused: Boolean(state.isPaused),
        sessionId,
        durationSeconds: state.duration ?? null,
      })
      return state
    } catch (error) {
      setLiveSessionState(defaultLiveSessionState)
      return null
    }
  }, [])

  const refreshCurrentRideAlongData = useCallback(async () => {
    await loadRideAlongs()
    if (selectedRideAlongId) {
      await loadSessions(selectedRideAlongId)
    }
  }, [loadRideAlongs, loadSessions, selectedRideAlongId])

  const resetVoiceDiagnostics = useCallback(() => {
    voiceSamplesRef.current = []
    rollingPeakRef.current = 0
    rollingAverageLevelRef.current = 0
    previousLevelRef.current = 0
    currentAudioLevelRef.current = 0
    currentAudioSpectrumRef.current = null
    supportsSpectrumLevelsRef.current = null
    setAudioSpectrum(null)
    setVoiceDiagnostics(getInitialVoiceDiagnostics())
  }, [])

  const readCurrentAudioSignal = useCallback(async () => {
    if (
      supportsSpectrumLevelsRef.current !== false &&
      typeof AudioRecording.getSpectrumLevels === 'function'
    ) {
      try {
        const spectrumResult = await AudioRecording.getSpectrumLevels({
          bands: WAVEFORM_SPECTRUM_BAND_COUNT,
          minFrequencyHz: WAVEFORM_SPECTRUM_MIN_FREQUENCY_HZ,
          maxFrequencyHz: WAVEFORM_SPECTRUM_MAX_FREQUENCY_HZ,
        })

        if (spectrumResult && Array.isArray(spectrumResult.bands)) {
          supportsSpectrumLevelsRef.current = true
          const spectrum = spectrumResult.bands
            .slice(0, WAVEFORM_SPECTRUM_BAND_COUNT)
            .map((value) => clampLevel(Number(value || 0), 0, 1))

          while (spectrum.length < WAVEFORM_SPECTRUM_BAND_COUNT) {
            spectrum.push(0)
          }

          const level = Number(spectrumResult.level || 0)
          const spectrumPeak = spectrum.length > 0 ? Math.max(...spectrum) : 0
          const spectrumAverage = average(spectrum)
          const nonTrivialBandCount = spectrum.filter((band) => band >= 0.0025).length
          const hasUsableSpectrum =
            nonTrivialBandCount >= 4 ||
            spectrumPeak >= 0.007 ||
            (level <= SPEECH_START_LEVEL_THRESHOLD && spectrumAverage > 0.0008)

          return {
            level,
            spectrum: hasUsableSpectrum ? spectrum : null,
          }
        }
      } catch (error) {
        supportsSpectrumLevelsRef.current = false
      }
    }

    const levels = await AudioRecording.getLevels()
    return {
      level: Number(levels.level || 0),
      spectrum: null,
    }
  }, [])

  const updateVoiceDiagnostics = useCallback(
    ({
      level,
      now,
      isMonitoring,
      thresholdCrossingLevel,
      sessionStartLevel,
      speechIndicatorCount,
      speechIndicatorRequiredCount,
      speechIndicatorTotalCount,
    }: {
      level: number
      now: number
      isMonitoring: boolean
      thresholdCrossingLevel?: number
      sessionStartLevel?: number
      speechIndicatorCount?: number
      speechIndicatorRequiredCount?: number
      speechIndicatorTotalCount?: number
    }) => {
      const samples = voiceSamplesRef.current
      samples.push({ timestamp: now, level })
      while (
        samples.length > 0 &&
        now - samples[0].timestamp > VOICE_DIAGNOSTIC_WINDOW_MS
      ) {
        samples.shift()
      }

      if (level > rollingPeakRef.current) {
        rollingPeakRef.current = level
      }

      let rollingMin: number | null = null
      let rollingMax: number | null = null
      let rollingAverage: number | null = null

      if (samples.length > 0) {
        let minLevel = Number.POSITIVE_INFINITY
        let maxLevel = Number.NEGATIVE_INFINITY
        let total = 0

        samples.forEach((sample) => {
          if (sample.level < minLevel) {
            minLevel = sample.level
          }
          if (sample.level > maxLevel) {
            maxLevel = sample.level
          }
          total += sample.level
        })

        rollingMin = minLevel
        rollingMax = maxLevel
        rollingAverage = total / samples.length
      }

      rollingAverageLevelRef.current = rollingAverage ?? 0

      const suggestedStartThreshold =
        rollingMin !== null && rollingMax !== null
          ? clampLevel(
              rollingMin + (rollingMax - rollingMin) * 0.28,
              SPEECH_START_LEVEL_THRESHOLD * 0.75,
              Math.max(
                SPEECH_START_LEVEL_THRESHOLD + 0.01,
                rollingMax * 0.7
              )
            )
          : null

      setVoiceDiagnostics((current) => ({
        currentLevel: level,
        rollingMin,
        rollingMax,
        rollingAverage,
        rollingPeak: rollingPeakRef.current || null,
        lastThresholdCrossingLevel:
          thresholdCrossingLevel ?? current.lastThresholdCrossingLevel,
        lastSessionStartLevel: sessionStartLevel ?? current.lastSessionStartLevel,
        suggestedStartThreshold,
        speechIndicatorCount:
          speechIndicatorCount ?? current.speechIndicatorCount,
        speechIndicatorRequiredCount:
          speechIndicatorRequiredCount ?? current.speechIndicatorRequiredCount,
        speechIndicatorTotalCount:
          speechIndicatorTotalCount ?? current.speechIndicatorTotalCount,
        levelBand: getVoiceLevelBand(level, isMonitoring),
        sampleWindowSeconds: VOICE_DIAGNOSTIC_WINDOW_SECONDS,
      }))
    },
    []
  )

  useEffect(() => {
    if (!selectedRideAlong || !clientId || !userId) {
      return
    }

    let isCancelled = false
    let beginHandle: { remove: () => Promise<void> } | null = null
    let turnHandle: { remove: () => Promise<void> } | null = null
    let errorHandle: { remove: () => Promise<void> } | null = null

    const attachListeners = async () => {
      beginHandle = await AudioRecording.addListener('rideAlongSessionBegin', async (event) => {
        if (isCancelled) {
          return
        }

        const sessionId = event?.sessionId
        if (
          !sessionId ||
          handledSessionStartRef.current.has(sessionId) ||
          inFlightSessionStartRef.current.has(sessionId)
        ) {
          return
        }

        inFlightSessionStartRef.current.add(sessionId)
        try {
          const startedAt = event.startedAt || new Date().toISOString()
          const startResponse = await postRideAlongSessionStart({
            rideAlongId: event.rideAlongId || selectedRideAlong.id,
            clientId: event.clientId || clientId,
            userId: event.userId || userId,
            assemblySessionId: sessionId,
            startedAt,
          })
          const responseVersion = startResponse.session?._version
          if (typeof responseVersion === 'number') {
            sessionVersionByIdRef.current = {
              ...sessionVersionByIdRef.current,
              [sessionId]: responseVersion,
            }
          }

          handledSessionStartRef.current.add(sessionId)
          await loadSessions(selectedRideAlong.id)
        } catch (error) {
          setActionError(getErrorMessage(error, 'Unable to save ride along session start.'))
        } finally {
          inFlightSessionStartRef.current.delete(sessionId)
        }
      })

      turnHandle = await AudioRecording.addListener('rideAlongTurn', async (event) => {
        if (isCancelled) {
          return
        }

        const eventRecord =
          event && typeof event === 'object'
            ? (event as Record<string, unknown>)
            : {}
        const sessionId = event?.sessionId || ''
        const turn = event?.turn as Record<string, unknown> | undefined
        if (!sessionId || !turn) {
          return
        }

        const transcriptText = extractLiveTranscriptText(eventRecord, turn)
        if (transcriptText) {
          setLatestTranscriptPreview(transcriptText)
        }

        const endOfTurn = Boolean(turn.end_of_turn ?? turn.endOfTurn ?? false)
        const turnIsFormatted = Boolean(
          turn.turn_is_formatted ?? turn.turnIsFormatted ?? false
        )
        if (!endOfTurn || !turnIsFormatted) {
          return
        }

        if (transcriptText) {
          const turnOrderRaw = turn.turn_order ?? turn.turnOrder ?? event.turnId ?? null
          const parsedTurnOrder = Number(turnOrderRaw)
          if (Number.isFinite(parsedTurnOrder)) {
            const rideAlongId = event.rideAlongId || selectedRideAlong.id
            const resolvedClientId = event.clientId || clientId
            const resolvedUserId = event.userId || userId
            const nowIso = new Date().toISOString()
            const createdAtRaw = turn.createdAt ?? turn.created_at ?? eventRecord.createdAt
            const createdAt =
              typeof createdAtRaw === 'string' && createdAtRaw.trim().length > 0
                ? createdAtRaw
                : nowIso
            const turnIdRaw = turn.id ?? turn.turn_id
            const resolvedTurnId =
              typeof turnIdRaw === 'string' && turnIdRaw.trim().length > 0
                ? turnIdRaw
                : `${sessionId}:${parsedTurnOrder}`

            setSessionTurnsById((current) => {
              const currentTurns = current[sessionId] || []
              const nextTurn: RideAlongSessionTurn = {
                id: resolvedTurnId,
                RideAlongSessionID: sessionId,
                RideAlongID: rideAlongId,
                ClientID: resolvedClientId,
                UserID: resolvedUserId,
                turnOrder: parsedTurnOrder,
                turnIsFormatted: true,
                endOfTurn: true,
                transcript: transcriptText,
                utterance:
                  typeof turn.utterance === 'string' ? turn.utterance : transcriptText,
                createdAt,
                updatedAt: nowIso,
              }

              const existingIndex = currentTurns.findIndex(
                (existingTurn) =>
                  existingTurn.id === resolvedTurnId ||
                  existingTurn.turnOrder === parsedTurnOrder
              )
              const nextTurns =
                existingIndex >= 0
                  ? currentTurns.map((existingTurn, index) =>
                      index === existingIndex
                        ? { ...existingTurn, ...nextTurn }
                        : existingTurn
                    )
                  : [...currentTurns, nextTurn].sort(
                      (left, right) => left.turnOrder - right.turnOrder
                    )

              return {
                ...current,
                [sessionId]: nextTurns,
              }
            })
          }
        }

        const turnOrder = turn.turn_order ?? turn.turnOrder ?? event.turnId ?? 'na'
        const identity = `${sessionId}:${String(turnOrder)}:final`
        if (handledTurnRef.current.has(identity)) {
          return
        }
        handledTurnRef.current.add(identity)

        try {
          await postRideAlongSessionTurns({
            sessionId,
            rideAlongId: event.rideAlongId || selectedRideAlong.id,
            clientId: event.clientId || clientId,
            userId: event.userId || userId,
            turns: [turn],
          })
        } catch (error) {
          handledTurnRef.current.delete(identity)
          setActionError(getErrorMessage(error, 'Unable to save ride along turn.'))
        }
      })

      errorHandle = await AudioRecording.addListener('rideAlongSessionError', (event) => {
        if (isCancelled) {
          return
        }
        const message =
          event?.message && event.message.trim().length > 0
            ? event.message
            : 'Streaming connection encountered an error.'
        setActionError(message)
      })
    }

    void attachListeners()
    return () => {
      isCancelled = true
      if (beginHandle) {
        void beginHandle.remove()
      }
      if (turnHandle) {
        void turnHandle.remove()
      }
      if (errorHandle) {
        void errorHandle.remove()
      }
    }
  }, [clientId, loadSessions, selectedRideAlong, setLatestTranscriptPreview, userId])

  const startSpeechSession = useCallback(async () => {
    if (!selectedRideAlong || !clientId || !userId) {
      return
    }
    if (selectedRideAlong.status !== 'LIVE') {
      return
    }

    const monitorState = monitorStateRef.current
    if (monitorState.isStartingSession || monitorState.isStoppingSession) {
      return
    }

    monitorState.isStartingSession = true
    try {
      const tokenPayload = await createAssemblyStreamingToken({
        expiresInSeconds: 600,
        maxSessionDurationSeconds: 10800,
        rideAlongId: selectedRideAlong.id,
      })

      if (!tokenPayload.token) {
        throw new Error('Assembly token request returned an empty token.')
      }

      const keytermsPrompt = Array.isArray(tokenPayload.keytermsPrompt)
        ? tokenPayload.keytermsPrompt
        : []

      const apiBaseUrl = getRideAlongApiBaseUrl()
      if (!apiBaseUrl) {
        throw new Error('Connections API base URL is missing from Amplify config.')
      }
      const apiAuthToken = await getApiAuthToken()

      const result = await AudioRecording.startRideAlongSession({
        token: tokenPayload.token,
        apiBaseUrl,
        apiAuthToken,
        rideAlongId: selectedRideAlong.id,
        clientId,
        userId,
        keytermsPrompt,
        sampleRate: 16000,
        formatTurns: true,
        preRollMs: PRE_ROLL_BUFFER_MS,
        filename: `ridealong-${Date.now()}.m4a`,
      })

      if (!result.success) {
        throw new Error(result.message || 'Unable to start speech session.')
      }

      await wait(700)
      await refreshCurrentRideAlongData()
      await syncLiveSessionState()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to start speech session.')
    } finally {
      monitorState.isStartingSession = false
    }
  }, [
    clientId,
    refreshCurrentRideAlongData,
    selectedRideAlong,
    syncLiveSessionState,
    userId,
  ])

  const stopCurrentSpeechSession = useCallback(
    async (terminationReason: string) => {
      const monitorState = monitorStateRef.current
      if (monitorState.isStoppingSession || monitorState.isStartingSession) {
        return
      }

      monitorState.isStoppingSession = true
      setIsStoppingSession(true)
      try {
        const result = await AudioRecording.stopRideAlongSession({
          terminationReason,
        })
        if (!result.success) {
          throw new Error(result.message || 'Unable to stop speech session.')
        }

        const sessionId = result.sessionId || liveSessionState.sessionId || undefined
        if (sessionId && selectedRideAlong) {
          const sessionRecord = sessions.find((item) => item.id === sessionId) || null
          let sessionVersion: number | undefined = sessionVersionByIdRef.current[sessionId]
          if (typeof sessionVersion !== 'number') {
            sessionVersion = sessionRecord?._version ?? undefined
          }
          if (typeof sessionVersion !== 'number') {
            const latestSessions = await listRideAlongSessionsByRideAlong(selectedRideAlong.id)
            const latestMatch = latestSessions.find((item) => item.id === sessionId) || null
            sessionVersion = latestMatch?._version ?? undefined
            if (typeof sessionVersion === 'number') {
              sessionVersionByIdRef.current = {
                ...sessionVersionByIdRef.current,
                [sessionId]: sessionVersion,
              }
            }
          }
          let uploadWarning: string | null = null
          const shouldAttemptWebUpload =
            typeof result.filePath === 'string' &&
            /^(blob:|data:|https?:)/.test(result.filePath)
          const hasNativeFilePath =
            typeof result.filePath === 'string' &&
            result.filePath.length > 0 &&
            !/^(blob:|data:|https?:)/.test(result.filePath)
          const hasBase64Recording =
            typeof result.base64Data === 'string' && result.base64Data.length > 0
          if (shouldAttemptWebUpload || hasBase64Recording || hasNativeFilePath) {
            try {
              const uploadData = await getRideAlongRecordingUploadUrl({
                sessionId,
                clientId: selectedRideAlong.ClientID,
                rideAlongId: selectedRideAlong.id,
                contentType: result.mimeType || 'audio/webm',
              })

              if (uploadData.signedUrl) {
                if (hasNativeFilePath && result.filePath) {
                  const uploadResult = await AudioRecording.uploadRideAlongRecording({
                    signedUrl: uploadData.signedUrl,
                    filePath: result.filePath,
                  })
                  if (!uploadResult.success) {
                    throw new Error(uploadResult.message ?? 'Native upload failed')
                  }
                } else {
                  let recordingBlob: Blob | null = null
                  if (shouldAttemptWebUpload && result.filePath) {
                    const recordingResponse = await fetch(result.filePath)
                    if (recordingResponse.ok) {
                      recordingBlob = await recordingResponse.blob()
                    }
                  } else if (hasBase64Recording && result.base64Data) {
                    const byteCharacters = atob(result.base64Data)
                    const byteNumbers = new Array(byteCharacters.length)
                    for (let index = 0; index < byteCharacters.length; index += 1) {
                      byteNumbers[index] = byteCharacters.charCodeAt(index)
                    }
                    recordingBlob = new Blob([new Uint8Array(byteNumbers)], {
                      type: result.mimeType || 'audio/m4a',
                    })
                  }

                  if (recordingBlob) {
                    await uploadRideAlongRecordingBlob({
                      signedUrl: uploadData.signedUrl,
                      blob: recordingBlob,
                      contentType: result.mimeType || 'audio/m4a',
                    })
                  }
                }
              }
            } catch (uploadError) {
              uploadWarning = 'Session ended, but recording upload failed.'
              console.warn('[RideAlongs] Recording upload warning:', uploadError)
            }
          }

          await postRideAlongSessionFinish({
            sessionId,
            rideAlongId: selectedRideAlong.id,
            endedAt: new Date().toISOString(),
            terminationReason,
            duration: result.duration,
            sessionVersion: typeof sessionVersion === 'number' ? sessionVersion : undefined,
          })

          if (uploadWarning) {
            setActionError(uploadWarning)
          }
        }

        await wait(900)
        await refreshCurrentRideAlongData()
        await syncLiveSessionState()
      } catch (error) {
        setActionError(getErrorMessage(error, 'Unable to stop current session.'))
      } finally {
        monitorState.isStoppingSession = false
        monitorState.silenceStartedAt = null
        monitorState.speechStartedAt = null
        setSilenceSeconds(0)
        setIsStoppingSession(false)
      }
    },
    [
      liveSessionState.sessionId,
      refreshCurrentRideAlongData,
      sessions,
      selectedRideAlong,
      syncLiveSessionState,
    ]
  )

  const handleStartRideAlong = useCallback(async () => {
    if (!selectedRideAlong) {
      return
    }

    setActionError(null)
    setSessionTurnsById({})
    resetLiveTranscriptPreview()
    setIsBusy(true)
    try {
      await markRideAlongAsLive(selectedRideAlong.id)
      await loadRideAlongs()
      await loadSessions(selectedRideAlong.id)
      setViewMode('rideAlong')
    } catch (error) {
      console.error('[RideAlongs] Failed to start ride along:', error)
      setActionError(getErrorMessage(error, 'Unable to start ride along.'))
    } finally {
      setIsBusy(false)
    }
  }, [loadRideAlongs, loadSessions, resetLiveTranscriptPreview, selectedRideAlong])

  const handlePauseRideAlong = useCallback(async () => {
    if (!selectedRideAlong || selectedRideAlong.status !== 'LIVE') {
      return
    }

    setActionError(null)
    setIsBusy(true)
    try {
      // Flip local state early so speech monitoring halts immediately.
      setSelectedRideAlong((current) =>
        current && current.id === selectedRideAlong.id
          ? { ...current, status: 'PAUSED' }
          : current
      )

      if (
        liveSessionState.isActive ||
        liveSessionState.isRecording ||
        liveSessionState.isStreaming
      ) {
        await stopCurrentSpeechSession('RIDEALONG_PAUSED')
        const stateAfterStop = await syncLiveSessionState()
        const isStillRunning = Boolean(
          stateAfterStop?.isActive || stateAfterStop?.isRecording || stateAfterStop?.isStreaming
        )
        if (isStillRunning) {
          throw new Error(
            'Unable to pause ride along while the current recording session is still active.'
          )
        }
      }

      await markRideAlongAsPaused(selectedRideAlong.id)
      await loadRideAlongs()
      await loadSessions(selectedRideAlong.id)
      await syncLiveSessionState()
    } catch (error) {
      setActionError(getErrorMessage(error, 'Unable to pause ride along.'))
      await loadRideAlongs()
    } finally {
      setIsBusy(false)
    }
  }, [
    liveSessionState.isActive,
    liveSessionState.isRecording,
    liveSessionState.isStreaming,
    loadRideAlongs,
    loadSessions,
    selectedRideAlong,
    stopCurrentSpeechSession,
    syncLiveSessionState,
  ])

  const handleResumeRideAlong = useCallback(async () => {
    if (!selectedRideAlong || selectedRideAlong.status !== 'PAUSED') {
      return
    }

    setActionError(null)
    setIsBusy(true)
    try {
      await markRideAlongAsResumed(selectedRideAlong.id)
      await loadRideAlongs()
      await loadSessions(selectedRideAlong.id)
      await syncLiveSessionState()
    } catch (error) {
      setActionError(getErrorMessage(error, 'Unable to resume ride along.'))
    } finally {
      setIsBusy(false)
    }
  }, [loadRideAlongs, loadSessions, selectedRideAlong, syncLiveSessionState])

  const handleCompleteRideAlong = useCallback(async () => {
    if (!selectedRideAlong) {
      return
    }

    setActionError(null)
    resetLiveTranscriptPreview()
    setIsBusy(true)
    try {
      if (
        liveSessionState.isActive ||
        liveSessionState.isRecording ||
        liveSessionState.isStreaming
      ) {
        await stopCurrentSpeechSession('RIDEALONG_COMPLETED')
      }
      await markRideAlongAsEnded(selectedRideAlong.id)
      await loadRideAlongs()
      setSelectedRideAlong(null)
      setSessions([])
      setSessionTurnsById({})
      sessionVersionByIdRef.current = {}
      setIsDetailsFlyoutOpen(false)
      setViewMode('list')
    } catch (error) {
      setActionError(getErrorMessage(error, 'Unable to complete ride along.'))
    } finally {
      setIsBusy(false)
    }
  }, [
    liveSessionState.isActive,
    liveSessionState.isRecording,
    liveSessionState.isStreaming,
    loadRideAlongs,
    resetLiveTranscriptPreview,
    selectedRideAlong,
    stopCurrentSpeechSession,
  ])

  const handleRequestCompleteRideAlong = useCallback(() => {
    if (!selectedRideAlong || selectedRideAlong.status === 'ENDED' || isBusy) {
      return
    }

    const shouldComplete = window.confirm(
      'Complete this ride along? This will end active monitoring and return to the ride-along list.'
    )
    if (shouldComplete) {
      void handleCompleteRideAlong()
    }
  }, [handleCompleteRideAlong, isBusy, selectedRideAlong])

  useEffect(() => {
    void loadRideAlongs()
  }, [loadRideAlongs])

  useEffect(() => {
    if (viewMode !== 'rideAlong' || !selectedRideAlongId) {
      setSessions([])
      setSessionTurnsById({})
      setIsDetailsFlyoutOpen(false)
      resetLiveTranscriptPreview()
      return
    }
    void loadSessions(selectedRideAlongId)
  }, [loadSessions, resetLiveTranscriptPreview, selectedRideAlongId, viewMode])

  useEffect(() => {
    let cancelled = false

    const tick = async () => {
      if (cancelled) {
        return
      }
      await syncLiveSessionState()
    }

    void tick()
    const interval = window.setInterval(() => {
      void tick()
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [syncLiveSessionState])

  useEffect(() => {
    if (!shouldRenderAudioVisualizer || !selectedRideAlong) {
      setAudioLevel(null)
      setAudioSpectrum(null)
      currentAudioLevelRef.current = 0
      resetVoiceDiagnostics()
      return
    }

    let cancelled = false
    let isPollingLevel = false

    const levelTick = async () => {
      if (cancelled || isPollingLevel) {
        return
      }

      isPollingLevel = true
      try {
        const signal = await readCurrentAudioSignal()

        if (cancelled) {
          return
        }

        const level = Number(signal.level || 0)
        const spectrum =
          signal.spectrum && signal.spectrum.length > 0 ? signal.spectrum : null
        const now = Date.now()
        const speechIndicators = evaluateSpeechIndicators({
          level,
          spectrum,
          ambientLevel: rollingAverageLevelRef.current,
        })
        const thresholdCrossingLevel =
          previousLevelRef.current < SPEECH_START_LEVEL_THRESHOLD &&
          level >= SPEECH_START_LEVEL_THRESHOLD
            ? level
            : undefined
        previousLevelRef.current = level

        currentAudioLevelRef.current = level
        currentAudioSpectrumRef.current = spectrum
        setAudioLevel(level)
        setAudioSpectrum(spectrum)
        updateVoiceDiagnostics({
          level,
          now,
          isMonitoring: shouldRenderAudioVisualizer,
          thresholdCrossingLevel,
          speechIndicatorCount: speechIndicators.indicatorCount,
          speechIndicatorRequiredCount: speechIndicators.requiredCount,
          speechIndicatorTotalCount: speechIndicators.totalCount,
        })
      } catch (error) {
        if (!cancelled) {
          console.warn('[RideAlongs] Level polling failed:', error)
        }
      } finally {
        isPollingLevel = false
      }
    }

    void levelTick()
    const interval = window.setInterval(() => {
      void levelTick()
    }, LEVEL_POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [
    readCurrentAudioSignal,
    resetVoiceDiagnostics,
    selectedRideAlong,
    shouldRenderAudioVisualizer,
    updateVoiceDiagnostics,
  ])

  useEffect(() => {
    if (!shouldMonitorSpeech || !selectedRideAlong) {
      monitorStateRef.current.silenceStartedAt = null
      monitorStateRef.current.speechStartedAt = null
      setSilenceSeconds(0)
      return
    }

    let cancelled = false
    let isPollingState = false

    const monitorTick = async () => {
      if (cancelled || isPollingState) {
        return
      }

      isPollingState = true
      try {
        const state = await AudioRecording.getRideAlongSessionState()
        if (cancelled) {
          return
        }

        const level = currentAudioLevelRef.current
        const spectrum = currentAudioSpectrumRef.current
        const now = Date.now()
        const isSessionActive = Boolean(
          state?.isActive || state?.isRecording || state?.isStreaming
        )
        const speechIndicators = evaluateSpeechIndicators({
          level,
          spectrum,
          ambientLevel: rollingAverageLevelRef.current,
        })
        const strictSpeechDetected = speechIndicators.isLikelySpeech
        const activeSpeechLevelFloor = Math.max(
          SPEECH_START_LEVEL_THRESHOLD * 0.9,
          rollingAverageLevelRef.current + SPEECH_MIN_LEVEL_ABOVE_AMBIENT * 0.66
        )
        const speechDetectedWhileActive =
          strictSpeechDetected || level >= activeSpeechLevelFloor

        setLiveSessionState({
          isActive: Boolean(state?.isActive),
          isStreaming: Boolean(state?.isStreaming),
          isRecording: Boolean(state?.isRecording),
          isPaused: Boolean(state?.isPaused),
          sessionId: state?.sessionId || null,
          durationSeconds: state?.duration ?? null,
        })

        const monitorState = monitorStateRef.current

        if (isSessionActive) {
          monitorState.speechStartedAt = null
          if (speechDetectedWhileActive) {
            monitorState.silenceStartedAt = null
            setSilenceSeconds(0)
          } else {
            if (!monitorState.silenceStartedAt) {
              monitorState.silenceStartedAt = now
            }
            const elapsedMs = now - monitorState.silenceStartedAt
            setSilenceSeconds(elapsedMs / 1000)

            if (elapsedMs >= LONG_PAUSE_MS) {
              await stopCurrentSpeechSession('LONG_SPEAKING_PAUSE')
            }
          }
          return
        }

        monitorState.silenceStartedAt = null
        setSilenceSeconds(0)

        if (strictSpeechDetected) {
          if (!monitorState.speechStartedAt) {
            monitorState.speechStartedAt = now
            return
          }

          const speechDurationMs = now - monitorState.speechStartedAt
          if (speechDurationMs >= MIN_SPEECH_MS) {
            monitorState.speechStartedAt = null
            updateVoiceDiagnostics({
              level,
              now,
              isMonitoring: shouldMonitorSpeech,
              sessionStartLevel: level,
            })
            await startSpeechSession()
          }
          return
        }

        monitorState.speechStartedAt = null
      } catch (error) {
        if (!cancelled) {
          setActionError(
            error instanceof Error
              ? error.message
              : 'Speech monitor failed. Please retry the ride along.'
          )
        }
      } finally {
        isPollingState = false
      }
    }

    void monitorTick()
    const interval = window.setInterval(() => {
      void monitorTick()
    }, SPEECH_MONITOR_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [
    selectedRideAlong,
    shouldMonitorSpeech,
    startSpeechSession,
    stopCurrentSpeechSession,
    updateVoiceDiagnostics,
  ])

  if (!clientId || !userId) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-color-text-muted text-[13px]">
        Client and user context are required to use Ride Alongs.
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="w-full h-full overflow-y-auto flex flex-col bg-transparent">
        <div className="bg-neutral-graphite rounded-b-2xl px-4 pb-4 text-neutral-alabaster" style={{ paddingTop: topContentInset }}>
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-[22px] font-bold">Ride Alongs</h2>
            <button
              type="button"
              onClick={() => { void loadRideAlongs() }}
              className="border border-white/[0.46] rounded-full min-w-[34px] h-[34px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer"
              aria-label="Refresh ride along list"
            >
              <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            </button>
          </div>
          <p className="m-0 text-[13px] text-white/[0.5] mt-1">
            {isLoadingList ? 'Loading...' : `${scheduledRideAlongs.length} job${scheduledRideAlongs.length === 1 ? '' : 's'} assigned`}
          </p>
        </div>

        <div className="px-[14px] py-3 flex flex-col gap-2.5">
          {activeRideAlong ? (
            <button
              type="button"
              onClick={() => {
                setSelectedRideAlong(activeRideAlong)
                setIsDetailsFlyoutOpen(false)
                setViewMode('rideAlong')
              }}
              className="border border-support-positive/[0.28] rounded-2xl bg-support-positive/[0.12] text-color-text text-left px-[14px] py-[13px] cursor-pointer text-[13px] font-semibold"
            >
              You have an active ride along in progress. Tap to resume.
            </button>
          ) : null}
          <RideAlongsList
            rideAlongs={scheduledRideAlongs}
            onSelect={(rideAlong) => {
              setSelectedRideAlong(rideAlong)
              setIsDetailsFlyoutOpen(false)
              setViewMode('rideAlong')
            }}
            isLoading={isLoadingList}
          />
        </div>
      </div>
    )
  }

  if (!selectedRideAlong) {
    return (
      <div className="w-full h-full flex items-center justify-center text-color-text-muted text-[13px]">
        No ride along selected.
      </div>
    )
  }

  const activeOverlay = (
    <div className="fixed top-0 left-0 w-screen h-dvh z-[6000] overflow-hidden bg-white" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)' }}>
      <div className="relative w-full h-full overflow-hidden bg-white pt-2 px-3 flex flex-col gap-2.5">
        <RideAlongActiveHeader
          rideAlong={selectedRideAlong}
          isSessionActive={liveSessionState.isActive}
          totalDurationSeconds={totalRecordedDurationSeconds}
          isDetailsOpen={isDetailsFlyoutOpen}
          onOpenDetails={() => setIsDetailsFlyoutOpen(true)}
          onCloseDetails={() => setIsDetailsFlyoutOpen(false)}
          onBack={() => {
            setIsDetailsFlyoutOpen(false)
            setViewMode('list')
          }}
        />

        <RideAlongActiveControls
          rideAlongStatus={selectedRideAlong.status}
          isMonitoringEnabled={shouldMonitorSpeech}
          isRideAlongPaused={selectedRideAlong.status === 'PAUSED'}
          isSessionActive={liveSessionState.isActive}
          currentLevel={audioLevel}
          spectrumLevels={audioSpectrum}
          liveTranscriptPreviewText={liveTranscriptPreview}
          transcriptSessions={transcriptSessions}
          speechStartThreshold={SPEECH_START_LEVEL_THRESHOLD}
          silenceSeconds={silenceSeconds}
          onStartRideAlong={handleStartRideAlong}
          onPauseRideAlong={handlePauseRideAlong}
          onResumeRideAlong={handleResumeRideAlong}
          onCompleteRideAlong={handleRequestCompleteRideAlong}
          isBusy={isBusy}
          isStoppingSession={isStoppingSession}
          error={actionError}
        />
      </div>
    </div>
  )

  if (!isDomReady) {
    return null
  }

  return createPortal(activeOverlay, document.body)
}
