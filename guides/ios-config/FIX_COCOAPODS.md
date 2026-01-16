# Fix CocoaPods Error

You're getting this error because CocoaPods needs to be installed and run.

## Quick Fix

Run these commands in Terminal:

```bash
# Install CocoaPods (you'll need to enter your password)
sudo gem install cocoapods

# Navigate to the iOS App directory
cd /Users/jacobnolley/Desktop/Projects/Tests/mobile_app_webpages-12_31_2025/ios/App

# Install the dependencies
pod install
```

This will:
1. Install CocoaPods (if not already installed)
2. Install all the iOS dependencies
3. Create the missing configuration files

## After Running pod install

1. **Close Xcode** (if it's open)
2. **Open the workspace file** (NOT the .xcodeproj):
   ```bash
   open ios/App/App.xcworkspace
   ```
3. The error should be gone!

## Alternative: If You Don't Want to Install CocoaPods

You can try using the workspace file directly:
- Close Xcode
- Open `ios/App/App.xcworkspace` (double-click it in Finder)
- This should work even without running pod install first

## Why This Happens

Capacitor uses CocoaPods to manage iOS dependencies. The `.xcodeproj` file references Pods configuration files that are created when you run `pod install`.

The `.xcworkspace` file is designed to work with CocoaPods and should handle this better.

