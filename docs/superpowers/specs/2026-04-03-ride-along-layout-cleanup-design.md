# Ride Along Active View — Layout Cleanup

**Date:** 2026-04-03
**Status:** Approved

---

## Overview

Clean up the active ride along view to reduce visual clutter — fewer boxes/borders, tighter spacing, more cohesive hierarchy.

---

## Changes

### 1. Merge toolbar and summary card into one unified header block

**Current:** Dark toolbar bar (back + settings buttons) sits separately above a bordered summary card with a gap between them. Two distinct visual containers.

**New:** One dark block (`bg-neutral-graphite`) with rounded bottom corners (`rounded-b-2xl`). Contains:
- **Top row:** Back arrow (left) + settings icon (right) — same pill buttons, same styling
- **Title:** Ride along name in white, large text
- **Subtitle:** Location in muted white
- **Status line:** "Scheduled · Ready for speech" in dim white
- **Stats row:** Plain inline text — `"0s duration · Not started · Updated Apr 1"` — no bordered boxes, just text with subtle color contrast

The existing bordered summary card (`border border-color-border rounded-[14px] bg-neutral-alabaster`) and the 3-column stats grid with bordered boxes are both removed.

**Files:** `app/components/ride-alongs/RideAlongActiveHeader.tsx`

### 2. Stats as plain text, no bordered boxes

**Current:** 3-column grid of bordered cards (Total Duration, Started, Updated) inside the summary card.

**New:** Single flex row of text spans inside the merged dark header. Format: `<strong>value</strong> label` separated by gaps. Uses `text-white/60` for labels, `text-white/85` for values.

**Files:** `app/components/ride-alongs/RideAlongActiveHeader.tsx`

### 3. Transcript section — flat, no border

**Current:** Bordered container (`border border-brand-navy/[0.16] rounded-xl bg-white/[0.78]`) with "Transcript" label, "Expand" button, and preview text inside.

**New:** No container/border. Just:
- Row: "TRANSCRIPT" label (left, muted uppercase) + "Expand ↗" link (right, muted text, no pill/border)
- Below: Preview text in slightly muted italic when empty ("Listening for transcription..."), normal text when populated

**Files:** `app/components/ride-alongs/RideAlongActiveControls.tsx`

---

## What does NOT change

- Waveform component and its behavior
- Action buttons (Start/Pause/Resume/Complete)
- Error display
- Transcript expanded overlay
- Details flyout panel
- Bottom nav bar
- List view (RideAlongsList)
- Business logic in RideAlongsTab.tsx

---

## Out of Scope

- No new features
- No logic changes
- No data model changes
- Waveform min-height stays at 152px (it's animation-driven)
