# iOS Plugin Setup Guide

## Important Notes

The iOS plugin files are located in `ios/App/App/Plugins/AudioRecording/` but this directory structure is created by Capacitor when you run `npx cap add ios`.

## Setup Process

1. **After running `npx cap add ios`**, the iOS project structure will be created
2. The plugin files should already exist in the repo at:
   - `ios/App/App/Plugins/AudioRecording/AudioRecording.swift`
   - `ios/App/App/Plugins/AudioRecording/AudioRecording.m`

3. **You MUST add these files to the Xcode project manually**:
   - Open Xcode: `npm run cap:ios`
   - Right-click on `App` folder → "Add Files to 'App'..."
   - Select both plugin files
   - Check "Add to targets: App"
   - Click "Add"

## Why Manual Step is Needed

Capacitor doesn't automatically detect custom plugins in the Plugins directory. The files need to be explicitly added to the Xcode project so they compile and link properly.

## Verification

After adding the files, you should see:
- `AudioRecording.swift` in Xcode project navigator under `App/Plugins/AudioRecording/`
- `AudioRecording.m` in the same location
- Both files should show as part of the "App" target (check in File Inspector)

## Troubleshooting

If the plugin doesn't work:
1. Verify files are in Xcode project (not just in Finder)
2. Check that files are added to "App" target
3. Clean build folder in Xcode (Product → Clean Build Folder)
4. Rebuild the project

