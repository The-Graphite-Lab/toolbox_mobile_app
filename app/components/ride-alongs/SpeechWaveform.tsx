'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  clampLevel,
  normalizeLevelForWaveform,
} from './audioLevelTuning'

type SpeechWaveformProps = {
  level: number | null
  spectrumLevels: number[] | null
  isMonitoringEnabled: boolean
}

const BAR_COUNT = 19
const FRAME_INTERVAL_MS = 56
const LEVEL_ATTACK_SMOOTHING = 0.68
const LEVEL_RELEASE_SMOOTHING = 0.26
const BAND_ATTACK_SMOOTHING = 0.82
const BAND_RELEASE_SMOOTHING = 0.24
const SPECTRUM_NOISE_FLOOR = 0.04
const SPECTRUM_EXPONENT = 1.06
const SPECTRUM_TRANSIENT_GAIN = 1.2
const SPECTRUM_CONTRAST_GAIN = 0.96
const SILENCE_DECAY = 0.88
const REST_BAR_HEIGHT_PX = 16
const MAX_BAR_HEIGHT_PX = 108
const REST_BAR_OPACITY = 0.28

const sampleSpectrumBand = (spectrum: number[], ratio: number) => {
  if (spectrum.length === 0) {
    return 0
  }
  if (spectrum.length === 1) {
    return spectrum[0]
  }

  const boundedRatio = clampLevel(ratio, 0, 1)
  const scaledIndex = boundedRatio * (spectrum.length - 1)
  const lowerIndex = Math.floor(scaledIndex)
  const upperIndex = Math.min(spectrum.length - 1, lowerIndex + 1)
  const interpolation = scaledIndex - lowerIndex

  return (
    spectrum[lowerIndex] * (1 - interpolation) +
    spectrum[upperIndex] * interpolation
  )
}

const createStableBandDistribution = (count: number) => {
  const goldenRatio = 0.61803398875
  return Array.from({ length: count }, (_, index) =>
    (index * goldenRatio + 0.23) % 1
  )
}

export default function SpeechWaveform({
  level,
  spectrumLevels,
  isMonitoringEnabled,
}: SpeechWaveformProps) {
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(0))
  const targetLevelRef = useRef(0)
  const targetSpectrumRef = useRef<number[] | null>(null)
  const smoothedLevelRef = useRef(0)
  const previousSpectrumRef = useRef<number[]>(
    Array(BAR_COUNT).fill(0)
  )
  const smoothedBandLevelsRef = useRef<number[]>(
    Array(BAR_COUNT).fill(0)
  )
  const bandDistributionRef = useRef<number[]>(
    createStableBandDistribution(BAR_COUNT)
  )
  const fallbackWeightRef = useRef<number[]>(
    bandDistributionRef.current.map((ratio, index) =>
      0.68 + (((ratio * 0.66 + index * 0.07) % 1) * 0.36)
    )
  )

  useEffect(() => {
    targetLevelRef.current = clampLevel(level ?? 0, 0, 1)
  }, [level])

  useEffect(() => {
    if (!spectrumLevels || spectrumLevels.length === 0) {
      targetSpectrumRef.current = null
      previousSpectrumRef.current = Array(BAR_COUNT).fill(0)
      return
    }

    targetSpectrumRef.current = spectrumLevels.map((value) =>
      clampLevel(value, 0, 1)
    )
  }, [spectrumLevels])

  useEffect(() => {
    let animationFrame: number | null = null
    let lastTick = 0

    const animate = (timestamp: number) => {
      if (timestamp - lastTick >= FRAME_INTERVAL_MS) {
        lastTick = timestamp

        const normalizedTarget = normalizeLevelForWaveform(
          isMonitoringEnabled ? targetLevelRef.current : 0
        )
        const smoothingFactor =
          normalizedTarget > smoothedLevelRef.current
            ? LEVEL_ATTACK_SMOOTHING
            : LEVEL_RELEASE_SMOOTHING
        smoothedLevelRef.current +=
          (normalizedTarget - smoothedLevelRef.current) * smoothingFactor

        const speechDrive = clampLevel(
          Math.pow(smoothedLevelRef.current, 0.7) * 1.1,
          0,
          1
        )
        const sourceSpectrum = isMonitoringEnabled ? targetSpectrumRef.current : null
        const distributedBars = smoothedBandLevelsRef.current.slice()
        const previousSpectrum = previousSpectrumRef.current.slice()

        for (let index = 0; index < BAR_COUNT; index += 1) {
          const sampleRatio =
            bandDistributionRef.current[index] ?? index / Math.max(1, BAR_COUNT - 1)
          const distributionWeight = fallbackWeightRef.current[index] ?? 1
          const spectrumStep = 0.035
          const sampledSpectrum = sourceSpectrum
            ? sampleSpectrumBand(sourceSpectrum, sampleRatio)
            : clampLevel(speechDrive * distributionWeight, 0, 1)
          const leftSpectrum = sourceSpectrum
            ? sampleSpectrumBand(
                sourceSpectrum,
                clampLevel(sampleRatio - spectrumStep, 0, 1)
              )
            : sampledSpectrum
          const rightSpectrum = sourceSpectrum
            ? sampleSpectrumBand(
                sourceSpectrum,
                clampLevel(sampleRatio + spectrumStep, 0, 1)
              )
            : sampledSpectrum

          const gatedSpectrum = clampLevel(
            (sampledSpectrum - SPECTRUM_NOISE_FLOOR) /
              (1 - SPECTRUM_NOISE_FLOOR),
            0,
            1
          )
          const shapedSpectrum = Math.pow(gatedSpectrum, SPECTRUM_EXPONENT)
          const localAverage = (leftSpectrum + sampledSpectrum + rightSpectrum) / 3
          const contrastBoost = clampLevel(
            sampledSpectrum - localAverage * 0.72,
            0,
            1
          )
          const transientBoost = clampLevel(
            sampledSpectrum - (previousSpectrum[index] ?? 0),
            0,
            1
          )
          previousSpectrum[index] = sampledSpectrum
          const baseLevelGate = Math.pow(smoothedLevelRef.current, 0.6) * 1.15
          const levelGate = clampLevel(
            sourceSpectrum ? baseLevelGate + 0.06 : baseLevelGate,
            0,
            1
          )

          const targetBandLevel = sourceSpectrum
            ? clampLevel(
                (shapedSpectrum * 0.94 +
                  contrastBoost * SPECTRUM_CONTRAST_GAIN +
                  transientBoost * SPECTRUM_TRANSIENT_GAIN) *
                  levelGate *
                  (0.82 + distributionWeight * 0.18),
                0,
                1
              )
            : clampLevel(speechDrive * (0.48 + distributionWeight * 0.52), 0, 1)

          const previousBandLevel = distributedBars[index] ?? 0
          const bandSmoothing =
            targetBandLevel > previousBandLevel
              ? BAND_ATTACK_SMOOTHING
              : BAND_RELEASE_SMOOTHING

          let nextBandLevel =
            previousBandLevel +
            (targetBandLevel - previousBandLevel) * bandSmoothing

          if (speechDrive < 0.015) {
            nextBandLevel *= SILENCE_DECAY
          }

          distributedBars[index] = clampLevel(nextBandLevel, 0, 1)
        }

        previousSpectrumRef.current = previousSpectrum
        smoothedBandLevelsRef.current = distributedBars
        setBars(distributedBars)
      }

      animationFrame = window.requestAnimationFrame(animate)
    }

    animationFrame = window.requestAnimationFrame(animate)
    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [isMonitoringEnabled])

  const barElements = useMemo(
    () =>
      bars.map((barLevel, index) => {
        const height =
          REST_BAR_HEIGHT_PX +
          barLevel * (MAX_BAR_HEIGHT_PX - REST_BAR_HEIGHT_PX)
        const opacity = REST_BAR_OPACITY + barLevel * (1 - REST_BAR_OPACITY)

        return (
          <div
            key={`wave-bar-${index}`}
            style={{
              width: '16px',
              height: `${height}px`,
              borderRadius: '999px',
              backgroundColor: 'var(--color-brand-marigold)',
              opacity,
              boxShadow: '0 1px 2px rgba(36, 41, 101, 0.14)',
            }}
          />
        )
      }),
    [bars]
  )

  return (
    <div style={shellStyle}>
      <div style={barsRowStyle}>{barElements}</div>
    </div>
  )
}

const shellStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  minHeight: '152px',
  borderRadius: '0',
  border: 'none',
  backgroundColor: 'transparent',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  padding: '8px 0',
  overflow: 'hidden',
}

const barsRowStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  gap: '5px',
  paddingBottom: '2px',
}
