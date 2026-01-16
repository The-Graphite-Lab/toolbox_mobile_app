# Native Audio Recording Integration Guide

## Overview
This guide shows how to integrate the native Capacitor AudioRecording API with your webpage, allowing it to use native recording when available and falling back to TGL SDK otherwise.

## Files Required

1. **native-audio-adapter.js** - Adapter that wraps native API to match TGL SDK interface
2. **native-audio-integration.js** - Helper functions for integration

## Integration Steps

### Step 1: Add Script Tags to Your HTML

Add these script tags in the `<head>` section of your HTML, **BEFORE** your existing recorder initialization code:

```html
<!-- Native Audio Recording Adapter -->
<script src="/native-audio-adapter.js"></script>
<script src="/native-audio-integration.js"></script>
```

Or if hosting externally:
```html
<script src="https://your-domain.com/native-audio-adapter.js"></script>
<script src="https://your-domain.com/native-audio-integration.js"></script>
```

### Step 2: Modify Your `ensureRecorder()` Function

Replace your existing `ensureRecorder()` function with this version that automatically detects and uses the native API:

```javascript
// --- Recorder setup using Native API or TGL SDK ---
function ensureRecorder() {
    if (recorder) return;

    // Try to create recorder (will use native API if available, otherwise TGL SDK)
    try {
        if (typeof createRecorder === 'function') {
            // Use the integration helper
            recorder = createRecorder({
                format: 'webm', // Only used for TGL SDK fallback
                maxDuration: 2700000, // 45 minutes
                quality: 0.8
            });
        } else if (window.Webpage && window.Webpage.media && window.Webpage.media.isSupported && window.Webpage.media.isSupported()) {
            // Fallback: Direct TGL SDK usage (if integration script not loaded)
            recorder = window.Webpage.media.createAudioRecorder({
                showUI: false,
                format: 'webm',
                maxDuration: 2700000,
                quality: 0.8
            });
        } else {
            alert('Audio recording not supported in this browser');
            return;
        }
    } catch (error) {
        console.error('Error creating recorder:', error);
        alert('Could not initialize audio recorder');
        return;
    }

    // Set up event listeners (works for both native adapter and TGL SDK)
    recorder.on('start', () => {
        isRecording = true;
        recordBtn.classList.add('recording');
        recordingIndicator.classList.add('active');
        recordingIndicator.textContent = 'Recording';
        pauseBtn.disabled = false;
        deleteBtn.disabled = false;
        controlButtons.classList.add('active');
        btnLabel.textContent = 'Stop';
        setTimer(0);
    });

    recorder.on('pause', () => {
        isPaused = true;
        recordingIndicator.textContent = 'Paused';
        pauseBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
        `;
    });

    recorder.on('resume', () => {
        isPaused = false;
        recordingIndicator.textContent = 'Recording';
        pauseBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
            </svg>
        `;
    });

    // Smooth level updates for waveform
    recorder.on('level', (level) => {
        renderLevel(level);
    });

    // Use SDK progress to update timer
    recorder.on('progress', (data) => {
        const duration =
            (data && typeof data.duration === 'number') ? data.duration :
            (data && data.recording && typeof data.recording.duration === 'number') ? data.recording.duration :
            0;
        setTimer(duration);
    });

    recorder.on('error', (error) => {
        console.error('Recording error:', error);
        alert(error?.message || 'Recording failed');
        resetUIToIdle();
    });
}
```

### Step 3: Update Your `stopRecording()` Function

The `stopRecording()` function should work as-is, but ensure it handles the blob correctly:

```javascript
async function stopRecording() {
    if (!recorder || !isRecording) {
        resetUIToIdle();
        return;
    }

    try {
        // Stop and get the result (works for both native and TGL SDK)
        const result = await recorder.stop();
        const audioBlob = result.blob;
        const audioUrl = URL.createObjectURL(audioBlob);
        const timestamp = new Date().toLocaleString();

        // Upload via SDK (authenticated S3 upload)
        let fileKey;
        try {
            const uploadRes = await Webpage.media.uploadFile(audioBlob, {
                filename: `recording-${Date.now()}.${result.mimeType === 'audio/m4a' ? 'm4a' : 'webm'}`,
                contentType: result.mimeType || 'audio/webm',
                onProgress: (progress) => {
                    // Optional: surface upload progress
                }
            });
            fileKey = uploadRes?.fileKey;
        } catch (uploadErr) {
            console.error('Upload failed:', uploadErr);
            // Keep local playback even if upload fails
        }

        recordings.push({ url: audioUrl, timestamp, fileKey });
        displayRecordings();
    } catch (err) {
        console.error('Error stopping recording:', err);
        alert('Failed to stop recording.');
    } finally {
        resetUIToIdle();
    }
}
```

## How It Works

1. **Automatic Detection**: The `createRecorder()` function automatically detects if `window.audioRecording` (native API) is available
2. **Native API**: If available, creates a `NativeAudioRecorderAdapter` that wraps the native API
3. **TGL SDK Fallback**: If native API is not available, falls back to TGL Media SDK
4. **Unified Interface**: Both adapters implement the same event-based interface, so your existing code works with either

## Testing

1. **In Native App**: Should use native Capacitor AudioRecording plugin
2. **In Web Browser**: Should fall back to TGL Media SDK
3. **Pause/Resume**: Should work with native API (TGL SDK also supports this)
4. **File Upload**: Should convert native recordings to blob and upload via TGL SDK

## Notes

- The native adapter provides mock level updates for waveform visualization (since native API doesn't provide real-time levels)
- File conversion from native recordings uses base64 data returned by the plugin for reliability
- All existing UI/UX behavior is maintained - no changes needed to your HTML/CSS

