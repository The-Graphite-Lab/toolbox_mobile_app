'use client'

import { createContext, useContext } from 'react'

type AuthContextValue = {
  name: string | null
}

const AuthContext = createContext<AuthContextValue>({ name: null })

export const AuthProvider = AuthContext.Provider

export const useAuthContext = () => useContext(AuthContext)
