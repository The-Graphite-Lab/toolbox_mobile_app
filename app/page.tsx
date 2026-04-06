'use client'

import { useState } from 'react'
import { signOut } from 'aws-amplify/auth'
import { useAuthContext } from './AuthContext'
import RideAlongsTab from './components/ride-alongs/RideAlongsTab'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './components/ui/dialog'
import { Button } from './components/ui/button'

const BOTTOM_BAR_HEIGHT = 50
const MIN_TOP_INSET = 44
const MIN_BOTTOM_INSET = 8
const SCROLL_CONTENT_TOP_INSET = `max(${MIN_TOP_INSET}px, calc(env(safe-area-inset-top, 0px) + 12px))`
const BOTTOM_SAFE_AREA_INSET = `max(${MIN_BOTTOM_INSET}px, env(safe-area-inset-bottom, 0px))`

function TechnicianRideAlongApp() {
  const { clientId, userId } = useAuthContext()
  const [homeTrigger, setHomeTrigger] = useState(0)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('[RideAlongsApp] Sign out failed:', error)
    }
  }

  return (
    <div
      className="w-full h-dvh min-h-dvh flex flex-col overflow-hidden bg-neutral-alabaster"
    >
      <div className="flex-1 min-h-0 overflow-hidden">
        <RideAlongsTab
          clientId={clientId}
          userId={userId}
          homeTrigger={homeTrigger}
          topContentInset={SCROLL_CONTENT_TOP_INSET}
        />
      </div>

      <nav
        role="navigation"
        aria-label="App navigation"
        style={{ paddingBottom: BOTTOM_SAFE_AREA_INSET, minHeight: BOTTOM_BAR_HEIGHT }}
        className="w-full flex-shrink-0 pt-1.5 bg-white border-t border-color-border flex flex-row items-center justify-center px-[10px]"
      >
        <div className="w-full flex items-center justify-evenly gap-1.5 md:gap-3">
          <button
            type="button"
            aria-label="Home"
            aria-current="page"
            onClick={() => setHomeTrigger((t) => t + 1)}
            className="border-none rounded-[10px] bg-brand-sand text-brand-marigold cursor-pointer flex flex-col items-center justify-center gap-[3px] py-[5px] px-4 min-w-[72px] md:min-w-[90px] md:max-w-[160px] flex-1"
          >
            <i className="fa-solid fa-house text-[17px] md:text-[20px]" aria-hidden="true" />
            <span className="text-[10px] md:text-[12px] font-semibold">Home</span>
          </button>
          <button
            type="button"
            aria-label="Logout"
            onClick={() => setShowLogoutConfirm(true)}
            className="border-none rounded-[10px] bg-transparent text-color-text-muted cursor-pointer flex flex-col items-center justify-center gap-[3px] py-[5px] px-4 min-w-[72px] md:min-w-[90px] md:max-w-[160px] flex-1"
          >
            <i className="fa-solid fa-right-from-bracket text-[17px] md:text-[20px]" aria-hidden="true" />
            <span className="text-[10px] md:text-[12px] font-semibold">Logout</span>
          </button>
        </div>
      </nav>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-[320px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">Log out?</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2.5 sm:justify-stretch">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-brand-navy text-white hover:bg-brand-navy"
              onClick={() => {
                setShowLogoutConfirm(false)
                void handleSignOut()
              }}
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Home() {
  return <TechnicianRideAlongApp />
}
