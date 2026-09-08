import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'coop.gigplatform.app',
  appName: 'Cooperative Gig Services',
  webDir: 'public',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://your-app.vercel.app',
    cleartext: false,
  },
  plugins: {
    Geolocation: {},
    Camera: {},
  },
};

export default config;

