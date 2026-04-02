'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'

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
    if (error) onClearError()
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (error) onClearError()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          autoComplete="username"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      {error ? (
        <p className="text-support-negative text-[13px]">{error}</p>
      ) : null}
      <div className="mt-auto flex">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[52px] rounded-[10px] font-semibold bg-brand-marigold text-neutral-graphite hover:bg-brand-marigold shadow-[0_8px_20px_rgba(14,24,50,0.12)]"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </div>
    </form>
  )
}
