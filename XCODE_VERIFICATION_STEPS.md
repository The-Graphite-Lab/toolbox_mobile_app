# Xcode Verification Steps

## Step 1: Verify Background Modes Capability

1. **Open Xcode:**
   ```bash
   npm run cap:ios
   ```

2. **Navigate to Signing & Capabilities:**
   - Click the **blue "App" project icon** at the top of the left sidebar
   - Under "TARGETS", select **"App"** (or "TGL Webpages")
   - Click the **"Signing & Capabilities"** tab at the top

3. **Check for Background Modes:**
   - Look in the "Capabilities" section
   - If you see "Background Modes" listed, expand it
   - Verify "Audio, AirPlay, and Picture in Picture" is checked ✅
   
4. **If Background Modes is NOT present:**
   - Click the **"+ Capability"** button (top left of capabilities section)
   - Search for "Background Modes"
   - Double-click to add it
   - Check the box for "Audio, AirPlay, and Picture in Picture"

5. **Verify .entitlements file:**
   - After adding Background Modes, an `.entitlements` file should be created
   - You can verify this in the project navigator (left sidebar)
   - It should contain: `com.apple.BackgroundModes` with `audio` value

**Once done, let me know and we'll check it off!**

---

## Step 2: Verify App Icon in Asset Catalog

1. **In Xcode project navigator:**
   - Expand `App` → `Assets.xcassets` → `AppIcon`

2. **Check the icon:**
   - You should see a 1024x1024 slot
   - The icon `TGL-iOS.png` should be displayed
   - If it shows a placeholder or is missing, drag the icon file into the slot

3. **Verify all sizes (if needed):**
   - Xcode can auto-generate sizes from the 1024x1024 icon
   - For App Store submission, only the 1024x1024 is required

**Once verified, let me know!**

---

## Step 3: Test Build

1. **Clean build folder:**
   - Press `Cmd + Shift + K` (or Product → Clean Build Folder)

2. **Select a device:**
   - At the top toolbar, select "Any iOS Device" or a connected device

3. **Build:**
   - Press `Cmd + B` (or Product → Build)
   - Wait for build to complete
   - Check for any errors in the Issue Navigator (left sidebar, exclamation mark icon)

4. **If build succeeds:**
   - Great! We can move to archiving

**Report any build errors and we'll fix them!**

---

## Step 4: Test Archive

1. **Select "Any iOS Device"** in the device selector (top toolbar)

2. **Archive:**
   - Go to **Product → Archive**
   - Wait for the archive to complete (this may take a few minutes)

3. **If archive succeeds:**
   - The Organizer window will open
   - You'll see your archive listed
   - This means the app is ready to upload!

**Let me know when you've completed each step!**
