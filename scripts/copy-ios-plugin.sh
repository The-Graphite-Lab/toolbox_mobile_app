#!/bin/bash

# Script to copy iOS plugin files after running npx cap add ios
# Run this after: npx cap add ios && npx cap sync

echo "Copying iOS AudioRecording plugin files..."

IOS_PLUGIN_DIR="ios/App/App/Plugins/AudioRecording"
SOURCE_DIR="ios/App/App/Plugins/AudioRecording"

# Check if iOS directory exists
if [ ! -d "ios/App" ]; then
    echo "Error: iOS directory not found. Run 'npx cap add ios' first."
    exit 1
fi

# Create plugin directory if it doesn't exist
mkdir -p "$IOS_PLUGIN_DIR"

# Copy plugin files (they should already be there if we created them)
# This script is mainly for reference/documentation
if [ -f "$SOURCE_DIR/AudioRecording.swift" ] && [ -f "$SOURCE_DIR/AudioRecording.m" ]; then
    echo "Plugin files found at: $SOURCE_DIR"
    echo "Make sure these files are added to the Xcode project:"
    echo "1. Open the project in Xcode: npm run cap:ios"
    echo "2. Right-click on 'Plugins' folder in Xcode"
    echo "3. Select 'Add Files to App'"
    echo "4. Select AudioRecording.swift and AudioRecording.m"
    echo "5. Make sure 'Copy items if needed' is checked"
    echo "6. Make sure 'Add to targets: App' is checked"
else
    echo "Creating plugin files..."
    mkdir -p "$IOS_PLUGIN_DIR"
    
    # The files should already exist from our initial setup
    # If not, they'll need to be created manually
    echo "If plugin files don't exist, create them manually or copy from the project root"
fi

echo ""
echo "Next steps:"
echo "1. Open in Xcode: npm run cap:ios"
echo "2. Add plugin files to Xcode project (see above)"
echo "3. Configure Info.plist (see README.md)"
echo "4. Enable Background Modes in Xcode"

