import { registerPlugin } from '@capacitor/core'

export interface AudioRecordingPlugin {
  start(options: { filename?: string }): Promise<{ success: boolean; message: string }>
  stop(): Promise<{ success: boolean; filePath?: string; duration?: number }>
  pause(): Promise<{ success: boolean; message: string }>
  resume(): Promise<{ success: boolean; message: string }>
  getStatus(): Promise<{ isRecording: boolean; isPaused?: boolean; duration?: number; level?: number }>
  getLevels(): Promise<{ level: number }>
}

const AudioRecording = registerPlugin<AudioRecordingPlugin>('AudioRecording', {
  web: () => import('./AudioRecording.web').then(m => new m.AudioRecordingWeb()),
})

export * from './definitions'
export { AudioRecording }

