'use client'

import type { ReactNode } from 'react'
import { Amplify } from 'aws-amplify'
import awsExports from '@/src/aws-exports'

let isConfigured = false

type AmplifyProviderProps = {
  children: ReactNode
}

export default function AmplifyProvider({ children }: AmplifyProviderProps) {
  if (!isConfigured) {
    Amplify.configure({
      ...awsExports,
    })
    isConfigured = true
  }

  return children
}
