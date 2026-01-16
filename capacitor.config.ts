import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thegraphitelab.webpages',
  appName: 'The Graphite Lab',
  webDir: 'out',
  server: {
    // Allow external URLs to be loaded in the WebView
    allowNavigation: [
      'https://webhooks.thegraphitelab.com',
      'https://*.thegraphitelab.com',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
    },
  },
};

export default config;

