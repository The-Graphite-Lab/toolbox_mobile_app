# TGL App Redirect Snippet

This document explains how to add the TGL Webpages app redirect functionality to any webpage.

## Quick Start

Add this script tag to your webpage (preferably in the `<head>` section):

```html
<script src="https://webhooks.thegraphitelab.com/tgl-app-redirect.js"></script>
```

Or copy the contents of `webhooks/scripts/tgl-app-redirect.js` directly into your webpage.

## How It Works

1. **Auto-detection**: The snippet automatically detects if the user is on a mobile device
2. **App Opening**: Attempts to open the TGL Webpages app using the custom URL scheme `tglwebpages://`
3. **Fallback**: If the app doesn't open within 2.5 seconds, redirects to the App Store

## URL Format

The deep link format is:
```
tglwebpages://[your-domain]/[path]
```

For example, if your webpage is:
```
https://webhooks.thegraphitelab.com/instance/abc123
```

The deep link will be:
```
tglwebpages://webhooks.thegraphitelab.com/instance/abc123
```

The app will then convert this to:
```
https://webhooks.thegraphitelab.com/instance/abc123
```

## Configuration Options

You can customize the behavior by modifying the `tglRedirectConfig` object after the script loads:

```html
<script src="https://webhooks.thegraphitelab.com/tgl-app-redirect.js"></script>
<script>
  // Customize configuration
  window.tglRedirectConfig.autoRedirect = false; // Disable auto-redirect
  window.tglRedirectConfig.redirectTimeout = 3000; // Increase timeout to 3 seconds
  window.tglRedirectConfig.mobileOnly = false; // Allow redirect on desktop too
</script>
```

## Manual Trigger

If you disable auto-redirect, you can trigger it manually with a button:

```html
<button onclick="window.tglOpenApp()">Open in TGL App</button>
```

## Example HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Webpage</title>
  <script src="https://webhooks.thegraphitelab.com/tgl-app-redirect.js"></script>
</head>
<body>
  <h1>My Webpage</h1>
  <p>This page will automatically try to open in the TGL Webpages app on mobile devices.</p>
  
  <!-- Optional: Manual trigger button -->
  <button onclick="window.tglOpenApp()">Open in App</button>
</body>
</html>
```

## Testing

### On Your Development Phone

1. Make sure the app is installed on your phone
2. Add the script to your webpage
3. Visit the webpage on your phone's browser
4. The app should open automatically with the webpage loaded in the webview

### Testing Deep Links Directly

You can test the deep link directly by typing this in Safari on iOS:
```
tglwebpages://webhooks.thegraphitelab.com/instance/your-instance-id
```

## App Store URLs

**Important**: Update the App Store URLs in `webhooks/scripts/tgl-app-redirect.js` once your app is published:

```javascript
appStoreUrl: {
  ios: 'https://apps.apple.com/app/tgl-webpages/idYOUR_APP_ID',
  android: 'https://play.google.com/store/apps/details?id=com.thegraphitelab.webpages'
}
```

## Troubleshooting

### App doesn't open
- Make sure the app is installed on the device
- Check that the URL scheme is correctly configured in the app's Info.plist
- Verify the deep link format is correct

### Redirects to App Store immediately
- The timeout might be too short
- Increase `redirectTimeout` in the configuration
- Check browser console for errors

### Works on iOS but not Android
- Android requires additional configuration in the app
- Make sure Android App Links are configured (future enhancement)

## Browser Compatibility

- iOS Safari: ✅ Full support
- Android Chrome: ✅ Full support
- Desktop browsers: ⚠️ Will not redirect (unless `mobileOnly: false`)

## Security Notes

- The script only redirects to URLs on `webhooks.thegraphitelab.com` domain
- Custom URL schemes are handled securely by iOS/Android
- No sensitive data is transmitted in the URL

