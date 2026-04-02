# MUI → shadcn + Tailwind Migration & Folder Cleanup

**Date:** 2026-04-01
**Status:** Approved

---

## Overview

Remove MUI and replace with shadcn/ui + Tailwind CSS. Convert all inline `CSSProperties` to Tailwind utilities. Clean up dead folders and consolidate `src/` into `app/`.

---

## Phase 1 — Folder Cleanup & Dependency Swap

### Delete

| Path | Reason |
|------|--------|
| `/webhooks` | Standalone deep-link script, not part of the build |
| `/docs` | Stale/duplicate docs |
| `/types` | Only contains `mui.d.ts` — dead after MUI removal |
| `/src/app` | Empty |
| `/src/components` | Empty |
| `/src/hooks` | Empty |
| `/src/styles` | Empty |
| `/src/types` | Empty |

### Move

| From | To |
|------|----|
| `src/lib/rideAlongs/client.ts` | `app/lib/rideAlongs/client.ts` |
| `src/models/` | `app/models/` |
| `src/amplifyconfiguration.json` | `app/amplifyconfiguration.json` |
| `src/aws-exports.js` | `app/aws-exports.js` |

Delete `/src` once empty.

### Update imports

All `@/src/lib/...` references → `@/app/lib/...`
All `@/src/models/...` references → `@/app/models/...`

### Remove packages

```
@mui/material
@emotion/react
@emotion/styled
```

### Add packages

```
tailwindcss
postcss
autoprefixer
tailwind-merge
clsx
class-variance-authority
@radix-ui/react-slot
lucide-react
```

shadcn is installed via CLI (`npx shadcn@latest init`), which copies component source into `app/components/ui/`.

### shadcn components to install

- `button`
- `input`
- `label`
- `dialog`

### Delete after MUI removal

- `app/ThemeRegistry.tsx`
- `app/theme.ts`
- Update `app/layout.tsx` to remove `ThemeRegistry` wrapper

### Verify Phase 1

Run `npm run build` — must compile cleanly before proceeding to Phase 2.

---

## Phase 2 — Tailwind Conversion & Component Migration

### Tailwind Configuration

`tailwind.config.ts` extends the theme to map all existing CSS custom properties to named Tailwind colors:

```ts
colors: {
  'brand-tangerine': 'var(--color-brand-tangerine)',
  'brand-marigold':  'var(--color-brand-marigold)',
  'brand-sand':      'var(--color-brand-sand)',
  'brand-navy':      'var(--color-brand-navy)',
  'brand-cerulean':  'var(--color-brand-cerulean)',
  'brand-frost':     'var(--color-brand-frost)',
  'neutral-graphite':'var(--color-neutral-graphite)',
  'neutral-granite': 'var(--color-neutral-granite)',
  'neutral-alabaster':'var(--color-neutral-alabaster)',
  'support-negative':'var(--color-support-negative)',
  'support-positive':'var(--color-support-positive)',
  'support-warning': 'var(--color-support-warning)',
  'support-info':    'var(--color-support-info)',
  'color-bg':        'var(--color-bg)',
  'color-text':      'var(--color-text)',
  'color-text-muted':'var(--color-text-muted)',
  'color-border':    'var(--color-border)',
}
```

`globals.css` retains all `:root` variable definitions unchanged. Tailwind directives (`@tailwind base/components/utilities`) are added at the top.

shadcn's own CSS variables (`--primary`, `--background`, etc.) are mapped to match the brand palette in `globals.css`.

### Component Conversion

Each component file has its `style={...}` / `CSSProperties` replaced with `className="..."` Tailwind strings. No structural changes — only the styling mechanism changes.

| File | Key changes |
|------|-------------|
| `app/page.tsx` | Bottom nav, tab buttons → Tailwind; logout overlay → shadcn `Dialog` |
| `app/components/auth/SignInForm.tsx` | MUI `Button` → shadcn `Button`; MUI `TextField` → shadcn `Input` + `Label` |
| `app/components/auth/AuthCard.tsx` | Inline card/layout → Tailwind |
| `app/components/auth/AuthPageShell.tsx` | Inline shell/background → Tailwind |
| `app/components/ride-alongs/RideAlongsList.tsx` | Card list, header, status chip → Tailwind |
| `app/components/ride-alongs/RideAlongsTab.tsx` | Tab layout → Tailwind |
| `app/components/ride-alongs/RideAlongActiveHeader.tsx` | Header styles → Tailwind |
| `app/components/ride-alongs/RideAlongActiveControls.tsx` | Control styles → Tailwind |
| `app/components/ride-alongs/RideAlongTurnsFeed.tsx` | Feed styles → Tailwind |
| `app/components/ride-alongs/SpeechWaveform.tsx` | Container styles → Tailwind (wavesurfer canvas stays programmatic) |
| `app/LoadingScreen.tsx` | Inline loading styles → Tailwind |
| `app/AuthGate.tsx` | Inline gate/layout styles → Tailwind |

**Convention:** The `cn()` utility from `app/lib/utils.ts` (scaffolded by shadcn) is used for any conditional class logic.

### Verify Phase 2

Run `npm run build && npx cap sync ios` — clean build, sync to Xcode, smoke test in simulator.

---

## Final Structure

```
/app
  /components
    /auth         ← auth components
    /ride-alongs  ← ride along components
    /ui           ← shadcn generated components
  /lib
    /rideAlongs   ← API client
    utils.ts      ← shadcn cn() utility
  /models         ← Amplify generated models
  AmplifyProvider.tsx
  amplifyconfiguration.json
  aws-exports.js
  AuthContext.tsx
  AuthGate.tsx
  globals.css
  layout.tsx
  LoadingScreen.tsx
  page.tsx
/amplify          ← unchanged
/ios              ← unchanged
/public           ← unchanged
/plugins          ← unchanged
/scripts          ← unchanged
```

---

## Out of Scope

- No structural/logic changes to any component
- No new features
- Font Awesome icon links in `globals.css` are unchanged
- Wavesurfer programmatic canvas styles are unchanged
- Amplify/AWS config is unchanged
