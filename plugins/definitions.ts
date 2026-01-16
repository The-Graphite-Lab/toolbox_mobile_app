export interface AudioRecordingPlugin {
  start(options: { filename?: string }): Promise<{ success: boolean; message: string }>
  stop(): Promise<{ success: boolean; filePath?: string; duration?: number }>
  getStatus(): Promise<{ isRecording: boolean; duration?: number }>
}

