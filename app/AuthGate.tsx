'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { fetchUserAttributes, getCurrentUser, signIn } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import { AuthProvider } from './AuthContext'
import LoadingScreen from '@/app/LoadingScreen'
import AuthCard from './components/auth/AuthCard'
import AuthPageShell from './components/auth/AuthPageShell'
import SignInForm from './components/auth/SignInForm'

type AuthGateProps = {
  children: ReactNode
}

type AuthStatus = 'checking' | 'signedIn' | 'signedOut' | 'error'

const getClientIdFromAttributes = (
  attributes: Record<string, string | undefined>
) => {
  const keys = ['custom:clientID', 'custom:clientId', 'custom:clientid']
  for (const key of keys) {
    const value = attributes[key]
    if (value && value.trim().length > 0) {
      return value
    }
  }
  return null
}

export default function AuthGate({ children }: AuthGateProps) {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentClientId, setCurrentClientId] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const loadUserProfile = useCallback(async () => {
    const user = await getCurrentUser()
    const attributes = await fetchUserAttributes()
    const safeAttributes = attributes as Record<string, string | undefined>
    const name = safeAttributes.name || user.username
    const clientId = getClientIdFromAttributes(safeAttributes)
    const userId = user.userId || user.username
    return { name, userId, clientId }
  }, [])

  const isUnauthenticatedError = (err: unknown) => {
    if (!(err instanceof Error)) {
      return false
    }
    const unauthenticatedNames = new Set([
      'UserUnAuthenticatedException',
      'UserUnauthenticatedException',
      'NotAuthorizedException',
    ])
    return unauthenticatedNames.has(err.name)
  }

  const checkSession = useCallback(async () => {
    setStatus('checking')
    setAuthError(null)
    try {
      const profile = await loadUserProfile()
      setDisplayName(profile.name)
      setCurrentUserId(profile.userId)
      setCurrentClientId(profile.clientId)
      setStatus('signedIn')
    } catch (err) {
      setDisplayName(null)
      setCurrentUserId(null)
      setCurrentClientId(null)
      if (isUnauthenticatedError(err)) {
        setStatus('signedOut')
        return
      }
      setStatus('error')
      setAuthError('We could not verify your session. Please try again.')
    }
  }, [loadUserProfile])

  useEffect(() => {
    let isActive = true

    const checkSessionSafe = async () => {
      try {
        const profile = await loadUserProfile()
        if (isActive) {
          setDisplayName(profile.name)
          setCurrentUserId(profile.userId)
          setCurrentClientId(profile.clientId)
          setStatus('signedIn')
          setAuthError(null)
        }
      } catch (err) {
        if (isActive) {
          setDisplayName(null)
          setCurrentUserId(null)
          setCurrentClientId(null)
          if (isUnauthenticatedError(err)) {
            setStatus('signedOut')
          } else {
            setStatus('error')
            setAuthError('We could not verify your session. Please try again.')
          }
        }
      }
    }

    checkSessionSafe()

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (!isActive) {
        return
      }

      if (payload.event === 'signedOut') {
        setStatus('signedOut')
        setError(null)
        setDisplayName(null)
        setCurrentUserId(null)
        setCurrentClientId(null)
        setAuthError(null)
      }

      if (payload.event === 'signedIn') {
        checkSessionSafe()
      }
    })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  const handleSignIn = async (username: string, password: string) => {
    if (isSubmitting) {
      return
    }

    if (!username || !password) {
      setError('Enter your username and password to sign in.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await signIn({ username, password })
      if (response.isSignedIn) {
        const profile = await loadUserProfile()
        setDisplayName(profile.name)
        setCurrentUserId(profile.userId)
        setCurrentClientId(profile.clientId)
        setStatus('signedIn')
        return
      }

      setError(`Sign in step required: ${response.nextStep.signInStep}`)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to sign in.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'checking') {
    return (
      <LoadingScreen />
    )
  }

  if (status === 'error') {
    return (
      <AuthPageShell>
        <AuthCard
          heading="Unable to verify session"
          subheading={authError ?? 'We ran into an issue while loading your account.'}
        >
          <button
            type="button"
            onClick={checkSession}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: 'var(--color-brand-marigold)',
              color: 'var(--color-neutral-graphite)',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Try again
          </button>
        </AuthCard>
      </AuthPageShell>
    )
  }

  if (status === 'signedOut') {
    return (
      <AuthPageShell>
        <AuthCard
          heading="Welcome back"
          subheading="Sign in to continue to The Graphite Lab."
        >
          <SignInForm
            onSignIn={handleSignIn}
            isSubmitting={isSubmitting}
            error={error}
            onClearError={() => setError(null)}
          />
        </AuthCard>
      </AuthPageShell>
    )
  }

  return (
    <AuthProvider value={{ name: displayName, userId: currentUserId, clientId: currentClientId }}>
      {children}
    </AuthProvider>
  )
}

