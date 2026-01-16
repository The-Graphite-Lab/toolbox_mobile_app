'use client'

import { useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { AudioRecording } from '@/plugins/AudioRecording'
import { signOut } from 'aws-amplify/auth'
import { useAuthContext } from './AuthContext'
import LoadingScreen from '@/app/LoadingScreen'

function WebpageViewer() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [webViewUrl, setWebViewUrl] = useState<string>('')
  const [view, setView] = useState<'home' | 'webview'>('home')
  const { name: displayName } = useAuthContext()
  const [isWebViewLoading, setIsWebViewLoading] = useState(false)

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
            setView('webview')
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
          setView('webview')
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
          const redirectKey = 'tgl:websession-redirect'
          const lastRedirectUrl = window.sessionStorage.getItem(redirectKey)
          if (lastRedirectUrl !== urlParam) {
            setView('webview')
            window.sessionStorage.setItem(redirectKey, urlParam)
          }
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

  useEffect(() => {
    if (view === 'webview' && webViewUrl) {
      setIsWebViewLoading(true)
    }
  }, [view, webViewUrl])

  const showHome = view === 'home'

  const navButtonBase: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    border: 'none',
    background: 'transparent',
    fontSize: '11px',
    cursor: 'pointer',
    flex: 1,
    height: '100%',
  }

  const navIconStyle: React.CSSProperties = {
    fontSize: '20px',
  }

  const primaryButtonStyle: React.CSSProperties = {
    border: 'none',
    borderRadius: '999px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: 'var(--color-brand-marigold)',
    color: 'var(--color-neutral-graphite)',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '320px',
  }

  const homePageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    backgroundColor: 'var(--color-bg)',
    backgroundImage: 'url(/images/TGL-WavesDots.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    backgroundSize: 'auto 100vh',
  }

  const homeCardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    height: '80vh',
    maxHeight: '80vh',
    backgroundColor: '#ffffff',
    borderRadius: '32px 32px 0 0',
    padding: '24px 22px 32px',
    boxShadow: '0 -12px 40px rgba(0, 0, 0, 0.18)',
    color: 'var(--color-text)',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  }

  const homeGreetingStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    letterSpacing: '0.02em',
  }

  const homeWelcomeCardStyle: React.CSSProperties = {
    borderRadius: '16px',
    border: '1px solid var(--color-border)',
    padding: '14px 16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 8px 20px rgba(36, 41, 101, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }

  const homeWelcomeTopRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  }

  const homeWelcomeChipStyle: React.CSSProperties = {
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 600,
    border: '1px solid rgba(21, 55, 91, 0.12)',
    backgroundColor: 'rgba(21, 55, 91, 0.04)',
    color: 'var(--color-text)',
  }

  const homeWelcomeTitleStyle: React.CSSProperties = {
    fontSize: '20px',
    margin: 0,
    letterSpacing: '-0.01em',
    color: 'var(--color-text)',
  }

  const homeWelcomeTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    margin: 0,
  }

  const homeSectionTitleStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '8px',
  }

  const homeHeroCardStyle: React.CSSProperties = {
    borderRadius: '18px',
    border: '1px solid rgba(21, 55, 91, 0.1)',
    padding: '16px 16px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 12px 24px rgba(36, 41, 101, 0.08)',
  }

  const homeHeroRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  }

  const homeHeroLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
  }

  const homeHeroValueStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--color-text)',
  }

  const homeActionRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
  }

  const homeSecondaryButtonStyle: React.CSSProperties = {
    border: '1px solid rgba(21, 55, 91, 0.12)',
    borderRadius: '14px',
    padding: '12px 10px',
    backgroundColor: '#ffffff',
    color: 'var(--color-text)',
    fontSize: '12px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 10px 18px rgba(36, 41, 101, 0.06)',
  }

  const homeFooterNoteStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
  }

  const emptyWebViewStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-bg)',
    backgroundImage: 'url(/images/TGL-WavesDots.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    backgroundSize: 'auto 100vh',
    padding: '24px',
  }

  const emptyWebViewCardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '320px',
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '18px 16px',
    border: '1px solid var(--color-border)',
    boxShadow: '0 12px 28px rgba(36, 41, 101, 0.16)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    textAlign: 'center',
  }

  const emptyWebViewTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--color-text)',
  }

  const emptyWebViewTextStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
  }

  const webViewShellStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setView('home')
    } catch (error) {
      console.error('[App] Sign out failed:', error)
    }
  }

  const handleClearWebpage = () => {
    setWebViewUrl('')
    setView('home')
    setIsWebViewLoading(false)
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--color-bg)',
    }}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          backgroundColor: showHome || !webViewUrl ? 'var(--color-bg)' : '#ffffff',
        }}
      >
        {showHome ? (
          <div style={homePageStyle}>
            <div style={homeCardStyle}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}>
                <div style={homeWelcomeCardStyle}>
                  <div style={homeWelcomeTopRowStyle}>
                    <p style={homeGreetingStyle}>
                      {displayName ? `Good to see you, ${displayName}` : 'Good to see you'}
                    </p>
                    <span style={homeWelcomeChipStyle}>
                      {webViewUrl ? 'Ready' : 'Waiting'}
                    </span>
                  </div>
                  <div>
                    <h1 style={homeWelcomeTitleStyle}>
                      Your workspace
                    </h1>
                    <p style={homeWelcomeTextStyle}>
                      {webViewUrl
                        ? 'Your latest webpage is ready. Tap below to open it.'
                        : 'Your next webpage will open here when it arrives.'}
                    </p>
                  </div>
                </div>
                <div>
                  <p style={homeSectionTitleStyle}>Current webpage</p>
                  <div style={homeHeroCardStyle}>
                    <div style={homeHeroRowStyle}>
                      <span style={homeHeroLabelStyle}>Status</span>
                      <span style={homeWelcomeChipStyle}>
                        {webViewUrl ? 'Ready' : 'Waiting'}
                      </span>
                    </div>
                    <div style={homeHeroValueStyle}>
                      {webViewUrl ? 'Webpage ready to open' : 'No webpage loaded yet'}
                    </div>
                    <p style={homeWelcomeTextStyle}>
                      {webViewUrl
                        ? 'Open it to complete the task or workflow you were sent.'
                        : 'We will notify you when a new webpage arrives.'}
                    </p>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    style={{
                      ...primaryButtonStyle,
                      maxWidth: '100%',
                      width: '100%',
                      fontSize: '13px',
                      padding: '12px 10px',
                      ...(webViewUrl
                        ? {}
                        : {
                          backgroundColor: 'var(--color-border)',
                          color: 'var(--color-text-muted)',
                          cursor: 'not-allowed',
                        }),
                    }}
                    onClick={() => setView('webview')}
                    disabled={!webViewUrl}
                  >
                    {webViewUrl ? 'Open webpage' : 'Waiting for a webpage'}
                  </button>
                </div>
                <div>
                  <p style={homeSectionTitleStyle}>Quick actions</p>
                  <div style={homeActionRowStyle}>
                    <button
                      type="button"
                      style={homeSecondaryButtonStyle}
                      onClick={handleClearWebpage}
                      disabled={!webViewUrl}
                    >
                      <i className="fa-solid fa-trash-can" aria-hidden="true" />
                      Clear webpage
                    </button>
                    <button
                      type="button"
                      style={homeSecondaryButtonStyle}
                    >
                      <i className="fa-solid fa-link" aria-hidden="true" />
                      Copy link
                    </button>
                    <button
                      type="button"
                      style={homeSecondaryButtonStyle}
                    >
                      <i className="fa-solid fa-rotate" aria-hidden="true" />
                      Refresh
                    </button>
                    <button
                      type="button"
                      style={homeSecondaryButtonStyle}
                    >
                      <i className="fa-solid fa-comment-dots" aria-hidden="true" />
                      Message support
                    </button>
                    <button
                      type="button"
                      style={homeSecondaryButtonStyle}
                    >
                      <i className="fa-solid fa-circle-info" aria-hidden="true" />
                      How it works
                    </button>
                  </div>
                </div>
                <p style={homeFooterNoteStyle}>
                  Need a new webpage? Ask your dispatcher to send the next link.
                </p>
              </div>
            </div>
          </div>
        ) : webViewUrl ? (
          <div style={webViewShellStyle}>
            {isWebViewLoading ? <LoadingScreen /> : null}
            <iframe
              ref={iframeRef}
              src={webViewUrl}
              onLoad={() => setIsWebViewLoading(false)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                opacity: isWebViewLoading ? 0 : 1,
              }}
              allow="microphone"
              title="The Graphite Lab"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
            />
          </div>
        ) : (
          <div style={emptyWebViewStyle}>
            <div style={emptyWebViewCardStyle}>
              <i
                className="fa-solid fa-square-up-right"
                aria-hidden="true"
                style={{ fontSize: '20px', color: 'var(--color-brand-tangerine)' }}
              />
              <div style={emptyWebViewTitleStyle}>No active webpage</div>
              <div style={emptyWebViewTextStyle}>
                A new webpage will appear here when it is ready.
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{
        height: '72px',
        borderTop: '1px solid var(--color-border)',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
      }}>
        <button
          type="button"
          onClick={() => setView('home')}
          style={{
            ...navButtonBase,
            color: view === 'home' ? 'var(--color-text)' : 'var(--color-text-muted)',
          }}
        >
          <i
            className="fa-solid fa-house"
            aria-hidden="true"
            style={navIconStyle}
          />
          Home
        </button>
        <button
          type="button"
          onClick={() => setView('webview')}
          style={{
            ...navButtonBase,
            color: view === 'webview'
              ? 'var(--color-text)'
              : 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
        >
          <i
            className="fa-solid fa-square-up-right"
            aria-hidden="true"
            style={navIconStyle}
          />
          Web
        </button>
        <button
          type="button"
          aria-label="Logout"
          onClick={handleSignOut}
          style={{
            ...navButtonBase,
            color: 'var(--color-text-muted)',
          }}
        >
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true" style={navIconStyle} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  return <WebpageViewer />
}

