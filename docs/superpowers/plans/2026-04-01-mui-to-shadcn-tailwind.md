# MUI → shadcn + Tailwind Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove MUI/Emotion, install shadcn/ui + Tailwind CSS, convert all inline `CSSProperties` to Tailwind utilities, and consolidate the folder structure.

**Architecture:** Two phases — Phase 1 cleans up dead folders, moves `src/` into `app/`, swaps dependencies, and verifies the build compiles. Phase 2 configures Tailwind with the existing CSS variable design system and converts every component file-by-file.

**Tech Stack:** Next.js 14 (App Router), Capacitor 6, Tailwind CSS, shadcn/ui, AWS Amplify

---

## File Map

### Deleted
- `/webhooks/` — entire folder
- `/docs/bugs`, `/docs/bugs 2`, `/docs/decisions.md`, `/docs/decisions 2.md`, `/docs/future-improvements.md`, `/docs/future-improvements 2.md`
- `/types/` — entire folder
- `/src/app/`, `/src/components/`, `/src/hooks/`, `/src/styles/`, `/src/types/` — all empty
- `app/ThemeRegistry.tsx`
- `app/theme.ts`

### Moved
- `src/lib/rideAlongs/client.ts` → `app/lib/rideAlongs/client.ts`
- `src/models/` → `app/models/`
- `src/amplifyconfiguration.json` → `app/amplifyconfiguration.json`
- `src/aws-exports.js` → `app/aws-exports.js`
- `/src/` deleted once empty

### Created
- `tailwind.config.ts`
- `postcss.config.js` (from `npx tailwindcss init -p`)
- `app/components/ui/button.tsx` (shadcn)
- `app/components/ui/input.tsx` (shadcn)
- `app/components/ui/label.tsx` (shadcn)
- `app/components/ui/dialog.tsx` (shadcn)
- `app/lib/utils.ts` (shadcn `cn()` utility)

### Modified
- `app/globals.css` — add Tailwind directives + shadcn CSS vars
- `app/layout.tsx` — remove ThemeRegistry import and wrapper
- `app/AmplifyProvider.tsx` — update import path
- `app/AuthGate.tsx` — update import path + convert inline style
- `app/LoadingScreen.tsx` — convert CSSProperties to Tailwind
- `app/components/auth/AuthCard.tsx` — convert CSSProperties
- `app/components/auth/AuthPageShell.tsx` — convert CSSProperties
- `app/components/auth/SignInForm.tsx` — MUI → shadcn, convert CSSProperties
- `app/page.tsx` — convert styles, swap Dialog
- `app/components/ride-alongs/RideAlongsList.tsx` — update import + convert
- `app/components/ride-alongs/RideAlongActiveHeader.tsx` — update import + convert
- `app/components/ride-alongs/RideAlongActiveControls.tsx` — update import + convert
- `app/components/ride-alongs/RideAlongsTab.tsx` — update import + convert inline styles
- `app/components/ride-alongs/SpeechWaveform.tsx` — convert static styles only

---

## Phase 1 — Folder Cleanup & Dependency Swap

---

### Task 1: Delete dead folders and files

**Files:** `/webhooks/`, `/docs/` (partial), `/types/`, empty `/src/` subdirs

- [ ] **Step 1: Delete dead top-level folders and files**

```bash
rm -rf webhooks types
rm -f docs/decisions.md "docs/decisions 2.md"
rm -f docs/future-improvements.md "docs/future-improvements 2.md"
rm -rf docs/bugs "docs/bugs 2"
```

- [ ] **Step 2: Delete empty src subdirectories**

```bash
rm -rf src/app src/components src/hooks src/styles src/types
```

- [ ] **Step 3: Verify only expected files remain in src/**

```bash
find src -type f
```

Expected output — exactly these 6 files:
```
src/aws-exports.js
src/amplifyconfiguration.json
src/models/index.js
src/models/index.d.ts
src/models/schema.js
src/models/schema.d.ts
```

---

### Task 2: Move src/ into app/

**Files:** `src/lib/`, `src/models/`, `src/amplifyconfiguration.json`, `src/aws-exports.js`

- [ ] **Step 1: Create destination directories and move files**

```bash
mkdir -p app/lib/rideAlongs app/models
cp src/lib/rideAlongs/client.ts app/lib/rideAlongs/client.ts
cp -r src/models/. app/models/
cp src/amplifyconfiguration.json app/amplifyconfiguration.json
cp src/aws-exports.js app/aws-exports.js
```

- [ ] **Step 2: Delete src/**

```bash
rm -rf src
```

- [ ] **Step 3: Verify app structure**

```bash
find app/lib app/models -type f
```

Expected:
```
app/lib/rideAlongs/client.ts
app/models/index.js
app/models/index.d.ts
app/models/schema.js
app/models/schema.d.ts
```

---

### Task 3: Update all @/src/ imports

**Files:** `app/AmplifyProvider.tsx`, `app/AuthGate.tsx` (indirectly via chain), `app/components/ride-alongs/RideAlongsTab.tsx`, `app/components/ride-alongs/RideAlongActiveHeader.tsx`, `app/components/ride-alongs/RideAlongActiveControls.tsx`, `app/components/ride-alongs/RideAlongsList.tsx`

Note: `tsconfig.json` already has `"@/*": ["./*"]` so `@/app/lib/...` resolves correctly with no tsconfig changes needed.

- [ ] **Step 1: Update AmplifyProvider.tsx**

Change line 5:
```ts
// before
import awsExports from '@/src/aws-exports'
// after
import awsExports from '@/app/aws-exports'
```

- [ ] **Step 2: Update RideAlongsTab.tsx**

Find the import line (around line 35):
```ts
// before
} from '@/src/lib/rideAlongs/client'
// after
} from '@/app/lib/rideAlongs/client'
```

- [ ] **Step 3: Update RideAlongActiveHeader.tsx**

Line 4:
```ts
// before
import type { RideAlong, RideAlongStatus } from '@/src/lib/rideAlongs/client'
// after
import type { RideAlong, RideAlongStatus } from '@/app/lib/rideAlongs/client'
```

- [ ] **Step 4: Update RideAlongActiveControls.tsx**

Line 4:
```ts
// before
import type { RideAlongStatus } from '@/src/lib/rideAlongs/client'
// after
import type { RideAlongStatus } from '@/app/lib/rideAlongs/client'
```

- [ ] **Step 5: Update RideAlongsList.tsx**

Line 4:
```ts
// before
import type { RideAlong } from '@/src/lib/rideAlongs/client'
// after
import type { RideAlong } from '@/app/lib/rideAlongs/client'
```

- [ ] **Step 6: Verify no remaining @/src/ references**

```bash
grep -r "@/src/" app --include="*.ts" --include="*.tsx"
```

Expected: no output.

---

### Task 4: Remove MUI/Emotion packages

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Uninstall MUI and Emotion**

```bash
npm uninstall @mui/material @emotion/react @emotion/styled
```

- [ ] **Step 2: Verify packages are gone**

```bash
cat package.json | grep -E "@mui|@emotion"
```

Expected: no output.

---

### Task 5: Install Tailwind and shadcn dependencies

**Files:** `package.json`, `tailwind.config.ts`, `postcss.config.js`

- [ ] **Step 1: Install Tailwind and peer dependencies**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p --ts
```

This creates `tailwind.config.ts` and `postcss.config.js`.

- [ ] **Step 2: Install shadcn utility dependencies**

```bash
npm install tailwind-merge clsx class-variance-authority @radix-ui/react-slot lucide-react
```

- [ ] **Step 3: Run shadcn init**

```bash
npx shadcn@latest init
```

When prompted, answer:
- Style: **Default**
- Base color: **Neutral**
- CSS variables for colors: **Yes**
- `globals.css` location: `app/globals.css`
- Components alias: `@/app/components`
- Utils alias: `@/app/lib/utils`
- React Server Components: **Yes**
- `tailwind.config.ts`: **Yes** (overwrite — we'll configure it in Task 8)

- [ ] **Step 4: Install required shadcn components**

```bash
npx shadcn@latest add button input label dialog
```

Components will be placed in `app/components/ui/`.

- [ ] **Step 5: Verify component files exist**

```bash
ls app/components/ui/
```

Expected: `button.tsx  dialog.tsx  input.tsx  label.tsx`

---

### Task 6: Delete ThemeRegistry and theme, update layout.tsx

**Files:** `app/ThemeRegistry.tsx`, `app/theme.ts`, `app/layout.tsx`

- [ ] **Step 1: Delete MUI theme files**

```bash
rm app/ThemeRegistry.tsx app/theme.ts
```

- [ ] **Step 2: Update app/layout.tsx**

Replace the entire file:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import AmplifyProvider from './AmplifyProvider'
import AuthGate from './AuthGate'

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
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/efx2sth.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body>
        <AmplifyProvider>
          <AuthGate>{children}</AuthGate>
        </AmplifyProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify no remaining MUI imports**

```bash
grep -r "@mui\|@emotion\|ThemeRegistry\|theme\.ts" app --include="*.ts" --include="*.tsx"
```

Expected: no output.

---

### Task 7: Verify Phase 1 build

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors (lint warnings about `<img>` are OK).

- [ ] **Step 2: Commit Phase 1**

```bash
git add -A
git commit -m "refactor: phase 1 — remove MUI, move src into app, install shadcn+Tailwind"
```

---

## Phase 2 — Tailwind Configuration & Component Conversion

---

### Task 8: Configure Tailwind and update globals.css

**Files:** `tailwind.config.ts`, `app/globals.css`

- [ ] **Step 1: Replace tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-tangerine':  'var(--color-brand-tangerine)',
        'brand-marigold':   'var(--color-brand-marigold)',
        'brand-sand':       'var(--color-brand-sand)',
        'brand-navy':       'var(--color-brand-navy)',
        'brand-cerulean':   'var(--color-brand-cerulean)',
        'brand-frost':      'var(--color-brand-frost)',
        'neutral-graphite': 'var(--color-neutral-graphite)',
        'neutral-granite':  'var(--color-neutral-granite)',
        'neutral-alabaster':'var(--color-neutral-alabaster)',
        'support-negative': 'var(--color-support-negative)',
        'support-positive': 'var(--color-support-positive)',
        'support-warning':  'var(--color-support-warning)',
        'support-info':     'var(--color-support-info)',
        'color-bg':         'var(--color-bg)',
        'color-text':       'var(--color-text)',
        'color-text-muted': 'var(--color-text-muted)',
        'color-border':     'var(--color-border)',
        border:             'hsl(var(--border))',
        input:              'hsl(var(--input))',
        ring:               'hsl(var(--ring))',
        background:         'hsl(var(--background))',
        foreground:         'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update app/globals.css**

Add Tailwind directives at the very top (before the existing `*` reset) and shadcn CSS variables inside `:root`. Replace the entire file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Brand */
    --color-brand-tangerine: #e96600;
    --color-brand-marigold: #fcb500;
    --color-brand-sand: #ffe9b8;
    --color-brand-navy: #242965;
    --color-brand-cerulean: #82bee8;
    --color-brand-frost: #dff0fa;
    --color-neutral-graphite: #3a3b38;
    --color-neutral-granite: #e1e1e1;
    --color-neutral-alabaster: #fffefc;
    --color-support-negative: #cb2d2d;
    --color-support-positive: #319a49;
    --color-support-warning: #fec42a;
    --color-support-warning-orange: #da6e27;
    --color-support-info: #4692df;
    --color-bg: var(--color-neutral-alabaster);
    --color-text: var(--color-neutral-graphite);
    --color-text-muted: rgba(58, 59, 56, 0.7);
    --color-link: var(--color-brand-navy);
    --color-border: var(--color-neutral-granite);

    /* shadcn — mapped to brand palette */
    --background: 60 100% 99%;
    --foreground: 62 1% 22%;
    --card: 0 0% 100%;
    --card-foreground: 62 1% 22%;
    --popover: 0 0% 100%;
    --popover-foreground: 62 1% 22%;
    --primary: 37 100% 49%;
    --primary-foreground: 62 1% 22%;
    --secondary: 38 100% 91%;
    --secondary-foreground: 62 1% 22%;
    --muted: 38 100% 91%;
    --muted-foreground: 62 1% 22%;
    --accent: 38 100% 91%;
    --accent-foreground: 62 1% 22%;
    --destructive: 0 72% 47%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 88%;
    --input: 0 0% 88%;
    --ring: 37 100% 49%;
    --radius: 0.75rem;
  }
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  height: 100%;
  margin: 0;
  padding: 0;
  -webkit-overflow-scrolling: touch;
}

body {
  color: var(--color-text);
  background: var(--color-bg);
  font-family: "brother-1816", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

input,
textarea,
select {
  font-size: 16px;
}

button,
a,
input,
textarea,
select {
  touch-action: manipulation;
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 3: Verify build still passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

---

### Task 9: Convert AuthCard.tsx

**Files:** `app/components/auth/AuthCard.tsx`

- [ ] **Step 1: Replace file**

```tsx
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
```

---

### Task 10: Convert AuthPageShell.tsx

**Files:** `app/components/auth/AuthPageShell.tsx`

- [ ] **Step 1: Replace file**

```tsx
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
```

---

### Task 11: Convert SignInForm.tsx (MUI → shadcn)

**Files:** `app/components/auth/SignInForm.tsx`

- [ ] **Step 1: Replace file**

```tsx
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
```

---

### Task 12: Convert LoadingScreen.tsx

**Files:** `app/LoadingScreen.tsx`

Note: The `@keyframes` blocks remain in the `<style>` tag — they are referenced by animation names and cannot move to Tailwind. The dynamically-computed inline bar styles are not present in this file.

- [ ] **Step 1: Replace file**

```tsx
'use client'

import { cn } from '@/app/lib/utils'

type LoadingScreenProps = {
  variant?: 'fullscreen' | 'inline'
}

export default function LoadingScreen({ variant = 'fullscreen' }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-color-bg bg-[url(\'/images/TGL-WavesDots.svg\')] bg-no-repeat bg-top bg-cover overflow-hidden',
        variant === 'inline'
          ? 'absolute inset-0 w-full h-full z-[5]'
          : 'fixed inset-0 w-full h-dvh z-[1300]'
      )}
    >
      <div className="w-[220px] h-[220px] flex items-center justify-center [perspective:1000px]">
        <div className="w-[200px] h-[200px] relative [transform-style:preserve-3d] [animation:eliShowcase_3.4s_ease-in-out_infinite]">
          <img
            src="/images/TGL-ELI-ThumbsUp.svg"
            alt="Graphite Lab mascot"
            className="w-full h-full object-contain block relative z-[2] [filter:drop-shadow(0_20px_30px_rgba(0,0,0,0.18))]"
          />
          <div
            aria-hidden="true"
            className="absolute [inset:10%] rounded-3xl bg-[radial-gradient(circle_at_50%_40%,rgba(36,41,101,0.18),transparent_65%)] [transform:translateZ(-30px)] z-[1]"
          />
          <div
            aria-hidden="true"
            className="absolute [inset:12%_14%] rounded-[28px] bg-[linear-gradient(120deg,transparent_10%,rgba(255,255,255,0.45)_45%,transparent_70%)] mix-blend-screen [animation:eliShimmer_3.4s_ease-in-out_infinite] z-[3] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute [inset:12%_16%] rounded-[26px] bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.55)_32%,rgba(255,255,255,0.16)_48%,transparent_64%)] mix-blend-screen [animation:eliGlintSweep_3.4s_ease-in-out_infinite] z-[4] pointer-events-none blur-[1.4px]"
          />
        </div>
      </div>
      <style>{`
        @keyframes eliShowcase {
          0%   { transform: rotateX(10deg) rotateY(-18deg) translateY(0); }
          50%  { transform: rotateX(12deg) rotateY(18deg) translateY(-6px); }
          100% { transform: rotateX(10deg) rotateY(-18deg) translateY(0); }
        }
        @keyframes eliShimmer {
          0%   { opacity: 0.06; transform: translateX(-10%) rotate(-12deg); }
          50%  { opacity: 0.12; transform: translateX(10%) rotate(-12deg); }
          100% { opacity: 0.06; transform: translateX(-10%) rotate(-12deg); }
        }
        @keyframes eliGlintSweep {
          0%   { opacity: 0;    transform: translateX(-120%) translateY(4%)  rotate(12deg) scaleY(0.92); }
          38%  { opacity: 0;    transform: translateX(-70%)  translateY(2%)  rotate(12deg) scaleY(0.92); }
          52%  { opacity: 0.22; transform: translateX(-5%)   translateY(0%)  rotate(12deg) scaleY(0.96); }
          70%  { opacity: 0.08; transform: translateX(65%)   translateY(-1%) rotate(12deg) scaleY(0.96); }
          100% { opacity: 0;    transform: translateX(120%)  translateY(-2%) rotate(12deg) scaleY(0.92); }
        }
      `}</style>
    </div>
  )
}
```

---

### Task 13: Convert AuthGate.tsx

**Files:** `app/AuthGate.tsx`

Only change: update import path (Task 3 already covered this for other files — AuthGate doesn't import from `@/src/`) and replace the one inline `style={{...}}` on the "Try again" button (around line 189).

- [ ] **Step 1: Replace the inline Try Again button style**

Find the button in the `status === 'error'` block and replace:

```tsx
// before
<button
  type="button"
  onClick={checkSession}
  style={{
    border: 'none',
    borderRadius: '999px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: 'var(--color-brand-marigold)',
    color: 'var(--color-neutral-graphite)',
    cursor: 'pointer',
    width: '100%',
  }}
>
  Try again
</button>

// after
<button
  type="button"
  onClick={checkSession}
  className="border-none rounded-full px-5 py-3 text-sm font-semibold bg-brand-marigold text-neutral-graphite cursor-pointer w-full"
>
  Try again
</button>
```

---

### Task 14: Convert page.tsx (logout Dialog)

**Files:** `app/page.tsx`

- [ ] **Step 1: Replace file**

```tsx
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
      className="w-full h-dvh min-h-dvh flex flex-col overflow-hidden bg-color-bg bg-[url('/images/TGL-WavesDots.svg')] bg-no-repeat bg-top bg-cover"
    >
      <div className="flex-1 min-h-0 overflow-hidden px-[14px]">
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
        <div className="w-full flex items-center justify-evenly gap-1.5">
          <button
            type="button"
            aria-label="Home"
            aria-current="page"
            onClick={() => setHomeTrigger((t) => t + 1)}
            className="border-none rounded-[10px] bg-brand-sand text-brand-marigold cursor-pointer flex flex-col items-center justify-center gap-[3px] py-[5px] px-4 min-w-[72px] flex-1"
          >
            <i className="fa-solid fa-house text-[17px]" aria-hidden="true" />
            <span className="text-[10px] font-semibold">Home</span>
          </button>
          <button
            type="button"
            aria-label="Logout"
            onClick={() => setShowLogoutConfirm(true)}
            className="border-none rounded-[10px] bg-transparent text-color-text-muted cursor-pointer flex flex-col items-center justify-center gap-[3px] py-[5px] px-4 min-w-[72px] flex-1"
          >
            <i className="fa-solid fa-right-from-bracket text-[17px]" aria-hidden="true" />
            <span className="text-[10px] font-semibold">Logout</span>
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
```

---

### Task 15: Convert RideAlongsList.tsx

**Files:** `app/components/ride-alongs/RideAlongsList.tsx`

- [ ] **Step 1: Replace file**

```tsx
'use client'

import type { RideAlong } from '@/app/lib/rideAlongs/client'

type RideAlongsListProps = {
  rideAlongs: RideAlong[]
  onSelect: (rideAlong: RideAlong) => void
  onRefresh: () => Promise<void> | void
  isLoading: boolean
}

const parseLocation = (location: string): string => {
  try {
    const parsed = JSON.parse(location) as Record<string, unknown>
    if (typeof parsed.label === 'string' && parsed.label) return parsed.label
    if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
      return `${parsed.latitude.toFixed(4)}, ${parsed.longitude.toFixed(4)}`
    }
  } catch {
    // not JSON — use as-is
  }
  return location
}

const getRideAlongSubtitle = (rideAlong: RideAlong) => {
  if (rideAlong.location) return parseLocation(rideAlong.location)
  return rideAlong.address || 'Location details pending'
}

const getScheduledLabel = (isoDate: string | null | undefined) => {
  if (!isoDate) return 'Scheduled'
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return 'Scheduled'
  return `Scheduled ${parsed.toLocaleDateString()}`
}

export default function RideAlongsList({
  rideAlongs,
  onSelect,
  onRefresh,
  isLoading,
}: RideAlongsListProps) {
  return (
    <section
      className="border border-color-border rounded-2xl bg-white p-[14px] flex flex-col gap-3"
      aria-label="Scheduled ride alongs"
    >
      <header className="flex items-start justify-between gap-2.5">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[20px] text-color-text">Ride Alongs</h2>
          <p className="m-0 text-[12px] text-color-text-muted">
            Select a job below to begin your ride along.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { void onRefresh() }}
          className="border border-color-border rounded-full min-w-[34px] h-[34px] bg-white text-color-text-muted cursor-pointer inline-flex items-center justify-center"
          aria-label="Refresh ride along list"
        >
          <i className="fa-solid fa-rotate-right" aria-hidden="true" />
        </button>
      </header>

      {isLoading ? (
        <div className="border border-dashed border-color-border rounded-xl bg-white/[0.88] text-color-text-muted text-[12px] p-3">
          Loading your jobs...
        </div>
      ) : null}

      {!isLoading && rideAlongs.length === 0 ? (
        <div className="border border-dashed border-color-border rounded-xl bg-white/[0.88] text-color-text-muted text-[12px] p-3">
          No jobs are assigned to you right now. Check back soon or contact your supervisor.
        </div>
      ) : null}

      {!isLoading && rideAlongs.length > 0 ? (
        <div className="flex flex-col gap-2">
          {rideAlongs.map((rideAlong) => (
            <button
              key={rideAlong.id}
              type="button"
              onClick={() => onSelect(rideAlong)}
              className="border border-color-border rounded-[14px] bg-white text-left p-3 cursor-pointer flex flex-col gap-[7px]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[14px] font-bold text-color-text">{rideAlong.name}</div>
                <span className="border border-brand-navy/[0.14] rounded-full px-2 py-1 text-[11px] font-semibold text-brand-navy bg-brand-cerulean/[0.14] whitespace-nowrap">
                  {getScheduledLabel(rideAlong.startedAt)}
                </span>
              </div>
              <div className="text-[12px] text-color-text-muted">
                {getRideAlongSubtitle(rideAlong)}
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
```

---

### Task 16: Convert RideAlongActiveHeader.tsx

**Files:** `app/components/ride-alongs/RideAlongActiveHeader.tsx`

- [ ] **Step 1: Update the import at the top of the file**

```ts
// before
import type { RideAlong, RideAlongStatus } from '@/src/lib/rideAlongs/client'
// after
import type { RideAlong, RideAlongStatus } from '@/app/lib/rideAlongs/client'
```

- [ ] **Step 2: Replace all style constants and JSX style props**

Replace the entire JSX return and all `const *Style: CSSProperties = {...}` constants at the bottom of the file. The helper functions (`parseLocationPayload`, `getLocationDisplay`, `formatDateTime`, etc.) are unchanged — only the component's return and style constants change.

Replace from `export default function RideAlongActiveHeader(` through the end of the file:

```tsx
export default function RideAlongActiveHeader({
  rideAlong,
  isSessionActive,
  totalDurationSeconds,
  isDetailsOpen,
  onOpenDetails,
  onCloseDetails,
  onBack,
}: RideAlongActiveHeaderProps) {
  const summaryLocation = getLocationDisplay(rideAlong)
  const totalDuration = formatTotalDuration(
    totalDurationSeconds,
    rideAlong.startedAt,
    rideAlong.endedAt
  )
  const startedLabel = formatCompactDateTime(rideAlong.startedAt)
  const updatedLabel = formatCompactDateTime(rideAlong.updatedAt)

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2.5 -mx-3 mt-0 border border-[rgba(58,59,56,0.92)] rounded-none bg-neutral-graphite px-[10px] py-2">
          <button
            type="button"
            onClick={onBack}
            className="border border-white/[0.46] rounded-full min-w-[38px] h-[38px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer text-[14px]"
            aria-label="Back to ride along list"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onOpenDetails}
            className="border border-white/[0.46] rounded-full min-w-[38px] h-[38px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer text-[14px]"
            aria-label="Open ride along details"
          >
            <i className="fa-solid fa-sliders" aria-hidden="true" />
          </button>
        </div>

        <div className="border border-color-border rounded-[14px] bg-neutral-alabaster px-3 py-[10px]">
          <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
            <h2 className="m-0 text-[21px] text-color-text truncate">{rideAlong.name}</h2>
            <p className="m-0 text-[15px] text-[rgba(58,59,56,0.78)] leading-[1.35] truncate">
              {summaryLocation}
            </p>
            <p className="m-0 text-[12px] text-[rgba(58,59,56,0.72)] font-semibold">
              {getStatusLabel(rideAlong.status)}
              {' \u00b7 '}
              {isSessionActive ? 'Recording speech' : 'Ready for speech'}
            </p>
            <div className="mt-1.5 grid grid-cols-3 gap-[7px]">
              {[
                { label: 'Total Duration', value: totalDuration },
                { label: 'Started', value: startedLabel },
                { label: 'Updated', value: updatedLabel },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="border border-color-border rounded-[10px] bg-white px-2 py-[7px] flex flex-col gap-[2px] min-w-0"
                >
                  <span className="text-[10px] font-bold text-color-text-muted uppercase tracking-[0.2px]">
                    {label}
                  </span>
                  <span className="text-[12px] font-semibold text-color-text truncate">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isDetailsOpen ? (
        <button
          type="button"
          onClick={onCloseDetails}
          className="fixed inset-0 border-none m-0 p-0 bg-brand-navy/[0.22] z-[21]"
          aria-label="Close ride along details"
        />
      ) : null}

      <aside
        aria-hidden={!isDetailsOpen}
        style={{
          transform: isDetailsOpen ? 'translateX(0)' : 'translateX(102%)',
          pointerEvents: isDetailsOpen ? 'auto' : 'none',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 14px)',
        }}
        className="fixed top-0 right-0 bottom-0 w-[min(340px,100%)] border-l border-brand-navy/[0.12] rounded-[22px_0_0_22px] bg-white shadow-[-12px_0_30px_rgba(36,41,101,0.16)] z-[22] transition-transform duration-[180ms] ease-out flex flex-col gap-3 px-[14px]"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="m-0 text-[17px] text-color-text">Ride Along Details</h3>
          <button
            type="button"
            onClick={onCloseDetails}
            className="border border-color-border rounded-full min-w-[38px] h-[38px] bg-white text-color-text-muted inline-flex items-center justify-center cursor-pointer text-[14px]"
            aria-label="Close details panel"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
          {[
            { label: 'Ride Along', value: rideAlong.name },
            { label: 'Status', value: getStatusLabel(rideAlong.status) },
            { label: 'Address', value: rideAlong.address || 'Not set' },
            { label: 'Location', value: rideAlong.location || 'Not set' },
            { label: 'Started', value: formatDateTime(rideAlong.startedAt) },
            { label: 'Ended', value: formatDateTime(rideAlong.endedAt) },
            { label: 'Updated', value: formatDateTime(rideAlong.updatedAt) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="border border-color-border rounded-xl bg-white p-[10px] flex flex-col gap-[3px]"
            >
              <div className="text-[11px] font-bold text-color-text-muted uppercase tracking-[0.2px]">
                {label}
              </div>
              <div className="text-[12px] text-color-text leading-[1.35] break-words">
                {value}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
```

---

### Task 17: Convert RideAlongActiveControls.tsx

**Files:** `app/components/ride-alongs/RideAlongActiveControls.tsx`

- [ ] **Step 1: Update import at the top**

```ts
// before
import type { RideAlongStatus } from '@/src/lib/rideAlongs/client'
// after
import type { RideAlongStatus } from '@/app/lib/rideAlongs/client'
```

- [ ] **Step 2: Replace JSX return and all CSSProperties constants**

Replace from `export default function RideAlongActiveControls(` to end of file:

```tsx
export default function RideAlongActiveControls({
  rideAlongStatus,
  isMonitoringEnabled,
  isRideAlongPaused,
  isSessionActive,
  currentLevel,
  spectrumLevels,
  liveTranscriptPreviewText,
  transcriptSessions,
  speechStartThreshold,
  silenceSeconds,
  onStartRideAlong,
  onPauseRideAlong,
  onResumeRideAlong,
  onCompleteRideAlong,
  isBusy,
  isStoppingSession,
  error,
}: RideAlongActiveControlsProps) {
  const level = Number(currentLevel || 0)
  const speakingNow =
    !isRideAlongPaused && isMonitoringEnabled && level >= speechStartThreshold
  const actionConfig = getMainAction({
    rideAlongStatus,
    onStartRideAlong,
    onPauseRideAlong,
    onResumeRideAlong,
  })
  const disableMainAction = isBusy || isStoppingSession || rideAlongStatus === 'ENDED'
  const disableCompleteAction = isBusy || isStoppingSession || rideAlongStatus === 'ENDED'
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false)
  const transcriptTurnsScrollRef = useRef<HTMLDivElement | null>(null)

  const helperMessage = isRideAlongPaused
    ? 'Ride along is paused. Tap resume when ready.'
    : speakingNow
      ? 'Speech detected.'
      : isSessionActive
        ? 'Listening for speech...'
        : 'Speak naturally to start capture.'
  const transcriptPreview =
    typeof liveTranscriptPreviewText === 'string' &&
    liveTranscriptPreviewText.trim().length > 0
      ? liveTranscriptPreviewText.trim()
      : null

  const combinedTranscriptTurns = useMemo(() => {
    const turns: Array<{
      id: string
      text: string
      timestampMs: number
      datetimeLine: string | null
    }> = []

    transcriptSessions.forEach((session) => {
      const sessionStartTimestamp = parseTimestamp(session.sessionStartTime)
      session.turns.forEach((turn) => {
        const normalizedText = turn.text.trim()
        if (!normalizedText) return
        const timestampMs = parseTimestamp(turn.createdAt) ?? sessionStartTimestamp
        if (timestampMs === null) return
        turns.push({
          id: `${session.id}:${turn.id}:${turn.turnOrder}`,
          text: normalizedText,
          timestampMs,
          datetimeLine: turn.createdAt || session.sessionStartTime || null,
        })
      })
    })

    return turns.sort((left, right) => left.timestampMs - right.timestampMs)
  }, [transcriptSessions])

  const hasTranscriptTurns = combinedTranscriptTurns.length > 0

  useEffect(() => {
    if (!isTranscriptExpanded) return
    window.requestAnimationFrame(() => {
      const turnsContainer = transcriptTurnsScrollRef.current
      if (!turnsContainer) return
      turnsContainer.scrollTop = turnsContainer.scrollHeight
    })
  }, [isTranscriptExpanded, combinedTranscriptTurns.length])

  const mainActionToneClass =
    actionConfig.tone === 'primary' || actionConfig.tone === 'resume'
      ? 'bg-brand-marigold border-brand-marigold/[0.62] text-neutral-graphite'
      : actionConfig.tone === 'neutral'
        ? 'bg-white border-brand-navy/[0.34] text-brand-navy'
        : 'bg-[rgba(58,59,56,0.16)] border-[rgba(58,59,56,0.24)] text-[rgba(58,59,56,0.75)]'

  return (
    <section className="flex-1 min-h-0 flex flex-col justify-end gap-3 pb-[2px]" aria-label="Live ride along controls">
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 py-1.5">
        <div className="w-full max-w-[620px]">
          <SpeechWaveform
            level={currentLevel}
            spectrumLevels={spectrumLevels}
            isMonitoringEnabled={isMonitoringEnabled && !isRideAlongPaused}
          />
        </div>
        <p className="m-0 text-[13px] text-[rgba(58,59,56,0.72)] text-center font-semibold">
          {helperMessage}
          {isSessionActive && silenceSeconds >= 0.8
            ? ` Silence: ${silenceSeconds.toFixed(1)}s`
            : ''}
        </p>
      </div>

      <div className="border border-brand-navy/[0.16] rounded-xl bg-white/[0.78] p-[10px] flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] tracking-[0.25px] uppercase font-bold text-[rgba(58,59,56,0.62)]">
            Transcript
          </span>
          <button
            type="button"
            onClick={() => setIsTranscriptExpanded(true)}
            className="border border-color-border rounded-full bg-white text-color-text-muted px-[10px] py-1 inline-flex items-center gap-1.5 text-[12px] font-bold cursor-pointer"
            aria-label="Open transcript timeline"
          >
            <span className="text-[12px] font-bold">Expand</span>
            <i className="fa-solid fa-up-right-and-down-left-from-center" aria-hidden="true" />
          </button>
        </div>
        <div className="text-[14px] text-color-text leading-[1.35] min-h-[20px] max-h-[2.7em] [-webkit-line-clamp:2] [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden break-words">
          {transcriptPreview || 'Listening for transcription...'}
        </div>
      </div>

      {isTranscriptExpanded ? (
        <section
          className="fixed inset-0 z-[6505] bg-white flex flex-col"
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
          }}
          aria-label="Full transcript"
        >
          <div className="border border-[rgba(58,59,56,0.92)] rounded-none bg-neutral-graphite px-[10px] py-2 flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => setIsTranscriptExpanded(false)}
              className="border border-white/[0.46] rounded-full w-[38px] h-[38px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer flex-shrink-0"
              aria-label="Back to recording controls"
            >
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            </button>
            <div className="flex-1 text-center text-[15px] font-bold text-neutral-alabaster">
              Transcript
            </div>
            <button
              type="button"
              onClick={() => setIsTranscriptExpanded(false)}
              className="border border-white/[0.46] rounded-full w-[38px] h-[38px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer flex-shrink-0"
              aria-label="Close transcript timeline"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>

          <div ref={transcriptTurnsScrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3">
            {hasTranscriptTurns ? (
              <div className="flex flex-col gap-2.5">
                {combinedTranscriptTurns.map((turn) => (
                  <div key={turn.id} className="flex flex-col gap-1">
                    <div className="text-[11px] font-bold text-color-text-muted leading-[1.25]">
                      {turn.datetimeLine || 'Timestamp unavailable'}
                    </div>
                    <div className="border border-brand-navy/[0.15] rounded-[10px] bg-white px-[10px] py-2 text-[13px] leading-[1.4] text-color-text whitespace-pre-wrap break-words">
                      {turn.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="m-0 text-[14px] text-color-text-muted leading-[1.35] p-[2px]">
                Listening for transcription...
              </div>
            )}
          </div>
        </section>
      ) : null}

      <div className="flex items-center gap-2.5 w-full">
        <button
          type="button"
          onClick={actionConfig.onClick}
          disabled={disableMainAction}
          className={`flex-1 rounded-[14px] min-h-[52px] border inline-flex items-center justify-center gap-2 text-[15px] font-extrabold ${mainActionToneClass}`}
          style={{ opacity: disableMainAction ? 0.62 : 1, cursor: disableMainAction ? 'default' : 'pointer' }}
          aria-label={actionConfig.label}
        >
          <i className={actionConfig.iconClassName} aria-hidden="true" />
          {isBusy || isStoppingSession ? 'Working...' : actionConfig.label}
        </button>

        <button
          type="button"
          onClick={onCompleteRideAlong}
          disabled={disableCompleteAction}
          className="flex-1 rounded-[14px] min-h-[52px] border inline-flex items-center justify-center gap-2 text-[15px] font-extrabold bg-brand-tangerine/[0.14] border-brand-tangerine/[0.38] text-brand-tangerine"
          style={{ opacity: disableCompleteAction ? 0.62 : 1, cursor: disableCompleteAction ? 'default' : 'pointer' }}
          aria-label="Complete ride along"
        >
          <i className="fa-solid fa-flag-checkered" aria-hidden="true" />
          {rideAlongStatus === 'ENDED' ? 'Completed' : 'Complete'}
        </button>
      </div>

      {error ? (
        <div className="border border-support-negative/[0.3] rounded-[10px] bg-support-negative/[0.08] text-support-negative text-[12px] px-[9px] py-2">
          {error}
        </div>
      ) : null}
    </section>
  )
}
```

---

### Task 18: Convert RideAlongsTab.tsx inline styles

**Files:** `app/components/ride-alongs/RideAlongsTab.tsx`

The business logic (lines 1–1552) is untouched. Only the JSX render blocks at the bottom of the file change.

- [ ] **Step 1: Update import path (already done in Task 3 Step 2 — verify)**

```bash
grep "@/src" app/components/ride-alongs/RideAlongsTab.tsx
```

Expected: no output.

- [ ] **Step 2: Replace the four inline-styled render blocks**

Find and replace each `style={{...}}` in the render section (lines ~1553–end):

**No client/user div (line ~1555):**
```tsx
// before
<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', color: 'var(--color-text-muted)', fontSize: '13px' }}>

// after
<div className="h-full flex items-center justify-center p-6 text-color-text-muted text-[13px]">
```

**List view wrapper div (line ~1573):**
```tsx
// before
<div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '14px', paddingTop: topContentInset, display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'transparent' }}>

// after
<div className="w-full h-full overflow-y-auto px-[14px] pb-[14px] flex flex-col gap-3 bg-transparent" style={{ paddingTop: topContentInset }}>
```

**Active resume banner button (line ~1587):**
```tsx
// before
<button type="button" ... style={{ border: '1px solid rgba(49, 154, 73, 0.28)', borderRadius: '16px', backgroundColor: 'rgba(49, 154, 73, 0.12)', color: 'var(--color-text)', textAlign: 'left', padding: '13px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>

// after
<button type="button" ... className="border border-support-positive/[0.28] rounded-2xl bg-support-positive/[0.12] text-color-text text-left px-[14px] py-[13px] cursor-pointer text-[13px] font-semibold">
```

**No selection div (line ~1625):**
```tsx
// before
<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>

// after
<div className="w-full h-full flex items-center justify-center text-color-text-muted text-[13px]">
```

**Active overlay outer div (line ~1642):**
```tsx
// before
<div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 6000, overflow: 'hidden', backgroundColor: '#ffffff', paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)' }}>

// after
<div
  className="fixed top-0 left-0 w-screen h-dvh z-[6000] overflow-hidden bg-white"
  style={{
    paddingTop: 'env(safe-area-inset-top, 0px)',
    paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
  }}
>
```

**Active overlay inner div (line ~1656):**
```tsx
// before
<div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#ffffff', padding: '8px 12px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>

// after
<div className="relative w-full h-full overflow-hidden bg-white pt-2 px-3 flex flex-col gap-2.5">
```

---

### Task 19: Convert SpeechWaveform.tsx

**Files:** `app/components/ride-alongs/SpeechWaveform.tsx`

Note: The per-bar inline styles (`width`, `height`, `opacity`, `boxShadow`) are driven by JS animation state and MUST remain inline. Only the static shell and bars-row styles are converted.

- [ ] **Step 1: Replace shell and barsRow styles**

Replace `const shellStyle` and `const barsRowStyle` constants and their usages:

Remove the two style constants at the bottom:
```ts
// delete these entirely:
const shellStyle: CSSProperties = { ... }
const barsRowStyle: CSSProperties = { ... }
```

Replace in JSX:
```tsx
// before
<div style={shellStyle}>
  <div style={barsRowStyle}>{barElements}</div>
</div>

// after
<div className="relative w-full min-h-[152px] rounded-none border-none bg-transparent flex items-end justify-center py-2 overflow-hidden">
  <div className="w-full flex items-end justify-center gap-[5px] pb-[2px]">
    {barElements}
  </div>
</div>
```

Also remove the `CSSProperties` import if it is no longer used after this change. Check the top of the file:
```ts
// before
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

// after (if CSSProperties is no longer used)
import { useEffect, useMemo, useRef, useState } from 'react'
```

---

### Task 20: Final build and iOS sync

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: `✓ Compiled successfully` — no errors.

- [ ] **Step 2: Sync to iOS**

```bash
npx cap sync ios
```

Expected: `[info] Sync finished in X.Xs`

- [ ] **Step 3: Open Xcode and do a smoke test**

```bash
npx cap open ios
```

Verify in simulator:
- Loading screen animation plays
- Sign-in form renders with Input + Label fields
- Ride along list shows with location labels (not raw JSON)
- Logout button opens Dialog confirmation
- Active ride along controls render correctly

- [ ] **Step 4: Commit Phase 2**

```bash
git add -A
git commit -m "refactor: phase 2 — Tailwind + shadcn full component conversion, remove all inline CSSProperties"
```

---

## Self-Review Notes

- `RideAlongTurnsFeed.tsx` is empty (1 line) — no changes needed
- `SpeechWaveform.tsx` per-bar inline styles intentionally kept — they are animation-driven JS values
- `safe-area-inset` values kept as inline `style` where Tailwind cannot express dynamic `env()` calls
- `loadUserProfile` missing-dep warning in `AuthGate.tsx` is pre-existing and out of scope
- shadcn `Dialog` replaces the hand-rolled overlay in `page.tsx` — the previous `overlayStyle`, `dialogStyle`, and button style constants are fully deleted
