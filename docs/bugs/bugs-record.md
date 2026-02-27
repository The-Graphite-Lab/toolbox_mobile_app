<<<<<<< Current (Your changes)
=======
# Bug Record

Ledger of recurring bug types and the most recent known fix approach.

## Bugs
- `BUG_4` | Last seen: 2026-02-27 | iOS ride-along persistence failed because native plugin attempted direct API calls with incompatible auth for API Gateway IAM routes. Most recent fix: move session/turn/stop persistence back to JS Amplify flow via plugin events and keep iOS native focused on audio + websocket only.
- `BUG_3` | Last seen: 2026-02-27 | Connections API CORS preflight blocked ride-along backend calls from app origins. Most recent fix: add explicit `OPTIONS` handling plus `Access-Control-Allow-Methods/Headers` responses in `connections` Lambda Express middleware.
- `BUG_2` | Last seen: 2026-02-27 | iOS ride-along speech monitor never auto-started sessions because ambient mic levels stayed at `0` before recording began. Most recent fix: add native ambient level monitor (`AVAudioEngine`) fallback in `getLevels()` and stop it when an active ride-along session starts.
- `BUG_1` | Last seen: 2026-02-27 | iOS Capacitor `AudioRecording` plugin not implemented due native registration drift (stale compiled source and missing runtime bridge registration). Most recent fix: compile `ios/App/App/Plugins/AudioRecording/*` and register `AudioRecordingPlugin` via a custom `BridgeViewController` `capacitorDidLoad` hook.

## Entry Format
- `BUG_{num}`: bug summary, last-seen date, and most recent successful resolution pattern.
>>>>>>> Incoming (Background Agent changes)
