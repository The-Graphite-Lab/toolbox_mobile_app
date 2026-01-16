import { WebPlugin } from '@capacitor/core'
import type { AudioRecordingPlugin } from './definitions'

export class AudioRecordingWeb extends WebPlugin implements AudioRecordingPlugin {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private startTime: number = 0
  private stream: MediaStream | null = null
  private isPaused: boolean = false
  private totalPauseDuration: number = 0
  private pauseStartTime: number = 0

  async start(options: { filename?: string }): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[AudioRecording.web] Starting recording...', options)
      
      // Check if already recording
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        console.warn('[AudioRecording.web] Already recording')
        return { success: false, message: 'Recording already in progress' }
      }

      // Clean up any existing stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }

      // Request microphone access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const error = 'getUserMedia not supported in this browser'
        console.error('[AudioRecording.web]', error)
        return { success: false, message: error }
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('[AudioRecording.web] Microphone access granted')
      
      // Determine best MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg'
      ]
      
      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }
      
      if (!selectedMimeType) {
        selectedMimeType = '' // Use default
      }
      
      console.log('[AudioRecording.web] Using MIME type:', selectedMimeType || 'default')
      
      const recorderOptions: MediaRecorderOptions = {}
      if (selectedMimeType) {
        recorderOptions.mimeType = selectedMimeType
      }

      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions)
      this.audioChunks = []
      this.startTime = Date.now()

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data)
          console.log('[AudioRecording.web] Data chunk received:', event.data.size, 'bytes')
        }
      }

      this.mediaRecorder.onerror = (event: any) => {
        console.error('[AudioRecording.web] MediaRecorder error:', event)
      }

      this.mediaRecorder.onstop = () => {
        console.log('[AudioRecording.web] Recording stopped, total chunks:', this.audioChunks.length)
      }

      this.mediaRecorder.start(1000) // Collect data every second
      this.isPaused = false
      this.totalPauseDuration = 0
      this.pauseStartTime = 0
      console.log('[AudioRecording.web] Recording started successfully')
      
      return { success: true, message: 'Recording started' }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to start recording'
      console.error('[AudioRecording.web] Start error:', error)
      
      // Clean up on error
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }
      
      return { success: false, message: errorMessage }
    }
  }

  async stop(): Promise<{ success: boolean; filePath?: string; duration?: number }> {
    return new Promise((resolve) => {
      console.log('[AudioRecording.web] Stopping recording...')
      
      if (!this.mediaRecorder) {
        console.warn('[AudioRecording.web] No active recorder')
        resolve({ success: false })
        return
      }

      if (this.mediaRecorder.state === 'inactive') {
        console.warn('[AudioRecording.web] Recorder already inactive')
        resolve({ success: false })
        return
      }

      this.mediaRecorder.onstop = () => {
        const totalTime = Date.now() - this.startTime
        const actualDuration = totalTime - this.totalPauseDuration
        const durationSeconds = Math.floor(actualDuration / 1000)
        
        console.log('[AudioRecording.web] Recording stopped, duration:', durationSeconds, 's')
        console.log('[AudioRecording.web] Total chunks:', this.audioChunks.length)
        
        try {
          const audioBlob = new Blob(this.audioChunks, { 
            type: this.mediaRecorder?.mimeType || 'audio/webm' 
          })
          const url = URL.createObjectURL(audioBlob)
          
          console.log('[AudioRecording.web] Audio blob created:', audioBlob.size, 'bytes')
          console.log('[AudioRecording.web] Blob URL:', url)
          
          // Clean up stream
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop())
            this.stream = null
          }
          
          // Reset recorder
          this.mediaRecorder = null
          this.audioChunks = []
          
          resolve({
            success: true,
            filePath: url,
            duration: durationSeconds,
          })
        } catch (error) {
          console.error('[AudioRecording.web] Error creating blob:', error)
          resolve({ success: false })
        }
      }

      this.mediaRecorder.stop()
    })
  }

  async pause(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.mediaRecorder) {
        return { success: false, message: 'No active recording' }
      }

      if (this.mediaRecorder.state !== 'recording') {
        return { success: false, message: 'Not currently recording' }
      }

      if (this.isPaused) {
        return { success: false, message: 'Recording is already paused' }
      }

      this.mediaRecorder.pause()
      this.isPaused = true
      this.pauseStartTime = Date.now()
      
      console.log('[AudioRecording.web] Recording paused')
      return { success: true, message: 'Recording paused' }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to pause recording'
      console.error('[AudioRecording.web] Pause error:', error)
      return { success: false, message: errorMessage }
    }
  }

  async resume(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.mediaRecorder) {
        return { success: false, message: 'No active recording' }
      }

      if (!this.isPaused) {
        return { success: false, message: 'Recording is not paused' }
      }

      if (this.mediaRecorder.state !== 'paused') {
        return { success: false, message: 'Recorder is not in paused state' }
      }

      // Calculate pause duration
      if (this.pauseStartTime > 0) {
        this.totalPauseDuration += Date.now() - this.pauseStartTime
        this.pauseStartTime = 0
      }

      this.mediaRecorder.resume()
      this.isPaused = false
      
      console.log('[AudioRecording.web] Recording resumed')
      return { success: true, message: 'Recording resumed' }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to resume recording'
      console.error('[AudioRecording.web] Resume error:', error)
      return { success: false, message: errorMessage }
    }
  }

  async getStatus(): Promise<{ isRecording: boolean; isPaused?: boolean; duration?: number }> {
    const isRecording = this.mediaRecorder?.state === 'recording' || false
    const isPaused = this.isPaused || this.mediaRecorder?.state === 'paused' || false
    
    let duration: number | undefined = undefined
    if ((isRecording || isPaused) && this.startTime) {
      const totalTime = Date.now() - this.startTime
      const currentPauseTime = this.isPaused && this.pauseStartTime > 0 
        ? Date.now() - this.pauseStartTime 
        : 0
      const actualDuration = totalTime - this.totalPauseDuration - currentPauseTime
      duration = Math.floor(Math.max(0, actualDuration) / 1000)
    }
    
    console.log('[AudioRecording.web] Status check:', { isRecording, isPaused, duration })
    
    return { isRecording: isRecording && !isPaused, isPaused, duration }
  }
}


