# iPad Responsive Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scale up the phone layout for iPad portrait using Tailwind `md:` responsive utilities (~30% increase in text, spacing, touch targets) with a capped 620px content zone in the active recording view.

**Architecture:** Pure CSS approach using Tailwind `md:` breakpoint (768px). No new components, no layout rearrangement. Remove existing custom `.ipad-container` classes and replace with inline Tailwind responsive utilities. SpeechWaveform uses a `window.matchMedia` hook to scale inline-style bar dimensions.

**Tech Stack:** Tailwind CSS, React, Next.js 14, Capacitor iOS

**Spec:** `docs/superpowers/specs/2026-04-05-ipad-responsive-design.md`

---

### Task 1: Clean up globals.css — remove custom iPad container classes

**Files:**
- Modify: `app/globals.css:97-120`

- [ ] **Step 1: Remove the `.ipad-container` and `.ipad-container-wide` CSS classes**

In `app/globals.css`, delete lines 97-120 (the two custom container class definitions and their media queries):

```css
/* DELETE everything from this comment to the end of the file: */

/* iPad-aware centered container — no-op on phone, constrains on tablet+ */
.ipad-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
@media (min-width: 768px) {
  .ipad-container {
    max-width: 600px;
  }
}

/* Wider variant for views that benefit from more space on iPad */
.ipad-container-wide {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
@media (min-width: 768px) {
  .ipad-container-wide {
    max-width: 720px;
  }
}
```

The file should end after the `.bg-waves` rule at line 96-97.

- [ ] **Step 2: Verify the build still compiles**

Run: `npx next build`
Expected: Build succeeds (the `ipad-container` classes are still referenced in components — Tailwind/CSS won't error on missing classes, they'll just have no effect until we update the components in later tasks).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "refactor: remove custom .ipad-container CSS classes from globals.css"
```

---

### Task 2: Scale bottom nav in page.tsx

**Files:**
- Modify: `app/page.tsx:55-74`

- [ ] **Step 1: Update the nav button container**

In `app/page.tsx`, find line 55:
```tsx
        <div className="w-full flex items-center justify-evenly gap-1.5 ipad-container">
```

Replace with:
```tsx
        <div className="w-full flex items-center justify-evenly gap-1.5 md:gap-3">
```

- [ ] **Step 2: Scale the Home button**

Find line 61-65 (the Home button):
```tsx
            className="border-none rounded-[10px] bg-brand-sand text-brand-marigold cursor-pointer flex flex-col items-center justify-center gap-[3px] py-[5px] px-4 min-w-[72px] flex-1"
```

Replace with:
```tsx
            className="border-none rounded-[10px] bg-brand-sand text-brand-marigold cursor-pointer flex flex-col items-center justify-center gap-[3px] py-[5px] px-4 min-w-[72px] md:min-w-[90px] md:max-w-[160px] flex-1"
```

- [ ] **Step 3: Scale the Home button icon and label**

Find (inside the Home button):
```tsx
            <i className="fa-solid fa-house text-[17px]" aria-hidden="true" />
            <span className="text-[10px] font-semibold">Home</span>
```

Replace with:
```tsx
            <i className="fa-solid fa-house text-[17px] md:text-[20px]" aria-hidden="true" />
            <span className="text-[10px] md:text-[12px] font-semibold">Home</span>
```

- [ ] **Step 4: Scale the Logout button**

Find line 67-71 (the Logout button className):
```tsx
            className="border-none rounded-[10px] bg-transparent text-color-text-muted cursor-pointer flex flex-col items-center justify-center gap-[3px] py-[5px] px-4 min-w-[72px] flex-1"
```

Replace with:
```tsx
            className="border-none rounded-[10px] bg-transparent text-color-text-muted cursor-pointer flex flex-col items-center justify-center gap-[3px] py-[5px] px-4 min-w-[72px] md:min-w-[90px] md:max-w-[160px] flex-1"
```

- [ ] **Step 5: Scale the Logout button icon and label**

Find (inside the Logout button):
```tsx
            <i className="fa-solid fa-right-from-bracket text-[17px]" aria-hidden="true" />
            <span className="text-[10px] font-semibold">Logout</span>
```

Replace with:
```tsx
            <i className="fa-solid fa-right-from-bracket text-[17px] md:text-[20px]" aria-hidden="true" />
            <span className="text-[10px] md:text-[12px] font-semibold">Logout</span>
```

- [ ] **Step 6: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "refactor: scale bottom nav for iPad — larger icons, labels, touch targets"
```

---

### Task 3: Scale job cards in RideAlongsList.tsx

**Files:**
- Modify: `app/components/ride-alongs/RideAlongsList.tsx:50-88`

- [ ] **Step 1: Revert card container from grid to flex and add iPad gap**

Find line 67:
```tsx
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
```

Replace with:
```tsx
    <div className="flex flex-col gap-2.5 md:gap-3.5">
```

- [ ] **Step 2: Scale the loading and empty states**

Find line 52:
```tsx
      <div className="text-color-text-muted text-[13px] py-4 text-center">
        Loading your jobs...
```

Replace with:
```tsx
      <div className="text-color-text-muted text-[13px] md:text-[16px] py-4 text-center">
        Loading your jobs...
```

Find line 60:
```tsx
      <div className="text-color-text-muted text-[13px] py-4 text-center">
        No jobs are assigned to you right now.
```

Replace with:
```tsx
      <div className="text-color-text-muted text-[13px] md:text-[16px] py-4 text-center">
        No jobs are assigned to you right now.
```

- [ ] **Step 3: Scale each card button**

Find lines 72-73 (the card button className):
```tsx
          className="bg-white rounded-[14px] text-left p-[14px] cursor-pointer flex flex-col gap-[3px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-none"
```

Replace with:
```tsx
          className="bg-white rounded-[14px] md:rounded-[18px] text-left p-[14px] md:p-5 cursor-pointer flex flex-col gap-[3px] md:gap-[5px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-none"
```

- [ ] **Step 4: Scale card title**

Find line 75:
```tsx
          <div className="text-[15px] font-bold text-color-text">{rideAlong.name}</div>
```

Replace with:
```tsx
          <div className="text-[15px] md:text-[19px] font-bold text-color-text">{rideAlong.name}</div>
```

- [ ] **Step 5: Scale card subtitle**

Find line 76:
```tsx
          <div className="text-[13px] text-[rgba(58,59,56,0.55)]">
```

Replace with:
```tsx
          <div className="text-[13px] md:text-[16px] text-[rgba(58,59,56,0.55)]">
```

- [ ] **Step 6: Scale status badge**

Find line 80:
```tsx
            <span className="border border-brand-navy/[0.14] rounded-full px-2.5 py-[3px] text-[11px] font-semibold text-brand-navy bg-brand-cerulean/[0.14]">
```

Replace with:
```tsx
            <span className="border border-brand-navy/[0.14] rounded-full px-2.5 md:px-3.5 py-[3px] md:py-[5px] text-[11px] md:text-[14px] font-semibold text-brand-navy bg-brand-cerulean/[0.14]">
```

- [ ] **Step 7: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add app/components/ride-alongs/RideAlongsList.tsx
git commit -m "refactor: scale ride along job cards for iPad — larger text, padding, badges"
```

---

### Task 4: Scale list view and active overlay in RideAlongsTab.tsx

**Files:**
- Modify: `app/components/ride-alongs/RideAlongsTab.tsx:1562-1655`

- [ ] **Step 1: Scale list view header — remove ipad-container, add responsive padding**

Find lines 1564-1580:
```tsx
        <div className="bg-neutral-graphite rounded-b-2xl px-4 pb-4 text-neutral-alabaster" style={{ paddingTop: topContentInset }}>
          <div className="ipad-container">
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[22px] font-bold">Ride Alongs</h2>
              <button
                type="button"
                onClick={() => { void loadRideAlongs() }}
                className="border border-white/[0.46] rounded-full min-w-[34px] h-[34px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer"
                aria-label="Refresh ride along list"
              >
                <i className="fa-solid fa-rotate-right" aria-hidden="true" />
              </button>
            </div>
            <p className="m-0 text-[13px] text-white/[0.5] mt-1">
              {isLoadingList ? 'Loading...' : `${scheduledRideAlongs.length} job${scheduledRideAlongs.length === 1 ? '' : 's'} assigned`}
            </p>
          </div>
        </div>
```

Replace with:
```tsx
        <div className="bg-neutral-graphite rounded-b-2xl px-4 md:px-8 pb-4 md:pb-5 text-neutral-alabaster" style={{ paddingTop: topContentInset }}>
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-[22px] md:text-[28px] font-bold">Ride Alongs</h2>
            <button
              type="button"
              onClick={() => { void loadRideAlongs() }}
              className="border border-white/[0.46] rounded-full min-w-[34px] md:min-w-[42px] h-[34px] md:h-[42px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer"
              aria-label="Refresh ride along list"
            >
              <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            </button>
          </div>
          <p className="m-0 text-[13px] md:text-[16px] text-white/[0.5] mt-1">
            {isLoadingList ? 'Loading...' : `${scheduledRideAlongs.length} job${scheduledRideAlongs.length === 1 ? '' : 's'} assigned`}
          </p>
        </div>
```

- [ ] **Step 2: Scale list content area padding and active banner**

Find line 1583:
```tsx
        <div className="ipad-container px-[14px] py-3 flex flex-col gap-2.5">
```

Replace with:
```tsx
        <div className="px-[14px] md:px-6 py-3 md:py-4 flex flex-col gap-2.5">
```

Find line 1592 (the active ride-along banner):
```tsx
              className="border border-support-positive/[0.28] rounded-2xl bg-support-positive/[0.12] text-color-text text-left px-[14px] py-[13px] cursor-pointer text-[13px] font-semibold"
```

Replace with:
```tsx
              className="border border-support-positive/[0.28] rounded-2xl md:rounded-[18px] bg-support-positive/[0.12] text-color-text text-left px-[14px] md:px-5 py-[13px] md:py-4 cursor-pointer text-[13px] md:text-[16px] font-semibold"
```

- [ ] **Step 3: Update active overlay — remove ipad-container-wide, add centered cap**

Find line 1621:
```tsx
      <div className="relative w-full h-full overflow-hidden bg-white pt-2 px-3 flex flex-col gap-2.5 ipad-container-wide">
```

Replace with:
```tsx
      <div className="relative w-full h-full overflow-hidden bg-white pt-2 px-3 md:px-5 flex flex-col gap-2.5 md:max-w-[620px] md:mx-auto">
```

- [ ] **Step 4: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add app/components/ride-alongs/RideAlongsTab.tsx
git commit -m "refactor: scale list view header and active overlay for iPad"
```

---

### Task 5: Scale active header and details flyout in RideAlongActiveHeader.tsx

**Files:**
- Modify: `app/components/ride-alongs/RideAlongActiveHeader.tsx:219-307`

- [ ] **Step 1: Scale dark header bar and remove ipad-container-wide**

Find lines 219-220:
```tsx
      <div className="-mx-3 -mt-2 bg-neutral-graphite rounded-b-2xl px-3 pt-2 pb-[14px] text-neutral-alabaster">
        <div className="flex items-center justify-between mb-2.5 ipad-container-wide">
```

Replace with:
```tsx
      <div className="-mx-3 md:-mx-5 -mt-2 bg-neutral-graphite rounded-b-2xl px-3 md:px-5 pt-2 pb-[14px] md:pb-5 text-neutral-alabaster">
        <div className="flex items-center justify-between mb-2.5">
```

- [ ] **Step 2: Scale back and settings buttons**

Find lines 224 and 232 (both buttons share the same className pattern):
```tsx
            className="border border-white/[0.46] rounded-full min-w-[38px] h-[38px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer text-[14px]"
```

Replace both occurrences with:
```tsx
            className="border border-white/[0.46] rounded-full min-w-[38px] md:min-w-[46px] h-[38px] md:h-[46px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer text-[14px]"
```

- [ ] **Step 3: Scale header text**

Find line 239:
```tsx
        <h2 className="m-0 text-[18px] truncate">{rideAlong.name}</h2>
```

Replace with:
```tsx
        <h2 className="m-0 text-[18px] md:text-[22px] truncate">{rideAlong.name}</h2>
```

Find line 240:
```tsx
        <p className="m-0 text-[13px] text-white/[0.72] mt-[2px] truncate">{summaryLocation}</p>
```

Replace with:
```tsx
        <p className="m-0 text-[13px] md:text-[16px] text-white/[0.72] mt-[2px] truncate">{summaryLocation}</p>
```

Find line 241:
```tsx
        <p className="m-0 text-[11px] text-white/[0.55] font-semibold mt-[2px]">
```

Replace with:
```tsx
        <p className="m-0 text-[11px] md:text-[13px] text-white/[0.55] font-semibold mt-[2px]">
```

Find line 246:
```tsx
        <div className="flex gap-4 mt-2 text-[11px] text-white/[0.6]">
```

Replace with:
```tsx
        <div className="flex gap-4 mt-2 text-[11px] md:text-[13px] text-white/[0.6]">
```

- [ ] **Step 4: Scale details flyout width and title**

Find line 270 (the aside className):
```tsx
        className="fixed top-0 right-0 bottom-0 w-[min(340px,100%)] border-l border-brand-navy/[0.12] rounded-[22px_0_0_22px] bg-white shadow-[-12px_0_30px_rgba(36,41,101,0.16)] z-[22] transition-transform duration-[180ms] ease-out flex flex-col gap-3 px-[14px]"
```

Replace with:
```tsx
        className="fixed top-0 right-0 bottom-0 w-[min(340px,100%)] md:w-[min(420px,100%)] border-l border-brand-navy/[0.12] rounded-[22px_0_0_22px] bg-white shadow-[-12px_0_30px_rgba(36,41,101,0.16)] z-[22] transition-transform duration-[180ms] ease-out flex flex-col gap-3 px-[14px]"
```

Find line 273:
```tsx
          <h3 className="m-0 text-[17px] text-color-text">Ride Along Details</h3>
```

Replace with:
```tsx
          <h3 className="m-0 text-[17px] md:text-[20px] text-color-text">Ride Along Details</h3>
```

- [ ] **Step 5: Scale details flyout sections**

Find line 296 (the detail section card):
```tsx
              className="border border-color-border rounded-xl bg-white p-[10px] flex flex-col gap-[3px]"
```

Replace with:
```tsx
              className="border border-color-border rounded-xl bg-white p-[10px] md:p-3.5 flex flex-col gap-[3px]"
```

Find line 298 (section label):
```tsx
              <div className="text-[11px] font-bold text-color-text-muted uppercase tracking-[0.2px]">
```

Replace with:
```tsx
              <div className="text-[11px] md:text-[13px] font-bold text-color-text-muted uppercase tracking-[0.2px]">
```

Find line 301 (section value):
```tsx
              <div className="text-[12px] text-color-text leading-[1.35] break-words">
```

Replace with:
```tsx
              <div className="text-[12px] md:text-[14px] text-color-text leading-[1.35] break-words">
```

- [ ] **Step 6: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add app/components/ride-alongs/RideAlongActiveHeader.tsx
git commit -m "refactor: scale active header and details flyout for iPad"
```

---

### Task 6: Scale active controls, transcript, and buttons in RideAlongActiveControls.tsx

**Files:**
- Modify: `app/components/ride-alongs/RideAlongActiveControls.tsx:201-331`

- [ ] **Step 1: Scale waveform container**

Find line 203:
```tsx
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 py-1.5">
```

Replace with:
```tsx
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 md:gap-4 py-1.5">
```

- [ ] **Step 2: Scale helper text**

Find line 211:
```tsx
        <p className="m-0 text-[13px] text-[rgba(58,59,56,0.72)] text-center font-semibold">
```

Replace with:
```tsx
        <p className="m-0 text-[13px] md:text-[16px] text-[rgba(58,59,56,0.72)] text-center font-semibold">
```

- [ ] **Step 3: Scale transcript preview — replace inline height with className**

Find lines 222-223:
```tsx
        className="relative w-full text-left cursor-pointer border-none bg-transparent p-0 overflow-hidden"
        style={{ height: '8em' }}
```

Replace with:
```tsx
        className="relative w-full text-left cursor-pointer border-none bg-transparent p-0 overflow-hidden h-[8em] md:h-[10em]"
```

(Remove the `style={{ height: '8em' }}` prop entirely.)

- [ ] **Step 4: Scale transcript preview text**

Find line 230:
```tsx
          <div className="text-[18px] leading-[1.7] break-words text-[rgba(58,59,56,0.38)]">
```

Replace with:
```tsx
          <div className="text-[18px] md:text-[22px] leading-[1.7] break-words text-[rgba(58,59,56,0.38)]">
```

- [ ] **Step 5: Scale transcript expanded view buttons**

Find line 257 (back button in expanded transcript):
```tsx
              className="border border-white/[0.46] rounded-full w-[38px] h-[38px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer flex-shrink-0"
```

Replace with:
```tsx
              className="border border-white/[0.46] rounded-full w-[38px] md:w-[46px] h-[38px] md:h-[46px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer flex-shrink-0"
```

Find line 268 (close button in expanded transcript — same className):
```tsx
              className="border border-white/[0.46] rounded-full w-[38px] h-[38px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer flex-shrink-0"
```

Replace with:
```tsx
              className="border border-white/[0.46] rounded-full w-[38px] md:w-[46px] h-[38px] md:h-[46px] bg-transparent text-neutral-alabaster inline-flex items-center justify-center cursor-pointer flex-shrink-0"
```

- [ ] **Step 6: Scale transcript expanded title**

Find line 262:
```tsx
            <div className="flex-1 text-center text-[15px] font-bold text-neutral-alabaster">
```

Replace with:
```tsx
            <div className="flex-1 text-center text-[15px] md:text-[18px] font-bold text-neutral-alabaster">
```

- [ ] **Step 7: Scale transcript content area — remove ipad-container-wide, add centered cap**

Find line 275:
```tsx
          <div ref={transcriptTurnsScrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 ipad-container-wide">
```

Replace with:
```tsx
          <div ref={transcriptTurnsScrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 md:max-w-[620px] md:mx-auto md:w-full">
```

- [ ] **Step 8: Scale transcript turns**

Find line 277:
```tsx
              <div className="flex flex-col gap-2.5">
```

Replace with:
```tsx
              <div className="flex flex-col gap-2.5 md:gap-3.5">
```

Find line 280 (turn timestamp):
```tsx
                    <div className="text-[11px] font-bold text-color-text-muted leading-[1.25]">
```

Replace with:
```tsx
                    <div className="text-[11px] md:text-[13px] font-bold text-color-text-muted leading-[1.25]">
```

Find line 283 (turn text bubble):
```tsx
                    <div className="border border-brand-navy/[0.15] rounded-[10px] bg-white px-[10px] py-2 text-[13px] leading-[1.4] text-color-text whitespace-pre-wrap break-words">
```

Replace with:
```tsx
                    <div className="border border-brand-navy/[0.15] rounded-[10px] md:rounded-[14px] bg-white px-[10px] md:px-4 py-2 md:py-3 text-[13px] md:text-[16px] leading-[1.4] text-color-text whitespace-pre-wrap break-words">
```

- [ ] **Step 9: Scale action buttons**

Find line 298:
```tsx
      <div className="flex items-center gap-2.5 w-full">
```

Replace with:
```tsx
      <div className="flex items-center gap-2.5 md:gap-3.5 w-full">
```

Find line 303 (main action button className — the template literal part):
```tsx
          className={`flex-1 rounded-[14px] min-h-[52px] border inline-flex items-center justify-center gap-2 text-[15px] font-extrabold ${mainActionToneClass}`}
```

Replace with:
```tsx
          className={`flex-1 rounded-[14px] md:rounded-[18px] min-h-[52px] md:min-h-[64px] border inline-flex items-center justify-center gap-2 text-[15px] md:text-[18px] font-extrabold ${mainActionToneClass}`}
```

Find line 315 (complete button):
```tsx
          className="flex-1 rounded-[14px] min-h-[52px] border inline-flex items-center justify-center gap-2 text-[15px] font-extrabold bg-brand-tangerine/[0.14] border-brand-tangerine/[0.38] text-brand-tangerine"
```

Replace with:
```tsx
          className="flex-1 rounded-[14px] md:rounded-[18px] min-h-[52px] md:min-h-[64px] border inline-flex items-center justify-center gap-2 text-[15px] md:text-[18px] font-extrabold bg-brand-tangerine/[0.14] border-brand-tangerine/[0.38] text-brand-tangerine"
```

- [ ] **Step 10: Scale error banner**

Find line 325:
```tsx
        <div className="border border-support-negative/[0.3] rounded-[10px] bg-support-negative/[0.08] text-support-negative text-[12px] px-[9px] py-2">
```

Replace with:
```tsx
        <div className="border border-support-negative/[0.3] rounded-[10px] bg-support-negative/[0.08] text-support-negative text-[12px] md:text-[14px] px-[9px] md:px-3.5 py-2 md:py-2.5">
```

- [ ] **Step 11: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 12: Commit**

```bash
git add app/components/ride-alongs/RideAlongActiveControls.tsx
git commit -m "refactor: scale active controls, transcript, and action buttons for iPad"
```

---

### Task 7: Scale waveform bar dimensions in SpeechWaveform.tsx

**Files:**
- Modify: `app/components/ride-alongs/SpeechWaveform.tsx:14-28, 57-62, 216-247`

- [ ] **Step 1: Add useMediaQuery logic and responsive constants**

Find lines 14-15 at the top of the file (module-level constants):
```typescript
const BAR_COUNT = 19
const FRAME_INTERVAL_MS = 56
```

Add these lines immediately before `const BAR_COUNT`:
```typescript
const TABLET_MEDIA_QUERY = '(min-width: 768px)'
```

- [ ] **Step 2: Add media query state inside the component**

Find lines 57-62 (start of the component function body):
```typescript
export default function SpeechWaveform({
  level,
  spectrumLevels,
  isMonitoringEnabled,
}: SpeechWaveformProps) {
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(0))
```

Replace with:
```typescript
export default function SpeechWaveform({
  level,
  spectrumLevels,
  isMonitoringEnabled,
}: SpeechWaveformProps) {
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(TABLET_MEDIA_QUERY)
    setIsTablet(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsTablet(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const barWidth = isTablet ? 20 : 16
  const maxBarHeight = isTablet ? 140 : 108
  const restBarHeight = isTablet ? 20 : 16

  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(0))
```

- [ ] **Step 3: Update bar rendering to use responsive dimensions**

Find lines 218-237 (the `barElements` useMemo):
```typescript
  const barElements = useMemo(
    () =>
      bars.map((barLevel, index) => {
        const height =
          REST_BAR_HEIGHT_PX +
          barLevel * (MAX_BAR_HEIGHT_PX - REST_BAR_HEIGHT_PX)
        const opacity = REST_BAR_OPACITY + barLevel * (1 - REST_BAR_OPACITY)

        return (
          <div
            key={`wave-bar-${index}`}
            style={{
              width: '16px',
              height: `${height}px`,
              borderRadius: '999px',
              backgroundColor: 'var(--color-brand-marigold)',
              opacity,
              boxShadow: '0 1px 2px rgba(36, 41, 101, 0.14)',
            }}
          />
        )
      }),
    [bars]
  )
```

Replace with:
```typescript
  const barElements = useMemo(
    () =>
      bars.map((barLevel, index) => {
        const height =
          restBarHeight +
          barLevel * (maxBarHeight - restBarHeight)
        const opacity = REST_BAR_OPACITY + barLevel * (1 - REST_BAR_OPACITY)

        return (
          <div
            key={`wave-bar-${index}`}
            style={{
              width: `${barWidth}px`,
              height: `${height}px`,
              borderRadius: '999px',
              backgroundColor: 'var(--color-brand-marigold)',
              opacity,
              boxShadow: '0 1px 2px rgba(36, 41, 101, 0.14)',
            }}
          />
        )
      }),
    [bars, barWidth, maxBarHeight, restBarHeight]
  )
```

- [ ] **Step 4: Scale the waveform container min-height**

Find line 242:
```tsx
    <div className="relative w-full min-h-[152px] rounded-none border-none bg-transparent flex items-end justify-center py-2 overflow-hidden">
```

Replace with:
```tsx
    <div className="relative w-full min-h-[152px] md:min-h-[200px] rounded-none border-none bg-transparent flex items-end justify-center py-2 overflow-hidden">
```

- [ ] **Step 5: Remove the now-unused module-level constants**

Find lines 26-27:
```typescript
const REST_BAR_HEIGHT_PX = 16
const MAX_BAR_HEIGHT_PX = 108
```

Delete these two lines (they are now computed inside the component as `restBarHeight` and `maxBarHeight`).

- [ ] **Step 6: Verify build**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add app/components/ride-alongs/SpeechWaveform.tsx
git commit -m "refactor: scale waveform bar dimensions for iPad via matchMedia"
```

---

### Task 8: Final build, sync, and verify

**Files:**
- None (verification only)

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Sync to iOS and open Xcode**

Run: `npm run rebuild:ios`
Expected: Build succeeds, Capacitor sync completes, Xcode opens.

- [ ] **Step 3: Verify no remaining ipad-container references**

Run: `grep -r "ipad-container" app/`
Expected: No matches found.

- [ ] **Step 4: Commit any remaining cleanup**

If Step 3 found stray references, clean them up and commit. Otherwise, skip.
