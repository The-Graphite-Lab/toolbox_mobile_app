'use client'

import { signOut } from 'aws-amplify/auth'
import { useAuthContext } from './AuthContext'
import RideAlongsTab from './components/ride-alongs/RideAlongsTab'

function TechnicianRideAlongApp() {
  const { name: displayName, clientId, userId } = useAuthContext()

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
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg)',
        backgroundImage: 'url(/images/TGL-WavesDots.svg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
        backgroundSize: 'auto 100vh',
      }}
    >
      <div
        style={{
          padding: '14px 14px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div
          style={{
            borderRadius: '18px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border)',
            boxShadow: '0 12px 26px rgba(36, 41, 101, 0.08)',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Technician Console
            </div>
            <div style={{ fontSize: '17px', color: 'var(--color-text)', fontWeight: 700 }}>
              {displayName ? `Welcome, ${displayName}` : 'Ride Alongs'}
            </div>
          </div>
          <button
            type="button"
            aria-label="Logout"
            onClick={handleSignOut}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '999px',
              backgroundColor: '#ffffff',
              color: 'var(--color-text-muted)',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: '0 0 10px',
        }}
      >
        <RideAlongsTab clientId={clientId} userId={userId} />
      </div>
    </div>
  )
}

export default function Home() {
  return <TechnicianRideAlongApp />
}
