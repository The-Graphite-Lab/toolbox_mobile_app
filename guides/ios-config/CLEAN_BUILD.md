# Complete iOS Build Cleanup Guide

This guide explains how to thoroughly clean and reinstall your iOS build environment when you encounter issues.

## Quick Cleanup (Recommended)

Run the automated cleanup script:

```bash
npm run clean:ios
```

This script will:
1. Clean Xcode Derived Data
2. Remove Pods directory and Podfile.lock
3. Clean build directories
4. Clean workspace/project user data
5. Reinstall CocoaPods dependencies
6. Re-sync Capacitor
7. Verify the installation

## Manual Cleanup Steps

If you prefer to do it manually or the script doesn't work:

### Step 1: Clean Xcode Derived Data

```bash
# Remove project-specific derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
```

Or clean all derived data:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

### Step 2: Remove CocoaPods Artifacts

```bash
cd ios/App
rm -rf Pods
rm -f Podfile.lock
cd ../..
```

### Step 3: Clean Build Directories

```bash
cd ios/App
rm -rf build
rm -rf App.xcworkspace/xcuserdata
rm -rf App.xcodeproj/xcuserdata
cd ../..
```

### Step 4: Clean Node.js Cache (Optional)

```bash
rm -rf node_modules/.cache
```

### Step 5: Reinstall CocoaPods

```bash
cd ios/App
pod install --repo-update
cd ../..
```

### Step 6: Re-sync Capacitor

```bash
# Build Next.js app if needed
npm run build

# Sync Capacitor
npx cap sync ios
```

### Step 7: Clean in Xcode

1. Open Xcode: `npm run cap:ios`
2. Product → Clean Build Folder (Shift+Cmd+K)
3. Close Xcode
4. Reopen Xcode
5. Build again (Cmd+B)

## What Gets Cleaned

### Xcode Derived Data
- Build artifacts
- Index files
- Module cache
- Precompiled headers

### CocoaPods
- `Pods/` directory (all installed pods)
- `Podfile.lock` (lock file)
- Pods build artifacts

### Build Directories
- `ios/App/build/` (local build directory)
- Workspace user data (xcuserdata)
- Project user data (xcuserdata)

### Node.js Cache
- `.cache/` directory in node_modules

## When to Use This

Use this cleanup when:
- Build errors persist after code changes
- Pod installation issues
- Xcode can't find frameworks
- rsync permission errors
- "No such module" errors
- After updating CocoaPods or Xcode
- After major dependency changes
- When build artifacts seem corrupted

## After Cleanup

1. **Open Xcode**: `npm run cap:ios`
2. **Clean Build Folder**: Product → Clean Build Folder (Shift+Cmd+K)
3. **Build**: Product → Build (Cmd+B)

If issues persist:
- Restart Xcode
- Restart your Mac (clears system caches)
- Check CocoaPods version: `pod --version` (should be 1.11.0+)
- Check Xcode version (should be 14+ for Capacitor 6)

## Troubleshooting

### Script Fails with "CocoaPods not found"
```bash
# Install CocoaPods
sudo gem install cocoapods
# or
brew install cocoapods
```

### Script Fails with Permission Errors
```bash
# Make script executable
chmod +x scripts/clean-ios-build.sh
```

### Still Getting Build Errors
1. Close Xcode completely
2. Run cleanup script again
3. Restart your Mac
4. Open Xcode fresh
5. Clean Build Folder
6. Build again

## Related Files

- `scripts/clean-ios-build.sh` - The cleanup script
- `ios/App/Podfile` - CocoaPods configuration
- `guides/PODFILE_FIX.md` - Information about Podfile fixes

