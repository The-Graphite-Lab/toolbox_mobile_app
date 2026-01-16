# Mobile App Webpages Test

A simple test mobile application built with Next.js, Capacitor, and Material UI that serves webpages and exposes background audio recording capabilities.

## Features

- WebView integration to load webpages from webpages.thegraphitelab.com
- Background audio recording (works when app is minimized)
- Test webpage for testing audio recording functionality
- iOS support with native audio recording

## Prerequisites

- Node.js 18+ installed
- Xcode (for iOS development)
- iOS device or simulator for testing
- CocoaPods (will be installed automatically by Capacitor)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Next.js App

```bash
npm run build
```

This creates a static export in the `out` directory that Capacitor will use.

### 3. Initialize Capacitor iOS Platform

```bash
npx cap add ios
npx cap sync
```

### 4. Configure iOS

After running `cap sync`, you need to manually configure iOS:

#### a. Add Microphone Permission

Open `ios/App/App/Info.plist` and add:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to your microphone to record audio.</string>
```

#### b. Enable Background Audio

1. Open the project in Xcode:
   ```bash
   npm run cap:ios
   ```
2. Select the project in Xcode navigator
3. Select the "TGL Webpages" target
4. Go to "Signing & Capabilities" tab
5. Click "+ Capability"
6. Add "Background Modes"
7. Check "Audio, AirPlay, and Picture in Picture"

#### c. Add Plugin Files to Xcode Project

**IMPORTANT**: The plugin files need to be manually added to the Xcode project:

1. After running `npx cap add ios`, the plugin files should exist at:
   - `ios/App/App/Plugins/AudioRecording/AudioRecording.swift`
   - `ios/App/App/Plugins/AudioRecording/AudioRecording.m`

2. If they don't exist, copy them from the project (they're already created in the repo)

3. Open the project in Xcode:
   ```bash
   npm run cap:ios
   ```

4. In Xcode:
   - Right-click on the `Plugins` folder (or `App` folder if Plugins doesn't exist)
   - Select "Add Files to 'App'..."
   - Navigate to `ios/App/App/Plugins/AudioRecording/`
   - Select both `AudioRecording.swift` and `AudioRecording.m`
   - **IMPORTANT**: Check "Copy items if needed" (if files are outside the project)
   - **IMPORTANT**: Check "Add to targets: App"
   - Click "Add"

5. Verify the files appear in the Xcode project navigator under `App/Plugins/AudioRecording/`

### 5. Configure WebView URL

By default, the app loads a local test page. To load webpages from your server:

1. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_WEBPAGE_URL=https://webpages.thegraphitelab.com/your-page
   ```

2. Rebuild:
   ```bash
   npm run build
   npx cap sync
   ```

## Running the App

### Development (Web)

```bash
npm run dev
```

Visit `http://localhost:3000` to test the web version.

### iOS

1. Build and sync:
   ```bash
   npm run build
   npm run cap:sync
   ```

2. Open in Xcode:
   ```bash
   npm run cap:ios
   ```

3. In Xcode:
   - Select your device or simulator
   - Click the Run button (▶️)
   - The app will install and launch on your device

## Testing Audio Recording

1. Open the app on your iPhone
2. The test page should load automatically
3. Click "Start Recording"
4. Grant microphone permission when prompted
5. Minimize the app (press home button)
6. Wait a few seconds
7. Return to the app
8. Click "Stop Recording"
9. Check the status to verify recording worked

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page with WebView
│   └── globals.css        # Global styles
├── plugins/               # Capacitor plugins
│   ├── AudioRecording.ts  # Plugin interface
│   ├── AudioRecording.web.ts  # Web implementation
│   └── definitions.ts     # Type definitions
├── public/                # Static files
│   └── test-page.html    # Test webpage
├── ios/                   # iOS native code (generated)
│   └── App/
│       └── App/
│           └── Plugins/
│               └── AudioRecording/  # Native iOS plugin
├── capacitor.config.ts    # Capacitor configuration
├── next.config.js         # Next.js configuration
└── package.json           # Dependencies
```

## API Usage in Webpages

Webpages loaded in the WebView can access the audio recording API:

```javascript
// Check if API is available
if (window.audioRecording || window.Capacitor?.Plugins?.AudioRecording) {
  // Start recording
  const result = await window.audioRecording.start({ filename: 'recording.m4a' });
  
  // Check status
  const status = await window.audioRecording.getStatus();
  
  // Stop recording
  const stopResult = await window.audioRecording.stop();
}
```

## Troubleshooting

### Audio recording doesn't work
- Verify microphone permission is granted in iOS Settings
- Check that Background Modes > Audio is enabled in Xcode
- Ensure the plugin is properly registered (check console logs)

### WebView doesn't load
- Check the URL in `app/page.tsx` or `.env.local`
- Verify network connectivity
- Check browser console for errors

### Build errors
- Run `npm run build` before `npx cap sync`
- Clean build: `rm -rf out ios` then rebuild
- Check Node.js version (18+ required)

## Version Management

The app version is automatically synchronized from `package.json` to the test page. The version appears in:
- The version badge next to the "Audio Recorder" title
- The dev info section at the bottom

### Automatic Version Updates

The version is automatically updated:
- **Before builds**: The `prebuild` script runs `inject-version.js` before every build
- **During development**: The `dev` script runs the injection script
- **Before commits**: A git pre-commit hook ensures the version is updated (if git is initialized)

### Manual Version Update

To manually update the version:

```bash
npm run inject-version
```

Or update `package.json` and run any build/dev command - it will update automatically.

### Setting Up Git Hooks

If you initialize a git repository, set up the pre-commit hook:

```bash
./scripts/setup-git-hooks.sh
```

This ensures the version is always in sync before commits.

## Next Steps

This is a basic test implementation. For production, consider:
- Adding error handling and retry logic
- Implementing audio playback
- Adding file management UI
- Setting up proper deep linking
- Adding Android support
- Implementing authentication if needed

