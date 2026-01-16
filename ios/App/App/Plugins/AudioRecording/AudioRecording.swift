import Foundation
import Capacitor
import AVFoundation

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(AudioRecordingPlugin)
public class AudioRecordingPlugin: CAPPlugin {
    private var audioRecorder: AVAudioRecorder?
    private var audioSession: AVAudioSession?
    private var startTime: Date?
    private var recordingURL: URL?
    private var isPaused: Bool = false
    private var totalPauseDuration: TimeInterval = 0
    private var pauseStartTime: Date?
    
    @objc func start(_ call: CAPPluginCall) {
        let filename = call.getString("filename") ?? "recording-\(Int(Date().timeIntervalSince1970)).m4a"
        
        // Request microphone permission
        AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
            guard let self = self else { return }
            
            if !granted {
                call.reject("Microphone permission denied")
                return
            }
            
            // Configure audio session
            do {
                let audioSession = AVAudioSession.sharedInstance()
                try audioSession.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetoothHFP])
                try audioSession.setActive(true)
                self.audioSession = audioSession
            } catch {
                call.reject("Failed to configure audio session: \(error.localizedDescription)")
                return
            }
            
            // Check if already recording
            if self.audioRecorder?.isRecording == true {
                call.reject("Recording already in progress")
                return
            }
            
            // Set up file path
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let filePath = documentsPath.appendingPathComponent(filename)
            self.recordingURL = filePath
            
            // Audio settings
            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44100.0,
                AVNumberOfChannelsKey: 2,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]
            
            // Create recorder
            do {
                self.audioRecorder = try AVAudioRecorder(url: filePath, settings: settings)
                self.audioRecorder?.delegate = self
                self.audioRecorder?.isMeteringEnabled = true // Enable audio level metering
                self.audioRecorder?.prepareToRecord()
                
                // Start recording
                if self.audioRecorder?.record() == true {
                    self.startTime = Date()
                    self.isPaused = false
                    self.totalPauseDuration = 0
                    self.pauseStartTime = nil
                    call.resolve([
                        "success": true,
                        "message": "Recording started"
                    ])
                } else {
                    call.reject("Failed to start recording")
                }
            } catch {
                call.reject("Failed to create audio recorder: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func stop(_ call: CAPPluginCall) {
        guard let recorder = audioRecorder else {
            call.reject("No active recording")
            return
        }
        
        // If paused, resume briefly to ensure we can stop
        if isPaused {
            recorder.record()
            isPaused = false
            if let pauseStart = pauseStartTime {
                totalPauseDuration += Date().timeIntervalSince(pauseStart)
                pauseStartTime = nil
            }
        }
        
        // Stop recording (works whether recording or paused)
        recorder.stop()
        
        // Calculate duration accounting for pause time
        let duration: Int
        if let start = startTime {
            let totalTime = Date().timeIntervalSince(start)
            let actualDuration = totalTime - totalPauseDuration
            duration = Int(actualDuration)
        } else {
            duration = 0
        }
        
        // Get file path
        let filePath = recordingURL?.path ?? ""
        
        // Read file data as base64 for easier blob conversion
        var base64Data: String? = nil
        if let url = recordingURL, let fileData = try? Data(contentsOf: url) {
            base64Data = fileData.base64EncodedString()
        }
        
        // Deactivate audio session
        do {
            try AVAudioSession.sharedInstance().setActive(false)
        } catch {
            print("Failed to deactivate audio session: \(error)")
        }
        
        var result: [String: Any] = [
            "success": true,
            "filePath": filePath,
            "duration": duration
        ]
        
        if let base64 = base64Data {
            result["base64Data"] = base64
            result["mimeType"] = "audio/m4a"
        }
        
        call.resolve(result)
        
        // Clean up
        audioRecorder = nil
        startTime = nil
        recordingURL = nil
        isPaused = false
        totalPauseDuration = 0
        pauseStartTime = nil
    }
    
    @objc func pause(_ call: CAPPluginCall) {
        guard let recorder = audioRecorder else {
            call.reject("No active recording")
            return
        }
        
        guard recorder.isRecording else {
            call.reject("Not currently recording")
            return
        }
        
        guard !isPaused else {
            call.reject("Recording is already paused")
            return
        }
        
        recorder.pause()
        isPaused = true
        pauseStartTime = Date()
        
        call.resolve([
            "success": true,
            "message": "Recording paused"
        ])
    }
    
    @objc func resume(_ call: CAPPluginCall) {
        guard let recorder = audioRecorder else {
            call.reject("No active recording")
            return
        }
        
        guard isPaused else {
            call.reject("Recording is not paused")
            return
        }
        
        // Calculate pause duration and add to total
        if let pauseStart = pauseStartTime {
            totalPauseDuration += Date().timeIntervalSince(pauseStart)
            pauseStartTime = nil
        }
        
        // Resume recording
        if recorder.record() {
            isPaused = false
            call.resolve([
                "success": true,
                "message": "Recording resumed"
            ])
        } else {
            call.reject("Failed to resume recording")
        }
    }
    
    @objc func getStatus(_ call: CAPPluginCall) {
        let isRecording = audioRecorder?.isRecording ?? false
        var duration: Int? = nil
        var level: Double? = nil
        
        // Get audio level if recording
        if isRecording && !isPaused, let recorder = audioRecorder {
            recorder.updateMeters()
            let averagePower = recorder.averagePower(forChannel: 0)
            
            // Convert decibels (-160 to 0) to 0-1 range
            // Normalize: -60dB (quiet) = 0, 0dB (loud) = 1
            let normalizedLevel = max(0.0, min(1.0, (averagePower + 60.0) / 60.0))
            level = normalizedLevel
        }
        
        if (isRecording || isPaused), let start = startTime {
            let totalTime = Date().timeIntervalSince(start)
            let currentPauseTime: TimeInterval
            if isPaused, let pauseStart = pauseStartTime {
                currentPauseTime = Date().timeIntervalSince(pauseStart)
            } else {
                currentPauseTime = 0
            }
            let actualDuration = totalTime - totalPauseDuration - currentPauseTime
            duration = Int(max(0, actualDuration))
        }
        
        var result: [String: Any] = [
            "isRecording": isRecording && !isPaused,
            "isPaused": isPaused
        ]
        
        if let duration = duration {
            result["duration"] = duration
        }
        
        if let level = level {
            result["level"] = level
        }
        
        call.resolve(result)
    }
    
    @objc func getLevels(_ call: CAPPluginCall) {
        guard let recorder = audioRecorder else {
            call.resolve(["level": 0.0])
            return
        }
        
        guard recorder.isRecording && !isPaused else {
            call.resolve(["level": 0.0])
            return
        }
        
        recorder.updateMeters()
        let averagePower = recorder.averagePower(forChannel: 0)
        
        // Convert decibels (-160 to 0) to 0-1 range
        // Normalize: -60dB (quiet) = 0, 0dB (loud) = 1
        let normalizedLevel = max(0.0, min(1.0, (averagePower + 60.0) / 60.0))
        
        call.resolve(["level": normalizedLevel])
    }
}

extension AudioRecordingPlugin: AVAudioRecorderDelegate {
    public func audioRecorderDidFinishRecording(_ recorder: AVAudioRecorder, successfully flag: Bool) {
        if !flag {
            print("Recording finished unsuccessfully")
        }
    }
    
    public func audioRecorderEncodeErrorDidOccur(_ recorder: AVAudioRecorder, error: Error?) {
        if let error = error {
            print("Audio recorder error: \(error.localizedDescription)")
        }
    }
}

