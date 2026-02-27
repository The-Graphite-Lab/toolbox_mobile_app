import { WebPlugin } from '@capacitor/core'
import type { AudioRecordingPlugin } from './definitions'

type PreRollChunk = {
  buffer: ArrayBuffer
  durationMs: number
  sampleRate: number
}

export class AudioRecordingWeb extends WebPlugin implements AudioRecordingPlugin {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private startTime: number = 0
  private stream: MediaStream | null = null
  private isPaused: boolean = false
  private totalPauseDuration: number = 0
  private pauseStartTime: number = 0
  private levelAudioContext: AudioContext | null = null
  private levelAnalyser: AnalyserNode | null = null
  private levelSourceNode: MediaStreamAudioSourceNode | null = null
  private levelSourceStream: MediaStream | null = null
  private levelDataArray: Uint8Array<ArrayBuffer> | null = null
  private levelFrequencyDataArray: Uint8Array<ArrayBuffer> | null = null
  private levelMonitorStream: MediaStream | null = null
  private rideAlongSocket: WebSocket | null = null
  private rideAlongSessionId: string | null = null
  private rideAlongIsStreaming: boolean = false
  private rideAlongAudioContext: AudioContext | null = null
  private rideAlongSourceNode: MediaStreamAudioSourceNode | null = null
  private rideAlongProcessorNode: ScriptProcessorNode | null = null
  private rideAlongSilenceGain: GainNode | null = null
  private preRollAudioContext: AudioContext | null = null
  private preRollSourceNode: MediaStreamAudioSourceNode | null = null
  private preRollProcessorNode: ScriptProcessorNode | null = null
  private preRollSilenceGain: GainNode | null = null
  private preRollSourceStream: MediaStream | null = null
  private preRollChunks: PreRollChunk[] = []
  private preRollBufferedMs: number = 0
  private preRollDurationMs: number = 2500

  private createTurnIdentity(sessionId: string, turn: Record<string, any>): string {
    const turnOrder = turn.turn_order ?? turn.turnOrder ?? 'na'
    const transcript = typeof turn.transcript === 'string' ? turn.transcript : ''
    return `${sessionId}:${turnOrder}:${transcript.length}:${transcript.slice(0, 64)}`
  }

  private convertFloatToInt16Buffer(floatData: Float32Array): ArrayBuffer {
    const arrayBuffer = new ArrayBuffer(floatData.length * 2)
    const view = new DataView(arrayBuffer)
    for (let index = 0; index < floatData.length; index += 1) {
      const sample = Math.max(-1, Math.min(1, floatData[index]))
      view.setInt16(
        index * 2,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      )
    }
    return arrayBuffer
  }

  private trimPreRollChunks() {
    if (this.preRollDurationMs <= 0) {
      this.preRollChunks = []
      this.preRollBufferedMs = 0
      return
    }

    while (this.preRollBufferedMs > this.preRollDurationMs && this.preRollChunks.length > 0) {
      const removedChunk = this.preRollChunks.shift()
      if (removedChunk) {
        this.preRollBufferedMs -= removedChunk.durationMs
      }
    }

    if (this.preRollBufferedMs < 0) {
      this.preRollBufferedMs = 0
    }
  }

  private appendPreRollChunk(buffer: ArrayBuffer, sampleRate: number) {
    if (!Number.isFinite(sampleRate) || sampleRate <= 0 || buffer.byteLength <= 0) {
      return
    }

    const sampleCount = buffer.byteLength / 2
    const durationMs = (sampleCount / sampleRate) * 1000
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      return
    }

    this.preRollChunks.push({
      buffer,
      durationMs,
      sampleRate,
    })
    this.preRollBufferedMs += durationMs
    this.trimPreRollChunks()
  }

  private async ensurePreRollCapture(sourceStream: MediaStream): Promise<void> {
    if (this.preRollDurationMs <= 0) {
      return
    }

    if (!this.preRollAudioContext) {
      this.preRollAudioContext = new AudioContext()
    }

    if (this.preRollAudioContext.state === 'suspended') {
      await this.preRollAudioContext.resume()
    }

    const shouldRebuildCapture =
      !this.preRollSourceNode ||
      !this.preRollProcessorNode ||
      !this.preRollSilenceGain ||
      !this.preRollSourceStream ||
      this.preRollSourceStream !== sourceStream ||
      !this.preRollSourceStream.active

    if (!shouldRebuildCapture) {
      return
    }

    if (this.preRollProcessorNode) {
      try {
        this.preRollProcessorNode.disconnect()
      } catch (error) {
        // no-op
      }
    }

    if (this.preRollSourceNode) {
      try {
        this.preRollSourceNode.disconnect()
      } catch (error) {
        // no-op
      }
    }

    if (this.preRollSilenceGain) {
      try {
        this.preRollSilenceGain.disconnect()
      } catch (error) {
        // no-op
      }
    }

    this.preRollSourceNode = this.preRollAudioContext.createMediaStreamSource(sourceStream)
    this.preRollProcessorNode = this.preRollAudioContext.createScriptProcessor(4096, 1, 1)
    this.preRollSilenceGain = this.preRollAudioContext.createGain()
    this.preRollSilenceGain.gain.value = 0

    this.preRollProcessorNode.onaudioprocess = (audioEvent) => {
      if (this.preRollDurationMs <= 0) {
        return
      }

      const channelData = audioEvent.inputBuffer.getChannelData(0)
      if (!channelData || channelData.length === 0) {
        return
      }

      const pcmBuffer = this.convertFloatToInt16Buffer(channelData)
      const sourceSampleRate =
        audioEvent.inputBuffer.sampleRate || this.preRollAudioContext?.sampleRate || 0
      this.appendPreRollChunk(pcmBuffer, sourceSampleRate)
    }

    this.preRollSourceNode.connect(this.preRollProcessorNode)
    this.preRollProcessorNode.connect(this.preRollSilenceGain)
    this.preRollSilenceGain.connect(this.preRollAudioContext.destination)
    this.preRollSourceStream = sourceStream
  }

  private async waitForRideAlongSocketOpen(timeoutMs = 5000): Promise<void> {
    const startedAt = Date.now()
    while (this.rideAlongSocket && this.rideAlongSocket.readyState === WebSocket.CONNECTING) {
      if (Date.now() - startedAt >= timeoutMs) {
        break
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 40)
      })
    }

    if (!this.rideAlongSocket || this.rideAlongSocket.readyState !== WebSocket.OPEN) {
      throw new Error('AssemblyAI websocket did not open in time.')
    }
  }

  private async flushPreRollToRideAlongSocket(expectedSampleRate: number): Promise<void> {
    if (!this.rideAlongSocket || this.rideAlongSocket.readyState !== WebSocket.OPEN) {
      return
    }

    if (this.preRollDurationMs <= 0) {
      return
    }

    const bufferedChunks = this.preRollChunks.slice()
    if (bufferedChunks.length === 0) {
      console.log('[AudioRecording.web] No pre-roll audio buffered.')
      return
    }

    const uniqueSampleRates = Array.from(
      new Set(
        bufferedChunks
          .map((chunk) => Math.round(chunk.sampleRate))
          .filter((sampleRate) => Number.isFinite(sampleRate) && sampleRate > 0)
      )
    )
    const bufferedSampleRate =
      uniqueSampleRates.length > 0 ? uniqueSampleRates[uniqueSampleRates.length - 1] : expectedSampleRate

    if (Math.abs(bufferedSampleRate - expectedSampleRate) > 2) {
      console.warn('[AudioRecording.web] Skipping pre-roll audio due sample rate mismatch.', {
        expectedSampleRate,
        bufferedSampleRate,
      })
      return
    }

    let flushedDurationMs = 0
    let flushedChunkCount = 0
    for (const chunk of bufferedChunks) {
      if (!this.rideAlongSocket || this.rideAlongSocket.readyState !== WebSocket.OPEN) {
        break
      }
      this.rideAlongSocket.send(chunk.buffer)
      flushedDurationMs += chunk.durationMs
      flushedChunkCount += 1
    }

    if (flushedChunkCount > 0) {
      console.log('[AudioRecording.web] Flushed pre-roll audio to AssemblyAI.', {
        chunkCount: flushedChunkCount,
        durationMs: Math.round(flushedDurationMs),
      })
    }
  }

  private stopRideAlongStreamingGraph() {
    if (this.rideAlongProcessorNode) {
      try {
        this.rideAlongProcessorNode.disconnect()
      } catch (error) {
        // no-op
      }
    }
    if (this.rideAlongSourceNode) {
      try {
        this.rideAlongSourceNode.disconnect()
      } catch (error) {
        // no-op
      }
    }
    if (this.rideAlongSilenceGain) {
      try {
        this.rideAlongSilenceGain.disconnect()
      } catch (error) {
        // no-op
      }
    }

    this.rideAlongProcessorNode = null
    this.rideAlongSourceNode = null
    this.rideAlongSilenceGain = null

    if (this.rideAlongAudioContext) {
      try {
        this.rideAlongAudioContext.close()
      } catch (error) {
        // no-op
      }
    }
    this.rideAlongAudioContext = null
  }

  private stopRideAlongSocket() {
    if (this.rideAlongSocket) {
      try {
        this.rideAlongSocket.close()
      } catch (error) {
        // no-op
      }
    }
    this.rideAlongSocket = null
    this.rideAlongIsStreaming = false
  }

  private getRmsLevel(): number {
    if (!this.levelAnalyser || !this.levelDataArray) {
      return 0
    }

    this.levelAnalyser.getByteTimeDomainData(this.levelDataArray)

    let sumSquares = 0
    for (let index = 0; index < this.levelDataArray.length; index += 1) {
      const centered = (this.levelDataArray[index] - 128) / 128
      sumSquares += centered * centered
    }

    const rms = Math.sqrt(sumSquares / this.levelDataArray.length)
    return Math.min(1, rms * 4.5)
  }

  private getSpeechBands(options?: {
    bands?: number
    minFrequencyHz?: number
    maxFrequencyHz?: number
  }): number[] {
    if (
      !this.levelAnalyser ||
      !this.levelFrequencyDataArray ||
      !this.levelAudioContext
    ) {
      return []
    }

    this.levelAnalyser.getByteFrequencyData(this.levelFrequencyDataArray)

    const requestedBandCount = options?.bands ?? 29
    const bandCount = Math.max(3, Math.min(64, requestedBandCount))
    const nyquist = this.levelAudioContext.sampleRate / 2
    const minFrequencyHz = Math.max(
      40,
      Math.min(options?.minFrequencyHz ?? 90, nyquist - 100)
    )
    const maxFrequencyHz = Math.max(
      minFrequencyHz + 50,
      Math.min(options?.maxFrequencyHz ?? 4800, nyquist)
    )
    const minLog = Math.log(minFrequencyHz)
    const maxLog = Math.log(maxFrequencyHz)
    const spectrumLength = this.levelFrequencyDataArray.length
    const bands: number[] = []

    for (let bandIndex = 0; bandIndex < bandCount; bandIndex += 1) {
      const startRatio = bandIndex / bandCount
      const endRatio = (bandIndex + 1) / bandCount
      const startFrequency = Math.exp(minLog + (maxLog - minLog) * startRatio)
      const endFrequency = Math.exp(minLog + (maxLog - minLog) * endRatio)

      const startBin = Math.max(
        0,
        Math.min(
          spectrumLength - 1,
          Math.floor((startFrequency / nyquist) * (spectrumLength - 1))
        )
      )
      const endBin = Math.max(
        startBin + 1,
        Math.min(
          spectrumLength,
          Math.ceil((endFrequency / nyquist) * spectrumLength)
        )
      )

      let energySum = 0
      let sampleCount = 0
      for (let binIndex = startBin; binIndex < endBin; binIndex += 1) {
        energySum += this.levelFrequencyDataArray[binIndex]
        sampleCount += 1
      }

      const averageEnergy =
        sampleCount > 0 ? energySum / (255 * sampleCount) : 0
      const gatedEnergy = Math.max(0, (averageEnergy - 0.07) / 0.93)
      const curvedEnergy = Math.pow(gatedEnergy, 1.28)

      const centerFrequency = Math.sqrt(startFrequency * endFrequency)
      let speechWeight = 1
      if (centerFrequency < 120 || centerFrequency > 4200) {
        speechWeight = 0.55
      } else if (centerFrequency >= 180 && centerFrequency <= 3200) {
        speechWeight = 1.18
      } else {
        speechWeight = 0.88
      }

      const bandValue = Math.max(
        0,
        Math.min(1, curvedEnergy * speechWeight)
      )
      bands.push(Number(bandValue.toFixed(4)))
    }

    return bands
  }

  private async ensureLevelAnalyser(): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false
    }

    let sourceStream = this.stream

    if (!sourceStream) {
      const needsNewMonitorStream =
        !this.levelMonitorStream ||
        !this.levelMonitorStream.active ||
        this.levelMonitorStream.getAudioTracks().length === 0

      if (needsNewMonitorStream) {
        this.levelMonitorStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      sourceStream = this.levelMonitorStream
    }

    if (!sourceStream) {
      return false
    }

    if (!this.levelAudioContext) {
      this.levelAudioContext = new AudioContext()
    }

    if (this.levelAudioContext.state === 'suspended') {
      await this.levelAudioContext.resume()
    }

    const shouldRebuildAnalyser =
      !this.levelAnalyser ||
      !this.levelDataArray ||
      !this.levelSourceNode ||
      !this.levelSourceStream ||
      this.levelSourceStream !== sourceStream ||
      !this.levelSourceStream.active

    if (shouldRebuildAnalyser) {
      if (this.levelSourceNode) {
        try {
          this.levelSourceNode.disconnect()
        } catch (error) {
          // no-op
        }
      }

      this.levelSourceNode = this.levelAudioContext.createMediaStreamSource(sourceStream)
      this.levelAnalyser = this.levelAudioContext.createAnalyser()
      this.levelAnalyser.fftSize = 1024
      this.levelAnalyser.smoothingTimeConstant = 0.24
      this.levelAnalyser.minDecibels = -90
      this.levelAnalyser.maxDecibels = -20
      this.levelSourceNode.connect(this.levelAnalyser)
      this.levelDataArray = new Uint8Array(new ArrayBuffer(this.levelAnalyser.fftSize))
      this.levelFrequencyDataArray = new Uint8Array(
        new ArrayBuffer(this.levelAnalyser.frequencyBinCount)
      )
      this.levelSourceStream = sourceStream
    }

    try {
      await this.ensurePreRollCapture(sourceStream)
    } catch (error) {
      // Ignore pre-roll capture setup issues so level polling can continue.
    }

    return true
  }

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
      await this.ensureLevelAnalyser()

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
    
    return { isRecording: isRecording && !isPaused, isPaused, duration }
  }

  async getLevels(): Promise<{ level: number }> {
    try {
      const ready = await this.ensureLevelAnalyser()
      if (!ready || !this.levelAnalyser || !this.levelDataArray) {
        return { level: 0.0 }
      }

      const normalizedLevel = this.getRmsLevel()
      return { level: Number(normalizedLevel.toFixed(4)) }
    } catch (error) {
      return { level: 0.0 }
    }
  }

  async getSpectrumLevels(options?: {
    bands?: number
    minFrequencyHz?: number
    maxFrequencyHz?: number
  }): Promise<{ level: number; bands: number[] }> {
    const bandCount = Math.max(3, Math.min(64, options?.bands ?? 29))

    try {
      const ready = await this.ensureLevelAnalyser()
      if (
        !ready ||
        !this.levelAnalyser ||
        !this.levelDataArray ||
        !this.levelFrequencyDataArray
      ) {
        return { level: 0, bands: Array(bandCount).fill(0) }
      }

      const normalizedLevel = this.getRmsLevel()
      const bands = this.getSpeechBands(options)
      const normalizedBands =
        bands.length === bandCount ? bands : Array(bandCount).fill(0)

      return {
        level: Number(normalizedLevel.toFixed(4)),
        bands: normalizedBands,
      }
    } catch (error) {
      return { level: 0, bands: Array(bandCount).fill(0) }
    }
  }

  async startRideAlongSession(options: {
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
  }): Promise<{ success: boolean; message: string; sessionId?: string }> {
    const startResult = await this.start({ filename: options.filename })
    if (!startResult.success) {
      return {
        success: false,
        message: startResult.message,
      }
    }

    try {
      const requestedSampleRate = options.sampleRate || 16000
      const formatTurns = options.formatTurns !== false
      const requestedPreRollMs = Number(options.preRollMs ?? this.preRollDurationMs)
      this.preRollDurationMs =
        Number.isFinite(requestedPreRollMs) && requestedPreRollMs > 0
          ? Math.min(5000, Math.max(0, Math.round(requestedPreRollMs)))
          : 0
      this.trimPreRollChunks()

      this.rideAlongSessionId = null
      this.rideAlongIsStreaming = false

      if (!this.stream) {
        return {
          success: true,
          message: 'Ride along session started without stream.',
          sessionId: this.rideAlongSessionId || undefined,
        }
      }

      this.rideAlongAudioContext = new AudioContext()
      if (this.rideAlongAudioContext.state === 'suspended') {
        await this.rideAlongAudioContext.resume()
      }
      const preRollSampleRate = Math.round(this.preRollAudioContext?.sampleRate || 0)
      const rideAlongStreamSampleRate = Math.round(
        this.rideAlongAudioContext.sampleRate || requestedSampleRate
      )
      const effectiveSampleRate =
        preRollSampleRate > 0 ? preRollSampleRate : rideAlongStreamSampleRate
      if (effectiveSampleRate !== requestedSampleRate) {
        console.warn('[AudioRecording.web] AssemblyAI sample rate mismatch.', {
          requestedSampleRate,
          effectiveSampleRate,
        })
      }
      if (
        preRollSampleRate > 0 &&
        Math.abs(preRollSampleRate - rideAlongStreamSampleRate) > 2
      ) {
        console.warn('[AudioRecording.web] Pre-roll and live stream sample rates differ.', {
          preRollSampleRate,
          rideAlongStreamSampleRate,
        })
      }

      const keytermsPrompt = Array.isArray(options.keytermsPrompt)
        ? options.keytermsPrompt
            .map((term) => (typeof term === 'string' ? term.trim() : ''))
            .filter((term) => term.length > 0 && term.length <= 50)
            .slice(0, 100)
        : []
      const encodedKeytermsPrompt =
        keytermsPrompt.length > 0
          ? `&keyterms_prompt=${encodeURIComponent(JSON.stringify(keytermsPrompt))}`
          : ''
      const websocketUrl =
        `wss://streaming.assemblyai.com/v3/ws?sample_rate=${effectiveSampleRate}` +
        `&format_turns=${formatTurns ? 'true' : 'false'}` +
        `&token=${encodeURIComponent(options.token)}` +
        encodedKeytermsPrompt

      this.rideAlongSocket = new WebSocket(websocketUrl)
      this.rideAlongSocket.binaryType = 'arraybuffer'

      this.rideAlongSocket.onopen = () => {
        this.rideAlongIsStreaming = true
        console.log('[AudioRecording.web] AssemblyAI websocket opened.', {
          requestedSampleRate,
          effectiveSampleRate,
          preRollMs: this.preRollDurationMs,
          formatTurns,
          keytermsCount: keytermsPrompt.length,
        })
      }

      this.rideAlongSocket.onmessage = async (event) => {
        try {
          const rawData = event.data
          let rawText: string | null = null

          if (typeof rawData === 'string') {
            rawText = rawData
          } else if (rawData instanceof ArrayBuffer) {
            rawText = new TextDecoder().decode(rawData)
          } else if (rawData instanceof Blob) {
            rawText = await rawData.text()
          }

          if (!rawText) {
            let dataType: string = typeof rawData
            if (rawData instanceof ArrayBuffer) {
              dataType = 'ArrayBuffer'
            } else if (rawData instanceof Blob) {
              dataType = 'Blob'
            }
            console.log(
              '[AudioRecording.web] AssemblyAI response received with unsupported data type:',
              dataType
            )
            return
          }

          const payload = JSON.parse(rawText)
          if (!payload || typeof payload !== 'object') {
            return
          }

          console.log('[AudioRecording.web] AssemblyAI response payload:', payload)

          if (payload.type === 'Begin' && typeof payload.id === 'string') {
            this.rideAlongSessionId = payload.id
            this.notifyListeners('rideAlongSessionBegin', {
              sessionId: payload.id,
              startedAt: new Date().toISOString(),
              rideAlongId: options.rideAlongId,
              clientId: options.clientId,
              userId: options.userId,
            })
            return
          }

          if (payload.type === 'Turn') {
            console.log('[AudioRecording.web] AssemblyAI Turn received:', payload)
            const currentSessionId = this.rideAlongSessionId || ''
            this.notifyListeners('rideAlongTurn', {
              sessionId: currentSessionId,
              turnId: this.createTurnIdentity(currentSessionId, payload),
              turn: payload,
              rideAlongId: options.rideAlongId,
              clientId: options.clientId,
              userId: options.userId,
            })
            return
          }

          if (payload.type === 'Termination') {
            console.log('[AudioRecording.web] AssemblyAI Termination received:', payload)
          }
        } catch (error) {
          console.error(
            '[AudioRecording.web] Failed to parse AssemblyAI response payload:',
            error
          )
        }
      }

      this.rideAlongSocket.onerror = (event) => {
        console.error('[AudioRecording.web] AssemblyAI websocket error event:', event)
        this.notifyListeners('rideAlongSessionError', {
          message: 'AssemblyAI websocket error.',
        })
      }

      this.rideAlongSocket.onclose = (event) => {
        this.rideAlongIsStreaming = false
        console.log('[AudioRecording.web] AssemblyAI websocket closed.', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        })
      }

      await this.waitForRideAlongSocketOpen()
      await this.flushPreRollToRideAlongSocket(effectiveSampleRate)

      this.rideAlongSourceNode =
        this.rideAlongAudioContext.createMediaStreamSource(this.stream)
      this.rideAlongProcessorNode = this.rideAlongAudioContext.createScriptProcessor(4096, 1, 1)
      this.rideAlongSilenceGain = this.rideAlongAudioContext.createGain()
      this.rideAlongSilenceGain.gain.value = 0
      let sentAudioChunkCount = 0
      let lastAudioChunkLogAt = 0

      this.rideAlongProcessorNode.onaudioprocess = (audioEvent) => {
        if (!this.rideAlongSocket || this.rideAlongSocket.readyState !== WebSocket.OPEN) {
          const now = Date.now()
          if (now - lastAudioChunkLogAt >= 2000) {
            console.log(
              '[AudioRecording.web] Waiting for open AssemblyAI websocket before sending audio.',
              { readyState: this.rideAlongSocket?.readyState ?? -1 }
            )
            lastAudioChunkLogAt = now
          }
          return
        }

        const channelData = audioEvent.inputBuffer.getChannelData(0)
        const pcmBuffer = this.convertFloatToInt16Buffer(channelData)
        this.rideAlongSocket.send(pcmBuffer)
        sentAudioChunkCount += 1

        const now = Date.now()
        if (now - lastAudioChunkLogAt >= 2000) {
          console.log('[AudioRecording.web] Streaming audio to AssemblyAI.', {
            chunksSent: sentAudioChunkCount,
            lastChunkBytes: pcmBuffer.byteLength,
          })
          lastAudioChunkLogAt = now
        }
      }

      this.rideAlongSourceNode.connect(this.rideAlongProcessorNode)
      this.rideAlongProcessorNode.connect(this.rideAlongSilenceGain)
      this.rideAlongSilenceGain.connect(this.rideAlongAudioContext.destination)

      return {
        success: true,
        message: 'Ride along session started',
        sessionId: this.rideAlongSessionId || undefined,
      }
    } catch (error: any) {
      this.stopRideAlongStreamingGraph()
      this.stopRideAlongSocket()
      return {
        success: false,
        message: error?.message || 'Unable to initialize ride along streaming on web.',
      }
    }
  }

  async stopRideAlongSession(options?: {
    terminationReason?: string
  }): Promise<{ success: boolean; message?: string; sessionId?: string; duration?: number; filePath?: string; mimeType?: string }> {
    if (this.rideAlongSocket && this.rideAlongSocket.readyState === WebSocket.OPEN) {
      try {
        console.log(
          '[AudioRecording.web] Sending AssemblyAI ForceEndpoint and Terminate before closing websocket.'
        )
        this.rideAlongSocket.send(JSON.stringify({ type: 'ForceEndpoint' }))
        this.rideAlongSocket.send(JSON.stringify({ type: 'Terminate' }))
        await new Promise((resolve) => {
          setTimeout(resolve, 300)
        })
      } catch (error) {
        // no-op
      }
    }

    this.stopRideAlongStreamingGraph()
    this.stopRideAlongSocket()

    const currentSessionId = this.rideAlongSessionId || undefined
    const stopResult = await this.stop()
    this.notifyListeners('rideAlongSessionStopped', {
      sessionId: currentSessionId || '',
      stoppedAt: new Date().toISOString(),
    })
    this.rideAlongSessionId = null

    return {
      success: stopResult.success,
      message: stopResult.success ? (options?.terminationReason || 'Ride along session stopped') : 'Unable to stop ride along session',
      duration: stopResult.duration,
      filePath: stopResult.filePath,
      mimeType: 'audio/webm',
      sessionId: currentSessionId,
    }
  }

  async getRideAlongSessionState(): Promise<{
    isActive: boolean
    isStreaming: boolean
    isRecording: boolean
    sessionId?: string
    duration?: number
    isPaused?: boolean
  }> {
    const status = await this.getStatus()
    const isStreaming = this.rideAlongIsStreaming || this.rideAlongSocket?.readyState === WebSocket.OPEN
    const isActive = Boolean(status.isRecording || status.isPaused || isStreaming)
    return {
      isActive,
      isStreaming: Boolean(isStreaming),
      isRecording: Boolean(status.isRecording),
      duration: status.duration,
      isPaused: status.isPaused,
      sessionId: this.rideAlongSessionId || undefined,
    }
  }
}


