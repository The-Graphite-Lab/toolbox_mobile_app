/**
 * Native Audio Recording Adapter
 * Wraps the native Capacitor AudioRecording plugin to match TGL SDK interface
 */

class NativeAudioRecorderAdapter {
    constructor() {
        this.nativeAPI = window.audioRecording;
        this.eventListeners = {};
        this.isRecording = false;
        this.isPaused = false;
        this.statusCheckInterval = null;
        this.levelAnimationInterval = null;
        this.startTime = null;
        this.duration = 0;
    }

    /**
     * Event emitter pattern - matches TGL SDK interface
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.eventListeners[event]) return;
        const index = this.eventListeners[event].indexOf(callback);
        if (index > -1) {
            this.eventListeners[event].splice(index, 1);
        }
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    /**
     * Start recording
     */
    async start() {
        if (this.isRecording) {
            throw new Error('Recording already in progress');
        }

        try {
            const result = await this.nativeAPI.start({});
            if (result.success) {
                this.isRecording = true;
                this.isPaused = false;
                this.startTime = Date.now();
                this.duration = 0;
                
                // Start status polling
                this.startStatusPolling();
                
                // Start level animation (mock waveform)
                this.startLevelAnimation();
                
                // Emit start event
                this.emit('start');
                
                return result;
            } else {
                throw new Error(result.message || 'Failed to start recording');
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Stop recording and convert file path to blob
     */
    async stop() {
        if (!this.isRecording) {
            throw new Error('No active recording');
        }

        try {
            // Stop polling and animation
            this.stopStatusPolling();
            this.stopLevelAnimation();

            const result = await this.nativeAPI.stop();
            
            if (result.success) {
                let blob;
                
                // Prefer base64 data if available (more reliable)
                if (result.base64Data) {
                    blob = this.base64ToBlob(result.base64Data, result.mimeType || 'audio/m4a');
                } else if (result.filePath) {
                    // Fallback to file path conversion
                    blob = await this.filePathToBlob(result.filePath);
                } else {
                    throw new Error('No file data or path returned from recording');
                }
                
                this.isRecording = false;
                this.isPaused = false;
                
                // Emit stop event with blob (matching TGL SDK format)
                this.emit('stop', {
                    blob: blob,
                    duration: result.duration || 0,
                    mimeType: result.mimeType || 'audio/m4a',
                    size: blob.size,
                    filePath: result.filePath // Keep original path for reference
                });

                return {
                    blob: blob,
                    duration: result.duration || 0,
                    mimeType: result.mimeType || 'audio/m4a',
                    size: blob.size,
                    filePath: result.filePath
                };
            } else {
                throw new Error(result.message || 'Failed to stop recording');
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Pause recording
     */
    async pause() {
        if (!this.isRecording || this.isPaused) {
            return;
        }

        try {
            const result = await this.nativeAPI.pause();
            if (result.success) {
                this.isPaused = true;
                this.stopLevelAnimation(); // Stop animation when paused
                this.emit('pause');
                return result;
            } else {
                throw new Error(result.message || 'Failed to pause recording');
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Resume recording
     */
    async resume() {
        if (!this.isRecording || !this.isPaused) {
            return;
        }

        try {
            const result = await this.nativeAPI.resume();
            if (result.success) {
                this.isPaused = false;
                this.startLevelAnimation(); // Resume animation
                this.emit('resume');
                return result;
            } else {
                throw new Error(result.message || 'Failed to resume recording');
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Poll status for progress updates
     */
    startStatusPolling() {
        if (this.statusCheckInterval) return;

        this.statusCheckInterval = setInterval(async () => {
            if (!this.isRecording) {
                this.stopStatusPolling();
                return;
            }

            try {
                const status = await this.nativeAPI.getStatus();
                
                if (status.isRecording !== undefined) {
                    this.isRecording = status.isRecording || this.isPaused;
                }
                
                if (status.isPaused !== undefined) {
                    this.isPaused = status.isPaused;
                }

                // Update duration
                if (status.duration !== undefined) {
                    this.duration = status.duration * 1000; // Convert to milliseconds
                } else if (this.startTime) {
                    this.duration = Date.now() - this.startTime;
                }

                // Emit level if included in status (some implementations include it)
                if (status.level !== undefined && typeof status.level === 'number') {
                    this.emit('level', status.level);
                }

                // Emit progress event (matching TGL SDK format)
                this.emit('progress', {
                    duration: this.duration,
                    maxDuration: 2700000 // 45 minutes (matching webpage config)
                });
            } catch (error) {
                console.error('Error polling status:', error);
            }
        }, 200); // Poll every 200ms for smooth updates
    }

    stopStatusPolling() {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
    }

    /**
     * Poll for real audio levels from native API
     * Uses AVAudioRecorder's metering capabilities for accurate waveform visualization
     */
    startLevelAnimation() {
        if (this.levelAnimationInterval) return;

        // Poll for real audio levels
        this.levelAnimationInterval = setInterval(async () => {
            if (!this.isRecording || this.isPaused) {
                this.stopLevelAnimation();
                return;
            }

            try {
                // Get real audio level from native API
                if (this.nativeAPI.getLevels) {
                    const result = await this.nativeAPI.getLevels();
                    if (result && typeof result.level === 'number') {
                        this.emit('level', result.level);
                    }
                } else {
                    // Fallback: try to get level from status if getLevels not available
                    const status = await this.nativeAPI.getStatus();
                    if (status && typeof status.level === 'number') {
                        this.emit('level', status.level);
                    }
                }
            } catch (error) {
                console.error('Error getting audio level:', error);
                // Emit 0 level on error to avoid breaking waveform
                this.emit('level', 0);
            }
        }, 50); // Update every 50ms for smooth waveform (20fps)
    }

    stopLevelAnimation() {
        if (this.levelAnimationInterval) {
            clearInterval(this.levelAnimationInterval);
            this.levelAnimationInterval = null;
        }
    }

    /**
     * Convert base64 string to Blob
     */
    base64ToBlob(base64Data, mimeType = 'audio/m4a') {
        try {
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            return new Blob([byteArray], { type: mimeType });
        } catch (error) {
            console.error('Error converting base64 to blob:', error);
            throw new Error('Failed to convert base64 data to blob');
        }
    }

    /**
     * Convert iOS file path to Blob (fallback method)
     * Note: This requires Capacitor's Filesystem API or fetch from file:// URL
     */
    async filePathToBlob(filePath) {
        try {
            // Try using Capacitor Filesystem API if available
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem) {
                const Filesystem = window.Capacitor.Plugins.Filesystem;
                const result = await Filesystem.readFile({
                    path: filePath,
                    directory: 'DOCUMENTS'
                });
                
                if (result.data) {
                    // Convert base64 to blob
                    const byteCharacters = atob(result.data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    return new Blob([byteArray], { type: 'audio/m4a' });
                }
            }

            // Fallback: Try fetching as file:// URL
            // Note: This may not work in all contexts due to security restrictions
            try {
                const response = await fetch(`file://${filePath}`);
                if (response.ok) {
                    return await response.blob();
                }
            } catch (e) {
                console.warn('Could not fetch file:// URL:', e);
            }

            // Last resort: Create a placeholder blob with error info
            // In practice, you might want to use Capacitor's HTTP plugin
            // or expose a method in the native plugin to return base64 data
            throw new Error('Unable to convert file path to blob. File path: ' + filePath);
        } catch (error) {
            console.error('Error converting file path to blob:', error);
            throw error;
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stopStatusPolling();
        this.stopLevelAnimation();
        this.eventListeners = {};
        this.isRecording = false;
        this.isPaused = false;
    }
}

/**
 * Factory function to create adapter if native API is available
 */
function createNativeAudioRecorder(options = {}) {
    // Check if native API is available
    if (!window.audioRecording || typeof window.audioRecording.start !== 'function') {
        return null;
    }

    return new NativeAudioRecorderAdapter();
}

// Export for use in webpage
if (typeof window !== 'undefined') {
    window.NativeAudioRecorderAdapter = NativeAudioRecorderAdapter;
    window.createNativeAudioRecorder = createNativeAudioRecorder;
}

