'use client'

import type { ReactNode } from 'react'

type AuthPageShellProps = {
  children: ReactNode
}

export default function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="w-full min-h-dvh grid grid-rows-[1fr_auto] justify-items-stretch bg-color-bg bg-[url('/images/TGL-WavesDots.svg')] bg-no-repeat bg-top bg-cover">
      <div className="flex items-center justify-center py-3">
        <img
          src="/images/TGL-ELI-ThumbsUp.svg"
          alt="Graphite Lab mascot"
          className="w-auto max-h-[min(180px,24vh)]"
        />
      </div>
      {children}
    </div>
  )
}
