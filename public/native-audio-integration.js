/**
 * Native Audio Recording Integration
 * 
 * Add this script to your webpage BEFORE your existing recorder initialization code.
 * 
 * Usage:
 * 1. Include the adapter script: <script src="/native-audio-adapter.js"></script>
 * 2. Include this integration script: <script src="/native-audio-integration.js"></script>
 * 3. Modify your ensureRecorder() function to use createRecorder() from this script
 */

/**
 * Creates a recorder instance, preferring native API if available
 * Falls back to TGL SDK if native API is not available
 */
async function createRecorder(options = {}) {
    // Try to create native adapter first
    if (typeof createNativeAudioRecorder === 'function') {
        const nativeRecorder = createNativeAudioRecorder(options);
        if (nativeRecorder) {
            console.log('[Audio] Using native Capacitor AudioRecording API');
            return nativeRecorder;
        }
    }

    // Fall back to TGL SDK
    if (window.Webpage && window.Webpage.media && window.Webpage.media.isSupported && window.Webpage.media.isSupported()) {
        console.log('[Audio] Using TGL Media SDK');
        return window.Webpage.media.createAudioRecorder({
            showUI: false,
            format: options.format || 'webm',
            maxDuration: options.maxDuration || 2700000, // 45 minutes
            quality: options.quality || 0.8
        });
    }

    throw new Error('No audio recording API available');
}

/**
 * Helper to convert file path to blob (for native recordings)
 * This uses Capacitor Filesystem API if available
 */
async function filePathToBlob(filePath) {
    try {
        // Try using Capacitor Filesystem API
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem) {
            const Filesystem = window.Capacitor.Plugins.Filesystem;
            
            // Extract filename from path
            const filename = filePath.split('/').pop();
            
            const result = await Filesystem.readFile({
                path: filename,
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

        // Alternative: Try using Capacitor HTTP plugin to read file
        // This would require the native plugin to expose an HTTP endpoint
        // For now, we'll throw an error and suggest enhancement
        
        throw new Error('Unable to read file. Capacitor Filesystem plugin may not be available.');
    } catch (error) {
        console.error('Error converting file path to blob:', error);
        throw error;
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.createRecorder = createRecorder;
    window.filePathToBlob = filePathToBlob;
}

