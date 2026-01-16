# Xcode Beginner's Guide - Your First Time

This guide assumes you've never used Xcode before. We'll explain everything step by step.

## What is Xcode?

Xcode is Apple's app for building iOS apps. Think of it like a text editor (like VS Code) but specifically for making iPhone apps. It has a lot of buttons and panels, but we only need a few of them.

## Step 1: Opening Xcode

### Option A: Using the Command (Easiest)

1. Open **Terminal** (the black window where you type commands)
   - You can find it in Applications → Utilities → Terminal
   - Or press `Cmd+Space` and type "Terminal"

2. Make sure you're in the right folder. Type this and press Enter:
   ```bash
   cd /Users/jacobnolley/Desktop/Projects/Tests/mobile_app_webpages-12_31_2025
   ```

3. Type this command and press Enter:
   ```bash
   npm run cap:ios
   ```

4. Xcode should open automatically. It might take 30-60 seconds the first time.

### Option B: Opening Manually

If the command doesn't work:

1. Open **Finder** (the blue face icon in your dock)
2. Navigate to: `Desktop → Projects → Tests → mobile_app_webpages-12_31_2025 → ios → App`
3. Look for a file called **`App.xcworkspace`** (it has a blue icon)
4. Double-click it
5. Xcode will open

## Step 2: Understanding the Xcode Window

When Xcode opens, you'll see something like this:

```
┌─────────────────────────────────────────────────────────┐
│ [▶️] [⏹] [App ▼] [iPhone 15 Pro ▼]    [File] [Edit] ... │  ← Top Toolbar
├──────┬──────────────────────────────────────────────────┤
│      │                                                  │
│  📁  │                                                  │
│  📁  │         Main Editor Area                         │
│  📄  │         (Shows file contents)                   │
│  📄  │                                                  │
│      │                                                  │
│      │                                                  │
│      │                                                  │
│      │                                                  │
│      │                                                  │
├──────┴──────────────────────────────────────────────────┤
│  [Console Output] [Errors] [Warnings]                  │  ← Bottom Panel
└─────────────────────────────────────────────────────────┘
```

### The Left Sidebar (Project Navigator)

**Location:** Left side of the window

**What it shows:** All the files in your project, organized like folders

**How to see it:**
- If you don't see it, press `Cmd+1` (Command key + number 1)
- Or click "View" in the top menu → "Navigators" → "Show Project Navigator"

**What you'll see:**
- A blue icon at the top that says "App" (this is your project)
- Click the little triangle next to it to expand
- You'll see folders and files listed

**Important:** This is like a file browser - you can click folders to expand/collapse them.

### The Top Toolbar

**Location:** Very top of the window

**What you need to know:**
- **Play button (▶️):** Builds and runs your app (we'll use this later)
- **Stop button (⏹):** Stops the app if it's running
- **Device selector:** Shows what device you're building for (iPhone, Simulator, etc.)

### The Main Editor Area

**Location:** Big area in the middle

**What it does:** Shows the contents of whatever file you click

**Right now:** It might show some welcome screen or project settings

### The Bottom Panel

**Location:** Bottom of the window

**What it shows:** 
- Console messages (text output from your app)
- Errors (red X icons)
- Warnings (yellow triangle icons)

**How to see it:**
- If you don't see it, press `Cmd+Shift+Y`
- Or click "View" → "Debug Area" → "Show Debug Area"

## Step 3: Finding Your Files

Let's find the files we need to work with.

### Finding the "App" Folder

1. Look at the **left sidebar** (Project Navigator)
2. You should see a **blue icon** with "App" next to it at the top
3. Click the **little triangle** (▶) next to it to expand it
4. You'll see another folder called "App" - click its triangle too
5. Keep expanding until you see files like:
   - `AppDelegate.swift` (a file)
   - `ViewController.swift` (a file)
   - `Info.plist` (a file)
   - `Assets.xcassets` (a folder)

**Tip:** If you get lost, look for `Info.plist` - that's a file we need to edit, and it's usually near the top of the App folder.

### Understanding the File Icons

- **📁 Blue folder:** A folder (click triangle to expand)
- **📄 White document:** A code file (like .swift, .m files)
- **⚙️ Settings icon:** Configuration files (like Info.plist)

## Step 4: Adding Plugin Files (The Important Part!)

This is the trickiest part, but we'll go slow.

### Step 4a: Find Where to Add Files

1. In the left sidebar, find the **"App" folder** (the one that contains `AppDelegate.swift` and `Info.plist`)
2. **Right-click** on this folder
   - On Mac: Click with two fingers on trackpad, or Control+Click, or right-click with mouse
3. A menu will pop up with options like:
   - "New File..."
   - "Add Files to 'App'..." ← **This is what we want!**
   - "Show in Finder"
   - etc.

**If you don't see "Add Files to 'App'...":**
- Try right-clicking on a different folder
- Try the parent "App" folder (one level up)
- Make sure you're right-clicking on a **folder** (blue icon), not a **file** (white icon)

### Step 4b: Navigate to Plugin Files

1. After clicking "Add Files to 'App'...", a file browser window opens
2. This looks like a Finder window
3. You need to navigate to the plugin files

**Easy way - Use "Go to Folder":**
1. In the file browser, press `Cmd+Shift+G` (or click "Go" in the menu → "Go to Folder")
2. A text box appears
3. Type or paste this exact path:
   ```
   /Users/jacobnolley/Desktop/Projects/Tests/mobile_app_webpages-12_31_2025/ios/App/App/Plugins/AudioRecording
   ```
4. Press Enter
5. You should now see two files:
   - `AudioRecording.swift`
   - `AudioRecording.m`

**Alternative way - Navigate manually:**
1. In the file browser, click "Desktop" in the sidebar
2. Navigate: Desktop → Projects → Tests → mobile_app_webpages-12_31_2025 → ios → App → App → Plugins → AudioRecording
3. You should see the two files

### Step 4c: Select and Add the Files

1. **Select both files:**
   - Click on `AudioRecording.swift`
   - Hold `Cmd` (Command key) and click `AudioRecording.m`
   - Both should now be highlighted/selected

2. **Look at the bottom of the file browser window:**
   - You'll see some checkboxes and options
   - **IMPORTANT:** Check these boxes:
     - ✅ **"Copy items if needed"** (if it's not grayed out)
     - ✅ **"Add to targets: App"** (THIS IS CRITICAL - make sure it's checked!)
   - Make sure **"Create groups"** is selected (not "Create folder references")

3. Click the **"Add"** button (usually bottom right)

4. The files should now appear in your Xcode project!

### Step 4d: Verify Files Were Added

1. Look back at the left sidebar
2. You should now see a folder called "Plugins" or "AudioRecording"
3. Inside it, you should see:
   - `AudioRecording.swift`
   - `AudioRecording.m`

**If you see them:** ✅ Success! Move to Step 5.

**If you don't see them:** 
- Try the steps again
- Make sure you checked "Add to targets: App"
- The files might be in a different location - look around the sidebar

## Step 5: Editing Info.plist

### Step 5a: Find Info.plist

1. In the left sidebar, look for `Info.plist`
2. It's usually in the "App" folder (same one we just added files to)
3. Click on it once to select it

### Step 5b: Open as Source Code

1. **Right-click** on `Info.plist`
2. In the menu, hover over **"Open As"**
3. Click **"Source Code"**
4. The main editor area will now show XML code

### Step 5c: Understand What You're Looking At

You'll see something like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>App</string>
    <!-- ... more lines ... -->
</dict>
</plist>
```

**What to look for:**
- Find the line that says `</dict>` (with a slash - that's the closing tag)
- This is usually near the bottom of the file
- We need to add our code **before** this `</dict>` line

### Step 5d: Add the Required Code

1. Find the `</dict>` line (the closing tag)
2. Click your cursor **right before** that line
3. Press Enter to create a new line
4. Paste or type this code:

```xml
    <key>NSMicrophoneUsageDescription</key>
    <string>This app needs access to your microphone to record audio.</string>
    <key>UIBackgroundModes</key>
    <array>
        <string>audio</string>
    </array>
```

5. Make sure the indentation matches the other lines (use spaces or tabs consistently)

6. **Save the file:** Press `Cmd+S` or click File → Save

**What it should look like:**
```xml
    <key>CFBundleDisplayName</key>
    <string>App</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>This app needs access to your microphone to record audio.</string>
    <key>UIBackgroundModes</key>
    <array>
        <string>audio</string>
    </array>
</dict>
```

## Step 6: Enable Background Audio

### Step 6a: Select the Project

1. In the **left sidebar**, click on the **blue "App" icon** at the very top
   - This is the project icon (not a folder, the actual project)
   - It should be blue and have "App" next to it

2. The main editor area will change to show project settings

### Step 6b: Understand the Project Settings View

You'll see something like:

```
┌─────────────────────────────────────┐
│ PROJECT                              │
│   App                                │
│                                      │
│ TARGETS                              │
│   App  ← Click this!                 │
│                                      │
│ [General] [Signing & Capabilities]   │  ← Tabs at top
└─────────────────────────────────────┘
```

### Step 6c: Select the Target

1. Under "TARGETS", you'll see "App" (or maybe "TGL Webpages")
2. **Click on "App"** to select it
3. It should highlight in blue

### Step 6d: Go to Signing & Capabilities

1. At the top of the main editor area, you'll see tabs:
   - General
   - **Signing & Capabilities** ← Click this one!
   - Build Settings
   - etc.

2. Click on **"Signing & Capabilities"**

### Step 6e: Add Background Modes Capability

1. You'll see a section that might say "Capabilities" or show existing capabilities
2. Look for a button that says **"+ Capability"** (usually at the top of the capabilities section)
3. Click **"+ Capability"**
4. A search box or list will appear
5. Type: **"Background Modes"**
6. Double-click on **"Background Modes"** in the results
7. It will be added to your capabilities list

### Step 6f: Enable Audio

1. After adding "Background Modes", you'll see it in the list
2. Click on **"Background Modes"** to expand it (if it's not already expanded)
3. You'll see checkboxes for different background modes
4. **Check the box** next to **"Audio, AirPlay, and Picture in Picture"**
   - It might just say "Audio" - that's fine

## Step 7: Configure Signing (For Your iPhone)

### Step 7a: Still in Signing & Capabilities

You should still be on the "Signing & Capabilities" tab

### Step 7b: Find the Signing Section

1. Look for a section called **"Signing"** (usually near the top)
2. You'll see:
   - A checkbox: "Automatically manage signing"
   - A dropdown: "Team"

### Step 7c: Enable Automatic Signing

1. **Check the box** next to "Automatically manage signing"
2. Click the **"Team" dropdown**
3. Select your **Apple ID** (your email address)
   - If you don't see it, click "Add Account..." and sign in with your Apple ID
   - You can use a free Apple ID - you don't need a paid developer account for testing

4. Xcode will automatically configure signing

**Note:** If you get an error about signing, make sure:
- Your iPhone is connected and unlocked
- You're signed in with your Apple ID
- You've trusted the computer on your iPhone

## Step 8: Connect Your iPhone

1. Connect your iPhone to your Mac with a USB cable
2. Unlock your iPhone
3. If your iPhone shows a popup asking "Trust This Computer?", tap **"Trust"**
4. Enter your iPhone passcode if asked

## Step 9: Select Your iPhone

1. At the **top of Xcode**, next to the Play button, you'll see a device selector
2. It probably says something like "App" or "Any iOS Device"
3. **Click on it**
4. You should see your iPhone listed (e.g., "Jacob's iPhone" or "iPhone")
5. **Click on your iPhone** to select it

**If you don't see your iPhone:**
- Make sure it's unlocked
- Make sure you tapped "Trust This Computer"
- Try unplugging and replugging the cable
- Make sure you're using a data cable (not just a charging cable)

## Step 10: Build and Run!

1. Click the **Play button (▶️)** in the top left of Xcode
   - Or press `Cmd+R`

2. Xcode will start building (you'll see progress in the top center)

3. The first time might take a few minutes - be patient!

4. When it's done:
   - The app will install on your iPhone
   - The app will launch automatically
   - You might see "Untrusted Developer" on your iPhone

### If You See "Untrusted Developer"

1. On your iPhone, go to: **Settings → General → VPN & Device Management**
2. Tap on your Apple ID/Developer name
3. Tap **"Trust [Your Name]"**
4. Tap **"Trust"** in the popup
5. Go back to the app and it should launch

## Step 11: Test the App!

1. The app should open and show a purple gradient page
2. Tap **"Start Recording"**
3. Grant microphone permission when asked (tap "Allow")
4. The status should change to "Recording started..."
5. Press the **Home button** (or swipe up) to minimize the app
6. Wait 5-10 seconds
7. Open the app again
8. Tap **"Check Status"** - you should see the duration (e.g., "Recording... Duration: 8s")
9. Tap **"Stop Recording"**

## Common Questions

**Q: I can't find the left sidebar!**
- Press `Cmd+1` to show the Project Navigator
- Or: View → Navigators → Show Project Navigator

**Q: The main area is blank/white!**
- Click on a file in the left sidebar to open it
- Or click on the blue "App" project icon to see project settings

**Q: I can't right-click!**
- On Mac trackpad: Click with two fingers
- Or: Hold Control and click
- Or: Use an external mouse

**Q: I don't see "Add Files to 'App'..."**
- Make sure you're right-clicking on a **folder** (blue icon), not a file
- Try right-clicking on different folders
- The option might be called "Add Files to 'App'..." or just "Add Files..."

**Q: Build fails with errors!**
- Check the bottom panel for error messages (red X icons)
- Make sure you added the plugin files correctly
- Make sure Info.plist was saved
- Try: Product → Clean Build Folder (then build again)

**Q: The app crashes!**
- Check the bottom panel (console) for error messages
- Make sure you added the microphone permission to Info.plist
- Make sure Background Modes is enabled

## You Did It! 🎉

If the app runs and you can test recording, congratulations! You've successfully:
- Navigated Xcode for the first time
- Added files to a project
- Edited configuration files
- Built and ran an iOS app
- Tested background audio recording

## Need More Help?

If you get stuck on a specific step:
1. Tell me which step number you're on
2. Describe what you see on your screen
3. Describe what you're trying to do
4. I'll help you through it!

Good luck! 🚀

