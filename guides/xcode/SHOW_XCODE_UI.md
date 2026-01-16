# How to Show Xcode UI Elements

Xcode is running but the toolbar and sidebar are hidden. Here's how to show them:

## Step 1: Show the Left Sidebar (Project Navigator)

**Press this keyboard shortcut:**
```
Cmd + 1
```
(Hold Command key, press number 1)

**OR use the menu:**
1. Click **"View"** in the top menu bar
2. Click **"Navigators"**
3. Click **"Show Project Navigator"**

The left sidebar should appear with your files!

## Step 2: Show the Top Toolbar

**Press this keyboard shortcut:**
```
Cmd + Option + T
```
(Hold Command + Option, press T)

**OR use the menu:**
1. Click **"View"** in the top menu bar
2. Click **"Show Toolbar"**

The toolbar with the Play button (▶️) should appear!

## Step 3: Show the Bottom Panel (Optional)

**Press this keyboard shortcut:**
```
Cmd + Shift + Y
```
(Hold Command + Shift, press Y)

**OR use the menu:**
1. Click **"View"** in the top menu bar
2. Click **"Debug Area"**
3. Click **"Show Debug Area"**

## Quick Reference - All Keyboard Shortcuts

- **Left Sidebar:** `Cmd + 1`
- **Top Toolbar:** `Cmd + Option + T`
- **Bottom Panel:** `Cmd + Shift + Y`
- **Right Sidebar:** `Cmd + Option + 0` (zero)

## What You Should See After

After pressing `Cmd + 1` and `Cmd + Option + T`, you should see:

```
┌─────────────────────────────────────────────┐
│ [▶️] [⏹] [App ▼] [Any iOS Device ▼]        │  ← Toolbar (top)
├──────┬──────────────────────────────────────┤
│      │                                    │
│ 📁 App  ← Left Sidebar (Cmd+1)            │
│   📁 App                                  │
│     📄 AppDelegate.swift                  │
│     📄 ViewController.swift               │
│     📄 Info.plist                         │
│      │                                    │
│      │   Main Editor Area                 │
│      │                                    │
└──────┴──────────────────────────────────────┘
```

## If It Still Doesn't Work

### Try This:

1. **Click anywhere in the Xcode window** to make sure it's active
2. Press `Cmd + 1` again
3. If nothing happens, try:
   - Click **"View"** in the menu bar
   - Look for checkmarks next to "Show Toolbar" and "Show Navigator"
   - If they're unchecked, click them to check them

### Reset Window Layout

If the UI is still weird:

1. Click **"Window"** in the menu bar
2. Click **"Zoom"** (or press `Cmd + Ctrl + F`)
3. This resizes the window

### Open the Project

If you see a blank window:

1. Click **"File"** in the menu bar
2. Click **"Open"** (or press `Cmd + O`)
3. Navigate to: `Desktop → Projects → Tests → mobile_app_webpages-12_31_2025 → ios → App`
4. Select **`App.xcworkspace`**
5. Click **"Open"**

## Try This Right Now

1. **Make sure Xcode window is active** (click on it)
2. **Press `Cmd + 1`** - Left sidebar should appear
3. **Press `Cmd + Option + T`** - Toolbar should appear

Let me know if you see the sidebar and toolbar after this!

