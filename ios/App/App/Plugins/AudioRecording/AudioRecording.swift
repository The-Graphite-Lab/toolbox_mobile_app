import Foundation
import Capacitor
import AVFoundation

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(AudioRecordingPlugin)
public class AudioRecordingPlugin: CAPPlugin {
    private static let defaultSpectrumBandCount = 29
    private static let spectrumDefaultMinFrequencyHz: Double = 90
    private static let spectrumDefaultMaxFrequencyHz: Double = 4800
    private static let spectrumAnalysisSampleCount = 512

    private var audioRecorder: AVAudioRecorder?
    private var audioSession: AVAudioSession?
    private var startTime: Date?
    private var recordingURL: URL?
    private var isPaused: Bool = false
    private var totalPauseDuration: TimeInterval = 0
    private var pauseStartTime: Date?
    private var rideAlongWebSocketTask: URLSessionWebSocketTask?
    private var rideAlongWebSocketSession: URLSession?
    private var rideAlongAudioEngine: AVAudioEngine?
    private var rideAlongSessionID: String?
    private var rideAlongStartedAt: Date?
    private var rideAlongID: String?
    private var rideAlongClientID: String?
    private var rideAlongUserID: String?
    private var rideAlongPendingTurns: [[String: Any]] = []
    private var levelMonitorEngine: AVAudioEngine?
    private var levelMonitorCurrentLevel: Double = 0
    private let spectrumProcessingQueue = DispatchQueue(
        label: "AudioRecordingPlugin.spectrum.processing",
        qos: .userInitiated
    )
    private let spectrumStateQueue = DispatchQueue(label: "AudioRecordingPlugin.spectrum.state")
    private var spectrumWorkInFlight = false
    private var latestSpectrumBands: [Double] = Array(
        repeating: 0,
        count: AudioRecordingPlugin.defaultSpectrumBandCount
    )
    private var latestSpectrumLevel: Double = 0
    private var spectrumNoiseFloor: [Double] = Array(
        repeating: 0.012,
        count: AudioRecordingPlugin.defaultSpectrumBandCount
    )
    private var spectrumPeakHold: [Double] = Array(
        repeating: 0.06,
        count: AudioRecordingPlugin.defaultSpectrumBandCount
    )
    private var previousSpectrumBands: [Double] = Array(
        repeating: 0,
        count: AudioRecordingPlugin.defaultSpectrumBandCount
    )
    private var spectrumWindow: [Double] = []
    private let rideAlongDateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
    
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
            let normalizedLevel = max(
                0.0,
                min(1.0, Double((averagePower + 60.0) / 60.0))
            )
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
            resolveAmbientLevel(call)
            return
        }
        
        guard recorder.isRecording && !isPaused else {
            resolveAmbientLevel(call)
            return
        }
        
        recorder.updateMeters()
        let averagePower = recorder.averagePower(forChannel: 0)
        
        // Convert decibels (-160 to 0) to 0-1 range
        // Normalize: -60dB (quiet) = 0, 0dB (loud) = 1
        let normalizedLevel = max(
            0.0,
            min(1.0, Double((averagePower + 60.0) / 60.0))
        )
        
        call.resolve(["level": normalizedLevel])
    }

    @objc func getSpectrumLevels(_ call: CAPPluginCall) {
        let requestedBandCount = max(
            3,
            min(64, call.getInt("bands") ?? Self.defaultSpectrumBandCount)
        )
        let requestedMinHz = Double(
            call.getInt("minFrequencyHz") ?? Int(Self.spectrumDefaultMinFrequencyHz)
        )
        let requestedMaxHz = Double(
            call.getInt("maxFrequencyHz") ?? Int(Self.spectrumDefaultMaxFrequencyHz)
        )

        let session = AVAudioSession.sharedInstance()
        switch session.recordPermission {
        case .granted:
            do {
                try ensureLevelMonitor()
            } catch {
                print("Spectrum monitor setup failed: \(error.localizedDescription)")
            }
            resolveSpectrumLevels(
                call,
                requestedBandCount: requestedBandCount,
                requestedMinHz: requestedMinHz,
                requestedMaxHz: requestedMaxHz
            )
        case .denied:
            call.resolve([
                "level": 0.0,
                "bands": [Double](repeating: 0, count: requestedBandCount),
            ])
        case .undetermined:
            session.requestRecordPermission { [weak self] granted in
                guard let self = self else { return }
                if granted {
                    do {
                        try self.ensureLevelMonitor()
                    } catch {
                        print("Spectrum monitor setup failed after permission: \(error.localizedDescription)")
                    }
                }
                DispatchQueue.main.async {
                    self.resolveSpectrumLevels(
                        call,
                        requestedBandCount: requestedBandCount,
                        requestedMinHz: requestedMinHz,
                        requestedMaxHz: requestedMaxHz
                    )
                }
            }
        @unknown default:
            call.resolve([
                "level": 0.0,
                "bands": [Double](repeating: 0, count: requestedBandCount),
            ])
        }
    }

    @objc func startRideAlongSession(_ call: CAPPluginCall) {
        let token = call.getString("token") ?? ""
        let rideAlongId = call.getString("rideAlongId") ?? ""
        let clientId = call.getString("clientId") ?? ""
        let userId = call.getString("userId") ?? ""
        let rawKeytermsPrompt = call.options["keytermsPrompt"] as? [String] ?? []
        let keytermsPrompt = Array(
            rawKeytermsPrompt
                .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                .filter { !$0.isEmpty && $0.count <= 50 }
                .prefix(100)
        )
        let sampleRate = call.getInt("sampleRate") ?? 16000
        let formatTurns = call.getBool("formatTurns") ?? true
        let filename = call.getString("filename") ?? "ridealong-\(Int(Date().timeIntervalSince1970)).m4a"

        if token.isEmpty || rideAlongId.isEmpty || clientId.isEmpty || userId.isEmpty {
            call.reject("token, rideAlongId, clientId, and userId are required")
            return
        }

        if rideAlongWebSocketTask != nil || audioRecorder?.isRecording == true {
            call.reject("A recording or ride along session is already active")
            return
        }

        AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
            guard let self = self else { return }

            if !granted {
                call.reject("Microphone permission denied")
                return
            }

            do {
                self.stopLevelMonitor()
                let audioSession = AVAudioSession.sharedInstance()
                try audioSession.setCategory(
                    .playAndRecord,
                    mode: .default,
                    options: [.defaultToSpeaker, .allowBluetoothHFP, .allowBluetoothA2DP]
                )
                try audioSession.setActive(true)
                self.audioSession = audioSession
            } catch {
                call.reject("Failed to configure audio session: \(error.localizedDescription)")
                return
            }

            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let filePath = documentsPath.appendingPathComponent(filename)
            self.recordingURL = filePath

            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44100.0,
                AVNumberOfChannelsKey: 2,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]

            do {
                self.audioRecorder = try AVAudioRecorder(url: filePath, settings: settings)
                self.audioRecorder?.delegate = self
                self.audioRecorder?.isMeteringEnabled = true
                self.audioRecorder?.prepareToRecord()

                guard self.audioRecorder?.record() == true else {
                    call.reject("Failed to start local recording for ride along")
                    return
                }

                self.startTime = Date()
                self.isPaused = false
                self.totalPauseDuration = 0
                self.pauseStartTime = nil
                self.rideAlongID = rideAlongId
                self.rideAlongClientID = clientId
                self.rideAlongUserID = userId
                self.rideAlongStartedAt = Date()
                self.rideAlongSessionID = nil
                self.rideAlongPendingTurns = []

                try self.startRideAlongWebSocket(
                    token: token,
                    sampleRate: sampleRate,
                    formatTurns: formatTurns,
                    keytermsPrompt: keytermsPrompt
                )
                try self.startRideAlongAudioStream(sampleRate: Double(sampleRate))

                call.resolve([
                    "success": true,
                    "message": "Ride along session started"
                ])
            } catch {
                self.audioRecorder?.stop()
                self.audioRecorder = nil
                self.recordingURL = nil
                self.stopRideAlongAudioEngine()
                self.stopRideAlongWebSocket()
                self.resetRideAlongContext()
                call.reject("Failed to start ride along session: \(error.localizedDescription)")
            }
        }
    }

    @objc func stopRideAlongSession(_ call: CAPPluginCall) {
        let endedAt = rideAlongDateFormatter.string(from: Date())

        stopRideAlongAudioEngine()
        sendRideAlongForceEndpointMessage()
        let sessionIdToEmit = rideAlongSessionID
        let recordingURLToUse = recordingURL
        let startTimeToUse = startTime
        let totalPauseToUse = totalPauseDuration
        let pauseStartToUse = pauseStartTime
        let wasPaused = isPaused
        let recorderToStop = audioRecorder

        DispatchQueue.global(qos: .userInitiated).asyncAfter(deadline: .now() + 0.5) { [weak self] in
            guard let self = self else { return }
            self.sendRideAlongTerminateMessage()
            self.stopRideAlongWebSocket()

            if wasPaused, let recorder = recorderToStop {
                recorder.record()
            }

            var totalPauseDurationForDuration = totalPauseToUse
            if wasPaused, let pauseStart = pauseStartToUse {
                totalPauseDurationForDuration += Date().timeIntervalSince(pauseStart)
            }

            if recorderToStop?.isRecording == true {
                recorderToStop?.stop()
            }

            let duration: Int
            if let start = startTimeToUse {
                let totalTime = Date().timeIntervalSince(start)
                let actualDuration = totalTime - totalPauseDurationForDuration
                duration = Int(actualDuration)
            } else {
                duration = 0
            }

            let filePath = recordingURLToUse?.path
            let sessionId = sessionIdToEmit

            if let sessionId = sessionId {
                DispatchQueue.main.async {
                    self.notifyListeners("rideAlongSessionStopped", data: [
                        "sessionId": sessionId,
                        "stoppedAt": endedAt
                    ])
                }
            }

            self.resetAfterRideAlongStop()

            var response: [String: Any] = [
                "success": true,
                "sessionId": sessionId ?? "",
                "duration": duration,
                "filePath": filePath ?? "",
                "mimeType": "audio/m4a"
            ]
            call.resolve(response)
        }
        return
    }

    @objc func getRideAlongSessionState(_ call: CAPPluginCall) {
        let isStreaming = rideAlongWebSocketTask != nil
        let isRecording = audioRecorder?.isRecording ?? false
        let isActive = isStreaming || isRecording

        var duration: Int? = nil
        if let start = rideAlongStartedAt {
            duration = Int(Date().timeIntervalSince(start))
        }

        var response: [String: Any] = [
            "isActive": isActive,
            "isStreaming": isStreaming,
            "isRecording": isRecording && !isPaused,
            "isPaused": isPaused
        ]

        if let sessionId = rideAlongSessionID {
            response["sessionId"] = sessionId
        }

        if let duration = duration {
            response["duration"] = duration
        }

        call.resolve(response)
    }

    @objc func uploadRideAlongRecording(_ call: CAPPluginCall) {
        guard let signedUrlString = call.getString("signedUrl"),
              let filePath = call.getString("filePath"),
              !signedUrlString.isEmpty,
              !filePath.isEmpty else {
            call.reject("signedUrl and filePath are required")
            return
        }

        guard let url = URL(string: signedUrlString) else {
            call.reject("Invalid signedUrl")
            return
        }

        let fileURL = URL(fileURLWithPath: filePath)
        guard FileManager.default.fileExists(atPath: filePath) else {
            call.reject("Recording file not found at path")
            return
        }

        guard let fileData = try? Data(contentsOf: fileURL) else {
            call.reject("Failed to read recording file")
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("audio/m4a", forHTTPHeaderField: "Content-Type")
        request.httpBody = fileData

        let task = URLSession.shared.dataTask(with: request) { _, response, error in
            if let error = error {
                call.reject("Upload failed: \(error.localizedDescription)")
                return
            }
            guard let http = response as? HTTPURLResponse else {
                call.reject("Upload failed: invalid response")
                return
            }
            guard (200...299).contains(http.statusCode) else {
                call.reject("Upload failed: HTTP \(http.statusCode)")
                return
            }
            call.resolve(["success": true])
        }
        task.resume()
    }

    private func startRideAlongWebSocket(token: String, sampleRate: Int, formatTurns: Bool, keytermsPrompt: [String]) throws {
        var components = URLComponents(string: "wss://streaming.assemblyai.com/v3/ws")
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "sample_rate", value: "\(sampleRate)"),
            URLQueryItem(name: "format_turns", value: formatTurns ? "true" : "false"),
            URLQueryItem(name: "token", value: token)
        ]
        
        if !keytermsPrompt.isEmpty,
           let payloadData = try? JSONSerialization.data(withJSONObject: keytermsPrompt),
           let payload = String(data: payloadData, encoding: .utf8) {
            queryItems.append(URLQueryItem(name: "keyterms_prompt", value: payload))
        }
        
        components?.queryItems = queryItems

        guard let url = components?.url else {
            throw NSError(domain: "AudioRecordingPlugin", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "Failed to create AssemblyAI websocket URL."
            ])
        }

        let session = URLSession(configuration: .default)
        let task = session.webSocketTask(with: url)
        rideAlongWebSocketSession = session
        rideAlongWebSocketTask = task
        task.resume()
        receiveRideAlongWebSocketMessages()
    }

    private func stopRideAlongWebSocket() {
        rideAlongWebSocketTask?.cancel(with: .goingAway, reason: nil)
        rideAlongWebSocketTask = nil
        rideAlongWebSocketSession?.invalidateAndCancel()
        rideAlongWebSocketSession = nil
    }

    private func sendRideAlongForceEndpointMessage() {
        guard let task = rideAlongWebSocketTask else { return }
        guard let payload = try? JSONSerialization.data(withJSONObject: ["type": "ForceEndpoint"]),
              let payloadString = String(data: payload, encoding: .utf8) else { return }

        task.send(.string(payloadString)) { [weak self] error in
            if let error = error {
                print("RideAlong websocket ForceEndpoint send failed: \(error.localizedDescription)")
                self?.emitRideAlongSessionError(message: "ForceEndpoint send failed: \(error.localizedDescription)")
            }
        }
    }

    private func sendRideAlongTerminateMessage() {
        guard let task = rideAlongWebSocketTask else { return }
        guard let payload = try? JSONSerialization.data(withJSONObject: ["type": "Terminate"]),
              let payloadString = String(data: payload, encoding: .utf8) else { return }

        task.send(.string(payloadString)) { error in
            if let error = error {
                print("RideAlong websocket terminate send failed: \(error.localizedDescription)")
            }
        }
    }

    private func emitRideAlongSessionError(message: String) {
        DispatchQueue.main.async { [weak self] in
            self?.notifyListeners("rideAlongSessionError", data: ["message": message])
        }
    }

    private func startRideAlongAudioStream(sampleRate: Double) throws {
        let engine = AVAudioEngine()
        let inputNode = engine.inputNode
        let inputFormat = inputNode.outputFormat(forBus: 0)
        let bufferSize: AVAudioFrameCount = 2048

        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: bufferSize, format: inputFormat) { [weak self] buffer, _ in
            guard let self = self else { return }
            guard let pcmData = self.convertBufferToPCM16Data(buffer: buffer, sampleRate: sampleRate) else {
                return
            }

            self.rideAlongWebSocketTask?.send(.data(pcmData)) { [weak self] error in
                if let error = error {
                    print("RideAlong websocket send error: \(error.localizedDescription)")
                    self?.emitRideAlongSessionError(message: "WebSocket send error: \(error.localizedDescription)")
                }
            }
        }

        engine.prepare()
        try engine.start()
        rideAlongAudioEngine = engine
    }

    private func stopRideAlongAudioEngine() {
        rideAlongAudioEngine?.inputNode.removeTap(onBus: 0)
        rideAlongAudioEngine?.stop()
        rideAlongAudioEngine = nil
    }

    private func convertBufferToPCM16Data(buffer: AVAudioPCMBuffer, sampleRate: Double) -> Data? {
        guard let targetFormat = AVAudioFormat(
            commonFormat: .pcmFormatInt16,
            sampleRate: sampleRate,
            channels: 1,
            interleaved: true
        ) else {
            return nil
        }

        guard let converter = AVAudioConverter(from: buffer.format, to: targetFormat) else {
            return nil
        }

        let ratio = sampleRate / buffer.format.sampleRate
        let frameCapacity = AVAudioFrameCount(Double(buffer.frameLength) * ratio) + 1

        guard let convertedBuffer = AVAudioPCMBuffer(
            pcmFormat: targetFormat,
            frameCapacity: frameCapacity
        ) else {
            return nil
        }

        var error: NSError?
        var sourceBuffer: AVAudioPCMBuffer? = buffer
        _ = converter.convert(to: convertedBuffer, error: &error) { _, status -> AVAudioBuffer? in
            if let source = sourceBuffer {
                status.pointee = .haveData
                sourceBuffer = nil
                return source
            }
            status.pointee = .noDataNow
            return nil
        }

        if error != nil {
            return nil
        }

        let audioBuffer = convertedBuffer.audioBufferList.pointee.mBuffers
        guard let mData = audioBuffer.mData else {
            return nil
        }

        return Data(bytes: mData, count: Int(audioBuffer.mDataByteSize))
    }

    /// Returns true if the error indicates an expected close (we or server closed the socket); do not surface as user error.
    private func isExpectedWebSocketCloseError(_ error: Error) -> Bool {
        let msg = error.localizedDescription.lowercased()
        if msg.contains("not connected") || msg.contains("socket is not connected") { return true }
        if msg.contains("cancelled") || msg.contains("canceled") { return true }
        if msg.contains("connection reset") || msg.contains("broken pipe") { return true }
        if msg.contains("connection closed") || msg.contains("stream ended") { return true }
        let ns = error as NSError
        if ns.domain == "NSURLErrorDomain" && ns.code == -999 { return true } // URLError.cancelled
        return false
    }

    private func receiveRideAlongWebSocketMessages() {
        guard let task = rideAlongWebSocketTask else { return }

        task.receive { [weak self] result in
            guard let self = self else { return }

            switch result {
            case .failure(let error):
                print("RideAlong websocket receive error: \(error.localizedDescription)")
                if !self.isExpectedWebSocketCloseError(error) {
                    self.emitRideAlongSessionError(message: "WebSocket receive error: \(error.localizedDescription)")
                }
            case .success(let message):
                var jsonPayload: [String: Any]?
                switch message {
                case .string(let text):
                    if let data = text.data(using: .utf8) {
                        do {
                            jsonPayload = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                        } catch {
                            print("AssemblyAI payload parse error (string): \(error.localizedDescription)")
                            print("AssemblyAI raw string payload: \(text)")
                        }
                    } else {
                        print("AssemblyAI payload UTF-8 conversion failed for string message.")
                    }
                case .data(let data):
                    do {
                        jsonPayload = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                    } catch {
                        print("AssemblyAI payload parse error (data): \(error.localizedDescription)")
                    }
                @unknown default:
                    break
                }

                if let payload = jsonPayload {
                    print("AssemblyAI response payload: \(payload)")
                    self.handleRideAlongWebSocketMessage(payload)
                } else {
                    print("AssemblyAI websocket message was not a JSON object payload.")
                }
            }

            if self.rideAlongWebSocketTask != nil {
                self.receiveRideAlongWebSocketMessages()
            }
        }
    }

    private func handleRideAlongWebSocketMessage(_ payload: [String: Any]) {
        guard let type = payload["type"] as? String else { return }
        print("AssemblyAI payload type: \(type)")

        if type == "Begin" {
            if let sessionId = payload["id"] as? String {
                rideAlongSessionID = sessionId
                emitRideAlongSessionBegin(sessionId: sessionId)
                flushPendingTurnsIfPossible()
            }
            return
        }

        if type == "Turn" {
            let endOfTurn = (payload["end_of_turn"] as? Bool) ?? (payload["endOfTurn"] as? Bool) ?? false
            let turnIsFormatted =
                (payload["turn_is_formatted"] as? Bool) ?? (payload["turnIsFormatted"] as? Bool) ?? false

            guard endOfTurn && turnIsFormatted else {
                print("AssemblyAI Turn payload skipped (not finalized formatted turn).")
                return
            }

            print("AssemblyAI finalized Turn payload routed for persistence.")
            enqueueOrSendTurn(payload)
            return
        }
    }

    private func enqueueOrSendTurn(_ turn: [String: Any]) {
        if rideAlongSessionID == nil {
            rideAlongPendingTurns.append(turn)
            return
        }
        emitRideAlongTurn(turn)
    }

    private func flushPendingTurnsIfPossible() {
        guard !rideAlongPendingTurns.isEmpty else { return }
        let turns = rideAlongPendingTurns
        rideAlongPendingTurns = []
        for turn in turns {
            emitRideAlongTurn(turn)
        }
    }

    private func emitRideAlongSessionBegin(sessionId: String) {
        guard let rideAlongId = rideAlongID,
              let clientId = rideAlongClientID,
              let userId = rideAlongUserID else {
            return
        }

        let startedAt = rideAlongDateFormatter.string(from: rideAlongStartedAt ?? Date())
        DispatchQueue.main.async { [weak self] in
            self?.notifyListeners("rideAlongSessionBegin", data: [
                "sessionId": sessionId,
                "startedAt": startedAt,
                "rideAlongId": rideAlongId,
                "clientId": clientId,
                "userId": userId,
            ])
        }
    }

    private func emitRideAlongTurn(_ turn: [String: Any]) {
        guard let sessionId = rideAlongSessionID,
              let rideAlongId = rideAlongID,
              let clientId = rideAlongClientID,
              let userId = rideAlongUserID else {
            return
        }

        let turnOrder = turn["turn_order"] ?? turn["turnOrder"] ?? "na"
        let transcript = (turn["transcript"] as? String) ?? ""
        let turnIdentity = "\(sessionId):\(turnOrder):\(transcript.count)"

        DispatchQueue.main.async { [weak self] in
            self?.notifyListeners("rideAlongTurn", data: [
                "sessionId": sessionId,
                "turnId": turnIdentity,
                "turn": turn,
                "rideAlongId": rideAlongId,
                "clientId": clientId,
                "userId": userId,
            ])
        }
    }

    private func resetAfterRideAlongStop() {
        audioRecorder = nil
        startTime = nil
        recordingURL = nil
        isPaused = false
        totalPauseDuration = 0
        pauseStartTime = nil
        resetRideAlongContext()
    }

    private func resetRideAlongContext() {
        rideAlongSessionID = nil
        rideAlongStartedAt = nil
        rideAlongID = nil
        rideAlongClientID = nil
        rideAlongUserID = nil
        rideAlongPendingTurns = []
    }

    private func resolveAmbientLevel(_ call: CAPPluginCall) {
        let session = AVAudioSession.sharedInstance()
        switch session.recordPermission {
        case .granted:
            do {
                try ensureLevelMonitor()
            } catch {
                print("Ambient level monitor setup failed: \(error.localizedDescription)")
            }
            call.resolve(["level": levelMonitorCurrentLevel])
        case .denied:
            call.resolve(["level": 0.0])
        case .undetermined:
            session.requestRecordPermission { [weak self] granted in
                guard let self = self else { return }
                var level = 0.0
                if granted {
                    do {
                        try self.ensureLevelMonitor()
                        level = self.levelMonitorCurrentLevel
                    } catch {
                        print("Ambient level monitor setup failed after permission: \(error.localizedDescription)")
                    }
                }
                DispatchQueue.main.async {
                    call.resolve(["level": level])
                }
            }
        @unknown default:
            call.resolve(["level": 0.0])
        }
    }

    private func resolveSpectrumLevels(
        _ call: CAPPluginCall,
        requestedBandCount: Int,
        requestedMinHz: Double,
        requestedMaxHz: Double
    ) {
        var recorderLevel: Double = 0
        if let recorder = audioRecorder, recorder.isRecording && !isPaused {
            recorder.updateMeters()
            let averagePower = recorder.averagePower(forChannel: 0)
            recorderLevel = max(0.0, min(1.0, Double((averagePower + 60.0) / 60.0)))
        }

        let spectrumSnapshot = spectrumStateQueue.sync { () -> (bands: [Double], level: Double) in
            return (latestSpectrumBands, latestSpectrumLevel)
        }

        let spectrumAverage =
            spectrumSnapshot.bands.isEmpty
                ? 0
                : spectrumSnapshot.bands.reduce(0, +) / Double(spectrumSnapshot.bands.count)
        let effectiveLevel = max(
            levelMonitorCurrentLevel,
            recorderLevel,
            spectrumSnapshot.level,
            spectrumAverage * 0.55
        )
        let mappedBands = mapSpectrumBands(
            baseBands: spectrumSnapshot.bands,
            requestedBandCount: requestedBandCount,
            requestedMinHz: requestedMinHz,
            requestedMaxHz: requestedMaxHz
        )

        call.resolve([
            "level": effectiveLevel,
            "bands": mappedBands,
        ])
    }

    private func mapSpectrumBands(
        baseBands: [Double],
        requestedBandCount: Int,
        requestedMinHz: Double,
        requestedMaxHz: Double
    ) -> [Double] {
        guard !baseBands.isEmpty else {
            return [Double](repeating: 0, count: requestedBandCount)
        }

        let baseMin = Self.spectrumDefaultMinFrequencyHz
        let baseMax = Self.spectrumDefaultMaxFrequencyHz
        let boundedMin = max(40, min(requestedMinHz, requestedMaxHz - 20))
        let boundedMax = max(boundedMin + 20, requestedMaxHz)
        let baseMinLog = log(baseMin)
        let baseMaxLog = log(baseMax)
        let requestedMinLog = log(boundedMin)
        let requestedMaxLog = log(boundedMax)

        return (0..<requestedBandCount).map { bandIndex in
            let ratio = (Double(bandIndex) + 0.5) / Double(requestedBandCount)
            let centerFrequency = exp(
                requestedMinLog + (requestedMaxLog - requestedMinLog) * ratio
            )
            let baseRatio =
                (log(centerFrequency) - baseMinLog) /
                max(0.000001, baseMaxLog - baseMinLog)

            return sampleBandValue(baseBands: baseBands, ratio: baseRatio)
        }
    }

    private func sampleBandValue(baseBands: [Double], ratio: Double) -> Double {
        if baseBands.count <= 1 {
            return max(0, min(1, baseBands.first ?? 0))
        }

        let boundedRatio = max(0, min(1, ratio))
        let scaledIndex = boundedRatio * Double(baseBands.count - 1)
        let lowerIndex = Int(floor(scaledIndex))
        let upperIndex = min(baseBands.count - 1, lowerIndex + 1)
        let interpolation = scaledIndex - Double(lowerIndex)

        let value =
            baseBands[lowerIndex] * (1 - interpolation) +
            baseBands[upperIndex] * interpolation

        return max(0, min(1, value))
    }

    private func ensureLevelMonitor() throws {
        if let existingEngine = levelMonitorEngine, existingEngine.isRunning {
            return
        }

        let session = AVAudioSession.sharedInstance()
        let shouldConfigureSession =
            rideAlongAudioEngine == nil &&
            !(audioRecorder?.isRecording ?? false)
        if shouldConfigureSession {
            try session.setCategory(
                .playAndRecord,
                mode: .measurement,
                options: [.defaultToSpeaker, .allowBluetoothHFP, .allowBluetoothA2DP]
            )
            try session.setActive(true)
        }

        let engine = AVAudioEngine()
        let inputNode = engine.inputNode
        let inputFormat = inputNode.outputFormat(forBus: 0)
        let bufferSize: AVAudioFrameCount = 1024

        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: bufferSize, format: inputFormat) { [weak self] buffer, _ in
            guard let self = self else { return }
            guard let channelData = buffer.floatChannelData?[0] else { return }

            let frameLength = Int(buffer.frameLength)
            if frameLength <= 0 {
                return
            }

            var sumSquares: Float = 0
            for index in 0..<frameLength {
                let sample = channelData[index]
                sumSquares += sample * sample
            }

            let rms = sqrt(sumSquares / Float(frameLength))
            let rawLevel = max(0.0, min(1.0, Double(rms) * 5.5))
            let smoothed = (self.levelMonitorCurrentLevel * 0.82) + (rawLevel * 0.18)
            self.levelMonitorCurrentLevel = smoothed

            let captureCount = min(frameLength, Self.spectrumAnalysisSampleCount)
            if captureCount > 0 {
                var capturedSamples = [Float](
                    repeating: 0,
                    count: Self.spectrumAnalysisSampleCount
                )
                for index in 0..<captureCount {
                    capturedSamples[index] = channelData[index]
                }

                self.enqueueSpectrumAnalysis(
                    samples: capturedSamples,
                    sampleRate: buffer.format.sampleRate,
                    level: smoothed
                )
            }
        }

        engine.prepare()
        try engine.start()
        levelMonitorEngine = engine
    }

    private func stopLevelMonitor() {
        levelMonitorEngine?.inputNode.removeTap(onBus: 0)
        levelMonitorEngine?.stop()
        levelMonitorEngine = nil
        levelMonitorCurrentLevel = 0
        resetSpectrumState()
    }

    private func resetSpectrumState() {
        spectrumStateQueue.sync {
            latestSpectrumBands = Array(repeating: 0, count: Self.defaultSpectrumBandCount)
            latestSpectrumLevel = 0
            spectrumNoiseFloor = Array(repeating: 0.012, count: Self.defaultSpectrumBandCount)
            spectrumPeakHold = Array(repeating: 0.06, count: Self.defaultSpectrumBandCount)
            previousSpectrumBands = Array(repeating: 0, count: Self.defaultSpectrumBandCount)
            spectrumWorkInFlight = false
        }
    }

    private func enqueueSpectrumAnalysis(samples: [Float], sampleRate: Double, level: Double) {
        var shouldEnqueue = false
        spectrumStateQueue.sync {
            if !spectrumWorkInFlight {
                spectrumWorkInFlight = true
                shouldEnqueue = true
            }
        }

        if !shouldEnqueue {
            return
        }

        spectrumProcessingQueue.async { [weak self] in
            guard let self = self else { return }

            let rawBands = self.analyzeSpectrumBands(samples: samples, sampleRate: sampleRate)
            self.spectrumStateQueue.sync {
                let normalizedBands = self.normalizeSpectrumBands(rawBands: rawBands)
                self.latestSpectrumBands = normalizedBands
                self.latestSpectrumLevel = level
                self.spectrumWorkInFlight = false
            }
        }
    }

    private func analyzeSpectrumBands(samples: [Float], sampleRate: Double) -> [Double] {
        if sampleRate <= 0 {
            return Array(repeating: 0, count: Self.defaultSpectrumBandCount)
        }

        if spectrumWindow.count != Self.spectrumAnalysisSampleCount {
            let denominator = Double(Self.spectrumAnalysisSampleCount - 1)
            spectrumWindow = (0..<Self.spectrumAnalysisSampleCount).map { index in
                let ratio = denominator > 0 ? Double(index) / denominator : 0
                return 0.5 - 0.5 * cos(2 * Double.pi * ratio)
            }
        }

        var windowedSamples = Array(repeating: 0.0, count: Self.spectrumAnalysisSampleCount)
        let sampleCount = min(samples.count, Self.spectrumAnalysisSampleCount)
        if sampleCount > 0 {
            for index in 0..<sampleCount {
                windowedSamples[index] = Double(samples[index]) * spectrumWindow[index]
            }
        }

        let nyquist = max(200, sampleRate / 2)
        let minHz = max(40, min(Self.spectrumDefaultMinFrequencyHz, nyquist - 120))
        let maxHz = max(minHz + 80, min(Self.spectrumDefaultMaxFrequencyHz, nyquist - 20))
        let minLog = log(minHz)
        let maxLog = log(maxHz)
        let sampleScale = Double(Self.spectrumAnalysisSampleCount * Self.spectrumAnalysisSampleCount)

        var bands = Array(repeating: 0.0, count: Self.defaultSpectrumBandCount)
        for bandIndex in 0..<Self.defaultSpectrumBandCount {
            let startRatio = Double(bandIndex) / Double(Self.defaultSpectrumBandCount)
            let endRatio = Double(bandIndex + 1) / Double(Self.defaultSpectrumBandCount)
            let startHz = exp(minLog + (maxLog - minLog) * startRatio)
            let endHz = exp(minLog + (maxLog - minLog) * endRatio)
            let centerHz = sqrt(startHz * endHz)
            let lowHz = startHz * 0.6 + centerHz * 0.4
            let highHz = centerHz * 0.4 + endHz * 0.6

            let lowPower = goertzelPower(
                samples: windowedSamples,
                sampleRate: sampleRate,
                targetFrequencyHz: lowHz
            )
            let centerPower = goertzelPower(
                samples: windowedSamples,
                sampleRate: sampleRate,
                targetFrequencyHz: centerHz
            )
            let highPower = goertzelPower(
                samples: windowedSamples,
                sampleRate: sampleRate,
                targetFrequencyHz: highHz
            )

            let blendedPower =
                lowPower * 0.25 +
                centerPower * 0.5 +
                highPower * 0.25
            let normalizedPower = sampleScale > 0 ? blendedPower / sampleScale : 0
            var energy = sqrt(max(0, normalizedPower))

            let speechWeight: Double
            if centerHz < 120 || centerHz > 4200 {
                speechWeight = 0.55
            } else if centerHz >= 180 && centerHz <= 3200 {
                speechWeight = 1.18
            } else {
                speechWeight = 0.88
            }

            energy *= speechWeight
            let shapedEnergy = pow(max(0, energy * 2.0), 0.84)
            bands[bandIndex] = max(0, min(1, shapedEnergy))
        }

        return bands
    }

    private func goertzelPower(
        samples: [Double],
        sampleRate: Double,
        targetFrequencyHz: Double
    ) -> Double {
        if targetFrequencyHz <= 0 || targetFrequencyHz >= sampleRate * 0.5 {
            return 0
        }

        let omega = 2 * Double.pi * targetFrequencyHz / sampleRate
        let cosine = cos(omega)
        let coefficient = 2 * cosine
        var q0 = 0.0
        var q1 = 0.0
        var q2 = 0.0

        for sample in samples {
            q0 = sample + coefficient * q1 - q2
            q2 = q1
            q1 = q0
        }

        let power = q1 * q1 + q2 * q2 - coefficient * q1 * q2
        return max(0, power)
    }

    private func normalizeSpectrumBands(rawBands: [Double]) -> [Double] {
        if rawBands.count != previousSpectrumBands.count {
            previousSpectrumBands = Array(repeating: 0, count: rawBands.count)
            spectrumNoiseFloor = Array(repeating: 0.012, count: rawBands.count)
            spectrumPeakHold = Array(repeating: 0.06, count: rawBands.count)
        }

        var output = Array(repeating: 0.0, count: rawBands.count)
        for index in 0..<rawBands.count {
            let raw = max(0, rawBands[index])

            var floor = spectrumNoiseFloor[index]
            if raw < floor {
                floor = floor * 0.9 + raw * 0.1
            } else {
                floor = floor * 0.999 + raw * 0.001
            }

            var peak = spectrumPeakHold[index]
            if raw > peak {
                peak = peak * 0.76 + raw * 0.24
            } else {
                peak = peak * 0.982 + raw * 0.018
            }
            peak = max(peak, floor + 0.012)

            let range = max(0.012, peak - floor)
            let normalized = pow(max(0, min(1, (raw - floor) / range)), 1.08)
            let previous = previousSpectrumBands[index]
            let smoothing = normalized > previous ? 0.52 : 0.24
            let smoothed = previous + (normalized - previous) * smoothing

            spectrumNoiseFloor[index] = floor
            spectrumPeakHold[index] = peak
            previousSpectrumBands[index] = smoothed
            output[index] = max(0, min(1, smoothed))
        }

        return output
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

