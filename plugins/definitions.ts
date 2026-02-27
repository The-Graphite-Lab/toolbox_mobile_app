import type { PluginListenerHandle } from '@capacitor/core'

export interface AudioRecordingPlugin {
  start(options: { filename?: string }): Promise<{ success: boolean; message: string }>
  stop(): Promise<{ success: boolean; filePath?: string; duration?: number; base64Data?: string; mimeType?: string }>
  pause(): Promise<{ success: boolean; message: string }>
  resume(): Promise<{ success: boolean; message: string }>
  getStatus(): Promise<{ isRecording: boolean; isPaused?: boolean; duration?: number; level?: number }>
  getLevels(): Promise<{ level: number }>
  getSpectrumLevels?(options?: {
    bands?: number
    minFrequencyHz?: number
    maxFrequencyHz?: number
  }): Promise<{ level: number; bands: number[] }>
  startRideAlongSession(options: {
    token: string
    apiBaseUrl: string
    apiAuthToken?: string
    rideAlongId: string
    clientId: string
    userId: string
    keytermsPrompt?: string[]
    sampleRate?: number
    formatTurns?: boolean
    preRollMs?: number
    filename?: string
  }): Promise<{ success: boolean; message: string; sessionId?: string }>
  stopRideAlongSession(options?: {
    terminationReason?: string
<<<<<<< Current (Your changes)
  }): Promise<{ success: boolean; message?: string; sessionId?: string; duration?: number; filePath?: string; base64Data?: string; mimeType?: string }>
=======
  }): Promise<{ success: boolean; message?: string; sessionId?: string; duration?: number; filePath?: string; mimeType?: string }>
  uploadRideAlongRecordingToUrl?(options: {
    signedUrl: string
    filePath: string
    contentType?: string
  }): Promise<{ success: boolean }>
>>>>>>> Incoming (Background Agent changes)
  getRideAlongSessionState(): Promise<{
    isActive: boolean
    isStreaming: boolean
    isRecording: boolean
    sessionId?: string
    duration?: number
    isPaused?: boolean
  }>
  addListener(
    eventName: 'rideAlongSessionBegin',
    listenerFunc: (event: {
      sessionId: string
      startedAt: string
      rideAlongId: string
      clientId: string
      userId: string
    }) => void
  ): Promise<PluginListenerHandle>
  addListener(
    eventName: 'rideAlongTurn',
    listenerFunc: (event: {
      sessionId: string
      turnId: string
      turn: Record<string, unknown>
      rideAlongId: string
      clientId: string
      userId: string
    }) => void
  ): Promise<PluginListenerHandle>
  addListener(
    eventName: 'rideAlongSessionStopped',
    listenerFunc: (event: { sessionId: string; stoppedAt: string }) => void
  ): Promise<PluginListenerHandle>
  addListener(
    eventName: 'rideAlongSessionError',
    listenerFunc: (event: { message: string }) => void
  ): Promise<PluginListenerHandle>
  removeAllListeners(): Promise<void>
}

