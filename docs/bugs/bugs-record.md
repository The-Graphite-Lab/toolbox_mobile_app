# Bug Record

Ledger of recurring bug types and the most recent known fix approach.

## Bugs
- `BUG_7` | Last seen: 2026-03-05 | Bottom navigation could scroll out of view and action icons were unevenly distributed when shell height/content overflow changed. Most recent fix: constrain app shell to viewport height with internal scrolling and normalize nav actions to equal-flex distribution.
- `BUG_6` | Last seen: 2026-03-05 | Full-screen background art did not fill landscape/wide viewports due to height-locked sizing (`auto 100vh`). Most recent fix: move full-screen shells to viewport-safe sizing (`minHeight`/`100dvh`) and use `backgroundSize: 'cover'` so the background fills the screen in both portrait and landscape.
- `BUG_5` | Last seen: 2026-02-26 | iOS ride-along showed "WebSocket receive error: Socket is not connected" when session ended. Most recent fix: treat receive failure as expected when the socket was closed (by us or server) and do not emit rideAlongSessionError for cancelled/not-connected/connection-closed style errors.
- `BUG_4` | Last seen: 2026-02-27 | iOS ride-along persistence failed because native plugin attempted direct API calls with incompatible auth for API Gateway IAM routes. Most recent fix: move session/turn/stop persistence back to JS Amplify flow via plugin events and keep iOS native focused on audio + websocket only.
- `BUG_3` | Last seen: 2026-02-27 | Connections API CORS preflight blocked ride-along backend calls from app origins. Most recent fix: add explicit `OPTIONS` handling plus `Access-Control-Allow-Methods/Headers` responses in `connections` Lambda Express middleware.
- `BUG_2` | Last seen: 2026-02-27 | iOS ride-along speech monitor never auto-started sessions because ambient mic levels stayed at `0` before recording began. Most recent fix: add native ambient level monitor (`AVAudioEngine`) fallback in `getLevels()` and stop it when an active ride-along session starts.
- `BUG_1` | Last seen: 2026-02-27 | iOS Capacitor `AudioRecording` plugin not implemented due native registration drift (stale compiled source and missing runtime bridge registration). Most recent fix: compile `ios/App/App/Plugins/AudioRecording/*` and register `AudioRecordingPlugin` via a custom `BridgeViewController` `capacitorDidLoad` hook.

## Entry Format
- `BUG_{num}`: bug summary, last-seen date, and most recent successful resolution pattern.
