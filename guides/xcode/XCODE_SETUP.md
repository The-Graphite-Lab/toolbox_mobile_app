# Detailed Xcode Setup Guide

This guide walks you through every step in Xcode. Follow it carefully.

## Step 1: Open the Project in Xcode

1. Open Terminal (or use the terminal in your IDE)
2. Make sure you're in the project directory:
   ```bash
   cd /Users/jacobnolley/Desktop/Projects/Tests/mobile_app_webpages-12_31_2025
   ```
3. Run this command:
   ```bash
   npm run cap:ios
   ```
   This will open Xcode automatically.

**If Xcode doesn't open:**
- Open Xcode manually
- Click "File" → "Open"
- Navigate to: `ios/App/App.xcworkspace` (NOT .xcodeproj - use the .xcworkspace file)
- Click "Open"

## Step 2: Add Plugin Files to Xcode Project

This is the most important step!

### 2a. Find the Project Navigator

1. Look at the **left sidebar** in Xcode
2. You should see a folder icon at the top - that's the "Project Navigator"
3. If you don't see it, press `Cmd+1` or click "View" → "Navigators" → "Show Project Navigator"

### 2b. Locate the App Folder

1. In the left sidebar, you'll see a blue icon with "App" next to it - that's your project
2. Click the triangle next to "App" to expand it
3. Look for a folder called "App" (it might be nested inside another "App" folder)
4. Keep expanding until you see folders like:
   - AppDelegate.swift
   - ViewController.swift
   - Assets.xcassets
   - etc.

### 2c. Add the Plugin Files

1. **Right-click** on the "App" folder (the one that contains AppDelegate.swift)
2. In the menu that appears, select **"Add Files to 'App'..."**
   - (If you don't see this option, try right-clicking on a different folder, or try the parent "App" folder)
3. A file browser window will open
4. Navigate to this path:
   ```
   ios/App/App/Plugins/AudioRecording/
   ```
   - You might need to click "Go to Folder" (Cmd+Shift+G) and paste: `/Users/jacobnolley/Desktop/Projects/Tests/mobile_app_webpages-12_31_2025/ios/App/App/Plugins/AudioRecording`
5. You should see two files:
   - `AudioRecording.swift`
   - `AudioRecording.m`
6. **Select both files** (click one, then Cmd+click the other)
7. **IMPORTANT**: At the bottom of the file browser window, you'll see checkboxes:
   - ✅ Check **"Copy items if needed"** (if it's not already checked)
   - ✅ Check **"Add to targets: App"** (this is critical!)
   - Make sure "Create groups" is selected (not "Create folder references")
8. Click **"Add"** button

### 2d. Verify the Files Were Added

1. In the left sidebar, look for a folder called "Plugins" or "AudioRecording"
2. You should see:
   - `AudioRecording.swift`
   - `AudioRecording.m`
3. If you see them, great! If not, try the steps again.

**Troubleshooting:**
- If you can't find "Add Files to 'App'...", try right-clicking on different folders
- Make sure you're right-clicking on a folder, not a file
- Try right-clicking on the blue "App" project icon at the very top

## Step 3: Configure Info.plist

### 3a. Find Info.plist

1. In the left sidebar, look for a file called `Info.plist`
2. It might be in the "App" folder or at the root
3. Click on it to select it

### 3b. Open as Source Code

1. **Right-click** on `Info.plist`
2. Select **"Open As"** → **"Source Code"**
   - (If you don't see this, the file might already be in source code view)

### 3c. Add the Required Keys

1. You'll see XML code that looks like:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       ... existing keys ...
   </dict>
   </plist>
   ```

2. Find the `</dict>` tag (the closing tag near the end)

3. **Before** the `</dict>` tag, add these lines:
   ```xml
   <key>NSMicrophoneUsageDescription</key>
   <string>This app needs access to your microphone to record audio.</string>
   <key>UIBackgroundModes</key>
   <array>
       <string>audio</string>
   </array>
   ```

4. Make sure the XML is properly formatted (indented correctly)

5. Save the file: `Cmd+S`

**Example of what it should look like:**
```xml
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <!-- ... other existing keys ... -->
    <key>NSMicrophoneUsageDescription</key>
    <string>This app needs access to your microphone to record audio.</string>
    <key>UIBackgroundModes</key>
    <array>
        <string>audio</string>
    </array>
</dict>
```

## Step 4: Enable Background Audio Capability

### 4a. Select the Project

1. In the left sidebar, click on the **blue "App" icon** at the very top (the project icon)
2. This opens the project settings in the main area

### 4b. Select the Target

1. In the main area, you'll see "PROJECT" and "TARGETS" sections
2. Under "TARGETS", click on **"App"** (or "TGL Webpages" if that's what it's called)
3. Make sure it's selected (highlighted in blue)

### 4c. Go to Signing & Capabilities Tab

1. At the top of the main area, you'll see tabs like:
   - General
   - Signing & Capabilities ← **Click this one**
   - Build Settings
   - etc.

2. Click on **"Signing & Capabilities"**

### 4d. Add Background Modes Capability

1. You'll see a section showing capabilities (like "App Sandbox" or similar)
2. Look for a **"+ Capability"** button (usually at the top left of the capabilities section)
3. Click **"+ Capability"**
4. A search box will appear - type: **"Background Modes"**
5. Double-click on **"Background Modes"** in the results
6. It will be added to your capabilities list

### 4e. Enable Audio Background Mode

1. After adding "Background Modes", you'll see it in the capabilities list
2. Click on **"Background Modes"** to expand it
3. You'll see checkboxes for different background modes
4. **Check the box** next to **"Audio, AirPlay, and Picture in Picture"**
   - (It might just say "Audio" - that's fine too)

## Step 5: Configure Signing (For Your iPhone)

### 5a. Still in Signing & Capabilities Tab

1. You should still be in the "Signing & Capabilities" tab
2. Look for the "Signing" section (usually at the top)

### 5b. Enable Automatic Signing

1. Check the box that says **"Automatically manage signing"**
2. Under "Team", click the dropdown
3. Select your **Apple ID** (your email address)
   - If you don't see it, click "Add Account..." and sign in
4. Xcode will automatically create a provisioning profile

**Note:** You need a free Apple Developer account. If you don't have one, you can create it when prompted.

## Step 6: Connect Your iPhone

1. Connect your iPhone to your Mac with a USB cable
2. Unlock your iPhone
3. If prompted on your iPhone, tap **"Trust This Computer"**
4. Enter your iPhone passcode if asked

## Step 7: Select Your iPhone as the Build Target

1. At the top of Xcode, next to the Play button (▶️), you'll see a device selector
2. It probably says "App" or "Any iOS Device"
3. Click on it
4. You should see your iPhone listed (e.g., "Jacob's iPhone")
5. Select your iPhone

## Step 8: Build and Run

1. Click the **Play button (▶️)** in the top left, or press `Cmd+R`
2. Xcode will:
   - Build the project (this might take a minute the first time)
   - Install the app on your iPhone
   - Launch the app automatically

3. On your iPhone:
   - You might see "Untrusted Developer" - go to Settings → General → VPN & Device Management → Trust the developer
   - The app will launch

## Step 9: Grant Permissions

1. When the app opens, it will ask for microphone permission
2. Tap **"Allow"**

## Step 10: Test!

1. You should see the test page with a purple gradient
2. Tap **"Start Recording"**
3. The status should change to "Recording started..."
4. Press the **Home button** (or swipe up) to minimize the app
5. Wait 5-10 seconds
6. Open the app again
7. Tap **"Check Status"** - you should see the duration increasing
8. Tap **"Stop Recording"**

## Common Issues & Solutions

### "No such module 'Capacitor'"
- Close Xcode
- Run: `cd ios/App && pod install` (if CocoaPods is installed)
- Or just open Xcode again - it should resolve automatically

### Can't find "Add Files to 'App'..."
- Try right-clicking on different folders
- Make sure you're right-clicking on a folder (blue/yellow icon), not a file
- Try the parent "App" folder or the project root

### Build fails with signing errors
- Make sure "Automatically manage signing" is checked
- Select your Apple ID in the Team dropdown
- Make sure your iPhone is unlocked and trusted

### App crashes on launch
- Check the Xcode console (bottom panel) for error messages
- Make sure Info.plist has the microphone permission
- Verify plugin files are added to the target

### Can't see my iPhone in device list
- Make sure iPhone is unlocked
- Make sure you tapped "Trust This Computer"
- Try unplugging and replugging the cable
- Make sure you're using a data cable (not just charging)

## Visual Guide Reference

If you get stuck, here's what to look for:

**Left Sidebar (Project Navigator):**
```
📁 App (blue icon)
  📁 App (folder)
    📄 AppDelegate.swift
    📄 ViewController.swift
    📄 Info.plist
    📁 Plugins (you'll add files here)
      📁 AudioRecording
        📄 AudioRecording.swift ← Add this
        📄 AudioRecording.m ← Add this
```

**Main Area (when project is selected):**
```
TARGETS
  App
    General | Signing & Capabilities | Build Settings
```

**Top Bar:**
```
[▶️ Play] [⏹ Stop] [App > Any iOS Device ▼] ← Device selector here
```

Need more help? Let me know which step you're stuck on!

