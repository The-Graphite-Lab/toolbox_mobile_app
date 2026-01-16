/**
 * TGL Webpages App Redirect Snippet
 * 
 * Automatically redirects mobile users to the TGL Webpages app.
 * If the app is not installed, redirects to the App Store.
 * 
 * Usage: Add this script to your webpage, or include it via:
 * <script src="https://webhooks.thegraphitelab.com/tgl-app-redirect.js"></script>
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Custom URL scheme for the app
    appScheme: 'tglwebpages://',
    
    // App Store URL (update with your actual App Store link when published)
    appStoreUrl: {
      ios: 'https://apps.apple.com/app/tgl-webpages/idYOUR_APP_ID', // Update with actual App Store ID
      android: 'https://play.google.com/store/apps/details?id=com.thegraphitelab.webpages'
    },
    
    // Timeout in milliseconds to wait before redirecting to App Store
    redirectTimeout: 2500,
    
    // Auto-redirect on page load (set to false to require manual trigger)
    autoRedirect: true,
    
    // Only redirect on mobile devices
    mobileOnly: true
  };

  /**
   * Detect if user is on a mobile device
   */
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Detect if user is on iOS
   */
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  /**
   * Detect if user is on Android
   */
  function isAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  /**
   * Get the current page URL
   */
  function getCurrentPageUrl() {
    return window.location.href;
  }

  /**
   * Build the deep link URL
   */
  function buildDeepLinkUrl() {
    const currentUrl = getCurrentPageUrl();
    // Remove protocol and domain, keep the path
    const url = new URL(currentUrl);
    const pathAndQuery = url.pathname + url.search + url.hash;
    return CONFIG.appScheme + url.host + pathAndQuery;
  }

  /**
   * Attempt to open the app
   */
  function openApp() {
    const deepLinkUrl = buildDeepLinkUrl();
    console.log('[TGL Redirect] Attempting to open app with URL:', deepLinkUrl);
    
    // Create a hidden iframe to trigger the app
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.src = deepLinkUrl;
    document.body.appendChild(iframe);

    // Also try window.location as fallback
    setTimeout(() => {
      try {
        window.location.href = deepLinkUrl;
      } catch (e) {
        console.log('[TGL Redirect] Could not set window.location:', e);
      }
    }, 100);

    // Remove iframe after a short delay
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 2000);
  }

  /**
   * Redirect to App Store
   */
  function redirectToAppStore() {
    let appStoreUrl;
    
    if (isIOS()) {
      appStoreUrl = CONFIG.appStoreUrl.ios;
    } else if (isAndroid()) {
      appStoreUrl = CONFIG.appStoreUrl.android;
    } else {
      // Not a mobile device, don't redirect
      console.log('[TGL Redirect] Not a mobile device, skipping App Store redirect');
      return;
    }

    console.log('[TGL Redirect] Redirecting to App Store:', appStoreUrl);
    window.location.href = appStoreUrl;
  }

  /**
   * Main redirect function
   */
  function redirectToApp() {
    // Check if we should redirect
    if (CONFIG.mobileOnly && !isMobileDevice()) {
      console.log('[TGL Redirect] Not a mobile device, skipping redirect');
      return;
    }

    // Attempt to open the app
    openApp();

    // Set timeout to redirect to App Store if app doesn't open
    setTimeout(() => {
      // Check if we're still on the page (app didn't take focus)
      // This is a heuristic - if the page is still visible after timeout, app likely didn't open
      if (document.visibilityState === 'visible') {
        redirectToAppStore();
      }
    }, CONFIG.redirectTimeout);
  }

  /**
   * Manual trigger function (exposed globally)
   */
  window.tglOpenApp = function() {
    redirectToApp();
  };

  /**
   * Initialize on page load
   */
  function init() {
    if (CONFIG.autoRedirect) {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', redirectToApp);
      } else {
        // DOM is already ready
        redirectToApp();
      }
    }
  }

  // Start initialization
  init();

  // Expose config for customization (optional)
  window.tglRedirectConfig = CONFIG;

})();

