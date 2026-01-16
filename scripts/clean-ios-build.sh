#!/bin/bash

# Comprehensive iOS Build Cleanup and Reinstall Script
# This script thoroughly cleans all iOS build artifacts and reinstalls dependencies

set -e  # Exit on error

echo "=========================================="
echo "iOS Build Cleanup and Reinstall"
echo "=========================================="
echo ""

# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="$PROJECT_ROOT/ios"
IOS_APP_DIR="$IOS_DIR/App"

echo "Project root: $PROJECT_ROOT"
echo "iOS directory: $IOS_DIR"
echo ""

# Step 1: Clean Xcode Derived Data
echo "Step 1: Cleaning Xcode Derived Data..."
DERIVED_DATA_PATH="$HOME/Library/Developer/Xcode/DerivedData"
if [ -d "$DERIVED_DATA_PATH" ]; then
    # Find and remove derived data for this project
    PROJECT_DERIVED_DATA=$(find "$DERIVED_DATA_PATH" -maxdepth 1 -name "App-*" -type d 2>/dev/null || true)
    if [ -n "$PROJECT_DERIVED_DATA" ]; then
        echo "  Removing project-specific derived data..."
        rm -rf "$PROJECT_DERIVED_DATA"
        echo "  ✓ Derived data cleaned"
    else
        echo "  No project-specific derived data found"
    fi
else
    echo "  Derived data directory not found"
fi
echo ""

# Step 2: Clean iOS App build artifacts
echo "Step 2: Cleaning iOS App build artifacts..."
if [ -d "$IOS_APP_DIR" ]; then
    cd "$IOS_APP_DIR"
    
    # Remove Pods directory
    if [ -d "Pods" ]; then
        echo "  Removing Pods directory..."
        rm -rf Pods
        echo "  ✓ Pods directory removed"
    fi
    
    # Remove Podfile.lock
    if [ -f "Podfile.lock" ]; then
        echo "  Removing Podfile.lock..."
        rm -f Podfile.lock
        echo "  ✓ Podfile.lock removed"
    fi
    
    # Remove build directories
    if [ -d "build" ]; then
        echo "  Removing build directory..."
        rm -rf build
        echo "  ✓ Build directory removed"
    fi
    
    # Remove .xcworkspace user data (but keep the workspace itself)
    if [ -d "App.xcworkspace/xcuserdata" ]; then
        echo "  Cleaning workspace user data..."
        rm -rf App.xcworkspace/xcuserdata
        echo "  ✓ Workspace user data cleaned"
    fi
    
    # Remove .xcodeproj user data
    if [ -d "App.xcodeproj/xcuserdata" ]; then
        echo "  Cleaning Xcode project user data..."
        rm -rf App.xcodeproj/xcuserdata
        echo "  ✓ Xcode project user data cleaned"
    fi
    
    echo "  ✓ iOS App build artifacts cleaned"
else
    echo "  iOS App directory not found at $IOS_APP_DIR"
fi
echo ""

# Step 3: Clean iOS root build artifacts
echo "Step 3: Cleaning iOS root build artifacts..."
if [ -d "$IOS_DIR" ]; then
    # Remove any build directories at iOS root
    if [ -d "$IOS_DIR/build" ]; then
        echo "  Removing iOS root build directory..."
        rm -rf "$IOS_DIR/build"
        echo "  ✓ iOS root build directory removed"
    fi
    
    # Clean capacitor-cordova-ios-plugins if it exists (should be managed by Capacitor)
    if [ -d "$IOS_DIR/capacitor-cordova-ios-plugins" ]; then
        echo "  Note: capacitor-cordova-ios-plugins directory found (will be regenerated)"
    fi
fi
echo ""

# Step 4: Clean node_modules/.cache if it exists
echo "Step 4: Cleaning Node.js cache..."
if [ -d "$PROJECT_ROOT/node_modules/.cache" ]; then
    echo "  Removing node_modules cache..."
    rm -rf "$PROJECT_ROOT/node_modules/.cache"
    echo "  ✓ Node.js cache cleaned"
else
    echo "  No Node.js cache found"
fi
echo ""

# Step 5: Reinstall CocoaPods dependencies
echo "Step 5: Reinstalling CocoaPods dependencies..."
if [ -d "$IOS_APP_DIR" ]; then
    cd "$IOS_APP_DIR"
    
    # Check if pod command exists
    if ! command -v pod &> /dev/null; then
        echo "  ERROR: CocoaPods not found. Please install it first:"
        echo "    sudo gem install cocoapods"
        echo "    or"
        echo "    brew install cocoapods"
        exit 1
    fi
    
    echo "  Running pod install..."
    pod install --repo-update
    echo "  ✓ CocoaPods dependencies installed"
else
    echo "  ERROR: iOS App directory not found"
    exit 1
fi
echo ""

# Step 6: Re-sync Capacitor
echo "Step 6: Re-syncing Capacitor..."
cd "$PROJECT_ROOT"

# Check if we need to build first
if [ ! -d "out" ]; then
    echo "  Building Next.js app first (out directory not found)..."
    npm run build
    echo "  ✓ Next.js app built"
fi

echo "  Running Capacitor sync..."
npx cap sync ios
echo "  ✓ Capacitor synced"
echo ""

# Step 7: Final verification
echo "Step 7: Verifying installation..."
cd "$IOS_APP_DIR"

if [ -d "Pods" ] && [ -f "Podfile.lock" ]; then
    echo "  ✓ Pods directory exists"
    echo "  ✓ Podfile.lock exists"
    echo "  ✓ Installation verified"
else
    echo "  WARNING: Pods installation may be incomplete"
fi
echo ""

echo "=========================================="
echo "Cleanup and Reinstall Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Open Xcode: npm run cap:ios"
echo "2. Clean Build Folder in Xcode: Product → Clean Build Folder (Shift+Cmd+K)"
echo "3. Build the project: Product → Build (Cmd+B)"
echo ""
echo "If you still encounter issues, try:"
echo "- Closing and reopening Xcode"
echo "- Restarting your Mac (to clear any system caches)"
echo ""

