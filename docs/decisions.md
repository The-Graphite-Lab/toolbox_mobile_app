# Decisions

Log architecture and product decisions that affect long-term implementation direction.

## Categories
- New Rule
- Updated Rule
- New Feature
- Updated Feature

## Decision Log

## 2026-03-05 | Updated Rule | Waveform layout changed to non-mirrored distribution
- Updated the style guide for ride-along waveform visuals to use a non-mirrored, naturally distributed 19-bar layout.
- Preserved the existing constraints for vertical bars, marigold token usage, baseline growth, and speech-reactive behavior.

## 2026-03-05 | Updated Feature | iOS waveform now uses native spectrum output
- Added native iOS `getSpectrumLevels` support so ride-along waveform bars can respond to real per-band speech energy rather than level-only fallback behavior.
- Tuned sensitivity and normalization so low-volume speech remains visible without over-triggering from ambient noise.

## 2026-03-05 | Updated Rule | Full-screen shell and bottom navigation behavior standardized
- Added style guidance requiring viewport-locked (`100dvh`) app shells with content-region scrolling for pages that use persistent bottom navigation.
- Standardized bottom navigation expectations to keep the bar always visible, safe-area aware, non-shrinking, and with evenly distributed primary actions.

## 2026-03-05 | New Feature | Coaching tab with interactive technician metric cards
- Added a new bottom navigation tab labeled `Coaching` with benchmark-style cards that compare technician performance to top performers using sample data.
- Standardized coaching card icon styling and added card-level motion feedback for hover, focus, and press interactions.
- Added click-through metric detail views with technician-facing guidance for each metric, including what it is, why it matters, and practical improvement tips.

## 2026-02-26 | Updated Feature | Ride-along pause/resume state added without ending active run
- Added a persisted `PAUSED` ride-along status so an in-progress ride along can be temporarily halted without being marked complete.
- Defined pause behavior to force-stop any active recording session and block all new session starts until the ride along is resumed to `LIVE`.
- Added backend enforcement on session start so paused/non-live ride alongs cannot create sessions due to client race conditions or stale UI state.

## 2026-02-25 | Updated Feature | Session monitor waveform rebuilt for speech-reactive bars
- Historical state at that time: replaced the prior waveform behavior with a current-time, speech-reactive mirrored bar visualizer in the ride-along session monitor.
- Standardized the visual treatment to 19 chunky pill bars, bottom-aligned growth, and marigold token coloring for readability.
- Superseded on 2026-03-05: waveform layout direction changed from mirrored to non-mirrored distributed bars.

## 2026-02-25 | Updated Rule | Audio visualizer style rules updated
- Historical rule at that time: codified mirrored 19-bar pill visuals, vertical-only bars, upward growth from baseline, and current-time speech representation.
- Superseded on 2026-03-05: style guidance now uses non-mirrored distributed bars while keeping vertical bars, baseline growth, and speech-reactive behavior.
