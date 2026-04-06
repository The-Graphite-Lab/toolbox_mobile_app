# iPad Responsive Design — Scale + Breathe

**Date**: 2026-04-05
**Status**: Draft
**Scope**: iPad portrait layout for all ride-along views

## Summary

Scale up the existing phone layout for iPad portrait using Tailwind `md:` responsive utilities. No layout rearrangement — single-column throughout. Text, spacing, touch targets, and border radii increase ~30% on iPad. The active recording view caps its content zone at 620px centered to prevent the waveform and buttons from stretching too wide.

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Layout strategy | Scale + Breathe (no grid/rearrange) | Field workers need familiar layout with bigger touch targets |
| Orientation | Portrait only | Primary field use case |
| Scale factor | ~25-35% | Noticeable optimization without going oversized |
| Active view content | Capped at 620px centered | Prevents waveform/buttons from stretching thin across full width |
| Active view header | Full-bleed edge-to-edge | Maintains visual weight and brand presence |
| Breakpoint | Tailwind `md:` (768px) | Standard iPad portrait width |
| Implementation | Pure Tailwind `md:` utilities | Remove custom `.ipad-container` CSS classes |

## Scale Reference Table

| Element | iPhone | iPad (`md:`) |
|---|---|---|
| Header title | `text-[22px]` | `md:text-[28px]` |
| Card title | `text-[15px]` | `md:text-[19px]` |
| Card subtitle | `text-[13px]` | `md:text-[16px]` |
| Status badge | `text-[11px]` | `md:text-[14px]` |
| Helper/body text | `text-[13px]` | `md:text-[16px]` |
| Body padding (horizontal) | `px-[14px]` | `md:px-6` (24px) |
| Card padding | `p-[14px]` | `md:p-5` (20px) |
| Card border-radius | `rounded-[14px]` | `md:rounded-[18px]` |
| Button min-height | `min-h-[52px]` | `md:min-h-[64px]` |
| Button text | `text-[15px]` | `md:text-[18px]` |
| Button border-radius | `rounded-[14px]` | `md:rounded-[18px]` |

## File-by-File Changes

### 1. `app/globals.css`

**Remove** the `.ipad-container` and `.ipad-container-wide` custom CSS classes (lines 98-120). All iPad responsive behavior moves to Tailwind `md:` utilities in the components.

### 2. `app/page.tsx` — Bottom Nav

- Remove `ipad-container` class from the nav button container
- Scale button icons: add `md:text-[20px]` (from 17px)
- Scale button labels: add `md:text-[12px]` (from 10px)
- Scale button min-width: add `md:min-w-[90px]` (from 72px)
- Cap individual button width: add `md:max-w-[160px]` to prevent excessive stretching

### 3. `app/components/ride-alongs/RideAlongsList.tsx` — Job Cards

- Revert `grid grid-cols-1 md:grid-cols-2` back to `flex flex-col` (no grid)
- Card container gap: add `md:gap-3.5` (from 2.5)
- Each card button:
  - Padding: add `md:p-5`
  - Border-radius: add `md:rounded-[18px]`
  - Title: add `md:text-[19px]`
  - Subtitle: add `md:text-[16px]`
  - Status badge: add `md:text-[14px]` and `md:px-3.5 md:py-[5px]`
  - Gap between title/subtitle: add `md:gap-[5px]`

### 4. `app/components/ride-alongs/RideAlongsTab.tsx` — List View & Active Overlay

**List view header** (dark bar):
- Remove `ipad-container` wrapper div from header content — keep content direct
- Header outer padding: add `md:px-8 md:pb-5`
- Title: add `md:text-[28px]`
- Subtitle (job count): add `md:text-[16px]`
- Refresh button: add `md:min-w-[42px] md:h-[42px]`

**List view content area**:
- Padding: add `md:px-6 md:py-4`

**Active ride-along banner** (green "tap to resume"):
- Padding: add `md:px-5 md:py-4`
- Text: add `md:text-[16px]`
- Border-radius: add `md:rounded-[18px]`

**Active overlay** (portal):
- Remove `ipad-container-wide` from inner div
- Inner content div: add `md:max-w-[620px] md:mx-auto` to cap content width
- Outer padding: add `md:px-5`

### 5. `app/components/ride-alongs/RideAlongActiveHeader.tsx`

**Dark header bar**:
- Remove `ipad-container-wide` from button row
- Outer padding: add `md:px-5 md:pb-5`
- Back/settings buttons: add `md:min-w-[46px] md:h-[46px]`
- Name: add `md:text-[22px]`
- Location: add `md:text-[16px]`
- Status line: add `md:text-[13px]`
- Stats row: add `md:text-[13px]`

**Details flyout (side panel)**:
- Width: change `w-[min(340px,100%)]` to include `md:w-[min(420px,100%)]`
- Section label: add `md:text-[13px]`
- Section value: add `md:text-[14px]`
- Section padding: add `md:p-3.5`
- Flyout title: add `md:text-[20px]`

### 6. `app/components/ride-alongs/RideAlongActiveControls.tsx`

**Waveform container**:
- Min-height: add `md:min-h-[200px]`
- The `max-w-[620px]` on the waveform wrapper already exists — keep it

**Waveform bars** (in `SpeechWaveform.tsx`):
- Bar width: 16px → 20px on iPad
- Max bar height: 108px → 140px
- Rest bar height: 16px → 20px
- Implementation: pass an `isTablet` prop or use a CSS media query approach (see SpeechWaveform section)

**Helper text** ("Speech detected."):
- Add `md:text-[16px]`

**Transcript preview button**:
- Height is currently set via inline `style={{ height: '8em' }}`. Replace with `className="h-[8em] md:h-[10em]"` and remove the inline style.
- Text: add `md:text-[22px]` (from 18px)

**Action buttons** (Pause/Complete):
- Min-height: add `md:min-h-[64px]`
- Text: add `md:text-[18px]`
- Border-radius: add `md:rounded-[18px]`
- Gap between buttons: add `md:gap-3.5`

**Transcript expanded view**:
- Back/close buttons: add `md:w-[46px] md:h-[46px]`
- Title: add `md:text-[18px]`
- Content area: add `md:max-w-[620px] md:mx-auto`
- Turn timestamp: add `md:text-[13px]`
- Turn text: add `md:text-[16px] md:px-4 md:py-3`
- Turn bubble radius: add `md:rounded-[14px]`
- Turn gap: add `md:gap-3.5`

**Error banner**:
- Text: add `md:text-[14px]`
- Padding: add `md:px-3.5 md:py-2.5`

### 7. `app/components/ride-alongs/SpeechWaveform.tsx`

The waveform uses inline styles with hardcoded pixel values for bar dimensions. Two approaches to scale on iPad:

**Chosen approach**: Use a `useMediaQuery` hook (or `window.matchMedia`) to detect `min-width: 768px` and switch constants:

```typescript
const isTablet = useMediaQuery('(min-width: 768px)')
const barWidth = isTablet ? 20 : 16
const maxBarHeight = isTablet ? 140 : 108
const restBarHeight = isTablet ? 20 : 16
```

This keeps the existing inline style approach intact while scaling values for iPad. The `useMediaQuery` hook is a small addition (4-5 lines) in SpeechWaveform itself — no need for a shared utility since only this component needs it.

### 8. `capacitor.config.ts`

No changes needed. The `preferredContentMode: 'mobile'` was already reverted. iPad renders at native resolution by default.

## Out of Scope

- Landscape orientation support
- iPad-specific features (split view, slide over)
- Grid/multi-column card layouts
- New components or utility classes
