'use client'

import type { ReactNode } from 'react'

type AuthCardProps = {
  heading: string
  subheading: string
  children: ReactNode
}

export default function AuthCard({ heading, subheading, children }: AuthCardProps) {
  return (
    <div className="w-full h-[70vh] max-h-[70vh] bg-white rounded-3xl px-6 pt-7 pb-9 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] text-color-text overflow-y-auto flex flex-col">
      <h1 className="text-[22px] mb-2">{heading}</h1>
      <p className="text-sm text-color-text-muted mb-5">{subheading}</p>
      {children}
    </div>
  )
}
