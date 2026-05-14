import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finanzas.app',
  appName: 'Mis Finanzas',
  webDir: 'dist/frontend',
  server: {
    androidScheme: 'https',
  },
};

export default config;
