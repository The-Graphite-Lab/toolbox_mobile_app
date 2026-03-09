'use client'

import { useState, type CSSProperties } from 'react'
import { signOut } from 'aws-amplify/auth'
import { useAuthContext } from './AuthContext'
import CoachingTab from './components/coaching/CoachingTab'
import RideAlongsTab from './components/ride-alongs/RideAlongsTab'

const BOTTOM_BAR_HEIGHT = 50
const MIN_TOP_INSET = 44
const MIN_BOTTOM_INSET = 8
const SCROLL_CONTENT_TOP_INSET = `max(${MIN_TOP_INSET}px, calc(env(safe-area-inset-top, 0px) + 12px))`
const BOTTOM_SAFE_AREA_INSET = `max(${MIN_BOTTOM_INSET}px, env(safe-area-inset-bottom, 0px))`

type AppTab = 'home' | 'coaching'

function TechnicianRideAlongApp() {
  const { clientId, userId } = useAuthContext()
  const [homeTrigger, setHomeTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState<AppTab>('home')

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
          padding: activeTab === 'coaching' ? '0' : '0 14px 0',
        }}
      >
        {activeTab === 'home' ? (
          <RideAlongsTab
            clientId={clientId}
            userId={userId}
            homeTrigger={homeTrigger}
            topContentInset={SCROLL_CONTENT_TOP_INSET}
          />
        ) : (
          <CoachingTab topContentInset={SCROLL_CONTENT_TOP_INSET} />
        )}
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
            aria-current={activeTab === 'home' ? 'page' : undefined}
            onClick={() => {
              setActiveTab('home')
              setHomeTrigger((t) => t + 1)
            }}
            style={{
              ...tabButtonStyle,
              ...(activeTab === 'home' ? activeTabButtonStyle : inactiveTabButtonStyle),
            }}
          >
            <i className="fa-solid fa-house" style={{ fontSize: 17 }} aria-hidden="true" />
            <span style={{ fontSize: 10, fontWeight: 600 }}>Home</span>
          </button>
          <button
            type="button"
            aria-label="Coaching"
            aria-current={activeTab === 'coaching' ? 'page' : undefined}
            onClick={() => setActiveTab('coaching')}
            style={{
              ...tabButtonStyle,
              ...(activeTab === 'coaching' ? activeTabButtonStyle : inactiveTabButtonStyle),
            }}
          >
            <i className="fa-solid fa-chart-line" style={{ fontSize: 17 }} aria-hidden="true" />
            <span style={{ fontSize: 10, fontWeight: 600 }}>Coaching</span>
          </button>
          <button
            type="button"
            aria-label="Logout"
            onClick={handleSignOut}
            style={tabButtonStyle}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 17 }} aria-hidden="true" />
            <span style={{ fontSize: 10, fontWeight: 600 }}>Logout</span>
          </button>
        </div>
      </nav>
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

const inactiveTabButtonStyle: CSSProperties = {
  backgroundColor: 'transparent',
  color: 'var(--color-text-muted)',
}

export default function Home() {
  return <TechnicianRideAlongApp />
}
