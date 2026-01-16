# Step-by-Step Testing Guide

Follow these steps to set up and test the app on your iPhone.

## Step 1: Install Dependencies

```bash
npm install
```

Wait for all packages to install.

## Step 2: Build the Next.js App

```bash
npm run build
```

This creates the static files in the `out` directory that Capacitor will use.

## Step 3: Add iOS Platform

```bash
npx cap add ios
npx cap sync
```

This creates the iOS project structure.

## Step 4: Add Plugin Files to Xcode Project

**CRITICAL STEP** - The plugin files must be added to Xcode:

1. Open Xcode:
   ```bash
   npm run cap:ios
   ```

2. In Xcode:
   - Look at the left sidebar (Project Navigator)
   - Find the `App` folder (under "App" target)
   - Right-click on the `App` folder
   - Select **"Add Files to 'App'..."**
   - Navigate to: `ios/App/App/Plugins/AudioRecording/`
   - Select **both files**:
     - `AudioRecording.swift`
     - `AudioRecording.m`
   - **IMPORTANT**: Check ✅ "Copy items if needed"
   - **IMPORTANT**: Check ✅ "Add to targets: App"
   - Click **"Add"**

3. Verify: You should now see both files in the Xcode project under `App/Plugins/AudioRecording/`

## Step 5: Configure Info.plist

1. In Xcode, find `Info.plist` in the project navigator (it might be under `App` folder)

2. Right-click on `Info.plist` → **"Open As"** → **"Source Code"**

3. Find the `<dict>` tag and add these keys **inside** it (before `</dict>`):

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to your microphone to record audio.</string>

<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

4. Save the file (Cmd+S)

## Step 6: Enable Background Audio Capability

1. In Xcode, click on the **"App"** project (blue icon) in the left sidebar
2. Select the **"TGL Webpages"** target (under TARGETS)
3. Click the **"Signing & Capabilities"** tab
4. Click the **"+ Capability"** button (top left)
5. Search for and add **"Background Modes"**
6. Check the box for **"Audio, AirPlay, and Picture in Picture"**

## Step 7: Connect Your iPhone

1. Connect your iPhone to your Mac via USB
2. Unlock your iPhone
3. Trust the computer if prompted
4. In Xcode, select your iPhone from the device dropdown (next to the Run button)

## Step 8: Configure Signing (if needed)

1. In Xcode, still in "Signing & Capabilities" tab
2. Check **"Automatically manage signing"**
3. Select your **Team** (your Apple ID)
4. Xcode will automatically create a provisioning profile

## Step 9: Build and Run

1. Click the **Run** button (▶️) in Xcode, or press `Cmd+R`
2. Wait for the app to build and install on your iPhone
3. The app should launch automatically

## Step 10: Test Audio Recording

1. **Grant Permission**: When the app opens, it will ask for microphone permission - tap **"Allow"**

2. **Test Page Loads**: You should see the test page with purple gradient background

3. **Start Recording**:
   - Tap the **"Start Recording"** button
   - You should see the status change to "Recording started..."
   - The status box should turn red and pulse

4. **Test Background Recording**:
   - Press the **Home button** (or swipe up) to minimize the app
   - Wait 5-10 seconds
   - The recording should continue in the background

5. **Return to App**:
   - Open the app again (tap the app icon)
   - Tap **"Check Status"** button
   - You should see the duration increasing (e.g., "Recording... Duration: 15s")

6. **Stop Recording**:
   - Tap **"Stop Recording"**
   - You should see "Recording stopped. Duration: Xs"
   - The status should return to normal

## Step 11: Test with Your Webpage (Optional)

To test loading a webpage from webpages.thegraphitelab.com:

1. Create a file `.env.local` in the project root:
   ```
   NEXT_PUBLIC_WEBPAGE_URL=https://webpages.thegraphitelab.com/your-page
   ```

2. Rebuild:
   ```bash
   npm run build
   npx cap sync
   ```

3. In Xcode, run again (▶️)

## Troubleshooting

### "Plugin not found" error
- Make sure you added the plugin files to Xcode (Step 4)
- Verify files are in the project navigator
- Clean build: Product → Clean Build Folder (Shift+Cmd+K)

### Microphone permission denied
- Go to iPhone Settings → Privacy & Security → Microphone
- Find "TGL Webpages" and enable it

### Recording stops when app is minimized
- Verify Background Modes is enabled (Step 6)
- Check that "Audio" is checked in Background Modes
- Make sure Info.plist has UIBackgroundModes with "audio"

### Build errors in Xcode
- Make sure you ran `npm run build` before `npx cap sync`
- Try: Product → Clean Build Folder
- Check that all plugin files are added to the target

### App crashes on launch
- Check Xcode console for error messages
- Verify Info.plist has NSMicrophoneUsageDescription
- Make sure plugin files are properly added to the project

## Success Indicators

✅ App launches without errors  
✅ Test page loads with purple gradient  
✅ "Start Recording" button works  
✅ Status shows "Recording started..."  
✅ App continues recording when minimized  
✅ "Check Status" shows increasing duration  
✅ "Stop Recording" works and shows duration  

If all these work, your test is successful! 🎉

