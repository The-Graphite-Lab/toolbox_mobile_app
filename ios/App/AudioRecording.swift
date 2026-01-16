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
                self.audioRecorder?.prepareToRecord()
                
                // Start recording
                if self.audioRecorder?.record() == true {
                    self.startTime = Date()
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
        
        guard recorder.isRecording else {
            call.reject("Not currently recording")
            return
        }
        
        recorder.stop()
        
        // Calculate duration
        let duration: Int
        if let start = startTime {
            duration = Int(Date().timeIntervalSince(start))
        } else {
            duration = 0
        }
        
        // Get file path
        let filePath = recordingURL?.path ?? ""
        
        // Deactivate audio session
        do {
            try AVAudioSession.sharedInstance().setActive(false)
        } catch {
            print("Failed to deactivate audio session: \(error)")
        }
        
        call.resolve([
            "success": true,
            "filePath": filePath,
            "duration": duration
        ])
        
        // Clean up
        audioRecorder = nil
        startTime = nil
        recordingURL = nil
    }
    
    @objc func getStatus(_ call: CAPPluginCall) {
        let isRecording = audioRecorder?.isRecording ?? false
        var duration: Int? = nil
        
        if isRecording, let start = startTime {
            duration = Int(Date().timeIntervalSince(start))
        }
        
        var result: [String: Any] = [
            "isRecording": isRecording
        ]
        
        if let duration = duration {
            result["duration"] = duration
        }
        
        call.resolve(result)
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

