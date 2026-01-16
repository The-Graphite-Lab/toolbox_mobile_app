'use client'

import { Button, TextField } from '@mui/material'
import type { CSSProperties, FormEvent } from 'react'
import { useState } from 'react'

type SignInFormProps = {
  onSignIn: (username: string, password: string) => Promise<void>
  isSubmitting: boolean
  error: string | null
  onClearError: () => void
}

export default function SignInForm({
  onSignIn,
  isSubmitting,
  error,
  onClearError,
}: SignInFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSignIn(username, password)
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    if (error) {
      onClearError()
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (error) {
      onClearError()
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <TextField
        label="Username"
        value={username}
        onChange={(event) => handleUsernameChange(event.target.value)}
        autoComplete="username"
        required
        fullWidth
        size="small"
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(event) => handlePasswordChange(event.target.value)}
        autoComplete="current-password"
        required
        fullWidth
        size="small"
      />
      {error ? <p style={styles.error}>{error}</p> : null}
      <div style={styles.buttonRow}>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            px: 4.5,
            py: 1.75,
            fontWeight: 600,
            minHeight: 52,
            width: '100%',
            backgroundColor: 'var(--color-brand-marigold)',
            color: 'var(--color-neutral-graphite)',
            boxShadow: '0 8px 20px rgba(14, 24, 50, 0.12)',
            '&:hover': {
              backgroundColor: 'var(--color-brand-marigold)',
            },
          }}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </div>
    </form>
  )
}

const styles: Record<string, CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
  },
  error: {
    color: 'var(--color-support-negative)',
    fontSize: '13px',
  },
  buttonRow: {
    marginTop: 'auto',
    display: 'flex',
  },
}
