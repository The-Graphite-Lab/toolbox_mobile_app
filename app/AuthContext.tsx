'use client'

import { createContext, useContext } from 'react'

type AuthContextValue = {
  name: string | null
  userId: string | null
  clientId: string | null
}

const AuthContext = createContext<AuthContextValue>({
  name: null,
  userId: null,
  clientId: null,
})

export const AuthProvider = AuthContext.Provider

export const useAuthContext = () => useContext(AuthContext)
