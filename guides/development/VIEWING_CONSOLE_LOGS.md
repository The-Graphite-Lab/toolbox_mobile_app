# How to View Console Logs from Your App

This guide shows you all the ways to see console output and debug your app.

## Method 1: Xcode Console (Easiest - Shows Everything)

When you run your app from Xcode, the console automatically shows logs.

### Step 1: Open Xcode Console

1. **Open Xcode** with your project:
   ```bash
   npm run cap:ios
   ```

2. **Show the Debug Area** (bottom panel):
   - Press `Cmd+Shift+Y` (Command + Shift + Y)
   - OR click "View" → "Debug Area" → "Show Debug Area"

3. The bottom panel will show:
   - **Console tab**: All console output (JavaScript `console.log`, native iOS logs, errors)
   - **Variables tab**: Current variable values (when debugging)

### Step 2: Run Your App

1. Click the **Run button** (▶️) in Xcode, or press `Cmd+R`
2. The app will build and launch on your device/simulator
3. **Watch the console** - you'll see logs appear in real-time!

### What You'll See

- ✅ JavaScript `console.log()` messages from your React/Next.js code
- ✅ Native iOS logs (Swift/Objective-C)
- ✅ Errors (in red)
- ✅ Warnings (in yellow)
- ✅ Capacitor plugin logs

### Example Console Output

```
2025-01-01 10:30:15.123 App[12345:67890] App state changed. Is active? true
2025-01-01 10:30:15.456 App[12345:67890] Navigating to external URL in native app: https://...
2025-01-01 10:30:16.789 App[12345:67890] [INFO] Capacitor: App started
```

### Filtering Console Output

In the Xcode console, you can:
- **Search**: Type in the search box at the bottom to filter logs
- **Clear**: Click the trash icon to clear the console
- **Pause**: Click the pause icon to pause scrolling

---

## Method 2: Safari Web Inspector (Best for JavaScript)

Safari's Web Inspector gives you a full browser-like debugging experience for the JavaScript in your app.

### Step 1: Enable Web Inspector on Your iPhone

1. On your **iPhone**, go to: **Settings → Safari → Advanced**
2. Turn on **"Web Inspector"**

### Step 2: Connect Your iPhone

1. Connect your iPhone to your Mac via USB
2. Unlock your iPhone
3. Trust the computer if prompted

### Step 3: Open Safari on Mac

1. Open **Safari** on your Mac (not Chrome!)
2. In the menu bar, click **"Develop"**
   - If you don't see "Develop", enable it: Safari → Settings → Advanced → Check "Show Develop menu"
3. You should see your iPhone listed under "Develop"
4. Click your iPhone name → **"App"** (or the name of your app)

### Step 4: Use the Web Inspector

A new window opens with:
- **Console tab**: JavaScript console logs, errors, warnings
- **Elements tab**: Inspect HTML/CSS
- **Network tab**: See network requests
- **Sources tab**: Set breakpoints and debug JavaScript

### What You'll See

- ✅ All `console.log()`, `console.error()`, `console.warn()` from your JavaScript
- ✅ JavaScript errors with stack traces
- ✅ Network requests (API calls, image loads, etc.)
- ✅ DOM structure of your app

### Example Console Output

```
App state changed. Is active? true
Navigating to external URL in native app: https://webpages.thegraphitelab.com/...
Failed to inject bridge into iframe: Error: ...
```

---

## Method 3: iOS Simulator Console (For Simulator Only)

If you're testing on the iOS Simulator, you can view logs in Terminal.

### Step 1: Find Your Simulator

1. Open Xcode
2. Run your app on a simulator (not a physical device)
3. Note which simulator you're using (e.g., "iPhone 15 Pro")

### Step 2: View Simulator Logs

Open Terminal and run:

```bash
# List all simulators
xcrun simctl list devices

# View logs for a specific simulator (replace with your simulator UDID)
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "App"'

# Or view all logs
xcrun simctl spawn booted log stream
```

### What You'll See

- ✅ System-level logs
- ✅ App logs
- ✅ Native iOS logs
- ⚠️ JavaScript console.log might not appear here (use Safari Web Inspector instead)

---

## Method 4: Terminal Device Logs (For Physical Device)

If you're testing on a physical iPhone, you can view device logs in Terminal.

### Step 1: Connect Your iPhone

1. Connect your iPhone to your Mac via USB
2. Unlock your iPhone
3. Trust the computer if prompted

### Step 2: View Device Logs

Open Terminal and run:

```bash
# View all device logs (will show a lot of system logs)
idevicesyslog

# Filter for your app only (replace "App" with your app name)
idevicesyslog | grep -i "App"
```

**Note:** You may need to install `libimobiledevice` first:
```bash
brew install libimobiledevice
```

### What You'll See

- ✅ Native iOS logs
- ✅ System logs
- ⚠️ JavaScript console.log might not appear here (use Safari Web Inspector instead)

---

## Quick Reference: Which Method to Use?

| Method | Best For | Shows JavaScript Logs? | Shows Native Logs? | Easiest? |
|--------|----------|------------------------|---------------------|----------|
| **Xcode Console** | General debugging | ✅ Yes | ✅ Yes | ⭐⭐⭐⭐⭐ |
| **Safari Web Inspector** | JavaScript debugging | ✅ Yes | ❌ No | ⭐⭐⭐⭐ |
| **Simulator Console** | Simulator testing | ⚠️ Limited | ✅ Yes | ⭐⭐⭐ |
| **Device Logs (Terminal)** | Physical device | ⚠️ Limited | ✅ Yes | ⭐⭐ |

## Recommended Workflow

1. **Start with Xcode Console** - It shows everything and is the easiest
2. **Use Safari Web Inspector** - If you need to debug JavaScript specifically or see network requests
3. **Use Terminal logs** - Only if you need system-level logs or Xcode isn't available

---

## Adding More Console Logs to Your Code

You can add `console.log()` statements anywhere in your JavaScript/TypeScript code:

```typescript
// In app/page.tsx or any React component
console.log('App started!')
console.log('Current URL:', webViewUrl)
console.error('Something went wrong:', error)
console.warn('This is a warning')
```

These will appear in:
- ✅ Xcode Console
- ✅ Safari Web Inspector
- ✅ Browser console (if testing in browser)

---

## Troubleshooting

### "I don't see any logs in Xcode Console"

1. Make sure the **Debug Area is visible**: Press `Cmd+Shift+Y`
2. Check that you're looking at the **Console tab** (not Variables tab)
3. Make sure your app is actually running (not just built)
4. Try adding a `console.log('Test')` at the very start of your code to verify

### "Safari Web Inspector doesn't show my iPhone"

1. Make sure **Web Inspector is enabled** on your iPhone: Settings → Safari → Advanced → Web Inspector
2. Make sure your iPhone is **connected via USB** (not just on the same WiFi)
3. Make sure the **"Develop" menu is enabled** in Safari: Safari → Settings → Advanced
4. Try **unlocking your iPhone** and reconnecting
5. Make sure your app is **currently running** on the iPhone

### "I only see native logs, not JavaScript logs"

- Use **Safari Web Inspector** (Method 2) - it's specifically designed for JavaScript
- Or check that your JavaScript code is actually running (add a `console.log` at the very top)

### "The console is too noisy with system logs"

- In Xcode Console, use the **search box** to filter logs
- Search for your app name or specific keywords
- In Safari Web Inspector, you can filter by log level (Errors, Warnings, Logs)

---

## Example: Testing Your App

1. **Open Xcode Console**: `Cmd+Shift+Y` in Xcode
2. **Run your app**: Click ▶️ or press `Cmd+R`
3. **Watch the console** as the app launches
4. **Interact with your app** (tap buttons, navigate, etc.)
5. **See logs appear** in real-time showing what's happening

You should see logs like:
- App initialization
- Capacitor plugin loading
- Navigation events
- Any errors or warnings

---

## Success Indicators

✅ You can see console logs in Xcode when the app runs  
✅ Safari Web Inspector shows your JavaScript logs  
✅ You can filter and search logs  
✅ Errors appear in red, warnings in yellow  

If you can see logs, your debugging setup is working! 🎉

