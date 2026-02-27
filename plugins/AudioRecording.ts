import { registerPlugin } from '@capacitor/core'
import type { AudioRecordingPlugin } from './definitions'

const AudioRecording = registerPlugin<AudioRecordingPlugin>('AudioRecording', {
  web: () => import('./AudioRecording.web').then(m => new m.AudioRecordingWeb()),
})

export * from './definitions'
export { AudioRecording }
