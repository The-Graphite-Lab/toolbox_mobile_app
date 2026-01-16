# App Store Submission Checklist

## ✅ Technical Configuration (Code-based)

### 1. App Icon Configuration
- [x] **DONE** - App icon file exists (`TGL-iOS.png`)
- [x] **DONE** - Contents.json references correct filename
- [x] **DONE** - Icon is 1024x1024 PNG (verified)
- [ ] **TODO** - Verify icon displays correctly in Xcode

### 2. Info.plist Configuration
- [x] **DONE** - Bundle identifier: `com.thegraphitelab.webpages`
- [x] **DONE** - Version: 1.0
- [x] **DONE** - Build: 1
- [x] **DONE** - Display name: "The Graphite Lab" ✅ (updated)
- [x] **DONE** - Microphone permission description
- [x] **DONE** - Background audio mode declared
- [x] **DONE** - URL scheme configured (`tglwebpages://`)
- [x] **DONE** - Export compliance declaration added

### 3. Code Signing
- [x] **DONE** - Development team configured: `KSLHANYTXV`
- [x] **DONE** - Code signing style: Automatic
- [ ] **TODO** - Verify signing works in Xcode

### 4. Native Plugins
- [x] **DONE** - AudioRecording plugin files exist
- [x] **DONE** - Plugin files referenced in Xcode project
- [ ] **TODO** - Verify plugin compiles without errors

---

## 🔧 Xcode Configuration (Manual Steps)

### 5. Background Modes Capability
- [x] **DONE** - Background Modes capability enabled ✅
- [x] **DONE** - "Audio, AirPlay, and Picture in Picture" checked ✅

### 6. App Icon Verification
- [x] **DONE** - App icon displays correctly in Xcode ✅
- [x] **DONE** - 1024x1024 icon verified ✅

### 7. Build Verification
- [ ] **TODO** - Clean build folder (Cmd+Shift+K)
- [ ] **TODO** - Build for Any iOS Device (Cmd+B)
- [ ] **TODO** - Verify no build errors
- [ ] **TODO** - Archive build (Product → Archive)
- [ ] **TODO** - Verify archive succeeds

---

## 📱 Testing

### 8. Device Testing
- [ ] **TODO** - Connect physical iOS device
- [ ] **TODO** - Build and run on device
- [ ] **TODO** - Test app launch
- [ ] **TODO** - Test webpage loading
- [ ] **TODO** - Test audio recording functionality
- [ ] **TODO** - Test background audio recording
- [ ] **TODO** - Test deep linking (`tglwebpages://`)

---

## 🏪 App Store Connect Setup

### 9. Create App Listing
- [ ] **TODO** - Log into App Store Connect (https://appstoreconnect.apple.com)
- [ ] **TODO** - Click "My Apps" → "+" → "New App"
- [ ] **TODO** - Fill in:
  - Platform: iOS
  - Name: "The Graphite Lab"
  - Primary Language: English
  - Bundle ID: `com.thegraphitelab.webpages`
  - SKU: (unique identifier, e.g., "tgl-webpages-001")
- [ ] **TODO** - Click "Create"

### 10. App Information
- [ ] **TODO** - App description (up to 4000 characters)
- [ ] **TODO** - Subtitle (up to 30 characters)
- [ ] **TODO** - Keywords (up to 100 characters, comma-separated)
- [ ] **TODO** - Support URL (required)
- [ ] **TODO** - Marketing URL (optional)
- [ ] **TODO** - Privacy Policy URL (required)
- [ ] **TODO** - Category: Primary and Secondary
- [ ] **TODO** - Content Rights: If you have the rights

### 11. Pricing and Availability
- [ ] **TODO** - Set price (Free or Paid)
- [ ] **TODO** - Select countries/regions
- [ ] **TODO** - Set availability date

### 12. App Privacy
- [ ] **TODO** - Complete privacy questionnaire
- [ ] **TODO** - Declare data collection (microphone usage)
- [ ] **TODO** - Link privacy policy

### 13. Age Rating
- [ ] **TODO** - Complete age rating questionnaire
- [ ] **TODO** - Answer questions about content
- [ ] **TODO** - Review generated rating

---

## 📸 Screenshots (Required)

### 14. iPhone Screenshots
- [ ] **TODO** - iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max) - 1290 x 2796 pixels
- [ ] **TODO** - iPhone 6.5" (iPhone 11 Pro Max, XS Max) - 1242 x 2688 pixels
- [ ] **TODO** - iPhone 5.5" (iPhone 8 Plus) - 1242 x 2208 pixels

### 15. iPad Screenshots (if supporting iPad)
- [ ] **TODO** - iPad Pro (12.9") - 2048 x 2732 pixels

### 16. App Preview Videos (Optional)
- [ ] **TODO** - Create preview video (optional but recommended)

---

## 📤 Build Upload

### 17. Archive and Upload
- [ ] **TODO** - In Xcode: Product → Archive
- [ ] **TODO** - Wait for archive to complete
- [ ] **TODO** - Click "Distribute App"
- [ ] **TODO** - Select "App Store Connect"
- [ ] **TODO** - Select "Upload"
- [ ] **TODO** - Follow upload wizard
- [ ] **TODO** - Wait for processing (can take 10-30 minutes)

### 18. Version Information
- [ ] **TODO** - In App Store Connect, select the build
- [ ] **TODO** - Add "What's New in This Version" (up to 4000 characters)
- [ ] **TODO** - Upload screenshots
- [ ] **TODO** - Review all information

---

## ✅ Final Submission

### 19. Submit for Review
- [ ] **TODO** - Review all app information
- [ ] **TODO** - Ensure all required fields are filled
- [ ] **TODO** - Click "Submit for Review"
- [ ] **TODO** - Answer export compliance questions (if any)
- [ ] **TODO** - Wait for review (typically 1-3 days)

---

## 📝 Notes

### Current Status
- **Technical Configuration**: ✅ 95% complete (App name updated)
- **Xcode Setup**: Needs manual verification
- **App Store Connect**: Not started
- **Screenshots**: Not created

### ✅ Recently Completed
- App name changed to "The Graphite Lab"
- All Info.plist keys verified
- App icon verified (1024x1024)
- Export compliance added

### Estimated Time Remaining
- Xcode verification: 30-60 minutes
- App Store Connect setup: 1-2 hours
- Screenshot creation: 1-2 hours
- Review process: 1-3 days (after submission)

### Important URLs
- App Store Connect: https://appstoreconnect.apple.com
- Developer Portal: https://developer.apple.com/account
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
