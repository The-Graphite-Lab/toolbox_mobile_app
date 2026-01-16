# How to Open the Project in Xcode

If `npm run cap:ios` doesn't open the project properly, use one of these methods:

## Method 1: Direct Command (Easiest)

In Terminal, run:

```bash
open ios/App/App.xcworkspace
```

This will open Xcode with your project loaded.

## Method 2: From Finder

1. Open **Finder** (click the blue face icon in your dock)
2. Press `Cmd+Shift+G` (or click "Go" → "Go to Folder")
3. Paste this path:
   ```
   /Users/jacobnolley/Desktop/Projects/Tests/mobile_app_webpages-12_31_2025/ios/App
   ```
4. Press Enter
5. You'll see a file called **`App.xcworkspace`** (blue icon)
6. **Double-click** `App.xcworkspace`
7. Xcode will open with your project

## Method 3: From Xcode Menu

1. Open Xcode (from Applications or Spotlight)
2. Click **File** → **Open** (or press `Cmd+O`)
3. Navigate to: `Desktop → Projects → Tests → mobile_app_webpages-12_31_2025 → ios → App`
4. Select **`App.xcworkspace`**
5. Click **"Open"**

## What to Expect

When the project opens correctly, you should see:

- **Left sidebar:** Files and folders (AppDelegate.swift, Info.plist, etc.)
- **Top toolbar:** Play button (▶️), device selector
- **Main area:** Either a file's contents or project settings

If you don't see the left sidebar:
- Press `Cmd+1` to show it

## Verify It's Working

You should see in the left sidebar:
- A blue "App" icon at the top (your project)
- An "App" folder underneath
- Files like:
  - AppDelegate.swift
  - ViewController.swift
  - Info.plist
  - Assets.xcassets (folder)

If you see these, the project is open correctly! ✅

