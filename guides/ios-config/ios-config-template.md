# iOS Configuration Instructions

After running `npx cap add ios` and `npx cap sync`, you need to configure the following:

## 1. Info.plist Configuration

Add these keys to `ios/App/App/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to your microphone to record audio.</string>

<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

## 2. Enable Background Audio in Xcode

1. Open the project in Xcode: `npx cap open ios`
2. Select the project in the navigator
3. Select the "TGL Webpages" target
4. Go to "Signing & Capabilities" tab
5. Click "+ Capability"
6. Add "Background Modes"
7. Check "Audio, AirPlay, and Picture in Picture"

## 3. Register the Plugin

The plugin should be automatically registered, but verify in `ios/App/App/AppDelegate.swift` that plugins are loaded.

## 4. URL Scheme (Optional - for deep linking)

If you want deep linking from webpages, add to Info.plist:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>tglwebpages</string>
        </array>
    </dict>
</array>
```

