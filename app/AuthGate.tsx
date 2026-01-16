'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
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

type AuthStatus = 'checking' | 'signedIn' | 'signedOut'

export default function AuthGate({ children }: AuthGateProps) {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null)

  const loadUserProfile = async () => {
    const user = await getCurrentUser()
    const attributes = await fetchUserAttributes()
    const name = attributes.name || user.username
    return name
  }

  useEffect(() => {
    let isActive = true

    const checkSession = async () => {
      try {
        const name = await loadUserProfile()
        if (isActive) {
          setDisplayName(name)
          setStatus('signedIn')
        }
      } catch (err) {
        if (isActive) {
          setStatus('signedOut')
          setDisplayName(null)
        }
      }
    }

    checkSession()

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (!isActive) {
        return
      }

      if (payload.event === 'signedOut') {
        setStatus('signedOut')
        setError(null)
        setDisplayName(null)
      }

      if (payload.event === 'signedIn') {
        checkSession()
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
        const name = await loadUserProfile()
        setDisplayName(name)
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
    <AuthProvider value={{ name: displayName }}>
      {children}
    </AuthProvider>
  )
}

