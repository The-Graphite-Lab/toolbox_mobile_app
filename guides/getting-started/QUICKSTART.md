# Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Build the App

```bash
npm run build
```

## Step 3: Add iOS Platform

```bash
npx cap add ios
npx cap sync
```

## Step 4: Configure iOS Permissions

1. Open `ios/App/App/Info.plist`
2. Add these keys inside `<dict>`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to your microphone to record audio.</string>

<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

## Step 5: Add Plugin Files to Xcode

1. Open in Xcode:
   ```bash
   npm run cap:ios
   ```

2. In Xcode, add the plugin files:
   - Right-click on the `App` folder in the project navigator
   - Select "Add Files to 'App'..."
   - Navigate to `ios/App/App/Plugins/AudioRecording/`
   - Select both `AudioRecording.swift` and `AudioRecording.m`
   - **Check**: "Copy items if needed" and "Add to targets: App"
   - Click "Add"

3. Verify files appear in the project navigator under `App/Plugins/AudioRecording/`

## Step 6: Enable Background Audio in Xcode

1. In Xcode:
   - Select project → "TGL Webpages" target
   - Go to "Signing & Capabilities"
   - Click "+ Capability"
   - Add "Background Modes"
   - Check "Audio, AirPlay, and Picture in Picture"

## Step 7: Run on iPhone

1. Connect your iPhone
2. Select your device in Xcode
3. Click Run (▶️)
4. Grant microphone permission when prompted

## Testing

1. The test page should load automatically
2. Click "Start Recording"
3. Minimize the app (press home button)
4. Wait a few seconds
5. Return to the app
6. Click "Stop Recording"
7. Check status to verify it worked!

## Loading Your Webpage

To load a webpage from webpages.thegraphitelab.com:

1. Create `.env.local`:
   ```
   NEXT_PUBLIC_WEBPAGE_URL=https://webpages.thegraphitelab.com/your-page
   ```

2. Rebuild:
   ```bash
   npm run build
   npx cap sync
   ```

3. Run again in Xcode

## Troubleshooting

- **Build fails**: Make sure you ran `npm run build` before `npx cap sync`
- **No audio**: Check microphone permission in iOS Settings
- **Background doesn't work**: Verify Background Modes is enabled in Xcode
- **Plugin not found**: Check that plugin files exist in `ios/App/App/Plugins/AudioRecording/`

