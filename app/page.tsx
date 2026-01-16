'use client'

import { useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { AudioRecording } from '@/plugins/AudioRecording'

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [webViewUrl, setWebViewUrl] = useState<string>('')

  // Parse deep link URL from custom scheme
  // Format: tglwebpages://webhooks.thegraphitelab.com/path
  // Converts to: https://webhooks.thegraphitelab.com/path
  const parseDeepLinkUrl = (url: string): string | null => {
    try {
      // Remove the custom scheme prefix
      if (url.startsWith('tglwebpages://')) {
        const urlWithoutScheme = url.replace('tglwebpages://', '')
        // Convert to https://
        return `https://${urlWithoutScheme}`
      }
      return null
    } catch (error) {
      console.error('[App] Error parsing deep link URL:', error)
      return null
    }
  }

  useEffect(() => {
    // Handle deep links when app opens
    if (Capacitor.isNativePlatform()) {
      // Check for initial URL when app launches
      App.getLaunchUrl().then((result) => {
        if (result?.url) {
          console.log('[App] Launch URL received:', result.url)
          const parsedUrl = parseDeepLinkUrl(result.url)
          if (parsedUrl) {
            console.log('[App] Setting webview URL from deep link:', parsedUrl)
            setWebViewUrl(parsedUrl)
          }
        }
      }).catch(() => {
        // No launch URL, use default
        console.log('[App] No launch URL, using default')
      })

      // Listen for app URL open events (when app is already running)
      const urlListener = App.addListener('appUrlOpen', (data) => {
        console.log('[App] App URL open event:', data.url)
        const parsedUrl = parseDeepLinkUrl(data.url)
        if (parsedUrl) {
          console.log('[App] Setting webview URL from appUrlOpen:', parsedUrl)
          setWebViewUrl(parsedUrl)
        }
      })

      return () => {
        urlListener.then(listener => listener.remove())
      }
    } else {
      // Web fallback - check URL params or use default
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const urlParam = urlParams.get('url')
        if (urlParam) {
          setWebViewUrl(urlParam)
        } else {
          // Default fallback for web testing
          setWebViewUrl('https://webhooks.thegraphitelab.com/instance/cc4e8086-a247-4f03-9d4b-36e040eb8b75')
        }
      }
    }
  }, [])

  useEffect(() => {
    // Only proceed if we have a URL to load
    if (!webViewUrl) {
      return
    }

    // Expose audio recording API to window for webpages to access
    if (typeof window !== 'undefined') {
      console.log('[App] Exposing audio recording API to window')
      
      // Make AudioRecording plugin available globally
      ;(window as any).audioRecording = {
        start: async (options?: { filename?: string }) => {
          try {
            console.log('[App] audioRecording.start called', options)
            return await AudioRecording.start(options || {})
          } catch (error) {
            console.error('[App] audioRecording.start error:', error)
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
          }
        },
        stop: async () => {
          try {
            console.log('[App] audioRecording.stop called')
            return await AudioRecording.stop()
          } catch (error) {
            console.error('[App] audioRecording.stop error:', error)
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
          }
        },
        pause: async () => {
          try {
            console.log('[App] audioRecording.pause called')
            return await AudioRecording.pause()
          } catch (error) {
            console.error('[App] audioRecording.pause error:', error)
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
          }
        },
        resume: async () => {
          try {
            console.log('[App] audioRecording.resume called')
            return await AudioRecording.resume()
          } catch (error) {
            console.error('[App] audioRecording.resume error:', error)
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
          }
        },
        getStatus: async () => {
          try {
            console.log('[App] audioRecording.getStatus called')
            return await AudioRecording.getStatus()
          } catch (error) {
            console.error('[App] audioRecording.getStatus error:', error)
            return { isRecording: false }
          }
        },
        getLevels: async () => {
          try {
            console.log('[App] audioRecording.getLevels called')
            return await AudioRecording.getLevels()
          } catch (error) {
            console.error('[App] audioRecording.getLevels error:', error)
            return { level: 0.0 }
          }
        },
      }

      // Ensure Capacitor is available on window (it should be in native, but ensure it's accessible)
      if (Capacitor && !(window as any).Capacitor) {
        ;(window as any).Capacitor = Capacitor
        console.log('[App] Capacitor exposed to window')
      }

      // Also expose via Capacitor if available
      if ((window as any).Capacitor) {
        ;(window as any).Capacitor.Plugins = (window as any).Capacitor.Plugins || {}
        ;(window as any).Capacitor.Plugins.AudioRecording = AudioRecording
        console.log('[App] AudioRecording exposed via Capacitor.Plugins')
      }
      
      console.log('[App] Platform:', Capacitor.isNativePlatform() ? 'Native' : 'Web')
      console.log('[App] AudioRecording API available:', !!AudioRecording)
    }

    // Handle app state changes
    if (Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive)
      })
    }

    // Inject bridge into iframe when it loads (for both local and external URLs)
    const injectBridge = () => {
      if (iframeRef.current?.contentWindow) {
        try {
          const iframe = iframeRef.current
          
          // Try to inject immediately if iframe is already loaded
          const tryInject = () => {
            try {
              const iframeWindow = iframe.contentWindow
              const iframeDoc = iframe.contentDocument || iframeWindow?.document
              
              if (iframeDoc && iframeWindow) {
                // Check if already injected
                if ((iframeWindow as any).__capacitorBridgeInjected) {
                  return
                }
                
                // Inject the audio recording API into the iframe using a script element
                const script = iframeDoc.createElement('script')
                script.textContent = `
                  (function() {
                    // Get the parent window's audioRecording API
                    if (window.parent && window.parent.audioRecording) {
                      window.audioRecording = window.parent.audioRecording;
                    }
                    if (window.parent && window.parent.Capacitor) {
                      window.Capacitor = window.parent.Capacitor;
                      if (window.Capacitor.Plugins) {
                        window.Capacitor.Plugins.AudioRecording = window.parent.Capacitor.Plugins.AudioRecording;
                      }
                    }
                    // Mark as injected
                    window.__capacitorBridgeInjected = true;
                    // Dispatch event to notify the page
                    window.dispatchEvent(new Event('capacitorReady'));
                  })();
                `
                iframeDoc.head.appendChild(script)
              }
            } catch (e) {
              console.error('Failed to inject bridge into iframe:', e)
            }
          }
          
          // Set up onload handler
          iframe.onload = () => {
            // Wait a bit for the iframe's document to be fully ready
            setTimeout(tryInject, 50)
          }
          
          // Also try immediately in case iframe is already loaded
          if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            tryInject()
          } else {
            // Try after a short delay
            setTimeout(tryInject, 100)
          }
        } catch (e) {
          console.error('Failed to access iframe:', e)
        }
      }
    }

    // Inject bridge into iframe (for both web and native, local and external URLs)
    // Try injection immediately and also after iframe loads
    injectBridge()
    setTimeout(injectBridge, 500)
  }, [webViewUrl])

  // Don't render iframe until we have a URL
  if (!webViewUrl) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <p>Waiting for webpage URL...</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Open a webpage with the TGL app redirect snippet
          </p>
        </div>
      </div>
    )
  }

  // Use iframe for all URLs (both local and external, web and native)
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <iframe
        ref={iframeRef}
        src={webViewUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="microphone"
        title="Webpage Viewer"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
      />
    </div>
  )
}

