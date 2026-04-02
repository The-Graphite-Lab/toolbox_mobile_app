'use client'

import { useState, type CSSProperties } from 'react'
import { signOut } from 'aws-amplify/auth'
import { useAuthContext } from './AuthContext'
import RideAlongsTab from './components/ride-alongs/RideAlongsTab'

const BOTTOM_BAR_HEIGHT = 50
const MIN_TOP_INSET = 44
const MIN_BOTTOM_INSET = 8
const SCROLL_CONTENT_TOP_INSET = `max(${MIN_TOP_INSET}px, calc(env(safe-area-inset-top, 0px) + 12px))`
const BOTTOM_SAFE_AREA_INSET = `max(${MIN_BOTTOM_INSET}px, env(safe-area-inset-bottom, 0px))`

function TechnicianRideAlongApp() {
  const { clientId, userId } = useAuthContext()
  const [homeTrigger, setHomeTrigger] = useState(0)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('[RideAlongsApp] Sign out failed:', error)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100dvh',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg)',
        backgroundImage: 'url(/images/TGL-WavesDots.svg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
        backgroundSize: 'cover',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          padding: '0 14px 0',
        }}
      >
        <RideAlongsTab
          clientId={clientId}
          userId={userId}
          homeTrigger={homeTrigger}
          topContentInset={SCROLL_CONTENT_TOP_INSET}
        />
      </div>

      <nav
        role="navigation"
        aria-label="App navigation"
        style={{
          width: '100%',
          flexShrink: 0,
          minHeight: BOTTOM_BAR_HEIGHT,
          paddingTop: 6,
          paddingBottom: BOTTOM_SAFE_AREA_INSET,
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingInline: 10,
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            gap: 6,
          }}
        >
          <button
            type="button"
            aria-label="Home"
            aria-current="page"
            onClick={() => setHomeTrigger((t) => t + 1)}
            style={{
              ...tabButtonStyle,
              ...activeTabButtonStyle,
            }}
          >
            <i className="fa-solid fa-house" style={{ fontSize: 17 }} aria-hidden="true" />
            <span style={{ fontSize: 10, fontWeight: 600 }}>Home</span>
          </button>
          <button
            type="button"
            aria-label="Logout"
            onClick={() => setShowLogoutConfirm(true)}
            style={tabButtonStyle}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 17 }} aria-hidden="true" />
            <span style={{ fontSize: 10, fontWeight: 600 }}>Logout</span>
          </button>
        </div>
      </nav>

      {showLogoutConfirm ? (
        <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
          <div style={dialogStyle}>
            <p id="logout-dialog-title" style={dialogTitleStyle}>Log out?</p>
            <p style={dialogBodyStyle}>Are you sure you want to log out?</p>
            <div style={dialogActionsStyle}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                style={dialogCancelStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false)
                  void handleSignOut()
                }}
                style={dialogConfirmStyle}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const tabButtonStyle: CSSProperties = {
  border: 'none',
  borderRadius: 10,
  backgroundColor: 'transparent',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 3,
  padding: '5px 16px',
  minWidth: 72,
  flex: 1,
}

const activeTabButtonStyle: CSSProperties = {
  backgroundColor: 'var(--color-brand-sand)',
  color: 'var(--color-brand-marigold)',
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '0 32px',
}

const dialogStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  padding: '24px 20px 16px',
  width: '100%',
  maxWidth: 320,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const dialogTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 17,
  fontWeight: 700,
  color: 'var(--color-text)',
  textAlign: 'center',
}

const dialogBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: 'var(--color-text-muted)',
  textAlign: 'center',
  paddingBottom: 8,
}

const dialogActionsStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  marginTop: 4,
}

const dialogCancelStyle: CSSProperties = {
  flex: 1,
  border: '1px solid var(--color-border)',
  borderRadius: 10,
  padding: '10px 0',
  fontSize: 14,
  fontWeight: 600,
  backgroundColor: '#ffffff',
  color: 'var(--color-text)',
  cursor: 'pointer',
}

const dialogConfirmStyle: CSSProperties = {
  flex: 1,
  border: 'none',
  borderRadius: 10,
  padding: '10px 0',
  fontSize: 14,
  fontWeight: 600,
  backgroundColor: 'var(--color-brand-navy)',
  color: '#ffffff',
  cursor: 'pointer',
}

export default function Home() {
  return <TechnicianRideAlongApp />
}
