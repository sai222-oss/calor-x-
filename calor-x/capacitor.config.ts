import type { CapacitorConfig } from '@capacitor/cli';

// Allow an optional dev server URL to be injected via env for live-reload on device.
// Example: set CAPACITOR_DEV_SERVER_URL=http://192.168.1.42:5173 when running on device
const devServerUrl = process.env.CAPACITOR_DEV_SERVER_URL || process.env.CAPACITOR_SERVER_URL || '';

const config: CapacitorConfig = {
  appId: 'app.lovable.908cdb05ba874afe91935e4077e1693e',
  appName: 'Calor X',
  webDir: 'dist',
  // Only set server.url when a dev server is explicitly provided
  ...(devServerUrl ? { server: { url: devServerUrl, cleartext: true } } : {}),
};

export default config;