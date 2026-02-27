# Decisions

Log architecture and product decisions that affect long-term implementation direction.

## Categories
- New Rule
- Updated Rule
- New Feature
- Updated Feature

## Decision Log

## 2026-02-26 | Updated Feature | Ride-along pause/resume state added without ending active run
- Added a persisted `PAUSED` ride-along status so an in-progress ride along can be temporarily halted without being marked complete.
- Defined pause behavior to force-stop any active recording session and block all new session starts until the ride along is resumed to `LIVE`.
- Added backend enforcement on session start so paused/non-live ride alongs cannot create sessions due to client race conditions or stale UI state.

## 2026-02-25 | Updated Feature | Session monitor waveform rebuilt for speech-reactive bars
- Replaced the prior waveform behavior with a current-time, speech-reactive mirrored bar visualizer in the ride-along session monitor.
- Standardized the final visual treatment to 19 chunky pill bars, bottom-aligned growth, and marigold token coloring for cleaner readability.

## 2026-02-25 | Updated Rule | Audio visualizer style rules updated
- Updated style guidance to codify mirrored 19-bar pill visuals, vertical-only bars, upward growth from baseline, and current-time speech representation.
