import type { Metadata } from 'next'
import './globals.css'
import ThemeRegistry from './ThemeRegistry'
import AmplifyProvider from './AmplifyProvider'
import AuthGate from './AuthGate'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'The Graphite Lab',
  description: 'Mobile app for serving webpages with audio recording',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/efx2sth.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body>
        <ThemeRegistry>
          <AmplifyProvider>
            <AuthGate>{children}</AuthGate>
          </AmplifyProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}

