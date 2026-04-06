# Ride Along List — Redesign

**Date:** 2026-04-05
**Status:** Approved

---

## Overview

Redesign the ride along list screen to be visually consistent with the active ride along view. Remove the SVG waves background, add a dark header, and clean up the card layout.

---

## Changes

### 1. Remove SVG waves background from list view

**Current:** `page.tsx` root div has `bg-waves bg-no-repeat bg-top bg-cover` which shows the branded wave pattern behind the list.

**New:** Plain `bg-neutral-alabaster` (#fffefc). No background image on the list view.

**Files:** `app/page.tsx` — remove `bg-waves bg-no-repeat bg-top bg-cover` from the root div className.

### 2. Add dark header to list view

**Current:** `RideAlongsList` renders its own white bordered card container with "Ride Alongs" title, subtitle, and refresh button inside.

**New:** Split into two parts:
- **Dark header** at the top of the list scroll area (rendered in `RideAlongsTab.tsx` list mode, above `RideAlongsList`): dark graphite background, "Ride Alongs" title in white, "N jobs assigned" count in muted white, refresh button (white outline pill). Matches the active view header style — rounded bottom corners (`rounded-b-2xl`).
- **RideAlongsList** loses its outer container card, heading, subtitle, and refresh button. It becomes just the list of job cards.

**Files:** 
- `app/components/ride-alongs/RideAlongsTab.tsx` — add dark header in list view mode
- `app/components/ride-alongs/RideAlongsList.tsx` — remove outer section/border/heading, simplify to just the card list

### 3. Cleaner job cards

**Current:** Each job card has `border border-color-border rounded-[14px]` with title + status chip crammed side-by-side on one row, location below.

**New:** Each job card:
- White background, rounded-[14px], subtle box shadow (`shadow-[0_1px_4px_rgba(0,0,0,0.06)]`) instead of border
- Title on its own line (15px, bold)
- Location below (13px, muted)
- Status chip below location on its own row (same style as current chip)

**Files:** `app/components/ride-alongs/RideAlongsList.tsx`

### 4. Active ride along resume banner

**Current:** Green-bordered button "You have an active ride along in progress. Tap to resume." sits above the list.

**New:** Same content but positioned below the dark header, above the job cards. Styling unchanged — it already looks clean.

**Files:** `app/components/ride-alongs/RideAlongsTab.tsx` — no change needed, it already renders above `RideAlongsList`

---

## What does NOT change

- Bottom nav bar (Home / Logout)
- Active ride along view (already redesigned)
- Details flyout
- Login / loading screens
- Business logic
- Data model

---

## Out of Scope

- No new features
- No logic changes
- Waveform, transcript, controls unchanged
