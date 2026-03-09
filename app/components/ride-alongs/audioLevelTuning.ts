export const SPEECH_START_LEVEL_THRESHOLD = 0.035
export const WAVEFORM_NOISE_FLOOR_LEVEL = 0.14
export const WAVEFORM_SPEECH_PEAK_LEVEL = 0.32

export const clampLevel = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export const normalizeLevelForWaveform = (level: number) =>
  clampLevel(
    (level - WAVEFORM_NOISE_FLOOR_LEVEL) /
      (WAVEFORM_SPEECH_PEAK_LEVEL - WAVEFORM_NOISE_FLOOR_LEVEL),
    0,
    1
  )
