#!/bin/bash

# Setup script for iOS configuration
# Run this after: npm run build && npx cap sync

echo "iOS Setup Script"
echo "================="
echo ""
echo "This script helps configure iOS for background audio recording."
echo ""
echo "After running this, you still need to:"
echo "1. Open the project in Xcode: npm run cap:ios"
echo "2. Add Background Modes capability in Xcode"
echo "3. Check that microphone permission is in Info.plist"
echo ""

IOS_DIR="ios/App/App"
INFO_PLIST="$IOS_DIR/Info.plist"

if [ ! -f "$INFO_PLIST" ]; then
    echo "Error: Info.plist not found at $INFO_PLIST"
    echo "Make sure you've run: npx cap add ios && npx cap sync"
    exit 1
fi

echo "Found Info.plist at: $INFO_PLIST"
echo ""
echo "Please manually add the following to Info.plist:"
echo ""
echo "<key>NSMicrophoneUsageDescription</key>"
echo "<string>This app needs access to your microphone to record audio.</string>"
echo ""
echo "<key>UIBackgroundModes</key>"
echo "<array>"
echo "    <string>audio</string>"
echo "</array>"
echo ""
echo "Then open in Xcode and add Background Modes capability."
echo ""

